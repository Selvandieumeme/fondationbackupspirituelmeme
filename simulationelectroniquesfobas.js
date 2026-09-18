/* ================================================================
   FOBAS — LABORATOIRE ÉLECTRONIQUE
   ELECTRONIC ENGINE v1.0.0
   ---------------------------------------------------------------
   Moteur autonome — aucune bibliothèque externe.
   Compatible avec :
   simulationelectroniquesfobas.html
   ================================================================ */

(() => {
    "use strict";

    /* ============================================================
       01 — CONFIGURATION GÉNÉRALE
    ============================================================ */

    const ENGINE_NAME = "FOBAS_ELECTRONIC_ENGINE";
    const ENGINE_VERSION = "1.0.0";

    const STORAGE_KEY = "FOBAS_ELECTRONIC_LAB_PROJECT_V1";
    const SESSION_KEY = "FOBAS_ELECTRONIC_LAB_SESSION_V1";

    const GRID_SIZE = 20;
    const MIN_ZOOM = 0.55;
    const MAX_ZOOM = 2.8;
    const ZOOM_STEP = 0.1;

    const COMPONENT_WIDTH = 118;
    const COMPONENT_HEIGHT = 72;

    const state = {
        version: ENGINE_VERSION,

        level: "beginner",

        selectedTool: "select",

        components: [],
        wires: [],

        selectedComponentId: null,
        selectedWireId: null,

        pendingWirePin: null,

        zoom: 1,
        panX: 0,
        panY: 0,

        gridVisible: true,
        snapEnabled: true,

        powerOn: false,
        circuitRunning: false,

        simulationTimer: null,
        codeTimer: null,

        codeRunning: false,

        currentCode: "",

        activeCodeId: null,

        activeMission: null,
        missionRunning: false,

        activeFaults: [],

        measurements: {
            voltage: 0,
            current: 0,
            resistance: null,
            frequency: 0,
            power: 0,
            continuity: false
        },

        history: [],
        historyIndex: -1,

        componentSequence: 0,
        wireSequence: 0,

        drag: {
            active: false,
            componentId: null,
            offsetX: 0,
            offsetY: 0
        },

        viewportGesture: {
            active: false,
            lastX: 0,
            lastY: 0,
            pinchDistance: null,
            pinchZoom: 1
        },

        simulation: {
            sourceVoltage: 0,
            totalResistance: Infinity,
            current: 0,
            poweredNodes: new Set(),
            componentStates: {}
        }
    };


    /* ============================================================
       02 — OUTILS DOM
    ============================================================ */

    const $ = (id) => document.getElementById(id);

    function qs(selector, root = document) {
        return root.querySelector(selector);
    }

    function qsa(selector, root = document) {
        return Array.from(root.querySelectorAll(selector));
    }

    function exists(id) {
        return !!$(id);
    }

    function text(id, value) {
        const el = $(id);
        if (el) el.textContent = value;
    }

    function show(id) {
        const el = $(id);
        if (!el) return;
        el.classList.remove("hidden");
        el.setAttribute("aria-hidden", "false");
    }

    function hide(id) {
        const el = $(id);
        if (!el) return;
        el.classList.add("hidden");
        el.setAttribute("aria-hidden", "true");
    }

    function toggle(id, force = null) {
        const el = $(id);
        if (!el) return;

        const shouldShow =
            force === null
                ? el.classList.contains("hidden")
                : force;

        if (shouldShow) show(id);
        else hide(id);
    }


    /* ============================================================
       03 — NOTIFICATIONS
    ============================================================ */

    let toastTimer = null;

    function toast(message, type = "info") {

        const el = $("electronicToast");

        if (!el) {
            console.log("[FOBAS]", message);
            return;
        }

        el.textContent = message;

        el.classList.remove(
            "success",
            "error",
            "warning",
            "info"
        );

        el.classList.add(type);

        el.classList.add("visible");

        clearTimeout(toastTimer);

        toastTimer = setTimeout(() => {
            el.classList.remove("visible");
        }, 3000);
    }


    /* ============================================================
       04 — STATUT
    ============================================================ */

    function setStatus(message, type = "ready") {

        text("simulationStatusText", message);

        const dot = $("simulationStatusDot");

        if (!dot) return;

        dot.classList.remove(
            "ready",
            "running",
            "warning",
            "error"
        );

        dot.classList.add(type);
    }


    /* ============================================================
       05 — IDENTIFIANTS
    ============================================================ */

    function newComponentId() {

        state.componentSequence += 1;

        return (
            "component_" +
            Date.now().toString(36) +
            "_" +
            state.componentSequence
        );
    }

    function newWireId() {

        state.wireSequence += 1;

        return (
            "wire_" +
            Date.now().toString(36) +
            "_" +
            state.wireSequence
        );
    }


    /* ============================================================
       06 — BIBLIOTHÈQUE DES COMPOSANTS
    ============================================================ */

    const COMPONENT_LIBRARY = {

        resistors: [
            {
                type: "resistor",
                name: "Résistance 220 Ω",
                symbol: "R",
                value: 220,
                unit: "Ω",
                color: "#d9b36c",
                pins: ["A", "B"]
            },
            {
                type: "resistor",
                name: "Résistance 330 Ω",
                symbol: "R",
                value: 330,
                unit: "Ω",
                color: "#d9b36c",
                pins: ["A", "B"]
            },
            {
                type: "resistor",
                name: "Résistance 1 kΩ",
                symbol: "R",
                value: 1000,
                unit: "Ω",
                color: "#d9b36c",
                pins: ["A", "B"]
            },
            {
                type: "resistor",
                name: "Résistance 10 kΩ",
                symbol: "R",
                value: 10000,
                unit: "Ω",
                color: "#d9b36c",
                pins: ["A", "B"]
            },
            {
                type: "resistor",
                name: "Résistance 100 kΩ",
                symbol: "R",
                value: 100000,
                unit: "Ω",
                color: "#d9b36c",
                pins: ["A", "B"]
            }
        ],

        capacitors: [
            {
                type: "capacitor",
                name: "Condensateur 100 µF",
                symbol: "C",
                value: 100,
                unit: "µF",
                pins: ["+", "-"]
            },
            {
                type: "capacitor",
                name: "Condensateur 470 µF",
                symbol: "C",
                value: 470,
                unit: "µF",
                pins: ["+", "-"]
            },
            {
                type: "capacitor",
                name: "Condensateur 1000 µF",
                symbol: "C",
                value: 1000,
                unit: "µF",
                pins: ["+", "-"]
            }
        ],

        inductors: [
            {
                type: "inductor",
                name: "Bobine 10 mH",
                symbol: "L",
                value: 10,
                unit: "mH",
                pins: ["A", "B"]
            },
            {
                type: "inductor",
                name: "Bobine 100 mH",
                symbol: "L",
                value: 100,
                unit: "mH",
                pins: ["A", "B"]
            }
        ],

        diodes: [
            {
                type: "diode",
                name: "Diode 1N4007",
                symbol: "D",
                value: "1N4007",
                pins: ["A", "K"]
            },
            {
                type: "zener",
                name: "Diode Zener",
                symbol: "ZD",
                value: "5V1",
                pins: ["A", "K"]
            }
        ],

        leds: [
            {
                type: "led",
                name: "LED Rouge",
                symbol: "LED",
                color: "#ff3030",
                forwardVoltage: 2.0,
                pins: ["A", "K"]
            },
            {
                type: "led",
                name: "LED Verte",
                symbol: "LED",
                color: "#28e66b",
                forwardVoltage: 2.1,
                pins: ["A", "K"]
            },
            {
                type: "led",
                name: "LED Bleue",
                symbol: "LED",
                color: "#278cff",
                forwardVoltage: 3.0,
                pins: ["A", "K"]
            },
            {
                type: "led",
                name: "LED Jaune",
                symbol: "LED",
                color: "#ffd329",
                forwardVoltage: 2.1,
                pins: ["A", "K"]
            },
            {
                type: "led",
                name: "LED Blanche",
                symbol: "LED",
                color: "#ffffff",
                forwardVoltage: 3.0,
                pins: ["A", "K"]
            }
        ],

        bulbs: [
            {
                type: "bulb",
                name: "Ampoule 6 V",
                symbol: "💡",
                voltage: 6,
                resistance: 12,
                pins: ["A", "B"]
            },
            {
                type: "bulb",
                name: "Ampoule 12 V",
                symbol: "💡",
                voltage: 12,
                resistance: 24,
                pins: ["A", "B"]
            }
        ],

        transistors: [
            {
                type: "transistor-npn",
                name: "Transistor NPN",
                symbol: "NPN",
                pins: ["C", "B", "E"]
            },
            {
                type: "transistor-pnp",
                name: "Transistor PNP",
                symbol: "PNP",
                pins: ["C", "B", "E"]
            }
        ],

        mosfet: [
            {
                type: "mosfet",
                name: "MOSFET N-Channel",
                symbol: "NMOS",
                pins: ["D", "G", "S"]
            },
            {
                type: "mosfet-p",
                name: "MOSFET P-Channel",
                symbol: "PMOS",
                pins: ["D", "G", "S"]
            }
        ],

        relays: [
            {
                type: "relay",
                name: "Relais 5 V",
                symbol: "K",
                coilVoltage: 5,
                pins: ["COIL+", "COIL-", "COM", "NO", "NC"]
            }
        ],

        switches: [
            {
                type: "switch",
                name: "Interrupteur ON/OFF",
                symbol: "SW",
                pins: ["A", "B"]
            }
        ],

        buttons: [
            {
                type: "pushbutton",
                name: "Bouton poussoir",
                symbol: "BTN",
                pins: ["A", "B"]
            }
        ],

        potentiometers: [
            {
                type: "potentiometer",
                name: "Potentiomètre 10 kΩ",
                symbol: "POT",
                value: 10000,
                unit: "Ω",
                pins: ["A", "W", "B"]
            }
        ],

        fuses: [
            {
                type: "fuse",
                name: "Fusible 1 A",
                symbol: "FUSE",
                currentLimit: 1,
                pins: ["A", "B"]
            },
            {
                type: "fuse",
                name: "Fusible 5 A",
                symbol: "FUSE",
                currentLimit: 5,
                pins: ["A", "B"]
            }
        ],

        transformers: [
            {
                type: "transformer",
                name: "Transformateur",
                symbol: "TR",
                pins: ["P1", "P2", "S1", "S2"]
            }
        ],

        rectifiers: [
            {
                type: "bridge",
                name: "Pont redresseur",
                symbol: "BR",
                pins: ["AC1", "AC2", "+", "-"]
            }
        ],

        regulators: [
            {
                type: "regulator",
                name: "Régulateur 7805",
                symbol: "7805",
                outputVoltage: 5,
                pins: ["IN", "GND", "OUT"]
            },
            {
                type: "regulator",
                name: "Régulateur 7812",
                symbol: "7812",
                outputVoltage: 12,
                pins: ["IN", "GND", "OUT"]
            }
        ],

        opamps: [
            {
                type: "opamp",
                name: "Amplificateur opérationnel",
                symbol: "OPAMP",
                pins: ["V+", "V-", "IN+", "IN-", "OUT"]
            }
        ],

        logic: [
            {
                type: "logic-not",
                name: "Porte NOT",
                symbol: "NOT",
                pins: ["VCC", "GND", "IN", "OUT"]
            },
            {
                type: "logic-and",
                name: "Porte AND",
                symbol: "AND",
                pins: ["VCC", "GND", "A", "B", "OUT"]
            },
            {
                type: "logic-or",
                name: "Porte OR",
                symbol: "OR",
                pins: ["VCC", "GND", "A", "B", "OUT"]
            }
        ],

        wires: [
            {
                type: "wire",
                name: "Fil rouge",
                symbol: "━",
                color: "#ff3030",
                pins: []
            },
            {
                type: "wire",
                name: "Fil noir",
                symbol: "━",
                color: "#151515",
                pins: []
            },
            {
                type: "wire",
                name: "Fil bleu",
                symbol: "━",
                color: "#278cff",
                pins: []
            },
            {
                type: "wire",
                name: "Fil vert",
                symbol: "━",
                color: "#29d978",
                pins: []
            }
        ],

        terminals: [
            {
                type: "terminal",
                name: "Borne +",
                symbol: "+",
                pins: ["+"]
            },
            {
                type: "terminal",
                name: "Borne -",
                symbol: "-",
                pins: ["-"]
            },
            {
                type: "ground",
                name: "Masse GND",
                symbol: "GND",
                pins: ["GND"]
            }
        ]
    };


    /* ============================================================
       07 — SOURCES ÉLECTRIQUES
    ============================================================ */

    const POWER_COMPONENTS = {

        battery: {
            type: "battery",
            name: "Batterie 9 V",
            symbol: "🔋",
            voltage: 9,
            pins: ["+", "-"]
        },

        "dc-supply": {
            type: "dc-supply",
            name: "Alimentation DC",
            symbol: "DC",
            voltage: 12,
            adjustable: true,
            pins: ["+", "-"]
        },

        "ac-supply": {
            type: "ac-supply",
            name: "Alimentation AC",
            symbol: "∿",
            voltage: 12,
            frequency: 60,
            pins: ["L", "N"]
        },

        "signal-generator": {
            type: "signal-generator",
            name: "Générateur de signaux",
            symbol: "〰",
            voltage: 5,
            frequency: 1000,
            waveform: "sine",
            pins: ["OUT", "GND"]
        }
    };


    /* ============================================================
       08 — INSTRUMENTS
    ============================================================ */

    const INSTRUMENTS = {

        multimeter: {
            type: "multimeter",
            name: "Multimètre",
            symbol: "📟",
            pins: ["COM", "VΩ", "A"]
        },

        oscilloscope: {
            type: "oscilloscope",
            name: "Oscilloscope",
            symbol: "📈",
            pins: ["CH1", "CH2", "GND"]
        },

        voltmeter: {
            type: "voltmeter",
            name: "Voltmètre",
            symbol: "V",
            pins: ["+", "-"]
        },

        ammeter: {
            type: "ammeter",
            name: "Ampèremètre",
            symbol: "A",
            pins: ["+", "-"]
        },

        ohmmeter: {
            type: "ohmmeter",
            name: "Ohmmètre",
            symbol: "Ω",
            pins: ["+", "-"]
        },

        "frequency-meter": {
            type: "frequency-meter",
            name: "Fréquencemètre",
            symbol: "Hz",
            pins: ["IN", "GND"]
        },

        "logic-analyzer": {
            type: "logic-analyzer",
            name: "Analyseur logique",
            symbol: "▣",
            pins: ["CH0", "CH1", "CH2", "CH3", "GND"]
        }
    };


    /* ============================================================
       09 — CODE LIBRARY
    ============================================================ */

    const CODE_LIBRARY = [

        {
            id: "led-on",
            level: "beginner",
            title: "Allumage 1 LED",
            description:
                "Allume une LED connectée sur la sortie D13.",
            code:
`const int LED = 13;

void setup() {
    pinMode(LED, OUTPUT);
}

void loop() {
    digitalWrite(LED, HIGH);
}`,
            required: ["arduino", "led"],
            action: {
                type: "digital",
                pin: 13,
                value: 1
            }
        },

        {
            id: "led-off",
            level: "beginner",
            title: "Extinction 1 LED",
            description:
                "Éteint une LED connectée sur D13.",
            code:
`const int LED = 13;

void setup() {
    pinMode(LED, OUTPUT);
}

void loop() {
    digitalWrite(LED, LOW);
}`,
            required: ["arduino", "led"],
            action: {
                type: "digital",
                pin: 13,
                value: 0
            }
        },

        {
            id: "led-blink",
            level: "beginner",
            title: "Clignotement LED",
            description:
                "Fait clignoter une LED sur D13.",
            code:
`const int LED = 13;

void setup() {
    pinMode(LED, OUTPUT);
}

void loop() {
    digitalWrite(LED, HIGH);
    delay(500);
    digitalWrite(LED, LOW);
    delay(500);
}`,
            required: ["arduino", "led"],
            action: {
                type: "blink",
                pin: 13,
                interval: 500
            }
        },

        {
            id: "button-led",
            level: "beginner",
            title: "Bouton → LED",
            description:
                "La LED s'allume lorsque le bouton est actif.",
            code:
`const int BUTTON = 2;
const int LED = 13;

void setup() {
    pinMode(BUTTON, INPUT);
    pinMode(LED, OUTPUT);
}

void loop() {
    if (digitalRead(BUTTON) == HIGH) {
        digitalWrite(LED, HIGH);
    } else {
        digitalWrite(LED, LOW);
    }
}`,
            required: ["arduino", "led", "pushbutton"],
            action: {
                type: "buttonLed",
                inputPin: 2,
                outputPin: 13
            }
        },

        {
            id: "pot-led",
            level: "intermediate",
            title: "Potentiomètre → Luminosité LED",
            description:
                "Contrôle la luminosité d'une LED avec A0.",
            code:
`const int POT = A0;
const int LED = 9;

void setup() {
    pinMode(LED, OUTPUT);
}

void loop() {
    int value = analogRead(POT);
    int brightness = map(value, 0, 1023, 0, 255);
    analogWrite(LED, brightness);
}`,
            required: ["arduino", "led", "potentiometer"],
            action: {
                type: "analogLed",
                inputPin: "A0",
                outputPin: 9
            }
        },

        {
            id: "ldr-lamp",
            level: "intermediate",
            title: "Capteur → Lampe automatique",
            description:
                "Commande automatiquement une charge lumineuse.",
            code:
`const int SENSOR = A0;
const int LAMP = 8;

void setup() {
    pinMode(LAMP, OUTPUT);
}

void loop() {
    int value = analogRead(SENSOR);

    if (value < 400) {
        digitalWrite(LAMP, HIGH);
    } else {
        digitalWrite(LAMP, LOW);
    }
}`,
            required: ["arduino"],
            action: {
                type: "sensorLamp",
                inputPin: "A0",
                outputPin: 8
            }
        },

        {
            id: "buzzer",
            level: "intermediate",
            title: "Buzzer électronique",
            description:
                "Active un buzzer sur D10.",
            code:
`const int BUZZER = 10;

void setup() {
    pinMode(BUZZER, OUTPUT);
}

void loop() {
    tone(BUZZER, 1000);
}`,
            required: ["arduino"],
            action: {
                type: "tone",
                pin: 10,
                frequency: 1000
            }
        },

        {
            id: "traffic-light",
            level: "intermediate",
            title: "Feu tricolore",
            description:
                "Séquence rouge, jaune, verte.",
            code:
`const int RED = 8;
const int YELLOW = 9;
const int GREEN = 10;

void setup() {
    pinMode(RED, OUTPUT);
    pinMode(YELLOW, OUTPUT);
    pinMode(GREEN, OUTPUT);
}

void loop() {
    digitalWrite(RED, HIGH);
    delay(2000);
    digitalWrite(RED, LOW);

    digitalWrite(YELLOW, HIGH);
    delay(1000);
    digitalWrite(YELLOW, LOW);

    digitalWrite(GREEN, HIGH);
    delay(2000);
    digitalWrite(GREEN, LOW);
}`,
            required: ["arduino"],
            action: {
                type: "traffic"
            }
        },

        {
            id: "relay-control",
            level: "expert",
            title: "Commande d'un relais",
            description:
                "Commande une sortie relais.",
            code:
`const int RELAY = 7;

void setup() {
    pinMode(RELAY, OUTPUT);
}

void loop() {
    digitalWrite(RELAY, HIGH);
}`,
            required: ["arduino", "relay"],
            action: {
                type: "digital",
                pin: 7,
                value: 1
            }
        },

        {
            id: "pwm-motor",
            level: "expert",
            title: "Commande PWM",
            description:
                "Commande une charge avec PWM.",
            code:
`const int OUTPUT_PIN = 5;

void setup() {
    pinMode(OUTPUT_PIN, OUTPUT);
}

void loop() {
    analogWrite(OUTPUT_PIN, 180);
}`,
            required: ["arduino"],
            action: {
                type: "pwm",
                pin: 5,
                value: 180
            }
        }
    ];


    /* ============================================================
       10 — MISSIONS
    ============================================================ */

    const MISSIONS = {

        beginner: [
            {
                id: "b1",
                title: "Allumer une LED",
                description:
                    "Construisez un circuit avec une source, une résistance et une LED.",
                requirements: [
                    "Ajouter une source",
                    "Ajouter une résistance",
                    "Ajouter une LED",
                    "Créer les connexions",
                    "Mettre l'alimentation ON"
                ],
                validate() {
                    return validateBasicLED();
                }
            },
            {
                id: "b2",
                title: "Interrupteur et LED",
                description:
                    "Réalisez un circuit dans lequel l'interrupteur contrôle la LED.",
                requirements: [
                    "Source",
                    "Résistance",
                    "LED",
                    "Interrupteur"
                ],
                validate() {
                    return (
                        hasType("led") &&
                        hasType("resistor") &&
                        hasType("switch") &&
                        state.wires.length >= 4
                    );
                }
            },
            {
                id: "b3",
                title: "Mesurer une tension",
                description:
                    "Construisez un circuit alimenté puis effectuez une mesure.",
                requirements: [
                    "Source",
                    "Charge",
                    "Alimentation ON",
                    "Mesure de tension"
                ],
                validate() {
                    return (
                        hasPowerSource() &&
                        state.powerOn &&
                        state.measurements.voltage > 0
                    );
                }
            },
            {
                id: "b4",
                title: "Protection par fusible",
                description:
                    "Ajoutez un fusible dans le circuit.",
                requirements: [
                    "Source",
                    "Fusible",
                    "Charge"
                ],
                validate() {
                    return (
                        hasPowerSource() &&
                        hasType("fuse") &&
                        hasLoad()
                    );
                }
            },
            {
                id: "b5",
                title: "Utiliser le multimètre",
                description:
                    "Placez un multimètre et mesurez le circuit.",
                requirements: [
                    "Multimètre",
                    "Circuit alimenté",
                    "Mesure"
                ],
                validate() {
                    return (
                        hasType("multimeter") &&
                        state.powerOn &&
                        state.measurements.voltage > 0
                    );
                }
            }
        ],

        intermediate: [
            {
                id: "i1",
                title: "LED clignotante",
                description:
                    "Programmez une LED pour qu'elle clignote.",
                requirements: [
                    "Arduino",
                    "LED",
                    "Code LED Blink",
                    "Exécution"
                ],
                validate() {
                    return (
                        hasType("arduino") &&
                        hasType("led") &&
                        state.codeRunning
                    );
                }
            },
            {
                id: "i2",
                title: "Potentiomètre et luminosité",
                description:
                    "Utilisez un potentiomètre pour contrôler une LED.",
                requirements: [
                    "Arduino",
                    "Potentiomètre",
                    "LED",
                    "Programme analogique"
                ],
                validate() {
                    return (
                        hasType("arduino") &&
                        hasType("potentiometer") &&
                        hasType("led") &&
                        state.codeRunning
                    );
                }
            },
            {
                id: "i3",
                title: "Commande par bouton",
                description:
                    "Le bouton doit commander une sortie.",
                requirements: [
                    "Arduino",
                    "Bouton",
                    "LED",
                    "Programme"
                ],
                validate() {
                    return (
                        hasType("arduino") &&
                        hasType("pushbutton") &&
                        hasType("led") &&
                        state.codeRunning
                    );
                }
            },
            {
                id: "i4",
                title: "Régulation 5 V",
                description:
                    "Utilisez un régulateur 7805.",
                requirements: [
                    "Source",
                    "7805",
                    "Charge"
                ],
                validate() {
                    return (
                        hasPowerSource() &&
                        state.components.some(
                            c =>
                                c.type === "regulator" &&
                                c.outputVoltage === 5
                        )
                    );
                }
            },
            {
                id: "i5",
                title: "Signal périodique",
                description:
                    "Utilisez un générateur de signaux et mesurez sa fréquence.",
                requirements: [
                    "Générateur",
                    "Fréquencemètre",
                    "Connexion"
                ],
                validate() {
                    return (
                        hasType("signal-generator") &&
                        hasType("frequency-meter") &&
                        state.measurements.frequency > 0
                    );
                }
            }
        ],

        expert: [
            {
                id: "e1",
                title: "Commande transistorisée",
                description:
                    "Construisez une commande avec transistor NPN.",
                requirements: [
                    "Source",
                    "Transistor NPN",
                    "Résistance",
                    "Charge"
                ],
                validate() {
                    return (
                        hasType("transistor-npn") &&
                        hasType("resistor") &&
                        hasLoad()
                    );
                }
            },
            {
                id: "e2",
                title: "Commande relais",
                description:
                    "Activez un relais à partir d'une sortie électronique.",
                requirements: [
                    "Relais",
                    "Source",
                    "Commande"
                ],
                validate() {
                    return (
                        hasType("relay") &&
                        state.codeRunning
                    );
                }
            },
            {
                id: "e3",
                title: "Filtrage RC",
                description:
                    "Construisez un filtre avec résistance et condensateur.",
                requirements: [
                    "Résistance",
                    "Condensateur",
                    "Source"
                ],
                validate() {
                    return (
                        hasType("resistor") &&
                        hasType("capacitor") &&
                        hasPowerSource()
                    );
                }
            },
            {
                id: "e4",
                title: "Redressement",
                description:
                    "Construisez une alimentation redressée.",
                requirements: [
                    "Source AC",
                    "Pont redresseur",
                    "Condensateur"
                ],
                validate() {
                    return (
                        hasType("ac-supply") &&
                        hasType("bridge") &&
                        hasType("capacitor")
                    );
                }
            },
            {
                id: "e5",
                title: "Diagnostic professionnel",
                description:
                    "Créez puis analysez un circuit comportant une panne.",
                requirements: [
                    "Circuit",
                    "Panne",
                    "Diagnostic"
                ],
                validate() {
                    return (
                        state.activeFaults.length > 0 &&
                        lastDiagnosticPassed()
                    );
                }
            }
        ]
    };


    /* ============================================================
       11 — UTILITAIRES COMPOSANTS
    ============================================================ */

    function hasType(type) {
        return state.components.some(c => c.type === type);
    }

    function hasPowerSource() {
        return state.components.some(
            c =>
                c.type === "battery" ||
                c.type === "dc-supply" ||
                c.type === "ac-supply" ||
                c.type === "signal-generator"
        );
    }

    function hasLoad() {
        return state.components.some(
            c =>
                [
                    "led",
                    "bulb",
                    "motor",
                    "buzzer",
                    "relay"
                ].includes(c.type)
        );
    }

    function getComponent(id) {
        return state.components.find(c => c.id === id);
    }

    function getWire(id) {
        return state.wires.find(w => w.id === id);
    }


    /* ============================================================
       12 — CRÉATION D'UN COMPOSANT
    ============================================================ */

    function createComponent(definition, x = null, y = null) {

        const canvas = $("laboratoryCanvas");

        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();

        if (x === null) {
            x =
                Math.max(
                    30,
                    (rect.width / 2 - 80) /
                        Math.max(state.zoom, 0.1)
                );
        }

        if (y === null) {
            y =
                Math.max(
                    30,
                    (rect.height / 2 - 40) /
                        Math.max(state.zoom, 0.1)
                );
        }

        const component = {

            id: newComponentId(),

            type: definition.type,

            name: definition.name,

            symbol: definition.symbol || "●",

            value:
                definition.value !== undefined
                    ? definition.value
                    : null,

            unit:
                definition.unit || "",

            voltage:
                definition.voltage || 0,

            resistance:
                definition.resistance || 0,

            forwardVoltage:
                definition.forwardVoltage || 0,

            outputVoltage:
                definition.outputVoltage || 0,

            frequency:
                definition.frequency || 0,

            color:
                definition.color || "",

            pins:
                (definition.pins || []).map(pin => ({
                    name: pin,
                    id:
                        "pin_" +
                        Math.random()
                            .toString(36)
                            .slice(2)
                })),

            x: x,

            y: y,

            rotation: 0,

            enabled: true,

            active: false,

            brightness: 0,

            fault: null,

            valueState:
                definition.value !== undefined
                    ? Number(definition.value) || 0
                    : 0,

            arduinoPin: null,

            pwm: 0,

            metadata: {}
        };

        if (definition.type === "battery") {
            component.voltage = 9;
        }

        if (definition.type === "dc-supply") {
            component.voltage = 12;
        }

        state.components.push(component);

        pushHistory();

        renderComponent(component);

        updateWorkspace();

        return component;
    }


    /* ============================================================
       13 — AJOUT PAR TYPE
    ============================================================ */

    function addComponent(type) {

        let definition = null;

        if (POWER_COMPONENTS[type]) {
            definition = POWER_COMPONENTS[type];
        }

        if (!definition) {

            for (const category of Object.keys(COMPONENT_LIBRARY)) {

                const found =
                    COMPONENT_LIBRARY[category]
                        .find(item => item.type === type);

                if (found) {
                    definition = found;
                    break;
                }
            }
        }

        if (!definition) {
            toast(
                "Composant introuvable : " + type,
                "error"
            );
            return null;
        }

        const component =
            createComponent(
                structuredCloneSafe(definition)
            );

        if (component) {

            selectComponent(component.id);

            toast(
                component.name + " ajouté au laboratoire.",
                "success"
            );

            setStatus(
                component.name + " prêt.",
                "ready"
            );
        }

        return component;
    }


    /* ============================================================
       14 — AJOUT INSTRUMENT
    ============================================================ */

    function addInstrument(type) {

        const definition = INSTRUMENTS[type];

        if (!definition) {
            toast("Instrument introuvable.", "error");
            return;
        }

        const component =
            createComponent(
                structuredCloneSafe(definition)
            );

        if (component) {

            component.metadata.instrument = true;

            renderComponent(component);

            selectComponent(component.id);

            toast(
                component.name + " ajouté.",
                "success"
            );
        }
    }


    /* ============================================================
       15 — CLONAGE SÉCURISÉ
    ============================================================ */

    function structuredCloneSafe(value) {

        try {
            return structuredClone(value);
        } catch (error) {
            return JSON.parse(JSON.stringify(value));
        }
    }


    /* ============================================================
       16 — RENDU DES COMPOSANTS
    ============================================================ */

    function renderAllComponents() {

        const layer = $("componentLayer");

        if (!layer) return;

        layer.innerHTML = "";

        state.components.forEach(
            component => renderComponent(component)
        );
    }


    function renderComponent(component) {

        const layer = $("componentLayer");

        if (!layer) return;

        let el =
            document.querySelector(
                `[data-component-id="${component.id}"]`
            );

        if (!el) {

            el = document.createElement("div");

            el.className = "electronic-component";

            el.dataset.componentId =
                component.id;

            el.tabIndex = 0;

            layer.appendChild(el);

            attachComponentEvents(
                el,
                component
            );
        }

        el.style.position = "absolute";

        el.style.left =
            `${component.x}px`;

        el.style.top =
            `${component.y}px`;

        el.style.width =
            `${COMPONENT_WIDTH}px`;

        el.style.minHeight =
            `${COMPONENT_HEIGHT}px`;

        el.style.transform =
            `rotate(${component.rotation}deg)`;

        el.style.touchAction = "none";

        el.classList.toggle(
            "selected",
            state.selectedComponentId === component.id
        );

        el.classList.toggle(
            "component-active",
            !!component.active
        );

        el.classList.toggle(
            "component-fault",
            !!component.fault
        );

        el.innerHTML = componentMarkup(component);

        attachPinEvents(el, component);

        if (component.active) {
            el.style.boxShadow =
                "0 0 24px rgba(0,220,255,.75)";
        } else {
            el.style.boxShadow = "";
        }
    }


    /* ============================================================
       17 — MARKUP COMPOSANT
    ============================================================ */

    function componentMarkup(component) {

        let extra = "";

        if (component.type === "led") {

            const glow =
                component.brightness > 0
                    ? `box-shadow:0 0 22px ${component.color};`
                    : "";

            extra =
                `<div class="led-visual"
                    style="
                        background:${component.color};
                        ${glow}
                    ">
                </div>`;
        }

        else if (component.type === "bulb") {

            extra =
                `<div class="bulb-visual ${
                    component.active
                        ? "bulb-on"
                        : ""
                }">💡</div>`;
        }

        else if (component.type === "battery") {

            extra =
                `<div class="battery-visual">
                    <span>+</span>
                    <strong>${component.voltage}V</strong>
                    <span>−</span>
                </div>`;
        }

        else if (component.type === "resistor") {

            extra =
                `<div class="resistor-visual">
                    <span>▰</span>
                    <strong>
                        ${formatResistance(component.value)}
                    </strong>
                </div>`;
        }

        else if (component.type === "capacitor") {

            extra =
                `<div class="capacitor-visual">
                    <span>║</span>
                    <strong>
                        ${component.value}${component.unit}
                    </strong>
                </div>`;
        }

        else if (
            component.type === "arduino"
        ) {

            extra =
                `<div class="controller-visual">
                    <span>USB</span>
                    <strong>ARDUINO UNO</strong>
                    <small>D0–D13 • A0–A5</small>
                </div>`;
        }

        else {

            extra =
                `<div class="generic-symbol">
                    ${component.symbol}
                </div>`;
        }

        const pins =
            component.pins
                .map(
                    pin =>
                        `<button
                            type="button"
                            class="component-pin"
                            data-pin="${pin.name}"
                            title="${pin.name}"
                        >${pin.name}</button>`
                )
                .join("");

        return `
            <div class="component-header">
                <span>${escapeHTML(component.name)}</span>
            </div>

            <div class="component-body">
                ${extra}
            </div>

            <div class="component-pins">
                ${pins}
            </div>

            ${
                component.fault
                    ? `<div class="component-fault-label">
                        ⚠ PANNE
                       </div>`
                    : ""
            }
        `;
    }


    /* ============================================================
       18 — HTML SAFE
    ============================================================ */

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* ============================================================
       19 — RÉSISTANCE
    ============================================================ */

    function formatResistance(value) {

        const n = Number(value) || 0;

        if (n >= 1000000) {
            return (
                (n / 1000000)
                    .toFixed(2)
                    .replace(/\.00$/, "") +
                " MΩ"
            );
        }

        if (n >= 1000) {
            return (
                (n / 1000)
                    .toFixed(2)
                    .replace(/\.00$/, "") +
                " kΩ"
            );
        }

        return n + " Ω";
    }


    /* ============================================================
       20 — ÉVÉNEMENTS COMPOSANTS
    ============================================================ */

    function attachComponentEvents(el, component) {

        el.addEventListener(
            "pointerdown",
            event => {

                if (
                    event.target.closest(
                        ".component-pin"
                    )
                ) {
                    return;
                }

                if (
                    state.selectedTool === "delete"
                ) {
                    deleteComponent(
                        component.id
                    );
                    return;
                }

                if (
                    state.selectedTool === "rotate"
                ) {
                    rotateComponent(
                        component.id
                    );
                    return;
                }

                if (
                    state.selectedTool === "duplicate"
                ) {
                    duplicateComponent(
                        component.id
                    );
                    return;
                }

                selectComponent(
                    component.id
                );

                if (
                    state.selectedTool === "move" ||
                    state.selectedTool === "select"
                ) {

                    beginComponentDrag(
                        event,
                        component,
                        el
                    );
                }
            }
        );

        el.addEventListener(
            "dblclick",
            event => {

                if (
                    event.target.closest(
                        ".component-pin"
                    )
                ) return;

                openComponentDetails(
                    component.id
                );
            }
        );

        el.addEventListener(
            "contextmenu",
            event => {

                event.preventDefault();

                openComponentDetails(
                    component.id
                );
            }
        );
    }


    /* ============================================================
       21 — PINS
    ============================================================ */

    function attachPinEvents(el, component) {

        qsa(
            ".component-pin",
            el
        ).forEach(pinEl => {

            pinEl.addEventListener(
                "pointerdown",
                event => {

                    event.stopPropagation();

                    const pinName =
                        pinEl.dataset.pin;

                    handlePinClick(
                        component.id,
                        pinName
                    );
                }
            );
        });
    }


    function handlePinClick(
        componentId,
        pinName
    ) {

        const pin = {
            componentId,
            pinName
        };

        if (!state.pendingWirePin) {

            state.pendingWirePin = pin;

            state.selectedTool = "wire";

            setToolbarActive(
                "wireToolBtn"
            );

            toast(
                `Borne ${pinName} sélectionnée. Sélectionnez une deuxième borne.`,
                "info"
            );

            return;
        }

        if (
            state.pendingWirePin.componentId ===
            componentId &&
            state.pendingWirePin.pinName ===
            pinName
        ) {

            state.pendingWirePin = null;

            toast(
                "Connexion annulée.",
                "warning"
            );

            return;
        }

        createWire(
            state.pendingWirePin,
            pin
        );

        state.pendingWirePin = null;
    }


    /* ============================================================
       22 — CRÉATION DES FILS
    ============================================================ */

    function createWire(from, to) {

        const duplicate =
            state.wires.some(
                wire =>
                    (
                        wire.from.componentId ===
                            from.componentId &&
                        wire.from.pinName ===
                            from.pinName &&
                        wire.to.componentId ===
                            to.componentId &&
                        wire.to.pinName ===
                            to.pinName
                    ) ||
                    (
                        wire.from.componentId ===
                            to.componentId &&
                        wire.from.pinName ===
                            to.pinName &&
                        wire.to.componentId ===
                            from.componentId &&
                        wire.to.pinName ===
                            from.pinName
                    )
            );

        if (duplicate) {

            toast(
                "Cette connexion existe déjà.",
                "warning"
            );

            return;
        }

        const wire = {

            id: newWireId(),

            from: {
                componentId:
                    from.componentId,
                pinName:
                    from.pinName
            },

            to: {
                componentId:
                    to.componentId,
                pinName:
                    to.pinName
            },

            color: "#22c9ff",

            active: false,

            fault: null
        };

        state.wires.push(wire);

        pushHistory();

        renderWires();

        updateWorkspace();

        toast(
            "Connexion créée.",
            "success"
        );

        simulateCircuit();
    }


    /* ============================================================
       23 — POSITION DES PINS
    ============================================================ */

    function getPinPosition(
        component,
        pinName
    ) {

        const element =
            document.querySelector(
                `[data-component-id="${component.id}"]`
            );

        if (!element) {

            return {
                x: component.x,
                y: component.y
            };
        }

        const pin =
            element.querySelector(
                `.component-pin[data-pin="${CSS.escape(pinName)}"]`
            );

        if (!pin) {

            return {
                x:
                    component.x +
                    COMPONENT_WIDTH / 2,

                y:
                    component.y +
                    COMPONENT_HEIGHT / 2
            };
        }

        const canvas =
            $("laboratoryCanvas");

        const canvasRect =
            canvas.getBoundingClientRect();

        const pinRect =
            pin.getBoundingClientRect();

        return {

            x:
                (
                    pinRect.left +
                    pinRect.width / 2 -
                    canvasRect.left
                ) / state.zoom,

            y:
                (
                    pinRect.top +
                    pinRect.height / 2 -
                    canvasRect.top
                ) / state.zoom
        };
    }


    /* ============================================================
       24 — RENDU DES FILS
    ============================================================ */

    function renderWires() {

        const svg = $("wireLayer");

        if (!svg) return;

        svg.innerHTML = "";

        svg.setAttribute(
            "width",
            "100%"
        );

        svg.setAttribute(
            "height",
            "100%"
        );

        state.wires.forEach(
            wire => {

                const a =
                    getComponent(
                        wire.from.componentId
                    );

                const b =
                    getComponent(
                        wire.to.componentId
                    );

                if (!a || !b) return;

                const p1 =
                    getPinPosition(
                        a,
                        wire.from.pinName
                    );

                const p2 =
                    getPinPosition(
                        b,
                        wire.to.pinName
                    );

                const path =
                    document.createElementNS(
                        "http://www.w3.org/2000/svg",
                        "path"
                    );

                const midX =
                    (p1.x + p2.x) / 2;

                const d =
                    `M ${p1.x} ${p1.y}
                     C ${midX} ${p1.y},
                       ${midX} ${p2.y},
                       ${p2.x} ${p2.y}`;

                path.setAttribute(
                    "d",
                    d
                );

                path.setAttribute(
                    "fill",
                    "none"
                );

                path.setAttribute(
                    "stroke",
                    wire.active
                        ? "#19e6ff"
                        : wire.color
                );

                path.setAttribute(
                    "stroke-width",
                    wire.active
                        ? "5"
                        : "3"
                );

                path.setAttribute(
                    "stroke-linecap",
                    "round"
                );

                path.dataset.wireId =
                    wire.id;

                path.style.cursor =
                    "pointer";

                path.addEventListener(
                    "pointerdown",
                    event => {

                        event.stopPropagation();

                        selectWire(
                            wire.id
                        );
                    }
                );

                svg.appendChild(path);
            }
        );
    }


    /* ============================================================
       25 — SÉLECTION
    ============================================================ */

    function selectComponent(id) {

        state.selectedComponentId = id;
        state.selectedWireId = null;

        renderAllComponents();

        updateComponentDetailsIfOpen();
    }


    function selectWire(id) {

        state.selectedWireId = id;
        state.selectedComponentId = null;

        renderAllComponents();

        qsa(
            "[data-wire-id]"
        ).forEach(
            el =>
                el.classList.toggle(
                    "selected-wire",
                    el.dataset.wireId === id
                )
        );
    }


    /* ============================================================
       26 — DRAG DES COMPOSANTS
    ============================================================ */

    function beginComponentDrag(
        event,
        component,
        element
    ) {

        state.drag.active = true;

        state.drag.componentId =
            component.id;

        const canvas =
            $("laboratoryCanvas");

        const rect =
            canvas.getBoundingClientRect();

        const x =
            (
                event.clientX -
                rect.left
            ) / state.zoom;

        const y =
            (
                event.clientY -
                rect.top
            ) / state.zoom;

        state.drag.offsetX =
            x - component.x;

        state.drag.offsetY =
            y - component.y;

        element.setPointerCapture?.(
            event.pointerId
        );
    }


    function moveComponent(
        event
    ) {

        if (
            !state.drag.active
        ) return;

        const component =
            getComponent(
                state.drag.componentId
            );

        if (!component) return;

        const canvas =
            $("laboratoryCanvas");

        const rect =
            canvas.getBoundingClientRect();

        let x =
            (
                event.clientX -
                rect.left
            ) / state.zoom -
            state.drag.offsetX;

        let y =
            (
                event.clientY -
                rect.top
            ) / state.zoom -
            state.drag.offsetY;

        if (state.snapEnabled) {

            x =
                Math.round(
                    x / GRID_SIZE
                ) * GRID_SIZE;

            y =
                Math.round(
                    y / GRID_SIZE
                ) * GRID_SIZE;
        }

        component.x = Math.max(
            0,
            x
        );

        component.y = Math.max(
            0,
            y
        );

        renderComponent(
            component
        );

        renderWires();
    }


    function endComponentDrag() {

        if (!state.drag.active) return;

        state.drag.active = false;

        state.drag.componentId = null;

        pushHistory();

        updateWorkspace();
    }


    /* ============================================================
       27 — ROTATION
    ============================================================ */

    function rotateComponent(id) {

        const component =
            getComponent(id);

        if (!component) return;

        component.rotation =
            (
                component.rotation +
                90
            ) % 360;

        pushHistory();

        renderComponent(
            component
        );

        renderWires();

        toast(
            component.name +
            " tourné de 90°.",
            "success"
        );
    }


    /* ============================================================
       28 — DUPLICATION
    ============================================================ */

    function duplicateComponent(id) {

        const original =
            getComponent(id);

        if (!original) return;

        const copy =
            structuredCloneSafe(
                original
            );

        copy.id =
            newComponentId();

        copy.x += 40;
        copy.y += 40;

        copy.pins =
            copy.pins.map(
                pin => ({
                    ...pin,
                    id:
                        "pin_" +
                        Math.random()
                            .toString(36)
                            .slice(2)
                })
            );

        state.components.push(copy);

        pushHistory();

        renderComponent(copy);

        selectComponent(copy.id);

        updateWorkspace();

        toast(
            "Composant dupliqué.",
            "success"
        );
    }


    /* ============================================================
       29 — SUPPRESSION
    ============================================================ */

    function deleteComponent(id) {

        const component =
            getComponent(id);

        if (!component) return;

        state.wires =
            state.wires.filter(
                wire =>
                    wire.from.componentId !== id &&
                    wire.to.componentId !== id
            );

        state.components =
            state.components.filter(
                c => c.id !== id
            );

        if (
            state.selectedComponentId === id
        ) {
            state.selectedComponentId =
                null;
        }

        pushHistory();

        renderAllComponents();

        renderWires();

        updateWorkspace();

        toast(
            component.name +
            " supprimé.",
            "success"
        );

        simulateCircuit();
    }


    function deleteSelected() {

        if (
            state.selectedComponentId
        ) {

            deleteComponent(
                state.selectedComponentId
            );

            return;
        }

        if (state.selectedWireId) {

            deleteWire(
                state.selectedWireId
            );
        }
    }


    function deleteWire(id) {

        const index =
            state.wires.findIndex(
                w => w.id === id
            );

        if (index < 0) return;

        state.wires.splice(
            index,
            1
        );

        state.selectedWireId =
            null;

        pushHistory();

        renderWires();

        updateWorkspace();

        simulateCircuit();

        toast(
            "Connexion supprimée.",
            "success"
        );
    }


    /* ============================================================
       30 — OUTILS
    ============================================================ */

    function setTool(tool) {

        state.selectedTool =
            tool;

        state.pendingWirePin =
            null;

        const map = {
            select: "selectToolBtn",
            wire: "wireToolBtn",
            move: "moveToolBtn",
            rotate: "rotateToolBtn",
            delete: "deleteToolBtn",
            duplicate: "duplicateToolBtn"
        };

        Object.values(map).forEach(
            id => {
                const el = $(id);
                if (el) {
                    el.classList.remove(
                        "active"
                    );
                }
            }
        );

        if (map[tool]) {
            const el =
                $(map[tool]);

            if (el) {
                el.classList.add(
                    "active"
                );
            }
        }
    }


    function setToolbarActive(id) {

        qsa(
            ".workspace-tool"
        ).forEach(
            el =>
                el.classList.remove(
                    "active"
                )
        );

        const el = $(id);

        if (el) {
            el.classList.add(
                "active"
            );
        }
    }


    /* ============================================================
       31 — ZOOM
    ============================================================ */

    function setZoom(value) {

        state.zoom =
            Math.max(
                MIN_ZOOM,
                Math.min(
                    MAX_ZOOM,
                    value
                )
            );

        applyCanvasTransform();

        text(
            "zoomResetBtn",
            Math.round(
                state.zoom * 100
            ) + "%"
        );

        renderWires();
    }


    function zoomIn() {
        setZoom(
            state.zoom +
            ZOOM_STEP
        );
    }


    function zoomOut() {
        setZoom(
            state.zoom -
            ZOOM_STEP
        );
    }


    function resetZoom() {
        setZoom(1);
    }


    function applyCanvasTransform() {

        const canvas =
            $("laboratoryCanvas");

        if (!canvas) return;

        canvas.style.transform =
            `translate(${state.panX}px, ${state.panY}px)
             scale(${state.zoom})`;

        canvas.style.transformOrigin =
            "0 0";
    }


    function fitWorkspace() {

        state.panX = 0;
        state.panY = 0;

        setZoom(1);

        toast(
            "Laboratoire adapté.",
            "success"
        );
    }


    /* ============================================================
       32 — ZOOM TACTILE / PINCH
    ============================================================ */

    function touchDistance(
        touches
    ) {

        if (touches.length < 2) {
            return null;
        }

        const a = touches[0];
        const b = touches[1];

        return Math.hypot(
            b.clientX - a.clientX,
            b.clientY - a.clientY
        );
    }


    function setupTouchZoom() {

        const viewport =
            $("laboratoryViewport");

        if (!viewport) return;

        viewport.addEventListener(
            "touchstart",
            event => {

                if (
                    event.touches.length === 2
                ) {

                    state.viewportGesture
                        .pinchDistance =
                        touchDistance(
                            event.touches
                        );

                    state.viewportGesture
                        .pinchZoom =
                        state.zoom;
                }
            },
            {
                passive: true
            }
        );

        viewport.addEventListener(
            "touchmove",
            event => {

                if (
                    event.touches.length !== 2
                ) return;

                const distance =
                    touchDistance(
                        event.touches
                    );

                const initial =
                    state.viewportGesture
                        .pinchDistance;

                if (
                    !distance ||
                    !initial
                ) return;

                const ratio =
                    distance / initial;

                setZoom(
                    state.viewportGesture
                        .pinchZoom *
                    ratio
                );
            },
            {
                passive: true
            }
        );

        viewport.addEventListener(
            "touchend",
            () => {

                state.viewportGesture
                    .pinchDistance = null;
            },
            {
                passive: true
            }
        );
    }


    /* ============================================================
       33 — GRILLE
    ============================================================ */

    function toggleGrid() {

        state.gridVisible =
            !state.gridVisible;

        const grid =
            $("laboratoryGrid");

        if (grid) {

            grid.style.display =
                state.gridVisible
                    ? ""
                    : "none";
        }
    }


    function toggleSnap() {

        state.snapEnabled =
            !state.snapEnabled;

        toast(
            state.snapEnabled
                ? "Alignement magnétique activé."
                : "Alignement magnétique désactivé.",
            "info"
        );
    }


    /* ============================================================
       34 — SIMULATION CIRCUIT
    ============================================================ */

    function simulateCircuit() {

        const result =
            calculateCircuit();

        state.simulation =
            result;

        state.measurements.voltage =
            result.voltage;

        state.measurements.current =
            result.current;

        state.measurements.resistance =
            result.totalResistance;

        state.measurements.frequency =
            result.frequency;

        state.measurements.power =
            result.voltage *
            result.current;

        state.measurements.continuity =
            result.continuity;

        applySimulationStates(
            result
        );

        updateMeasurementDisplays();

        updateWorkspace();

        renderAllComponents();

        renderWires();

        return result;
    }


    /* ============================================================
       35 — CALCUL DU CIRCUIT
    ============================================================ */

    function calculateCircuit() {

        const result = {

            sourceVoltage: 0,

            voltage: 0,

            current: 0,

            totalResistance: Infinity,

            frequency: 0,

            continuity: false,

            poweredNodes: new Set(),

            componentStates: {}
        };

        const source =
            state.components.find(
                c =>
                    [
                        "battery",
                        "dc-supply"
                    ].includes(c.type)
            );

        if (
            source &&
            state.powerOn
        ) {

            result.sourceVoltage =
                Number(
                    source.voltage
                ) || 0;
        }

        const acSource =
            state.components.find(
                c =>
                    c.type === "ac-supply"
            );

        const signalSource =
            state.components.find(
                c =>
                    c.type ===
                    "signal-generator"
            );

        if (acSource) {

            result.sourceVoltage =
                state.powerOn
                    ? Number(
                        acSource.voltage
                    ) || 0
                    : 0;

            result.frequency =
                Number(
                    acSource.frequency
                ) || 0;
        }

        if (signalSource) {

            result.frequency =
                Number(
                    signalSource.frequency
                ) || 0;
        }

        if (!state.powerOn) {

            return result;
        }

        const conductive =
            buildElectricalGraph();

        result.continuity =
            conductive.hasClosedPath;

        if (!conductive.hasClosedPath) {

            return result;
        }

        const resistors =
            state.components.filter(
                c =>
                    c.type ===
                    "resistor"
            );

        let resistance =
            resistors.reduce(
                (
                    total,
                    resistor
                ) =>
                    total +
                    Math.max(
                        0.1,
                        Number(
                            resistor.value
                        ) || 0
                    ),
                0
            );

        const bulbs =
            state.components.filter(
                c =>
                    c.type ===
                    "bulb"
            );

        bulbs.forEach(
            bulb => {

                resistance +=
                    Number(
                        bulb.resistance
                    ) || 10;
            }
        );

        const leds =
            state.components.filter(
                c =>
                    c.type ===
                    "led"
            );

        leds.forEach(
            led => {

                resistance +=
                    100;
            }
        );

        if (
            resistance <= 0
        ) {

            resistance = 1;
        }

        result.totalResistance =
            resistance;

        result.voltage =
            result.sourceVoltage;

        result.current =
            result.voltage /
            resistance;

        result.poweredNodes =
            conductive.poweredNodes;

        return result;
    }


    /* ============================================================
       36 — GRAPHE ÉLECTRIQUE
    ============================================================ */

    function buildElectricalGraph() {

        const adjacency =
            new Map();

        function nodeKey(
            componentId,
            pinName
        ) {
            return (
                componentId +
                "::" +
                pinName
            );
        }

        function addNode(key) {

            if (!adjacency.has(key)) {
                adjacency.set(
                    key,
                    new Set()
                );
            }
        }

        state.components.forEach(
            component => {

                component.pins.forEach(
                    pin => {

                        addNode(
                            nodeKey(
                                component.id,
                                pin.name
                            )
                        );
                    }
                );
            }
        );

        state.wires.forEach(
            wire => {

                if (wire.fault === "open") {
                    return;
                }

                const a =
                    nodeKey(
                        wire.from.componentId,
                        wire.from.pinName
                    );

                const b =
                    nodeKey(
                        wire.to.componentId,
                        wire.to.pinName
                    );

                addNode(a);
                addNode(b);

                adjacency
                    .get(a)
                    .add(b);

                adjacency
                    .get(b)
                    .add(a);
            }
        );

        const sources =
            state.components.filter(
                c =>
                    c.type ===
                        "battery" ||
                    c.type ===
                        "dc-supply" ||
                    c.type ===
                        "ac-supply"
            );

        const positiveRoots = [];

        sources.forEach(
            source => {

                const positivePin =
                    source.pins.find(
                        p =>
                            [
                                "+",
                                "L"
                            ].includes(
                                p.name
                            )
                    );

                if (positivePin) {

                    positiveRoots.push(
                        nodeKey(
                            source.id,
                            positivePin.name
                        )
                    );
                }
            }
        );

        const poweredNodes =
            new Set();

        const queue =
            [...positiveRoots];

        while (queue.length) {

            const current =
                queue.shift();

            if (
                poweredNodes.has(
                    current
                )
            ) continue;

            poweredNodes.add(
                current
            );

            const neighbors =
                adjacency.get(
                    current
                );

            if (!neighbors) continue;

            neighbors.forEach(
                next => {

                    if (
                        !poweredNodes.has(
                            next
                        )
                    ) {
                        queue.push(next);
                    }
                }
            );
        }

        let hasClosedPath = false;

        sources.forEach(
            source => {

                const negative =
                    source.pins.find(
                        p =>
                            [
                                "-",
                                "N"
                            ].includes(
                                p.name
                            )
                    );

                if (!negative) return;

                const key =
                    nodeKey(
                        source.id,
                        negative.name
                    );

                if (
                    poweredNodes.has(key)
                ) {
                    hasClosedPath = true;
                }
            }
        );

        return {
            adjacency,
            poweredNodes,
            hasClosedPath
        };
    }


    /* ============================================================
       37 — ÉTAT DES COMPOSANTS
    ============================================================ */

    function applySimulationStates(
        result
    ) {

        state.components.forEach(
            component => {

                component.active = false;
                component.brightness = 0;

                if (
                    component.fault
                ) {
                    return;
                }

                if (
                    component.type ===
                    "led"
                ) {

                    const connected =
                        componentConnected(
                            component
                        );

                    if (
                        connected &&
                        result.current > 0
                    ) {

                        const voltage =
                            result.voltage;

                        if (
                            voltage >=
                            component.forwardVoltage
                        ) {

                            component.active =
                                true;

                            component.brightness =
                                Math.min(
                                    1,
                                    result.current *
                                    100
                                );
                        }
                    }
                }

                if (
                    component.type ===
                    "bulb"
                ) {

                    if (
                        componentConnected(
                            component
                        ) &&
                        result.current > 0
                    ) {

                        component.active =
                            true;

                        component.brightness =
                            Math.min(
                                1,
                                result.current *
                                10
                            );
                    }
                }

                if (
                    [
                        "relay",
                        "buzzer",
                        "motor"
                    ].includes(
                        component.type
                    )
                ) {

                    if (
                        componentConnected(
                            component
                        ) &&
                        result.current > 0
                    ) {
                        component.active = true;
                    }
                }
            }
        );

        state.wires.forEach(
            wire => {

                wire.active =
                    result.current > 0 &&
                    !wire.fault;
            }
        );
    }


    function componentConnected(
        component
    ) {

        return state.wires.some(
            wire =>
                wire.from.componentId ===
                    component.id ||
                wire.to.componentId ===
                    component.id
        );
    }


    /* ============================================================
       38 — ALIMENTATION
    ============================================================ */

    function powerOn() {

        state.powerOn = true;

        setStatus(
            "Alimentation active",
            "running"
        );

        simulateCircuit();

        toast(
            "Alimentation ON.",
            "success"
        );
    }


    function powerOff() {

        state.powerOn = false;

        state.circuitRunning = false;

        simulateCircuit();

        setStatus(
            "Alimentation arrêtée",
            "ready"
        );

        toast(
            "Alimentation OFF.",
            "info"
        );
    }


    function runCircuit() {

        state.circuitRunning = true;

        setStatus(
            "Simulation du circuit en cours",
            "running"
        );

        simulateCircuit();

        diagnoseCircuit();

        toast(
            state.measurements.continuity
                ? "Circuit testé : chemin électrique détecté."
                : "Test terminé : circuit ouvert.",
            state.measurements.continuity
                ? "success"
                : "warning"
        );
    }


    function stopCircuit() {

        state.circuitRunning = false;

        stopSimulationEffects();

        setStatus(
            "Simulation arrêtée",
            "ready"
        );

        toast(
            "Circuit arrêté.",
            "info"
        );
    }


    function resetCircuit() {

        powerOff();

        state.components.forEach(
            component => {

                component.active = false;
                component.brightness = 0;
                component.fault = null;
            }
        );

        state.wires.forEach(
            wire => {
                wire.active = false;
                wire.fault = null;
            }
        );

        state.activeFaults = [];

        simulateCircuit();

        toast(
            "Circuit réinitialisé.",
            "success"
        );
    }


    /* ============================================================
       39 — MESURES
    ============================================================ */

    function measureVoltage() {

        simulateCircuit();

        const value =
            state.measurements.voltage;

        displayMeasurement(
            "voltage",
            value
        );

        toast(
            `Tension mesurée : ${value.toFixed(2)} V`,
            value > 0
                ? "success"
                : "warning"
        );
    }


    function measureCurrent() {

        simulateCircuit();

        const value =
            state.measurements.current;

        displayMeasurement(
            "current",
            value
        );

        toast(
            `Courant mesuré : ${value.toFixed(4)} A`,
            value > 0
                ? "success"
                : "warning"
        );
    }


    function measureResistance() {

        simulateCircuit();

        const value =
            state.measurements.resistance;

        displayMeasurement(
            "resistance",
            value
        );

        toast(
            value === null ||
            !Number.isFinite(value)
                ? "Résistance non mesurable."
                : `Résistance équivalente : ${formatResistance(value)}`,
            value === null ||
            !Number.isFinite(value)
                ? "warning"
                : "success"
        );
    }


    function displayMeasurement(
        type,
        value
    ) {

        if (type === "voltage") {

            text(
                "voltageDisplay",
                `${Number(value).toFixed(2)} V`
            );

            text(
                "dashboardVoltage",
                `${Number(value).toFixed(2)} V`
            );
        }

        if (type === "current") {

            text(
                "currentDisplay",
                `${Number(value).toFixed(4)} A`
            );

            text(
                "dashboardCurrent",
                `${Number(value).toFixed(4)} A`
            );
        }

        if (type === "resistance") {

            const display =
                Number.isFinite(value)
                    ? formatResistance(value)
                    : "— Ω";

            text(
                "resistanceDisplay",
                display
            );

            text(
                "dashboardResistance",
                display
            );
        }
    }


    function updateMeasurementDisplays() {

        const m =
            state.measurements;

        text(
            "voltageDisplay",
            `${m.voltage.toFixed(2)} V`
        );

        text(
            "currentDisplay",
            `${m.current.toFixed(4)} A`
        );

        text(
            "resistanceDisplay",
            Number.isFinite(
                m.resistance
            )
                ? formatResistance(
                    m.resistance
                )
                : "— Ω"
        );

        text(
            "frequencyDisplay",
            `${m.frequency.toFixed(0)} Hz`
        );

        text(
            "dashboardVoltage",
            `${m.voltage.toFixed(2)} V`
        );

        text(
            "dashboardCurrent",
            `${m.current.toFixed(4)} A`
        );

        text(
            "dashboardResistance",
            Number.isFinite(
                m.resistance
            )
                ? formatResistance(
                    m.resistance
                )
                : "— Ω"
        );

        text(
            "dashboardFrequency",
            `${m.frequency.toFixed(0)} Hz`
        );

        text(
            "dashboardPower",
            `${m.power.toFixed(3)} W`
        );

        text(
            "dashboardContinuity",
            m.continuity
                ? "OUI"
                : "NON"
        );
    }


    /* ============================================================
       40 — WORKSPACE STATUS
    ============================================================ */

    function updateWorkspace() {

        text(
            "componentCount",
            state.components.length
        );

        text(
            "connectionCount",
            state.wires.length
        );

        text(
            "workspaceVoltage",
            `${state.measurements.voltage.toFixed(2)} V`
        );

        text(
            "workspaceCurrent",
            `${state.measurements.current.toFixed(4)} A`
        );

        text(
            "circuitState",
            state.measurements.continuity
                ? "Circuit fermé"
                : "Circuit ouvert"
        );
    }


    /* ============================================================
       41 — CODE LIBRARY UI
    ============================================================ */

    function renderCodeLibrary(
        level = state.level
    ) {

        const container =
            $("codeLibraryList");

        if (!container) return;

        container.innerHTML = "";

        CODE_LIBRARY
            .filter(
                code =>
                    code.level === level
            )
            .forEach(
                code => {

                    const card =
                        document.createElement(
                            "article"
                        );

                    card.className =
                        "code-library-card";

                    card.innerHTML = `
                        <h3>
                            ${escapeHTML(
                                code.title
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                code.description
                            )}
                        </p>

                        <pre><code>${escapeHTML(
                            code.code
                        )}</code></pre>

                        <div class="code-card-actions">
                            <button
                                type="button"
                                data-code-copy="${code.id}"
                            >
                                📑 Copier
                            </button>

                            <button
                                type="button"
                                data-code-open="${code.id}"
                            >
                                📝 Ouvrir
                            </button>

                            <button
                                type="button"
                                data-code-run="${code.id}"
                            >
                                ▶ Charger / Exécuter
                            </button>
                        </div>
                    `;

                    container.appendChild(
                        card
                    );
                }
            );

        qsa(
            "[data-code-copy]",
            container
        ).forEach(
            btn =>
                btn.addEventListener(
                    "click",
                    () =>
                        copyCodeById(
                            btn.dataset.codeCopy
                        )
                )
        );

        qsa(
            "[data-code-open]",
            container
        ).forEach(
            btn =>
                btn.addEventListener(
                    "click",
                    () =>
                        openCodeById(
                            btn.dataset.codeOpen
                        )
                )
        );

        qsa(
            "[data-code-run]",
            container
        ).forEach(
            btn =>
                btn.addEventListener(
                    "click",
                    () =>
                        runLibraryCode(
                            btn.dataset.codeRun
                        )
                )
        );
    }


    function openCodeById(id) {

        const item =
            CODE_LIBRARY.find(
                code =>
                    code.id === id
            );

        if (!item) return;

        state.activeCodeId = id;

        state.currentCode =
            item.code;

        const editor =
            $("electronicCodeEditor");

        if (editor) {
            editor.value =
                item.code;
        }

        show("codeEditorPanel");

        toast(
            "Code chargé dans l'éditeur.",
            "success"
        );
    }


    async function copyCodeById(id) {

        const item =
            CODE_LIBRARY.find(
                code =>
                    code.id === id
            );

        if (!item) return;

        await copyText(
            item.code
        );

        toast(
            "Code copié.",
            "success"
        );
    }


    async function copyCurrentCode() {

        const editor =
            $("electronicCodeEditor");

        if (!editor) return;

        await copyText(
            editor.value
        );

        toast(
            "Code copié.",
            "success"
        );
    }


    async function copyText(value) {

        try {

            await navigator.clipboard.writeText(
                value
            );

        } catch (error) {

            const area =
                document.createElement(
                    "textarea"
                );

            area.value = value;

            area.style.position =
                "fixed";

            area.style.opacity = "0";

            document.body.appendChild(
                area
            );

            area.select();

            document.execCommand(
                "copy"
            );

            area.remove();
        }
    }


    async function pasteCode() {

        const editor =
            $("electronicCodeEditor");

        if (!editor) return;

        try {

            const value =
                await navigator.clipboard.readText();

            editor.value += value;

            toast(
                "Code collé.",
                "success"
            );

        } catch (error) {

            toast(
                "Le presse-papiers n'est pas accessible. Utilisez Coller du système.",
                "warning"
            );
        }
    }


    /* ============================================================
       42 — VALIDATION CODE
    ============================================================ */

    function validateCode(
        code
    ) {

        const errors = [];
        const warnings = [];

        if (
            !code ||
            !code.trim()
        ) {

            errors.push(
                "Le programme est vide."
            );
        }

        if (
            code &&
            !/void\s+setup\s*\(/i.test(
                code
            )
        ) {

            warnings.push(
                "La fonction setup() n'a pas été détectée."
            );
        }

        if (
            code &&
            !/void\s+loop\s*\(/i.test(
                code
            )
        ) {

            warnings.push(
                "La fonction loop() n'a pas été détectée."
            );
        }

        const braces =
            (code.match(/{/g) || [])
                .length;

        const closeBraces =
            (code.match(/}/g) || [])
                .length;

        if (
            braces !== closeBraces
        ) {

            errors.push(
                "Les accolades { } ne sont pas équilibrées."
            );
        }

        const knownFunctions = [
            "pinMode",
            "digitalWrite",
            "digitalRead",
            "analogRead",
            "analogWrite",
            "delay",
            "tone",
            "noTone",
            "map"
        ];

        const functionFound =
            knownFunctions.some(
                fn =>
                    code.includes(
                        fn + "("
                    )
            );

        if (
            code &&
            !functionFound
        ) {

            warnings.push(
                "Aucune fonction de contrôle électronique connue n'a été détectée."
            );
        }

        return {
            valid:
                errors.length === 0,
            errors,
            warnings
        };
    }


    function validateCurrentCode() {

        const editor =
            $("electronicCodeEditor");

        if (!editor) return false;

        const result =
            validateCode(
                editor.value
            );

        consoleOutputClear();

        if (result.valid) {

            consoleOutput(
                "✓ Programme syntaxiquement exploitable.",
                "success"
            );

        } else {

            result.errors.forEach(
                error =>
                    consoleOutput(
                        "✕ " + error,
                        "error"
                    )
            );
        }

        result.warnings.forEach(
            warning =>
                consoleOutput(
                    "⚠ " + warning,
                    "warning"
                )
        );

        return result.valid;
    }


    /* ============================================================
       43 — PARSER ARDUINO
    ============================================================ */

    function parseArduinoCode(
        code
    ) {

        const program = {

            digitalWrites: [],

            analogWrites: [],

            pinModes: [],

            delays: [],

            tones: [],

            digitalReads: [],

            analogReads: [],

            variables: {}
        };

        const variablePattern =
            /(?:const\s+int|int)\s+([A-Za-z_]\w*)\s*=\s*(A\d+|\d+)\s*;/gi;

        let match;

        while (
            (match =
                variablePattern.exec(
                    code
                ))
        ) {

            program.variables[
                match[1]
            ] = normalizePin(
                match[2]
            );
        }

        const pinModeRegex =
            /pinMode\s*\(\s*([A-Za-z_]\w*|A\d+|\d+)\s*,\s*(INPUT_PULLUP|INPUT|OUTPUT)\s*\)/gi;

        while (
            (match =
                pinModeRegex.exec(
                    code
                ))
        ) {

            program.pinModes.push({
                pin:
                    resolvePin(
                        match[1],
                        program.variables
                    ),
                mode:
                    match[2].toUpperCase()
            });
        }

        const digitalWriteRegex =
            /digitalWrite\s*\(\s*([A-Za-z_]\w*|A\d+|\d+)\s*,\s*(HIGH|LOW|1|0)\s*\)/gi;

        while (
            (match =
                digitalWriteRegex.exec(
                    code
                ))
        ) {

            program.digitalWrites.push({
                pin:
                    resolvePin(
                        match[1],
                        program.variables
                    ),
                value:
                    /HIGH|1/i.test(
                        match[2]
                    )
                        ? 1
                        : 0
            });
        }

        const analogWriteRegex =
            /analogWrite\s*\(\s*([A-Za-z_]\w*|A\d+|\d+)\s*,\s*(\d+)\s*\)/gi;

        while (
            (match =
                analogWriteRegex.exec(
                    code
                ))
        ) {

            program.analogWrites.push({
                pin:
                    resolvePin(
                        match[1],
                        program.variables
                    ),
                value:
                    Number(
                        match[2]
                    )
            });
        }

        const delayRegex =
            /delay\s*\(\s*(\d+)\s*\)/gi;

        while (
            (match =
                delayRegex.exec(
                    code
                ))
        ) {

            program.delays.push(
                Number(match[1])
            );
        }

        const toneRegex =
            /tone\s*\(\s*([A-Za-z_]\w*|A\d+|\d+)\s*,\s*(\d+)(?:\s*,\s*(\d+))?\s*\)/gi;

        while (
            (match =
                toneRegex.exec(
                    code
                ))
        ) {

            program.tones.push({
                pin:
                    resolvePin(
                        match[1],
                        program.variables
                    ),
                frequency:
                    Number(match[2]),
                duration:
                    match[3]
                        ? Number(match[3])
                        : null
            });
        }

        const digitalReadRegex =
            /digitalRead\s*\(\s*([A-Za-z_]\w*|A\d+|\d+)\s*\)/gi;

        while (
            (match =
                digitalReadRegex.exec(
                    code
                ))
        ) {

            program.digitalReads.push(
                resolvePin(
                    match[1],
                    program.variables
                )
            );
        }

        const analogReadRegex =
            /analogRead\s*\(\s*([A-Za-z_]\w*|A\d+|\d+)\s*\)/gi;

        while (
            (match =
                analogReadRegex.exec(
                    code
                ))
        ) {

            program.analogReads.push(
                resolvePin(
                    match[1],
                    program.variables
                )
            );
        }

        return program;
    }


    function normalizePin(pin) {

        const value =
            String(pin)
                .trim()
                .toUpperCase();

        if (
            /^A\d+$/.test(value)
        ) {
            return value;
        }

        return Number(value);
    }


    function resolvePin(
        value,
        variables
    ) {

        const key =
            String(value)
                .trim();

        if (
            Object.prototype.hasOwnProperty.call(
                variables,
                key
            )
        ) {
            return variables[key];
        }

        return normalizePin(key);
    }


    /* ============================================================
       44 — EXÉCUTION DU CODE
    ============================================================ */

    function executeCurrentCode() {

        const editor =
            $("electronicCodeEditor");

        if (!editor) return;

        const code =
            editor.value;

        const validation =
            validateCode(code);

        if (!validation.valid) {

            validation.errors.forEach(
                error =>
                    consoleOutput(
                        "✕ " + error,
                        "error"
                    )
            );

            toast(
                "Le code contient des erreurs.",
                "error"
            );

            return;
        }

        state.currentCode = code;

        const program =
            parseArduinoCode(
                code
            );

        stopCode(false);

        state.codeRunning = true;

        setStatus(
            "Programme électronique en exécution",
            "running"
        );

        consoleOutput(
            "▶ Programme lancé.",
            "success"
        );

        consoleOutput(
            `Sorties numériques détectées : ${program.digitalWrites.length}`,
            "info"
        );

        consoleOutput(
            `Sorties PWM détectées : ${program.analogWrites.length}`,
            "info"
        );

        executeArduinoProgram(
            program,
            code
        );
    }


    function executeArduinoProgram(
        program,
        rawCode
    ) {

        applyDigitalOutputs(
            program.digitalWrites
        );

        applyAnalogOutputs(
            program.analogWrites
        );

        applyToneOutputs(
            program.tones
        );

        state.components
            .filter(
                c =>
                    c.type ===
                    "arduino"
            )
            .forEach(
                board => {

                    board.metadata.lastProgram =
                        rawCode;

                    board.active = true;
                }
            );

        simulateCircuit();

        const blink =
            detectBlinkProgram(
                rawCode
            );

        if (blink) {

            runBlinkProgram(
                blink
            );
        }

        const traffic =
            detectTrafficProgram(
                rawCode
            );

        if (traffic) {

            runTrafficProgram(
                traffic
            );
        }

        consoleOutput(
            "✓ Programme appliqué aux éléments physiques simulés.",
            "success"
        );

        toast(
            "Code exécuté sur le laboratoire.",
            "success"
        );
    }


    function applyDigitalOutputs(
        outputs
    ) {

        outputs.forEach(
            output => {

                const components =
                    findComponentsByArduinoPin(
                        output.pin
                    );

                if (
                    components.length === 0
                ) {

                    consoleOutput(
                        `⚠ Aucun composant relié à D${output.pin}.`,
                        "warning"
                    );

                    return;
                }

                components.forEach(
                    component => {

                        component.active =
                            output.value === 1;

                        component.brightness =
                            output.value === 1
                                ? 1
                                : 0;

                        component.metadata
                            .digitalValue =
                            output.value;
                    }
                );

                consoleOutput(
                    `D${output.pin} = ${
                        output.value
                            ? "HIGH"
                            : "LOW"
                    }`,
                    "info"
                );
            }
        );

        renderAllComponents();
    }


    function applyAnalogOutputs(
        outputs
    ) {

        outputs.forEach(
            output => {

                const components =
                    findComponentsByArduinoPin(
                        output.pin
                    );

                components.forEach(
                    component => {

                        component.pwm =
                            Math.max(
                                0,
                                Math.min(
                                    255,
                                    output.value
                                )
                            );

                        component.active =
                            output.value > 0;

                        component.brightness =
                            output.value /
                            255;

                        component.metadata
                            .analogValue =
                            output.value;
                    }
                );

                consoleOutput(
                    `${formatPin(output.pin)} PWM = ${output.value}/255`,
                    "info"
                );
            }
        );

        renderAllComponents();
    }


    function applyToneOutputs(
        outputs
    ) {

        outputs.forEach(
            output => {

                const components =
                    findComponentsByArduinoPin(
                        output.pin
                    );

                components.forEach(
                    component => {

                        component.active =
                            true;

                        component.metadata
                            .frequency =
                            output.frequency;
                    }
                );

                state.measurements.frequency =
                    output.frequency;

                text(
                    "frequencyDisplay",
                    `${output.frequency} Hz`
                );

                text(
                    "dashboardFrequency",
                    `${output.frequency} Hz`
                );

                consoleOutput(
                    `${formatPin(output.pin)} → ${output.frequency} Hz`,
                    "success"
                );
            }
        );
    }


    function findComponentsByArduinoPin(
        pin
    ) {

        const normalized =
            normalizePin(pin);

        const direct =
            state.components.filter(
                component =>
                    normalizePin(
                        component.arduinoPin
                    ) === normalized
            );

        if (direct.length) {
            return direct;
        }

        const connected =
            findArduinoConnectedComponents(
                normalized
            );

        return connected;
    }


    function findArduinoConnectedComponents(
        pin
    ) {

        const boards =
            state.components.filter(
                c =>
                    c.type ===
                    "arduino"
            );

        if (!boards.length) {
            return [];
        }

        const result = [];

        boards.forEach(
            board => {

                const pinNames =
                    [
                        String(pin),
                        formatPin(pin)
                    ];

                const matchingWires =
                    state.wires.filter(
                        wire => {

                            const endpoints = [
                                wire.from,
                                wire.to
                            ];

                            return endpoints.some(
                                endpoint =>
                                    endpoint.componentId ===
                                        board.id &&
                                    pinNames.includes(
                                        String(
                                            endpoint.pinName
                                        )
                                    )
                            );
                        }
                    );

                matchingWires.forEach(
                    wire => {

                        const other =
                            wire.from.componentId ===
                                board.id
                                ? wire.to
                                : wire.from;

                        const component =
                            getComponent(
                                other.componentId
                            );

                        if (
                            component &&
                            component.id !==
                                board.id
                        ) {

                            result.push(
                                component
                            );
                        }
                    }
                );
            }
        );

        return [
            ...new Map(
                result.map(
                    component =>
                        [
                            component.id,
                            component
                        ]
                )
            ).values()
        ];
    }


    function formatPin(pin) {

        if (
            typeof pin ===
                "string" &&
            /^A\d+$/i.test(pin)
        ) {
            return pin.toUpperCase();
        }

        return "D" + pin;
    }


    /* ============================================================
       45 — DÉTECTION CLIGNOTEMENT
    ============================================================ */

    function detectBlinkProgram(
        code
    ) {

        const high =
            code.match(
                /digitalWrite\s*\(\s*([A-Za-z_]\w*|\d+)\s*,\s*HIGH\s*\)/i
            );

        const low =
            code.match(
                /digitalWrite\s*\(\s*([A-Za-z_]\w*|\d+)\s*,\s*LOW\s*\)/i
            );

        const delay =
            code.match(
                /delay\s*\(\s*(\d+)\s*\)/i
            );

        if (
            high &&
            low &&
            delay
        ) {

            return {
                pin:
                    resolvePin(
                        high[1],
                        {}
                    ),
                interval:
                    Number(
                        delay[1]
                    )
            };
        }

        return null;
    }


    function runBlinkProgram(
        config
    ) {

        clearInterval(
            state.codeTimer
        );

        let on = false;

        state.codeTimer =
            setInterval(
                () => {

                    if (
                        !state.codeRunning
                    ) {

                        clearInterval(
                            state.codeTimer
                        );

                        return;
                    }

                    on = !on;

                    const components =
                        findComponentsByArduinoPin(
                            config.pin
                        );

                    components.forEach(
                        component => {

                            component.active =
                                on;

                            component.brightness =
                                on ? 1 : 0;
                        }
                    );

                    renderAllComponents();

                },
                Math.max(
                    50,
                    config.interval
                )
            );
    }


    /* ============================================================
       46 — FEU TRICOLORE
    ============================================================ */

    function detectTrafficProgram(
        code
    ) {

        if (
            !/digitalWrite/i.test(
                code
            )
        ) return false;

        return (
            /RED/i.test(code) &&
            /YELLOW/i.test(code) &&
            /GREEN/i.test(code)
        );
    }


    function runTrafficProgram() {

        clearInterval(
            state.codeTimer
        );

        const pins = [
            8,
            9,
            10
        ];

        let index = 0;

        state.codeTimer =
            setInterval(
                () => {

                    if (
                        !state.codeRunning
                    ) {

                        clearInterval(
                            state.codeTimer
                        );

                        return;
                    }

                    state.components.forEach(
                        component => {

                            const pin =
                                normalizePin(
                                    component.arduinoPin
                                );

                            if (
                                pins.includes(
                                    pin
                                )
                            ) {

                                component.active =
                                    pin ===
                                    pins[index];

                                component.brightness =
                                    component.active
                                        ? 1
                                        : 0;
                            }
                        }
                    );

                    index =
                        (
                            index + 1
                        ) % 3;

                    renderAllComponents();

                },
                1000
            );
    }


    /* ============================================================
       47 — STOP CODE
    ============================================================ */

    function stopCode(
        notify = true
    ) {

        state.codeRunning =
            false;

        clearInterval(
            state.codeTimer
        );

        state.codeTimer =
            null;

        if (notify) {

            setStatus(
                "Programme arrêté",
                "ready"
            );

            consoleOutput(
                "■ Programme arrêté.",
                "warning"
            );
        }
    }


    /* ============================================================
       48 — CONSOLE
    ============================================================ */

    function consoleOutput(
        message,
        type = "info"
    ) {

        const consoleEl =
            $("codeConsoleOutput");

        if (!consoleEl) return;

        const line =
            document.createElement(
                "div"
            );

        line.className =
            `console-line ${type}`;

        line.textContent =
            message;

        consoleEl.appendChild(
            line
        );

        consoleEl.scrollTop =
            consoleEl.scrollHeight;
    }


    function consoleOutputClear() {

        const consoleEl =
            $("codeConsoleOutput");

        if (!consoleEl) return;

        consoleEl.innerHTML = "";
    }


    /* ============================================================
       49 — PANNE
    ============================================================ */

    function createOpenCircuitFault() {

        clearFaults();

        const wire =
            state.wires[0];

        if (!wire) {

            toast(
                "Aucun fil disponible pour créer une panne.",
                "warning"
            );

            return;
        }

        wire.fault = "open";

        state.activeFaults.push({
            type: "open",
            target: wire.id
        });

        renderWires();

        simulateCircuit();

        toast(
            "Panne créée : circuit ouvert.",
            "warning"
        );
    }


    function createShortCircuitFault() {

        clearFaults();

        const source =
            state.components.find(
                c =>
                    c.type ===
                    "battery" ||
                    c.type ===
                    "dc-supply"
            );

        if (!source) {

            toast(
                "Ajoutez d'abord une source.",
                "warning"
            );

            return;
        }

        state.activeFaults.push({
            type: "short",
            target: source.id
        });

        source.fault =
            "short";

        simulateCircuit();

        toast(
            "Panne créée : court-circuit.",
            "error"
        );
    }


    function createPolarityFault() {

        const led =
            state.components.find(
                c =>
                    c.type ===
                    "led"
            );

        if (!led) {

            toast(
                "Ajoutez une LED avant de simuler cette panne.",
                "warning"
            );

            return;
        }

        clearFaults();

        led.fault =
            "polarity";

        state.activeFaults.push({
            type: "polarity",
            target: led.id
        });

        simulateCircuit();

        toast(
            "Panne créée : polarité inversée.",
            "warning"
        );
    }


    function createComponentFault() {

        const component =
            state.components.find(
                c =>
                    ![
                        "battery",
                        "dc-supply"
                    ].includes(
                        c.type
                    )
            );

        if (!component) {

            toast(
                "Aucun composant disponible.",
                "warning"
            );

            return;
        }

        clearFaults();

        component.fault =
            "defective";

        state.activeFaults.push({
            type: "component",
            target: component.id
        });

        simulateCircuit();

        toast(
            `Panne simulée sur ${component.name}.`,
            "warning"
        );
    }


    function clearFaults() {

        state.components.forEach(
            c => {
                c.fault = null;
            }
        );

        state.wires.forEach(
            wire => {
                wire.fault = null;
            }
        );

        state.activeFaults = [];

        simulateCircuit();

        toast(
            "Toutes les pannes ont été supprimées.",
            "success"
        );
    }


    /* ============================================================
       50 — DIAGNOSTIC
    ============================================================ */

    let diagnosticPassed = false;

    function diagnoseCircuit() {

        const results =
            $("diagnosticResults");

        if (!results) return;

        results.innerHTML = "";

        diagnosticPassed = true;

        const checks = [];

        if (!hasPowerSource()) {

            checks.push({
                title:
                    "Source d'alimentation",
                ok: false,
                message:
                    "Aucune source détectée."
            });

            diagnosticPassed = false;

        } else {

            checks.push({
                title:
                    "Source d'alimentation",
                ok: true,
                message:
                    "Source détectée."
            });
        }

        if (
            state.activeFaults.length
        ) {

            checks.push({
                title:
                    "Pannes actives",
                ok: false,
                message:
                    `${state.activeFaults.length} panne(s) détectée(s).`
            });

            diagnosticPassed = false;

        } else {

            checks.push({
                title:
                    "Pannes actives",
                ok: true,
                message:
                    "Aucune panne active."
            });
        }

        if (
            state.wires.length === 0
        ) {

            checks.push({
                title:
                    "Câblage",
                ok: false,
                message:
                    "Aucune connexion."
            });

            diagnosticPassed = false;

        } else {

            checks.push({
                title:
                    "Câblage",
                ok: true,
                message:
                    `${state.wires.length} connexion(s).`
            });
        }

        if (
            state.measurements.continuity
        ) {

            checks.push({
                title:
                    "Continuité",
                ok: true,
                message:
                    "Chemin électrique détecté."
            });

        } else {

            checks.push({
                title:
                    "Continuité",
                ok: false,
                message:
                    "Circuit ouvert."
            });

            diagnosticPassed = false;
        }

        checks.forEach(
            check => {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    check.ok
                        ? "diagnostic-ok"
                        : "diagnostic-error";

                card.innerHTML = `
                    <strong>
                        ${check.ok ? "✓" : "✕"}
                        ${escapeHTML(
                            check.title
                        )}
                    </strong>
                    <span>
                        ${escapeHTML(
                            check.message
                        )}
                    </span>
                `;

                results.appendChild(
                    card
                );
            }
        );

        toast(
            diagnosticPassed
                ? "Diagnostic terminé : aucune anomalie critique détectée."
                : "Diagnostic terminé : anomalies détectées.",
            diagnosticPassed
                ? "success"
                : "warning"
        );

        return diagnosticPassed;
    }


    function lastDiagnosticPassed() {
        return diagnosticPassed;
    }


    /* ============================================================
       51 — MISSIONS UI
    ============================================================ */

    function renderMissions(
        level = state.level
    ) {

        const list =
            $("missionsList");

        if (!list) return;

        list.innerHTML = "";

        const missions =
            MISSIONS[level] || [];

        missions.forEach(
            mission => {

                const card =
                    document.createElement(
                        "article"
                    );

                card.className =
                    "mission-card";

                card.innerHTML = `
                    <h3>
                        ${escapeHTML(
                            mission.title
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            mission.description
                        )}
                    </p>

                    <button
                        type="button"
                        data-mission-id="${mission.id}"
                    >
                        Sélectionner
                    </button>
                `;

                list.appendChild(
                    card
                );
            }
        );

        qsa(
            "[data-mission-id]",
            list
        ).forEach(
            button =>
                button.addEventListener(
                    "click",
                    () =>
                        selectMission(
                            button.dataset.missionId
                        )
                )
        );
    }


    function selectMission(id) {

        const missions =
            MISSIONS[state.level] || [];

        const mission =
            missions.find(
                m =>
                    m.id === id
            );

        if (!mission) return;

        state.activeMission =
            mission;

        text(
            "activeMissionTitle",
            mission.title
        );

        text(
            "activeMissionDescription",
            mission.description
        );

        const requirements =
            $("missionRequirements");

        if (requirements) {

            requirements.innerHTML = "";

            mission.requirements.forEach(
                requirement => {

                    const item =
                        document.createElement(
                            "div"
                        );

                    item.textContent =
                        "□ " +
                        requirement;

                    requirements.appendChild(
                        item
                    );
                }
            );
        }

        toast(
            "Mission sélectionnée.",
            "success"
        );
    }


    function startMission() {

        if (!state.activeMission) {

            toast(
                "Sélectionnez d'abord une mission.",
                "warning"
            );

            return;
        }

        state.missionRunning =
            true;

        setStatus(
            "Mission en cours",
            "running"
        );

        toast(
            `Mission commencée : ${state.activeMission.title}`,
            "success"
        );
    }


    function validateMission() {

        if (!state.activeMission) {

            toast(
                "Aucune mission sélectionnée.",
                "warning"
            );

            return;
        }

        if (
            !state.missionRunning
        ) {

            toast(
                "Commencez la mission avant de la valider.",
                "warning"
            );

            return;
        }

        const success =
            !!state.activeMission.validate();

        showMissionResult(
            success,
            state.activeMission
        );
    }


    function showMissionResult(
        success,
        mission
    ) {

        const icon =
            $("missionResultIcon");

        const title =
            $("missionResultTitle");

        const message =
            $("missionResultMessage");

        if (icon) {
            icon.textContent =
                success
                    ? "✓"
                    : "✕";
        }

        if (title) {
            title.textContent =
                success
                    ? "Mission réussie"
                    : "Mission non validée";
        }

        if (message) {

            message.textContent =
                success
                    ? `La mission « ${mission.title} » est validée.`
                    : `La mission « ${mission.title} » n'est pas encore complète. Vérifiez les exigences.`;
        }

        show("missionResultModal");

        if (success) {

            state.missionRunning =
                false;

            setStatus(
                "Mission validée",
                "ready"
            );
        }
    }


    /* ============================================================
       52 — NIVEAUX
    ============================================================ */

    function setLevel(level) {

        if (
            ![
                "beginner",
                "intermediate",
                "expert"
            ].includes(level)
        ) {
            return;
        }

        state.level = level;

        qsa(
            ".level-btn"
        ).forEach(
            btn =>
                btn.classList.toggle(
                    "active",
                    btn.dataset.level === level
                )
        );

        qsa(
            ".code-level-btn"
        ).forEach(
            btn =>
                btn.classList.toggle(
                    "active",
                    btn.id.toLowerCase()
                        .includes(
                            level ===
                                "beginner"
                                ? "beginner"
                                : level ===
                                    "intermediate"
                                    ? "intermediate"
                                    : "expert"
                        )
                )
        );

        qsa(
            ".mission-level-btn"
        ).forEach(
            btn =>
                btn.classList.toggle(
                    "active",
                    btn.dataset.level === level
                )
        );

        renderCodeLibrary(
            level
        );

        renderMissions(
            level
        );

        toast(
            `Niveau ${levelLabel(level)} sélectionné.`,
            "success"
        );
    }


    function levelLabel(level) {

        return {
            beginner: "Débutant",
            intermediate: "Intermédiaire",
            expert: "Expert"
        }[level] || level;
    }






    /* ============================================================
       53 — CATÉGORIES / BIBLIOTHÈQUE DES COMPOSANTS
       ------------------------------------------------------------
       - Affichage visuel des composants
       - Carte 3D autonome sans bibliothèque externe
       - Bouton AJOUTER fonctionnel
       - Compatible avec addComponent()
       - Aucun événement global supplémentaire
    ============================================================ */

    function renderLibraryComponentVisual(
        definition
    ) {

        const type =
            String(
                definition?.type || ""
            ).toLowerCase();

        const name =
            String(
                definition?.name || ""
            ).toLowerCase();


        /* --------------------------------------------------------
           LED
        -------------------------------------------------------- */

        if (
            type === "led" ||
            type === "led-red" ||
            type === "led-green" ||
            type === "led-blue" ||
            type === "led-yellow" ||
            type === "led-white" ||
            type.includes("led") ||
            name.includes("led")
        ) {

            const ledColor =
                definition.color ||
                "#ff3344";

            return `
                <div
                    class="fobas-library-3d fobas-led-3d"
                    style="
                        --fobas-led-color:${escapeHTML(
                            String(ledColor)
                        )};
                    "
                >
                    <div class="fobas-led-shadow"></div>

                    <div class="fobas-led-body">
                        <div class="fobas-led-dome"></div>
                        <div class="fobas-led-highlight"></div>
                    </div>

                    <div class="fobas-led-base">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <div class="fobas-led-pin pin-left"></div>
                    <div class="fobas-led-pin pin-right"></div>
                </div>
            `;
        }


        /* --------------------------------------------------------
           RÉSISTANCE
        -------------------------------------------------------- */

        if (
            type.includes("resistor") ||
            type.includes("resistance") ||
            name.includes("résistance") ||
            name.includes("resistor")
        ) {

            return `
                <div class="fobas-library-3d fobas-resistor-3d">

                    <div class="fobas-wire-left"></div>

                    <div class="fobas-resistor-body">
                        <span class="band band-1"></span>
                        <span class="band band-2"></span>
                        <span class="band band-3"></span>
                        <span class="band band-4"></span>
                        <div class="resistor-highlight"></div>
                    </div>

                    <div class="fobas-wire-right"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           CONDENSATEUR
        -------------------------------------------------------- */

        if (
            type.includes("capacitor") ||
            type.includes("condens") ||
            name.includes("condens")
        ) {

            return `
                <div class="fobas-library-3d fobas-capacitor-3d">

                    <div class="fobas-cap-pin left"></div>

                    <div class="fobas-cap-body">
                        <div class="cap-cylinder"></div>
                        <div class="cap-highlight"></div>
                        <div class="cap-mark">+</div>
                    </div>

                    <div class="fobas-cap-pin right"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           INDUCTEUR / BOBINE
        -------------------------------------------------------- */

        if (
            type.includes("inductor") ||
            type.includes("coil") ||
            type.includes("bobine") ||
            name.includes("induct")
        ) {

            return `
                <div class="fobas-library-3d fobas-inductor-3d">

                    <div class="inductor-wire-left"></div>

                    <div class="inductor-coils">
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                        <i></i>
                    </div>

                    <div class="inductor-wire-right"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           DIODE
        -------------------------------------------------------- */

        if (
            type.includes("diode") ||
            name.includes("diode")
        ) {

            return `
                <div class="fobas-library-3d fobas-diode-3d">

                    <div class="diode-pin"></div>

                    <div class="diode-body">
                        <div class="diode-glass"></div>
                        <div class="diode-band"></div>
                    </div>

                    <div class="diode-pin"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           TRANSISTOR
        -------------------------------------------------------- */

        if (
            type.includes("transistor") ||
            name.includes("transistor")
        ) {

            return `
                <div class="fobas-library-3d fobas-transistor-3d">

                    <div class="transistor-body">
                        <div class="transistor-face">
                            <span>Q</span>
                        </div>
                        <div class="transistor-highlight"></div>
                    </div>

                    <div class="transistor-pin p1"></div>
                    <div class="transistor-pin p2"></div>
                    <div class="transistor-pin p3"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           MOSFET
        -------------------------------------------------------- */

        if (
            type.includes("mosfet") ||
            name.includes("mosfet")
        ) {

            return `
                <div class="fobas-library-3d fobas-mosfet-3d">

                    <div class="mosfet-body">
                        <span>M</span>
                    </div>

                    <div class="mosfet-pin p1"></div>
                    <div class="mosfet-pin p2"></div>
                    <div class="mosfet-pin p3"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           RELAIS
        -------------------------------------------------------- */

        if (
            type.includes("relay") ||
            type.includes("relais") ||
            name.includes("relais") ||
            name.includes("relay")
        ) {

            return `
                <div class="fobas-library-3d fobas-relay-3d">

                    <div class="relay-body">
                        <div class="relay-label">
                            RELAY
                        </div>

                        <div class="relay-window">
                            <span></span>
                        </div>
                    </div>

                    <div class="relay-pin p1"></div>
                    <div class="relay-pin p2"></div>
                    <div class="relay-pin p3"></div>
                    <div class="relay-pin p4"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           INTERRUPTEUR
        -------------------------------------------------------- */

        if (
            type.includes("switch") ||
            type.includes("interrupteur") ||
            name.includes("switch") ||
            name.includes("interrupteur")
        ) {

            return `
                <div class="fobas-library-3d fobas-switch-3d">

                    <div class="switch-terminal left"></div>

                    <div class="switch-base">
                        <div class="switch-lever"></div>
                    </div>

                    <div class="switch-terminal right"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           BOUTON POUSSOIR
        -------------------------------------------------------- */

        if (
            type.includes("button") ||
            type.includes("push") ||
            name.includes("bouton") ||
            name.includes("push")
        ) {

            return `
                <div class="fobas-library-3d fobas-button-3d">

                    <div class="push-button-body">
                        <div class="push-button-cap">
                            <span></span>
                        </div>
                    </div>

                    <div class="push-pin left"></div>
                    <div class="push-pin right"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           POTENTIOMÈTRE
        -------------------------------------------------------- */

        if (
            type.includes("potentiometer") ||
            type.includes("potentiometre") ||
            name.includes("potentiom")
        ) {

            return `
                <div class="fobas-library-3d fobas-potentiometer-3d">

                    <div class="pot-body">
                        <div class="pot-dial">
                            <div class="pot-pointer"></div>
                        </div>
                    </div>

                    <div class="pot-pin p1"></div>
                    <div class="pot-pin p2"></div>
                    <div class="pot-pin p3"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           FUSIBLE
        -------------------------------------------------------- */

        if (
            type.includes("fuse") ||
            type.includes("fusible") ||
            name.includes("fusible") ||
            name.includes("fuse")
        ) {

            return `
                <div class="fobas-library-3d fobas-fuse-3d">

                    <div class="fuse-pin"></div>

                    <div class="fuse-body">
                        <div class="fuse-glass"></div>
                        <div class="fuse-wire"></div>
                    </div>

                    <div class="fuse-pin"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           TRANSFORMATEUR
        -------------------------------------------------------- */

        if (
            type.includes("transformer") ||
            type.includes("transformateur") ||
            name.includes("transformateur")
        ) {

            return `
                <div class="fobas-library-3d fobas-transformer-3d">

                    <div class="transformer-core"></div>

                    <div class="transformer-coil coil-left">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                    <div class="transformer-coil coil-right">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           REDRESSEUR
        -------------------------------------------------------- */

        if (
            type.includes("rectifier") ||
            type.includes("redresseur") ||
            name.includes("redresseur")
        ) {

            return `
                <div class="fobas-library-3d fobas-rectifier-3d">

                    <div class="rectifier-body">
                        <div class="rectifier-mark">~</div>
                        <div class="rectifier-mark">+</div>
                        <div class="rectifier-mark">−</div>
                    </div>

                    <div class="rectifier-pin p1"></div>
                    <div class="rectifier-pin p2"></div>
                    <div class="rectifier-pin p3"></div>
                    <div class="rectifier-pin p4"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           RÉGULATEUR
        -------------------------------------------------------- */

        if (
            type.includes("regulator") ||
            type.includes("regulateur") ||
            name.includes("7805") ||
            name.includes("7812") ||
            name.includes("régulateur")
        ) {

            return `
                <div class="fobas-library-3d fobas-regulator-3d">

                    <div class="regulator-body">
                        <div class="regulator-face">
                            REG
                        </div>
                        <div class="regulator-metal"></div>
                    </div>

                    <div class="regulator-pin p1"></div>
                    <div class="regulator-pin p2"></div>
                    <div class="regulator-pin p3"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           OP AMP
        -------------------------------------------------------- */

        if (
            type.includes("opamp") ||
            type.includes("op-amp") ||
            name.includes("opamp") ||
            name.includes("ampli")
        ) {

            return `
                <div class="fobas-library-3d fobas-opamp-3d">

                    <div class="opamp-body">
                        <span>+</span>
                        <span>−</span>
                        <b>OP</b>
                    </div>

                    <div class="opamp-pin input-plus"></div>
                    <div class="opamp-pin input-minus"></div>
                    <div class="opamp-pin output"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           LOGIQUE
        -------------------------------------------------------- */

        if (
            type.includes("logic") ||
            type.includes("not") ||
            type.includes("and") ||
            type.includes("or") ||
            name.includes("logic")
        ) {

            return `
                <div class="fobas-library-3d fobas-logic-3d">

                    <div class="logic-body">
                        <div class="logic-symbol">
                            ${escapeHTML(
                                definition.symbol || "LOGIC"
                            )}
                        </div>
                    </div>

                    <div class="logic-pin p1"></div>
                    <div class="logic-pin p2"></div>
                    <div class="logic-pin p3"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           SOURCE / BATTERIE
        -------------------------------------------------------- */

        if (
            type.includes("battery") ||
            type.includes("supply") ||
            type.includes("source")
        ) {

            return `
                <div class="fobas-library-3d fobas-power-3d">

                    <div class="power-body">

                        <div class="power-terminal plus">
                            +
                        </div>

                        <div class="power-center">
                            <div></div>
                            <div></div>
                        </div>

                        <div class="power-terminal minus">
                            −
                        </div>

                    </div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           FIL
        -------------------------------------------------------- */

        if (
            type === "wire" ||
            type.includes("wire") ||
            type.includes("fil") ||
            name.includes("fil")
        ) {

            return `
                <div class="fobas-library-3d fobas-wire-3d">

                    <div
                        class="library-wire-line"
                        style="
                            background:${escapeHTML(
                                String(
                                    definition.color ||
                                    "#e7edf5"
                                )
                            )};
                        "
                    ></div>

                    <div class="library-wire-terminal left"></div>
                    <div class="library-wire-terminal right"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           TERMINAL
        -------------------------------------------------------- */

        if (
            type.includes("terminal") ||
            type.includes("ground") ||
            name.includes("terminal") ||
            name.includes("gnd")
        ) {

            return `
                <div class="fobas-library-3d fobas-terminal-3d">

                    <div class="terminal-body">
                        <span>
                            ${escapeHTML(
                                definition.symbol || "●"
                            )}
                        </span>
                    </div>

                    <div class="terminal-pin"></div>

                </div>
            `;
        }


        /* --------------------------------------------------------
           VISUEL GÉNÉRIQUE
        -------------------------------------------------------- */

        return `
            <div class="fobas-library-3d fobas-generic-3d">

                <div class="generic-body">
                    <span>
                        ${escapeHTML(
                            definition.symbol || "●"
                        )}
                    </span>
                </div>

                <div class="generic-pin left"></div>
                <div class="generic-pin right"></div>

            </div>
        `;
    }


    /* ============================================================
       53A — CRÉATION D'UNE CARTE DE BIBLIOTHÈQUE
    ============================================================ */

    function createLibraryComponentCard(
        definition
    ) {

        if (!definition) {
            return null;
        }

        const card =
            document.createElement(
                "article"
            );

        card.className =
            "library-generated-item fobas-library-card";

        card.dataset.component =
            definition.type || "";


        const valueText =
            definition.value !== undefined
                ? `${definition.value}${definition.unit || ""}`
                : "";


        card.innerHTML = `

            <div class="fobas-library-visual">

                ${renderLibraryComponentVisual(
                    definition
                )}

            </div>


            <div class="fobas-library-info">

                <strong class="library-item-name">
                    ${escapeHTML(
                        definition.name ||
                        definition.type ||
                        "Composant"
                    )}
                </strong>

                ${
                    valueText
                        ? `
                            <small class="library-item-value">
                                ${escapeHTML(
                                    String(valueText)
                                )}
                            </small>
                          `
                        : ""
                }

            </div>


            <div class="fobas-library-actions">

                <button
                    type="button"
                    class="fobas-library-add-btn"
                    data-library-add="true"
                    data-component="${escapeHTML(
                        definition.type || ""
                    )}"
                >
                    Ajouter
                </button>

            </div>
        `;


        /* --------------------------------------------------------
           IMPORTANT :
           On attache UNE SEULE action au bouton AJOUTER.
        -------------------------------------------------------- */

        const addButton =
            card.querySelector(
                "[data-library-add='true']"
            );

        if (addButton) {

            addButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();

                    const componentType =
                        addButton.dataset.component;

                    if (!componentType) {

                        toast(
                            "Type de composant introuvable.",
                            "error"
                        );

                        return;
                    }

                    addComponent(
                        componentType
                    );
                }
            );
        }


        return card;
    }


    /* ============================================================
       53B — CATÉGORIE
    ============================================================ */

    function renderCategory(
        category
    ) {

        const grid =
            $("componentLibraryGrid");

        if (!grid) {
            return;
        }


        grid.innerHTML = "";


        const items =
            COMPONENT_LIBRARY[
                category
            ] || [];


        if (!items.length) {

            grid.innerHTML = `
                <div class="fobas-library-empty">
                    Aucun composant disponible
                    dans cette catégorie.
                </div>
            `;

        } else {

            items.forEach(
                definition => {

                    const card =
                        createLibraryComponentCard(
                            definition
                        );

                    if (card) {

                        grid.appendChild(
                            card
                        );
                    }
                }
            );
        }


        /* --------------------------------------------------------
           CATÉGORIE ACTIVE
        -------------------------------------------------------- */

        qsa(
            ".component-category-btn"
        ).forEach(
            btn => {

                btn.classList.toggle(
                    "active",
                    btn.dataset.category ===
                        category
                );
            }
        );
    }


    /* ============================================================
       53C — RECHERCHE
    ============================================================ */

    function searchComponents(
        query
    ) {

        const grid =
            $("componentLibraryGrid");

        if (!grid) {
            return;
        }


        const value =
            String(
                query || ""
            )
                .toLowerCase()
                .trim();


        grid.innerHTML = "";


        const results =
            Object.values(
                COMPONENT_LIBRARY
            )
                .flat()
                .filter(
                    item => {

                        const itemName =
                            String(
                                item.name || ""
                            )
                                .toLowerCase();

                        const itemType =
                            String(
                                item.type || ""
                            )
                                .toLowerCase();

                        const itemValue =
                            String(
                                item.value || ""
                            )
                                .toLowerCase();

                        return (
                            !value ||
                            itemName.includes(
                                value
                            ) ||
                            itemType.includes(
                                value
                            ) ||
                            itemValue.includes(
                                value
                            )
                        );
                    }
                );


        if (!results.length) {

            grid.innerHTML = `
                <div class="fobas-library-empty">
                    Aucun composant trouvé
                    pour :
                    <strong>
                        ${escapeHTML(
                            query || ""
                        )}
                    </strong>
                </div>
            `;

            return;
        }


        results.forEach(
            definition => {

                const card =
                    createLibraryComponentCard(
                        definition
                    );

                if (card) {

                    grid.appendChild(
                        card
                    );
                }
            }
        );
    }







    /* ============================================================
       54 — DÉTAILS COMPOSANT
    ============================================================ */

    let detailsComponentId =
        null;

    function openComponentDetails(
        id
    ) {

        const component =
            getComponent(id);

        if (!component) return;

        detailsComponentId = id;

        text(
            "componentDetailsTitle",
            component.name
        );

        const visual =
            $("componentDetailsVisual");

        if (visual) {

            visual.innerHTML =
                componentMarkup(
                    component
                );
        }

        const properties =
            $("componentDetailsProperties");

        if (properties) {

            const rows = [
                ["Type", component.type],
                ["Valeur", component.value ?? "—"],
                ["Unité", component.unit || "—"],
                ["Tension", component.voltage || "—"],
                ["Broches", component.pins.map(
                    p => p.name
                ).join(", ")],
                ["Rotation", `${component.rotation}°`],
                ["État",
                    component.active
                        ? "ACTIF"
                        : "INACTIF"
                ]
            ];

            properties.innerHTML =
                rows
                    .map(
                        row =>
                            `<div class="property-row">
                                <span>${escapeHTML(row[0])}</span>
                                <strong>${escapeHTML(row[1])}</strong>
                            </div>`
                    )
                    .join("");
        }

        show(
            "componentDetailsModal"
        );
    }


    function updateComponentDetailsIfOpen() {

        const modal =
            $("componentDetailsModal");

        if (
            !modal ||
            modal.classList.contains(
                "hidden"
            )
        ) return;

        if (
            detailsComponentId
        ) {
            openComponentDetails(
                detailsComponentId
            );
        }
    }


    function addComponentFromDetails() {

        if (!detailsComponentId) {
            return;
        }

        const component =
            getComponent(
                detailsComponentId
            );

        if (!component) return;

        addComponent(
            component.type
        );

        hide(
            "componentDetailsModal"
        );
    }


    /* ============================================================
       55 — ARDUINO UNO
    ============================================================ */

    function addArduinoUno() {

        const definition = {

            type: "arduino",

            name: "Arduino UNO",

            symbol: "UNO",

            pins: [
                "D0",
                "D1",
                "D2",
                "D3",
                "D4",
                "D5",
                "D6",
                "D7",
                "D8",
                "D9",
                "D10",
                "D11",
                "D12",
                "D13",
                "A0",
                "A1",
                "A2",
                "A3",
                "A4",
                "A5",
                "5V",
                "3.3V",
                "GND"
            ]
        };

        const board =
            createComponent(
                definition
            );

        if (board) {

            toast(
                "Arduino UNO ajouté au laboratoire.",
                "success"
            );
        }
    }








/* ============================================================
   56 — BOUTONS TOP
============================================================= */




function openLaboratory() {

        hide("codeLibraryPanel");
        hide("codeEditorPanel");
        hide("missionsPanel");
        hide("diagnosticPanel");
        hide("faultsPanel");
        hide("measurementsPanel");

        toast(
            "Laboratoire ouvert.",
            "info"
        );
    }







function openComponentLibrary() {

    hide("codeLibraryPanel");
    hide("codeEditorPanel");
    hide("missionsPanel");
    hide("diagnosticPanel");
    hide("faultsPanel");
    hide("measurementsPanel");

    show("componentLibraryPanel");

    const button =
        $("libraryBtn");

    if (button) {
        button.setAttribute(
            "aria-expanded",
            "true"
        );
    }

    toast(
        "Bibliothèque des composants active.",
        "info"
    );
}












    function openCodeLibrary() {

        renderCodeLibrary(
            state.level
        );

        show(
            "codeLibraryPanel"
        );
    }


    function openCodeEditor() {

        show(
            "codeEditorPanel"
        );

        const editor =
            $("electronicCodeEditor");

        if (
            editor &&
            !editor.value &&
            state.currentCode
        ) {
            editor.value =
                state.currentCode;
        }
    }


    function openMissions() {

        renderMissions(
            state.level
        );

        show(
            "missionsPanel"
        );
    }


    function openMeasurements() {

        simulateCircuit();

        show(
            "measurementsPanel"
        );
    }


    function openDiagnostic() {

        diagnoseCircuit();

        show(
            "diagnosticPanel"
        );
    }


    function openFaults() {

        show(
            "faultsPanel"
        );
    }
















    

    /* ============================================================
       57 — SAUVEGARDE
    ============================================================ */

    function projectData() {

        return {

            version:
                ENGINE_VERSION,

            level:
                state.level,

            components:
                state.components,

            wires:
                state.wires,

            zoom:
                state.zoom,

            panX:
                state.panX,

            panY:
                state.panY,

            gridVisible:
                state.gridVisible,

            snapEnabled:
                state.snapEnabled,

            currentCode:
                state.currentCode,

            activeMissionId:
                state.activeMission
                    ? state.activeMission.id
                    : null,

            activeFaults:
                state.activeFaults
        };
    }


    function saveProject() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(
                    projectData()
                )
            );

            sessionStorage.setItem(
                SESSION_KEY,
                JSON.stringify(
                    projectData()
                )
            );

            toast(
                "Projet sauvegardé localement.",
                "success"
            );

        } catch (error) {

            console.error(error);

            toast(
                "Impossible de sauvegarder le projet.",
                "error"
            );
        }
    }


    function loadProject() {

        try {

            const raw =
                localStorage.getItem(
                    STORAGE_KEY
                );

            if (!raw) {

                toast(
                    "Aucun projet sauvegardé.",
                    "warning"
                );

                return;
            }

            restoreProject(
                JSON.parse(raw)
            );

            toast(
                "Projet chargé.",
                "success"
            );

        } catch (error) {

            console.error(error);

            toast(
                "Projet invalide ou endommagé.",
                "error"
            );
        }
    }


    function restoreProject(
        data
    ) {

        if (
            !data ||
            !Array.isArray(
                data.components
            )
        ) {

            throw new Error(
                "Format projet invalide."
            );
        }

        state.components =
            data.components;

        state.wires =
            Array.isArray(
                data.wires
            )
                ? data.wires
                : [];

        state.level =
            data.level ||
            "beginner";

        state.zoom =
            Number(
                data.zoom
            ) || 1;

        state.panX =
            Number(
                data.panX
            ) || 0;

        state.panY =
            Number(
                data.panY
            ) || 0;

        state.gridVisible =
            data.gridVisible !== false;

        state.snapEnabled =
            data.snapEnabled !== false;

        state.currentCode =
            data.currentCode ||
            "";

        state.activeFaults =
            Array.isArray(
                data.activeFaults
            )
                ? data.activeFaults
                : [];

        const editor =
            $("electronicCodeEditor");

        if (editor) {
            editor.value =
                state.currentCode;
        }

        renderAllComponents();

        renderWires();

        setZoom(
            state.zoom
        );

        updateWorkspace();

        simulateCircuit();

        setLevel(
            state.level
        );
    }


    /* ============================================================
       58 — EXPORT / IMPORT
    ============================================================ */

    function exportProject() {

        const data =
            JSON.stringify(
                projectData(),
                null,
                2
            );

        const blob =
            new Blob(
                [data],
                {
                    type:
                        "application/json"
                }
            );

        const url =
            URL.createObjectURL(
                blob
            );

        const a =
            document.createElement(
                "a"
            );

        a.href = url;

        a.download =
            "fobas-electronique-projet.json";

        document.body.appendChild(a);

        a.click();

        a.remove();

        URL.revokeObjectURL(
            url
        );

        toast(
            "Projet exporté.",
            "success"
        );
    }


    function importProjectFile(
        file
    ) {

        if (!file) return;

        const reader =
            new FileReader();

        reader.onload =
            event => {

                try {

                    const data =
                        JSON.parse(
                            event.target.result
                        );

                    restoreProject(
                        data
                    );

                    saveProject();

                    toast(
                        "Projet importé avec succès.",
                        "success"
                    );

                } catch (error) {

                    console.error(error);

                    toast(
                        "Fichier projet invalide.",
                        "error"
                    );
                }
            };

        reader.readAsText(
            file
        );
    }


    /* ============================================================
       59 — HISTORIQUE UNDO / REDO
    ============================================================ */

    function snapshot() {

        return JSON.stringify({
            components:
                state.components,
            wires:
                state.wires
        });
    }


    function pushHistory() {

        const snap =
            snapshot();

        if (
            state.history[
                state.historyIndex
            ] === snap
        ) {
            return;
        }

        state.history =
            state.history.slice(
                0,
                state.historyIndex + 1
            );

        state.history.push(
            snap
        );

        if (
            state.history.length >
            50
        ) {

            state.history.shift();
        }

        state.historyIndex =
            state.history.length - 1;
    }


    function restoreSnapshot(
        snap
    ) {

        const data =
            JSON.parse(
                snap
            );

        state.components =
            data.components || [];

        state.wires =
            data.wires || [];

        renderAllComponents();

        renderWires();

        updateWorkspace();

        simulateCircuit();
    }


    function undo() {

        if (
            state.historyIndex <= 0
        ) {

            toast(
                "Aucune action à annuler.",
                "warning"
            );

            return;
        }

        state.historyIndex--;

        restoreSnapshot(
            state.history[
                state.historyIndex
            ]
        );

        toast(
            "Action annulée.",
            "info"
        );
    }


    function redo() {

        if (
            state.historyIndex >=
            state.history.length - 1
        ) {

            toast(
                "Aucune action à rétablir.",
                "warning"
            );

            return;
        }

        state.historyIndex++;

        restoreSnapshot(
            state.history[
                state.historyIndex
            ]
        );

        toast(
            "Action rétablie.",
            "info"
        );
    }


    /* ============================================================
       60 — VIDER LABORATOIRE
    ============================================================ */

    function clearWorkspace() {

        const confirmed =
            window.confirm(
                "Voulez-vous vraiment vider complètement le laboratoire ?"
            );

        if (!confirmed) return;

        state.components = [];
        state.wires = [];

        state.selectedComponentId =
            null;

        state.selectedWireId =
            null;

        state.pendingWirePin =
            null;

        state.powerOn =
            false;

        state.activeFaults =
            [];

        state.measurements = {
            voltage: 0,
            current: 0,
            resistance: null,
            frequency: 0,
            power: 0,
            continuity: false
        };

        pushHistory();

        renderAllComponents();

        renderWires();

        updateWorkspace();

        updateMeasurementDisplays();

        setStatus(
            "Laboratoire vide",
            "ready"
        );

        toast(
            "Laboratoire vidé.",
            "success"
        );
    }


    /* ============================================================
       61 — SIMULATION EFFECTS
    ============================================================ */

    function startSimulationEffects() {

        if (
            state.simulationTimer
        ) {
            return;
        }

        state.simulationTimer =
            setInterval(
                () => {

                    if (
                        state.circuitRunning
                    ) {

                        simulateCircuit();
                    }
                },
                300
            );
    }


    function stopSimulationEffects() {

        clearInterval(
            state.simulationTimer
        );

        state.simulationTimer =
            null;
    }


    /* ============================================================
       62 — INITIALISATION DES BOUTONS
    ============================================================ */

    function bind(
        id,
        event,
        handler
    ) {

        const el = $(id);

        if (!el) return;

        el.addEventListener(
            event,
            handler
        );
    }


    function setupEvents() {

        /* TOP */




bind(
    "libraryBtn",
    "click",
    () => {
        hide("codeLibraryPanel");
        hide("codeEditorPanel");
        hide("missionsPanel");
        hide("diagnosticPanel");
        hide("faultsPanel");
        hide("measurementsPanel");

        show("componentLibraryPanel");

        const button = document.getElementById("libraryBtn");

        if (button) {
            button.setAttribute("aria-expanded", "true");
        }

        toast(
            "Bibliothèque des composants active.",
            "info"
        );
    }
);









        bind(
            "codeLibraryBtn",
            "click",
            openCodeLibrary
        );

        bind(
            "codeEditorBtn",
            "click",
            openCodeEditor
        );

        bind(
            "missionsBtn",
            "click",
            openMissions
        );

        bind(
            "measurementsBtn",
            "click",
            openMeasurements
        );

        bind(
            "diagnosticBtn",
            "click",
            openDiagnostic
        );

        bind(
            "faultsBtn",
            "click",
            openFaults
        );


        /* NIVEAUX */

        bind(
            "beginnerLevelBtn",
            "click",
            () =>
                setLevel("beginner")
        );

        bind(
            "intermediateLevelBtn",
            "click",
            () =>
                setLevel("intermediate")
        );

        bind(
            "expertLevelBtn",
            "click",
            () =>
                setLevel("expert")
        );


        /* CATEGORIES */

        qsa(
            ".component-category-btn"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        renderCategory(
                            button.dataset.category
                        )
                );
            }
        );


        /* RECHERCHE */

        bind(
            "componentSearchBtn",
            "click",
            () => {

                const input =
                    $("componentSearchInput");

                if (input) {
                    input.focus();
                }
            }
        );

        bind(
            "componentSearchInput",
            "input",
            event =>
                searchComponents(
                    event.target.value
                )
        );


        /* SOURCES */

        qsa(
            "[data-component]"
        ).forEach(
            button => {

                if (
                    button.closest(
                        "#componentLibraryGrid"
                    )
                ) return;

                button.addEventListener(
                    "click",
                    () =>
                        addComponent(
                            button.dataset.component
                        )
                );
            }
        );


        /* INSTRUMENTS */

        qsa(
            "[data-instrument]"
        ).forEach(
            button => {

                button.addEventListener(
                    "click",
                    () =>
                        addInstrument(
                            button.dataset.instrument
                        )
                );
            }
        );


        /* WORKSPACE TOOLS */

        bind(
            "selectToolBtn",
            "click",
            () =>
                setTool("select")
        );

        bind(
            "wireToolBtn",
            "click",
            () =>
                setTool("wire")
        );

        bind(
            "moveToolBtn",
            "click",
            () =>
                setTool("move")
        );

        bind(
            "rotateToolBtn",
            "click",
            () =>
                setTool("rotate")
        );

        bind(
            "deleteToolBtn",
            "click",
            () =>
                setTool("delete")
        );

        bind(
            "duplicateToolBtn",
            "click",
            () =>
                setTool("duplicate")
        );


        /* ZOOM */

        bind(
            "zoomInBtn",
            "click",
            zoomIn
        );

        bind(
            "zoomOutBtn",
            "click",
            zoomOut
        );

        bind(
            "zoomResetBtn",
            "click",
            resetZoom
        );

        bind(
            "fitWorkspaceBtn",
            "click",
            fitWorkspace
        );


        /* CIRCUIT */

        bind(
            "powerOnBtn",
            "click",
            powerOn
        );

        bind(
            "powerOffBtn",
            "click",
            powerOff
        );

        bind(
            "runCircuitBtn",
            "click",
            runCircuit
        );

        bind(
            "stopCircuitBtn",
            "click",
            stopCircuit
        );

        bind(
            "resetCircuitBtn",
            "click",
            resetCircuit
        );


        /* MESURES */

        bind(
            "measureVoltageBtn",
            "click",
            measureVoltage
        );

        bind(
            "measureCurrentBtn",
            "click",
            measureCurrent
        );

        bind(
            "measureResistanceBtn",
            "click",
            measureResistance
        );


        /* CODE */

        bind(
            "openCodeEditorBtn",
            "click",
            openCodeEditor
        );

        bind(
            "executeCodeBtn",
            "click",
            executeCurrentCode
        );

        bind(
            "stopCodeBtn",
            "click",
            () =>
                stopCode(true)
        );

        bind(
            "clearCodeBtn",
            "click",
            () => {

                const editor =
                    $("electronicCodeEditor");

                if (editor) {
                    editor.value = "";
                }

                state.currentCode = "";

                toast(
                    "Code effacé.",
                    "success"
                );
            }
        );


        bind(
            "pasteCodeBtn",
            "click",
            pasteCode
        );

        bind(
            "copyCodeBtn",
            "click",
            copyCurrentCode
        );

        bind(
            "validateCodeBtn",
            "click",
            validateCurrentCode
        );

        bind(
            "executeEditorCodeBtn",
            "click",
            executeCurrentCode
        );

        bind(
            "stopEditorCodeBtn",
            "click",
            () =>
                stopCode(true)
        );

        bind(
            "clearEditorCodeBtn",
            "click",
            () => {

                const editor =
                    $("electronicCodeEditor");

                if (editor) {
                    editor.value = "";
                }

                state.currentCode = "";

                consoleOutputClear();

                toast(
                    "Éditeur effacé.",
                    "success"
                );
            }
        );


        /* CODE LIBRARY LEVELS */

        bind(
            "codeBeginnerBtn",
            "click",
            () =>
                renderCodeLibrary(
                    "beginner"
                )
        );

        bind(
            "codeIntermediateBtn",
            "click",
            () =>
                renderCodeLibrary(
                    "intermediate"
                )
        );

        bind(
            "codeExpertBtn",
            "click",
            () =>
                renderCodeLibrary(
                    "expert"
                )
        );


        /* MISSIONS */

        bind(
            "beginnerMissionsBtn",
            "click",
            () => {

                state.level =
                    "beginner";

                renderMissions(
                    "beginner"
                );
            }
        );

        bind(
            "intermediateMissionsBtn",
            "click",
            () => {

                state.level =
                    "intermediate";

                renderMissions(
                    "intermediate"
                );
            }
        );

        bind(
            "expertMissionsBtn",
            "click",
            () => {

                state.level =
                    "expert";

                renderMissions(
                    "expert"
                );
            }
        );

        bind(
            "startMissionBtn",
            "click",
            startMission
        );

        bind(
            "validateMissionBtn",
            "click",
            validateMission
        );


        /* DIAGNOSTIC */

        bind(
            "runDiagnosticBtn",
            "click",
            diagnoseCircuit
        );


        /* FAULTS */

        bind(
            "createOpenCircuitFaultBtn",
            "click",
            createOpenCircuitFault
        );

        bind(
            "createShortCircuitFaultBtn",
            "click",
            createShortCircuitFault
        );

        bind(
            "createPolarityFaultBtn",
            "click",
            createPolarityFault
        );

        bind(
            "createComponentFaultBtn",
            "click",
            createComponentFault
        );

        bind(
            "clearFaultsBtn",
            "click",
            clearFaults
        );


        /* PROJECT */

        bind(
            "saveProjectBtn",
            "click",
            saveProject
        );

        bind(
            "loadProjectBtn",
            "click",
            loadProject
        );

        bind(
            "clearWorkspaceBtn",
            "click",
            clearWorkspace
        );

        bind(
            "projectFileInput",
            "change",
            event => {

                const file =
                    event.target.files?.[0];

                importProjectFile(
                    file
                );

                event.target.value =
                    "";
            }
        );


        /* MODALS */

        bind(
            "closeCodeLibraryBtn",
            "click",
            () =>
                hide(
                    "codeLibraryPanel"
                )
        );

        bind(
            "closeCodeEditorBtn",
            "click",
            () =>
                hide(
                    "codeEditorPanel"
                )
        );

        bind(
            "closeMissionsBtn",
            "click",
            () =>
                hide(
                    "missionsPanel"
                )
        );

        bind(
            "closeDiagnosticBtn",
            "click",
            () =>
                hide(
                    "diagnosticPanel"
                )
        );

        bind(
            "closeFaultsBtn",
            "click",
            () =>
                hide(
                    "faultsPanel"
                )
        );

        bind(
            "closeMeasurementsBtn",
            "click",
            () =>
                hide(
                    "measurementsPanel"
                )
        );

        bind(
            "closeComponentDetailsBtn",
            "click",
            () =>
                hide(
                    "componentDetailsModal"
                )
        );



        /* ========================================================
           FERMETURE BIBLIOTHÈQUE DES COMPOSANTS
        ======================================================== */

        bind(
            "closeComponentLibraryBtn",
            "click",
            () => {

                hide(
                    "componentLibraryPanel"
                );

                const libraryButton =
                    $("libraryBtn");

                if (libraryButton) {

                    libraryButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );
                }
            }
        );








        bind(
            "addComponentFromDetailsBtn",
            "click",
            addComponentFromDetails
        );

        bind(
            "closeMissionResultBtn",
            "click",
            () =>
                hide(
                    "missionResultModal"
                )
        );


        /* FILE IMPORT */

        bind(
            "loadProjectBtn",
            "dblclick",
            () => {

                const input =
                    $("projectFileInput");

                if (input) {
                    input.click();
                }
            }
        );


        /* CANVAS */

        const canvas =
            $("laboratoryCanvas");

        if (canvas) {

            canvas.addEventListener(
                "pointerdown",
                event => {

                    if (
                        event.target ===
                            canvas ||
                        event.target ===
                            $("laboratoryGrid")
                    ) {

                        state.selectedComponentId =
                            null;

                        state.selectedWireId =
                            null;

                        renderAllComponents();
                    }
                }
            );
        }
    }


    /* ============================================================
       63 — ÉVÉNEMENTS GLOBAUX
    ============================================================ */

    function setupGlobalEvents() {

        document.addEventListener(
            "pointermove",
            moveComponent
        );

        document.addEventListener(
            "pointerup",
            endComponentDrag
        );

        document.addEventListener(
            "keydown",
            event => {

                const target =
                    event.target;

                const editing =
                    target &&
                    (
                        target.tagName ===
                            "TEXTAREA" ||
                        target.tagName ===
                            "INPUT"
                    );

                if (
                    event.key ===
                    "Delete"
                ) {

                    if (!editing) {
                        deleteSelected();
                    }

                    return;
                }

                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() ===
                        "z"
                ) {

                    event.preventDefault();

                    undo();

                    return;
                }

                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() ===
                        "y"
                ) {

                    event.preventDefault();

                    redo();

                    return;
                }

                if (
                    event.ctrlKey &&
                    event.key.toLowerCase() ===
                        "s"
                ) {

                    event.preventDefault();

                    saveProject();

                    return;
                }

                if (
                    event.key === "+"
                ) {

                    zoomIn();

                    return;
                }

                if (
                    event.key === "-"
                ) {

                    zoomOut();

                    return;
                }

                if (
                    event.key === "Escape"
                ) {

                    state.pendingWirePin =
                        null;

                    state.drag.active =
                        false;

                    return;
                }
            }
        );

        window.addEventListener(
            "resize",
            () => {

                renderWires();
            }
        );
    }


    /* ============================================================
       64 — INITIALISATION
    ============================================================ */

    function initialize() {

        console.log(
            `[${ENGINE_NAME}] v${ENGINE_VERSION}`
        );

        setupEvents();

        setupGlobalEvents();

        setupTouchZoom();

        renderCategory(
            "resistors"
        );

        renderCodeLibrary(
            state.level
        );

        renderMissions(
            state.level
        );

        updateWorkspace();

        updateMeasurementDisplays();

        applyCanvasTransform();

        startSimulationEffects();

        pushHistory();

        setStatus(
            "Simulation prête",
            "ready"
        );

        text(
            "engineVersion",
            `Electronic Engine v${ENGINE_VERSION}`
        );

        /*
         * Arduino UNO n'est pas affiché automatiquement.
         * Il peut être ajouté depuis la bibliothèque dynamique
         * via la fonction publique ci-dessous.
         */

        toast(
            "FOBAS Electronic Engine prêt.",
            "success"
        );
    }


    /* ============================================================
       65 — API PUBLIQUE FOBAS
    ============================================================ */

    window.FOBAS_ELECTRONIC_ENGINE = {

        version:
            ENGINE_VERSION,

        state,

        addComponent,

        addInstrument,

        addArduinoUno,

        createWire,

        deleteComponent,

        deleteWire,

        rotateComponent,

        duplicateComponent,

        simulateCircuit,

        powerOn,

        powerOff,

        runCircuit,

        stopCircuit,

        resetCircuit,

        executeCurrentCode,

        validateCurrentCode,

        openCodeLibrary,

        openCodeEditor,

        openMissions,

        openMeasurements,

        openDiagnostic,

        openFaults,

        diagnoseCircuit,

        createOpenCircuitFault,

        createShortCircuitFault,

        createPolarityFault,

        createComponentFault,

        clearFaults,

        saveProject,

        loadProject,

        exportProject,

        importProjectFile,

        clearWorkspace,

        undo,

        redo,

        setZoom,

        zoomIn,

        zoomOut,

        resetZoom,

        fitWorkspace,

        setLevel,

        selectMission,

        startMission,

        validateMission
    };


    /* ============================================================
       66 — INITIALISATION DOM
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
















/* ================================================================
   FOBAS ELECTRONIQUE
   PHYSICAL COMPONENT EXTENSION — V2
   ---------------------------------------------------------------
   Extension autonome pou:
   - Breadboard
   - Mini Breadboard
   - Protoboard
   - PCB
   - Terminal Board
   - Arduino UNO
   - Arduino Nano
   - ESP32
   - Raspberry Pi
   - Motors
   - Sensors
   - Displays
   - Communication modules
   - Robotics modules

   IMPORTANT:
   - PA MODIFIE PAS HTML
   - PA ITILIZE THREE.JS
   - PA ITILIZE BIBLIYOTÈK EXTERNE
   - OBJÈ YO RANN DIRÈKTEMAN NAN #componentLayer
   - SOURIS + TOUCH
   - DÉPLACEMENT
   - SÉLECTION
   - ROTATION
   - DUPLICATION
   - SUPPRESSION
   - BIBLIOTHÈQUE DINAMIK
================================================================ */

(function FOBASPhysicalComponentExtensionV2 () {

    "use strict";


    /* ============================================================
       1. DEFINITIONS DES OBJETS
    ============================================================ */

    const PHYSICAL_COMPONENTS = {

        breadboard: {
            type: "breadboard",
            name: "Breadboard",
            label: "Plaque d'essai sans soudure",
            category: "boards",
            value: "830 points",
            width: 300,
            height: 150,
            pins: 830,
            color: "#e3e7eb"
        },

        miniBreadboard: {
            type: "mini-breadboard",
            name: "Mini Breadboard",
            label: "Mini-plaque d'essai",
            category: "boards",
            value: "170 points",
            width: 230,
            height: 125,
            pins: 170,
            color: "#e7ebef"
        },

        protoboard: {
            type: "protoboard",
            name: "Protoboard",
            label: "Plaque de prototypage",
            category: "boards",
            value: "Prototype",
            width: 280,
            height: 150,
            pins: 500,
            color: "#d9dedb"
        },

        pcb: {
            type: "pcb",
            name: "PCB",
            label: "Carte de circuit imprimé",
            category: "boards",
            value: "PCB",
            width: 270,
            height: 160,
            pins: 80,
            color: "#17442e"
        },

        terminalBoard: {
            type: "terminal-board",
            name: "Terminal Board",
            label: "Carte de bornes",
            category: "boards",
            value: "12 bornes",
            width: 250,
            height: 125,
            pins: 12,
            color: "#252b31"
        },


        arduinoUno: {
            type: "arduino-uno",
            name: "Arduino UNO",
            label: "Arduino UNO R3",
            category: "controllers",
            value: "ATmega328P",
            width: 280,
            height: 145,
            pins: 14,
            color: "#168b73"
        },

        arduinoNano: {
            type: "arduino-nano",
            name: "Arduino Nano",
            label: "Arduino Nano",
            category: "controllers",
            value: "ATmega328P",
            width: 180,
            height: 95,
            pins: 22,
            color: "#168b73"
        },

        esp32: {
            type: "esp32",
            name: "ESP32",
            label: "ESP32 Dev Board",
            category: "controllers",
            value: "Wi-Fi + Bluetooth",
            width: 205,
            height: 110,
            pins: 30,
            color: "#25292d"
        },

        raspberryPi: {
            type: "raspberry-pi",
            name: "Raspberry Pi",
            label: "Raspberry Pi GPIO",
            category: "controllers",
            value: "40 GPIO",
            width: 250,
            height: 150,
            pins: 40,
            color: "#70264f"
        },


        dcMotor: {
            type: "dc-motor",
            name: "DC Motor",
            label: "Moteur CC",
            category: "motors",
            value: "6 V",
            width: 145,
            height: 110,
            pins: 2,
            color: "#7d858d"
        },

        servoMotor: {
            type: "servo-motor",
            name: "Servo Motor",
            label: "Servomoteur SG90",
            category: "motors",
            value: "SG90",
            width: 145,
            height: 125,
            pins: 3,
            color: "#315f8c"
        },

        stepperMotor: {
            type: "stepper-motor",
            name: "Stepper Motor",
            label: "Moteur pas à pas",
            category: "motors",
            value: "4 phases",
            width: 150,
            height: 125,
            pins: 4,
            color: "#4d5359"
        },

        motorDriver: {
            type: "motor-driver",
            name: "Motor Driver",
            label: "Pilote moteur L298N",
            category: "motor-drivers",
            value: "L298N",
            width: 210,
            height: 135,
            pins: 12,
            color: "#25343d"
        },

        buzzer: {
            type: "buzzer",
            name: "Buzzer",
            label: "Buzzer",
            category: "actuators",
            value: "5 V",
            width: 100,
            height: 90,
            pins: 2,
            color: "#16191d"
        },


        ultrasonicSensor: {
            type: "ultrasonic",
            name: "Ultrasonic Sensor",
            label: "Capteur ultrasonique",
            category: "sensors",
            value: "HC-SR04",
            width: 190,
            height: 115,
            pins: 4,
            color: "#286a75"
        },

        infraredSensor: {
            type: "infrared-sensor",
            name: "Infrared Sensor",
            label: "Capteur infrarouge",
            category: "sensors",
            value: "IR",
            width: 145,
            height: 95,
            pins: 3,
            color: "#22262b"
        },

        lightSensor: {
            type: "light-sensor",
            name: "Light Sensor",
            label: "Capteur de lumière",
            category: "sensors",
            value: "LDR",
            width: 145,
            height: 100,
            pins: 2,
            color: "#b7a12d"
        },

        temperatureSensor: {
            type: "temperature-sensor",
            name: "Temperature Sensor",
            label: "Capteur température LM35",
            category: "sensors",
            value: "LM35",
            width: 145,
            height: 100,
            pins: 3,
            color: "#4b7391"
        },

        distanceSensor: {
            type: "distance-sensor",
            name: "Distance Sensor",
            label: "Capteur de distance",
            category: "sensors",
            value: "ToF",
            width: 160,
            height: 105,
            pins: 4,
            color: "#354b5d"
        },

        joystick: {
            type: "joystick",
            name: "Joystick",
            label: "Joystick 2 axes",
            category: "input",
            value: "2 axes",
            width: 150,
            height: 145,
            pins: 5,
            color: "#292d31"
        },

        rotaryEncoder: {
            type: "rotary-encoder",
            name: "Rotary Encoder",
            label: "Encodeur rotatif",
            category: "input",
            value: "Encoder",
            width: 130,
            height: 105,
            pins: 5,
            color: "#5e646b"
        },


        lcd1602: {
            type: "lcd1602",
            name: "LCD 16x2",
            label: "Écran LCD",
            category: "displays",
            value: "16 × 2",
            width: 190,
            height: 105,
            pins: 16,
            color: "#23382d"
        },

        oled: {
            type: "oled",
            name: "OLED Display",
            label: "Écran OLED",
            category: "displays",
            value: "128 × 64",
            width: 165,
            height: 115,
            pins: 4,
            color: "#111820"
        },

        rgbLed: {
            type: "rgb-led",
            name: "RGB LED",
            label: "LED RGB",
            category: "leds",
            value: "RGB",
            width: 115,
            height: 100,
            pins: 4,
            color: "#28303a"
        },

        ledMatrix: {
            type: "led-matrix",
            name: "LED Matrix",
            label: "Matrice LED",
            category: "displays",
            value: "8 × 8",
            width: 180,
            height: 180,
            pins: 16,
            color: "#1b2026"
        },

        keypad: {
            type: "keypad",
            name: "Matrix Keypad",
            label: "Clavier matriciel",
            category: "input",
            value: "4 × 4",
            width: 180,
            height: 160,
            pins: 8,
            color: "#20252a"
        },


        bluetoothModule: {
            type: "bluetooth-module",
            name: "Bluetooth Module",
            label: "Module Bluetooth HC-05",
            category: "communication",
            value: "HC-05",
            width: 175,
            height: 105,
            pins: 6,
            color: "#28547a"
        },

        wifiModule: {
            type: "wifi-module",
            name: "Wi-Fi Module",
            label: "Module Wi-Fi ESP8266",
            category: "communication",
            value: "ESP8266",
            width: 180,
            height: 105,
            pins: 8,
            color: "#30363d"
        },

        relayModule: {
            type: "relay-module",
            name: "Relay Module",
            label: "Module relais 1 canal",
            category: "modules",
            value: "1 canal",
            width: 180,
            height: 120,
            pins: 6,
            color: "#263238"
        },

        voltageSensor: {
            type: "voltage-sensor",
            name: "Voltage Sensor",
            label: "Capteur de tension",
            category: "sensors",
            value: "0–25 V",
            width: 160,
            height: 105,
            pins: 3,
            color: "#384b59"
        },

        currentSensor: {
            type: "current-sensor",
            name: "Current Sensor",
            label: "Capteur de courant ACS712",
            category: "sensors",
            value: "ACS712",
            width: 165,
            height: 110,
            pins: 3,
            color: "#35434b"
        }
    };


    /* ============================================================
       2. ETAT
    ============================================================ */

    const physicalState = {
        objects: [],
        selectedId: null,
        sequence: 0
    };


    /* ============================================================
       3. OUTILS DOM
    ============================================================ */

    function $(id) {
        return document.getElementById(id);
    }

    function getCanvas() {
        return $("laboratoryCanvas");
    }

    function getLayer() {
        return $("componentLayer");
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function makeId(type) {
        physicalState.sequence++;

        return (
            "physical_" +
            String(type)
                .replace(/[^a-zA-Z0-9_-]/g, "_") +
            "_" +
            Date.now().toString(36) +
            "_" +
            physicalState.sequence
        );
    }

    function escapeHTML(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }


    /* ============================================================
       4. CSS AUTONOME POUR LES OBJETS PHYSIQUES
       ------------------------------------------------------------
       Sa fè extension nan pa depann de CSS prensipal la pou
       objè yo ka vizib.
    ============================================================ */

    function installPhysicalCSS() {

        if ($("fobasPhysicalExtensionCSS")) {
            return;
        }

        const style = document.createElement("style");

        style.id = "fobasPhysicalExtensionCSS";

        style.textContent = `
            #componentLayer {
                position: absolute;
                inset: 0;
                z-index: 30;
                pointer-events: auto;
            }

            .fobas-physical-object {
                box-sizing: border-box;
                display: block;
                position: absolute;
                cursor: grab;
                overflow: visible;
                border: 2px solid rgba(255,255,255,.28);
                border-radius: 10px;
                background: #1b2430;
                color: #fff;
                box-shadow:
                    0 8px 22px rgba(0,0,0,.35),
                    inset 0 1px 0 rgba(255,255,255,.12);
                z-index: 35;
                touch-action: none !important;
                user-select: none;
                -webkit-user-select: none;
                will-change: left, top, transform;
            }

            .fobas-physical-object:active {
                cursor: grabbing;
            }

            .fobas-physical-selected {
                outline: 3px solid #ffd43b;
                outline-offset: 3px;
                z-index: 100;
            }

            .fobas-physical-header {
                position: absolute;
                left: 0;
                right: 0;
                top: 0;
                height: 25px;
                padding: 4px 8px;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0,0,0,.34);
                border-radius: 8px 8px 0 0;
                font: 700 11px/1 Arial,sans-serif;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                pointer-events: none;
            }

            .fobas-physical-body {
                position: absolute;
                left: 4px;
                right: 4px;
                top: 28px;
                bottom: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                pointer-events: none;
            }

            .fobas-physical-value {
                position: absolute;
                left: 4px;
                right: 4px;
                bottom: 2px;
                text-align: center;
                font: 600 9px/12px Arial,sans-serif;
                color: rgba(255,255,255,.78);
                pointer-events: none;
            }

            .fobas-physical-pin {
                position: absolute;
                width: 11px;
                height: 11px;
                border-radius: 50%;
                background: #d7dde3;
                border: 2px solid #15191d;
                box-sizing: border-box;
                z-index: 150;
                cursor: crosshair;
            }

            .fobas-physical-pin:hover {
                transform: scale(1.35);
                background: #ffd43b;
            }

            .fobas-breadboard,
            .fobas-protoboard,
            .fobas-pcb,
            .fobas-board-controller,
            .fobas-module-board {
                position: relative;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                overflow: hidden;
                border-radius: 7px;
            }

            .fobas-breadboard {
                background: linear-gradient(90deg,#f5f7f9,#d9dfe4,#f5f7f9);
                border: 2px solid #9da6ad;
                box-shadow: inset 0 0 14px rgba(0,0,0,.18);
            }

            .fobas-power-rail {
                position: absolute;
                left: 10px;
                right: 10px;
                height: 3px;
                border-radius: 2px;
            }

            .fobas-power-rail.red {
                top: 12px;
                background: #d72f35;
            }

            .fobas-power-rail.blue {
                top: 19px;
                background: #3166c4;
            }

            .fobas-board-center {
                position: absolute;
                left: 12px;
                right: 12px;
                top: 30px;
                bottom: 24px;
                background: #eef1f3;
                border-radius: 4px;
                padding: 8px;
                box-sizing: border-box;
            }

            .fobas-board-hole-grid {
                display: grid;
                grid-template-columns: repeat(30,4px);
                grid-auto-rows: 4px;
                gap: 4px;
                align-content: start;
                justify-content: center;
            }

            .fobas-board-hole,
            .fobas-proto-hole {
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: #59636b;
                box-shadow: inset 0 1px 1px rgba(0,0,0,.6);
            }

            .fobas-board-label {
                position: absolute;
                bottom: 5px;
                left: 0;
                right: 0;
                text-align: center;
                color: #414a51;
                font: 700 9px Arial,sans-serif;
            }

            .fobas-board-terminal {
                position: absolute;
                right: 8px;
                bottom: 4px;
                color: #b5292f;
                font: 700 10px Arial,sans-serif;
            }

            .fobas-protoboard {
                background:
                    radial-gradient(circle,#4b565e 1.5px,transparent 1.7px);
                background-size: 9px 9px;
                background-color: #c8cecb;
                border: 3px solid #777f7b;
                padding: 18px;
                box-shadow: inset 0 0 18px rgba(0,0,0,.2);
            }

            .fobas-proto-title {
                position: absolute;
                top: 4px;
                left: 8px;
                font: 800 9px Arial,sans-serif;
                color: #3c4741;
            }

            .fobas-pcb {
                background:
                    linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px),
                    linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),
                    #17442e;
                background-size: 16px 16px;
                border: 3px solid #0d291c;
            }

            .fobas-pcb-brand {
                position: absolute;
                top: 8px;
                left: 10px;
                font: 800 10px Arial,sans-serif;
                color: #c9d8a5;
            }

            .fobas-pcb-chip {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%,-50%);
                width: 60px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #11151a;
                border-radius: 4px;
                font: 700 10px Arial,sans-serif;
            }

            .fobas-pcb-led {
                position: relative;
                display: inline-block;
                width: 7px;
                height: 7px;
                margin: 42px 5px 0;
                border-radius: 50%;
                background: #d72f35;
            }

            .fobas-board-controller {
                background: #168b73;
                border: 2px solid #0a594b;
                box-shadow: inset 0 0 15px rgba(0,0,0,.22);
            }

            .fobas-controller-title {
                position: absolute;
                left: 50%;
                top: 12px;
                transform: translateX(-50%);
                font: 800 12px Arial,sans-serif;
                color: #f4f7f8;
                white-space: nowrap;
            }

            .fobas-controller-chip {
                position: absolute;
                left: 50%;
                top: 48%;
                transform: translate(-50%,-50%);
                min-width: 70px;
                padding: 7px 9px;
                text-align: center;
                background: #15191d;
                border-radius: 4px;
                font: 700 8px Arial,sans-serif;
            }

            .fobas-usb-port,
            .fobas-nano-usb {
                position: absolute;
                background: #b9c0c6;
                color: #20252a;
                border-radius: 3px;
                font: 700 7px Arial,sans-serif;
                padding: 4px 6px;
            }

            .fobas-usb-port {
                left: 7px;
                top: 7px;
            }

            .fobas-nano-usb {
                right: 6px;
                top: 6px;
            }

            .fobas-controller-power {
                position: absolute;
                right: 8px;
                top: 8px;
                color: #ff3030;
                font: 800 8px Arial,sans-serif;
            }

            .fobas-header-pins {
                position: absolute;
                display: flex;
                flex-direction: column;
                gap: 3px;
                top: 38px;
                font: 700 7px Arial,sans-serif;
            }

            .left-pins {
                left: 5px;
            }

            .right-pins {
                right: 5px;
            }

            .fobas-esp32-antenna {
                position: absolute;
                right: 8px;
                top: 5px;
                color: #d9e2e7;
                font: 800 16px Arial,sans-serif;
            }

            .fobas-motor,
            .fobas-servo,
            .fobas-stepper,
            .fobas-buzzer,
            .fobas-joystick,
            .fobas-rgb-led,
            .fobas-lcd,
            .fobas-oled,
            .fobas-ultrasonic {
                position: relative;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .fobas-motor-body {
                width: 65px;
                height: 65px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: radial-gradient(circle at 35% 30%,#bfc6ca,#596168);
                border: 3px solid #343b40;
                font: 900 20px Arial,sans-serif;
            }

            .fobas-motor-shaft {
                position: absolute;
                right: 3px;
                width: 28px;
                height: 8px;
                background: #aab0b4;
            }

            .fobas-motor-terminal {
                position: absolute;
                bottom: 5px;
                font: 800 12px Arial,sans-serif;
            }

            .fobas-motor-terminal.t1 {
                left: 18px;
                color: #ef4343;
            }

            .fobas-motor-terminal.t2 {
                right: 18px;
                color: #e2e6e9;
            }

            .fobas-servo-body {
                width: 72px;
                height: 65px;
                border-radius: 5px;
                background: #315f8c;
                display: flex;
                align-items: center;
                justify-content: center;
                font: 800 10px Arial,sans-serif;
            }

            .fobas-servo-wheel {
                position: absolute;
                top: 5px;
                font-size: 25px;
            }

            .fobas-servo-wire {
                position: absolute;
                bottom: 8px;
                width: 8px;
                height: 25px;
                border-radius: 3px;
            }

            .fobas-servo-wire.red {
                left: 42px;
                background: #d72f35;
            }

            .fobas-servo-wire.black {
                left: 59px;
                background: #101215;
            }

            .fobas-servo-wire.yellow {
                left: 76px;
                background: #e0bf24;
            }

            .fobas-stepper-face {
                width: 62px;
                height: 62px;
                border-radius: 8px;
                background: #4c5359;
                display: flex;
                align-items: center;
                justify-content: center;
                font: 900 20px Arial,sans-serif;
            }

            .fobas-stepper-shaft {
                position: absolute;
                right: 8px;
                width: 28px;
                height: 9px;
                background: #a9b0b5;
            }

            .fobas-stepper-pins {
                position: absolute;
                bottom: 4px;
                font: 700 7px Arial,sans-serif;
            }

            .fobas-module-board {
                background: #25343d;
                border: 2px solid #111a20;
                padding: 8px;
            }

            .fobas-module-title {
                font: 800 9px Arial,sans-serif;
                text-align: center;
                color: #e8edf0;
            }

            .fobas-module-chip {
                width: 55px;
                height: 32px;
                margin: 12px auto 7px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #11151a;
                border-radius: 4px;
                font: 700 8px Arial,sans-serif;
            }

            .fobas-module-terminals,
            .fobas-module-terminal-row {
                text-align: center;
                font: 700 7px Arial,sans-serif;
                color: #b9c5cb;
                white-space: nowrap;
            }

            .fobas-ultrasonic {
                background: #286a75;
                border-radius: 6px;
            }

            .fobas-ultrasonic-eye {
                display: flex;
                gap: 10px;
            }

            .fobas-ultrasonic-eye span {
                width: 38px;
                height: 38px;
                border-radius: 50%;
                background: radial-gradient(circle,#d9e1e5 0 15%,#77838a 17% 32%,#222a2e 35%);
                border: 2px solid #172125;
            }

            .fobas-lcd {
                background: #1b3024;
                border: 3px solid #101913;
                border-radius: 5px;
                flex-direction: column;
            }

            .fobas-lcd-screen {
                width: 75%;
                padding: 10px 5px;
                background: #89a97b;
                color: #182417;
                text-align: center;
                font: 700 7px/12px monospace;
            }

            .fobas-lcd-header {
                margin-top: 5px;
                font: 800 8px Arial,sans-serif;
            }

            .fobas-oled {
                background: #111820;
                border: 2px solid #3e4850;
                border-radius: 5px;
                flex-direction: column;
            }

            .fobas-oled-screen {
                padding: 10px 18px;
                color: #8dd8ff;
                background: #081016;
                font: 800 10px monospace;
            }

            .fobas-oled-title {
                margin-top: 5px;
                font: 800 8px Arial,sans-serif;
            }

            .fobas-joystick-base {
                position: absolute;
                bottom: 8px;
                width: 75px;
                height: 45px;
                border-radius: 50%;
                background: #30363c;
                display: flex;
                align-items: flex-end;
                justify-content: center;
                padding-bottom: 6px;
                box-sizing: border-box;
                font: 700 7px Arial,sans-serif;
            }

            .fobas-joystick-stick {
                position: absolute;
                z-index: 2;
                top: 25px;
                width: 25px;
                height: 55px;
                border-radius: 12px;
                background: #191d21;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                font-size: 16px;
            }

            .fobas-rgb-bulb {
                width: 55px;
                height: 55px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: radial-gradient(circle at 35% 30%,#fff,#c34dff 20%,#2b9dff 48%,#e43148);
                color: #fff;
                font: 900 10px Arial,sans-serif;
                box-shadow: 0 0 20px rgba(120,170,255,.5);
            }

            .fobas-rgb-legs {
                position: absolute;
                bottom: 7px;
                font: 800 7px Arial,sans-serif;
            }

            .fobas-buzzer {
                flex-direction: column;
            }

            .fobas-buzzer-hole {
                width: 45px;
                height: 45px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: radial-gradient(circle,#050608 0 35%,#252b30 37% 65%,#111418 67%);
                font-size: 14px;
            }

            .fobas-buzzer-label {
                margin-top: 4px;
                font: 800 8px Arial,sans-serif;
            }

            .fobas-generic-module {
                width: 90%;
                height: 65%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                border-radius: 7px;
                background: #303943;
                border: 2px solid #4f5b66;
            }

            .fobas-generic-symbol {
                font: 800 10px Arial,sans-serif;
                text-align: center;
            }

            .fobas-generic-value {
                margin-top: 5px;
                font: 700 8px Arial,sans-serif;
                opacity: .8;
            }

            .fobas-physical-library-card {
                position: relative;
            }

            .fobas-physical-preview {
                min-height: 130px;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
                border-radius: 8px;
            }

            .fobas-physical-preview > * {
                transform: scale(.72);
                transform-origin: center;
            }

            .fobas-physical-library-card .fobas-library-add-btn {
                position: relative;
                z-index: 10;
                pointer-events: auto;
            }

            @media (max-width: 700px) {
                .fobas-physical-object {
                    touch-action: none !important;
                }
            }
        `;

        document.head.appendChild(style);
    }


    /* ============================================================
       5. PINS
    ============================================================ */

    function createPins(definition) {

        const count = Number(definition.pins || 0);

        if (count <= 0) {
            return "";
        }

        const visibleCount =
            Math.min(count, 16);

        let html = "";

        for (let i = 0; i < visibleCount; i++) {

            const side =
                i % 2 === 0
                    ? "left"
                    : "right";

            const row =
                Math.floor(i / 2);

            const top =
                38 + row * 15;

            html += `
                <span
                    class="fobas-physical-pin"
                    data-physical-pin="${i + 1}"
                    style="${side}:-7px;top:${top}px;"
                    title="Broche ${i + 1}"
                ></span>
            `;
        }

        return html;
    }


    /* ============================================================
       6. VISUELS
    ============================================================ */

    function physicalVisual(definition) {

        const type = definition.type;


        if (
            type === "breadboard" ||
            type === "mini-breadboard"
        ) {

            const rows =
                type === "breadboard"
                    ? 10
                    : 6;

            let holes = "";

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < 30; c++) {
                    holes += `<span class="fobas-board-hole"></span>`;
                }
            }

            return `
                <div class="fobas-breadboard">
                    <div class="fobas-power-rail red"></div>
                    <div class="fobas-power-rail blue"></div>

                    <div class="fobas-board-center">
                        <div class="fobas-board-hole-grid">
                            ${holes}
                        </div>
                    </div>

                    <div class="fobas-board-label">
                        ${escapeHTML(definition.name)}
                    </div>

                    <div class="fobas-board-terminal">
                        + &nbsp; −
                    </div>
                </div>
            `;
        }


        if (type === "protoboard") {

            let holes = "";

            for (let i = 0; i < 160; i++) {
                holes += `<span class="fobas-proto-hole"></span>`;
            }

            return `
                <div class="fobas-protoboard">
                    <div class="fobas-proto-title">
                        PROTOBOARD
                    </div>
                    ${holes}
                </div>
            `;
        }


        if (type === "pcb") {

            return `
                <div class="fobas-pcb">
                    <div class="fobas-pcb-brand">
                        FOBAS PCB
                    </div>

                    <div class="fobas-pcb-chip">
                        MCU
                    </div>

                    <div class="fobas-pcb-led"></div>
                    <div class="fobas-pcb-led"></div>
                    <div class="fobas-pcb-led"></div>
                </div>
            `;
        }


        if (type === "terminal-board") {

            return `
                <div class="fobas-module-board">
                    <div class="fobas-module-title">
                        TERMINAL BOARD
                    </div>

                    <div class="fobas-module-chip">
                        12
                    </div>

                    <div class="fobas-module-terminals">
                        + &nbsp; − &nbsp; GND
                    </div>
                </div>
            `;
        }


        if (type === "arduino-uno") {

            return `
                <div class="fobas-board-controller arduino-uno">
                    <div class="fobas-usb-port">USB</div>

                    <div class="fobas-controller-title">
                        ARDUINO UNO
                    </div>

                    <div class="fobas-controller-chip">
                        ATmega328P
                    </div>

                    <div class="fobas-controller-power">
                        ON
                    </div>

                    <div class="fobas-header-pins left-pins">
                        ${Array.from(
                            {length:7},
                            (_,i) => `<span>D${i}</span>`
                        ).join("")}
                    </div>

                    <div class="fobas-header-pins right-pins">
                        ${Array.from(
                            {length:7},
                            (_,i) => `<span>D${i + 7}</span>`
                        ).join("")}
                    </div>
                </div>
            `;
        }


        if (type === "arduino-nano") {

            return `
                <div class="fobas-board-controller arduino-nano">
                    <div class="fobas-controller-title">
                        ARDUINO NANO
                    </div>

                    <div class="fobas-controller-chip">
                        ATmega328P
                    </div>

                    <div class="fobas-nano-usb">
                        USB
                    </div>
                </div>
            `;
        }


        if (type === "esp32") {

            return `
                <div class="fobas-board-controller esp32-board">
                    <div class="fobas-esp32-antenna">)))</div>

                    <div class="fobas-controller-title">
                        ESP32
                    </div>

                    <div class="fobas-controller-chip">
                        Wi-Fi
                    </div>

                    <div class="fobas-controller-chip"
                         style="top:75%;">
                        Bluetooth
                    </div>
                </div>
            `;
        }


        if (type === "raspberry-pi") {

            return `
                <div class="fobas-module-board">
                    <div class="fobas-module-title">
                        RASPBERRY PI
                    </div>

                    <div class="fobas-module-chip">
                        GPIO
                    </div>

                    <div class="fobas-module-terminals">
                        40 GPIO
                    </div>
                </div>
            `;
        }


        if (type === "dc-motor") {

            return `
                <div class="fobas-motor">
                    <div class="fobas-motor-body">M</div>
                    <div class="fobas-motor-shaft"></div>
                    <div class="fobas-motor-terminal t1">+</div>
                    <div class="fobas-motor-terminal t2">−</div>
                </div>
            `;
        }


        if (type === "servo-motor") {

            return `
                <div class="fobas-servo">
                    <div class="fobas-servo-wheel">⚙</div>
                    <div class="fobas-servo-body">SERVO</div>
                    <div class="fobas-servo-wire red"></div>
                    <div class="fobas-servo-wire black"></div>
                    <div class="fobas-servo-wire yellow"></div>
                </div>
            `;
        }


        if (type === "stepper-motor") {

            return `
                <div class="fobas-stepper">
                    <div class="fobas-stepper-face">M</div>
                    <div class="fobas-stepper-shaft"></div>
                    <div class="fobas-stepper-pins">
                        A+ A− B+ B−
                    </div>
                </div>
            `;
        }


        if (type === "motor-driver") {

            return `
                <div class="fobas-module-board">
                    <div class="fobas-module-title">
                        L298N MOTOR DRIVER
                    </div>

                    <div class="fobas-module-chip">
                        L298N
                    </div>

                    <div class="fobas-module-terminals">
                        IN1 IN2 IN3 IN4
                    </div>

                    <div class="fobas-module-terminal-row">
                        OUT1 OUT2 OUT3 OUT4
                    </div>
                </div>
            `;
        }


        if (type === "ultrasonic") {

            return `
                <div class="fobas-ultrasonic">
                    <div class="fobas-ultrasonic-eye">
                        <span></span>
                        <span></span>
                    </div>
                </div>
            `;
        }


        if (type === "lcd1602") {

            return `
                <div class="fobas-lcd">
                    <div class="fobas-lcd-screen">
                        <span>FOBAS LAB</span>
                        <span>16x2 DISPLAY</span>
                    </div>

                    <div class="fobas-lcd-header">
                        LCD 1602
                    </div>
                </div>
            `;
        }


        if (type === "oled") {

            return `
                <div class="fobas-oled">
                    <div class="fobas-oled-screen">
                        FOBAS
                    </div>

                    <div class="fobas-oled-title">
                        OLED
                    </div>
                </div>
            `;
        }


        if (type === "joystick") {

            return `
                <div class="fobas-joystick">
                    <div class="fobas-joystick-stick">●</div>
                    <div class="fobas-joystick-base">
                        JOYSTICK
                    </div>
                </div>
            `;
        }


        if (type === "rgb-led") {

            return `
                <div class="fobas-rgb-led">
                    <div class="fobas-rgb-bulb">
                        RGB
                    </div>

                    <div class="fobas-rgb-legs">
                        R G B +
                    </div>
                </div>
            `;
        }


        if (type === "buzzer") {

            return `
                <div class="fobas-buzzer">
                    <div class="fobas-buzzer-hole">
                        ●
                    </div>

                    <div class="fobas-buzzer-label">
                        BUZZER
                    </div>
                </div>
            `;
        }


        return `
            <div class="fobas-generic-module">
                <div class="fobas-generic-symbol">
                    ${escapeHTML(definition.name)}
                </div>

                <div class="fobas-generic-value">
                    ${escapeHTML(definition.value || "")}
                </div>
            </div>
        `;
    }


    /* ============================================================
       7. CREATION OBJET
    ============================================================ */

    function createPhysicalObject(definition) {

        const canvas = getCanvas();
        const layer = getLayer();

        if (!canvas || !layer) {
            console.error(
                "FOBAS Physical: laboratoryCanvas/componentLayer introuvable."
            );
            return null;
        }

        const id = makeId(definition.type);

        const width =
            Number(definition.width) || 140;

        const height =
            Number(definition.height) || 90;

        const canvasWidth =
            Math.max(
                canvas.clientWidth,
                canvas.offsetWidth,
                900
            );

        const canvasHeight =
            Math.max(
                canvas.clientHeight,
                canvas.offsetHeight,
                650
            );

        const object = {

            id: id,

            type: definition.type,

            name: definition.name,

            label: definition.label,

            category: definition.category,

            value: definition.value || "",

            width: width,

            height: height,

            x: Math.max(
                20,
                (canvasWidth - width) / 2
            ),

            y: Math.max(
                20,
                (canvasHeight - height) / 2
            ),

            rotation: 0,

            definition: definition,

            drag: {
                active: false,
                offsetX: 0,
                offsetY: 0
            }
        };

        physicalState.objects.push(object);

        renderPhysicalObject(object);

        selectPhysicalObject(object);

        showPhysicalToast(
            definition.name +
            " ajouté au laboratoire"
        );

        return object;
    }


    /* ============================================================
       8. RENDU
    ============================================================ */

    function renderPhysicalObject(object) {

        const layer = getLayer();

        if (!layer) {
            return;
        }

        let element =
            layer.querySelector(
                `[data-physical-object-id="${object.id}"]`
            );

        if (!element) {

            element =
                document.createElement("div");

            element.className =
                "electronic-component fobas-physical-object";

            element.dataset.physicalObjectId =
                object.id;

            element.dataset.componentType =
                object.type;

            element.innerHTML = `
                <div class="fobas-physical-header">
                    ${escapeHTML(object.name)}
                </div>

                <div class="fobas-physical-body">
                    ${physicalVisual(object.definition)}
                </div>

                <div class="fobas-physical-value">
                    ${escapeHTML(object.value)}
                </div>

                ${createPins(object.definition)}
            `;

            layer.appendChild(element);

            attachPhysicalEvents(
                element,
                object
            );
        }

        element.style.position = "absolute";
        element.style.left = `${object.x}px`;
        element.style.top = `${object.y}px`;
        element.style.width = `${object.width}px`;
        element.style.minWidth = `${object.width}px`;
        element.style.height = `${object.height}px`;
        element.style.minHeight = `${object.height}px`;
        element.style.transform =
            `rotate(${object.rotation}deg)`;
        element.style.transformOrigin =
            "center center";
        element.style.touchAction =
            "none";
        element.style.zIndex =
            physicalState.selectedId === object.id
                ? "100"
                : "35";

        if (
            physicalState.selectedId === object.id
        ) {
            element.classList.add(
                "fobas-physical-selected"
            );
        } else {
            element.classList.remove(
                "fobas-physical-selected"
            );
        }
    }


    /* ============================================================
       9. DRAG SOURIS + TOUCH
    ============================================================ */

    function attachPhysicalEvents(
        element,
        object
    ) {

        element.addEventListener(
            "pointerdown",
            function(event) {

                if (
                    event.target.closest(
                        ".fobas-physical-pin"
                    )
                ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                selectPhysicalObject(object);

                const canvas = getCanvas();

                if (!canvas) {
                    return;
                }

                const rect =
                    canvas.getBoundingClientRect();

                object.drag.active = true;

                object.drag.offsetX =
                    event.clientX -
                    rect.left -
                    object.x;

                object.drag.offsetY =
                    event.clientY -
                    rect.top -
                    object.y;

                try {
                    element.setPointerCapture(
                        event.pointerId
                    );
                } catch (error) {}

            },
            {
                passive: false
            }
        );


        element.addEventListener(
            "pointermove",
            function(event) {

                if (!object.drag.active) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                const canvas = getCanvas();

                if (!canvas) {
                    return;
                }

                const rect =
                    canvas.getBoundingClientRect();

                let x =
                    event.clientX -
                    rect.left -
                    object.drag.offsetX;

                let y =
                    event.clientY -
                    rect.top -
                    object.drag.offsetY;

                const maxX =
                    Math.max(
                        0,
                        canvas.clientWidth -
                        object.width
                    );

                const maxY =
                    Math.max(
                        0,
                        canvas.clientHeight -
                        object.height
                    );

                object.x =
                    clamp(
                        x,
                        0,
                        maxX
                    );

                object.y =
                    clamp(
                        y,
                        0,
                        maxY
                    );

                renderPhysicalObject(object);
            },
            {
                passive: false
            }
        );


        element.addEventListener(
            "pointerup",
            function(event) {

                object.drag.active = false;

                try {
                    element.releasePointerCapture(
                        event.pointerId
                    );
                } catch (error) {}

            }
        );


        element.addEventListener(
            "pointercancel",
            function() {
                object.drag.active = false;
            }
        );


        element.addEventListener(
            "dblclick",
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                rotatePhysicalObject(object);
            }
        );


        element.addEventListener(
            "contextmenu",
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                selectPhysicalObject(object);

                showPhysicalToast(
                    object.name +
                    " sélectionné"
                );
            }
        );
    }


    /* ============================================================
       10. SELECTION
    ============================================================ */

    function selectPhysicalObject(object) {

        physicalState.selectedId =
            object ? object.id : null;

        physicalState.objects.forEach(
            function(item) {
                renderPhysicalObject(item);
            }
        );
    }


    /* ============================================================
       11. ROTATION
    ============================================================ */

    function rotatePhysicalObject(object) {

        if (!object) {
            return;
        }

        object.rotation =
            (object.rotation + 90) % 360;

        renderPhysicalObject(object);

        showPhysicalToast(
            object.name +
            " tourné à " +
            object.rotation +
            "°"
        );
    }


    /* ============================================================
       12. DUPLICATION
    ============================================================ */

    function duplicatePhysicalObject(object) {

        if (!object) {
            return null;
        }

        const copy =
            createPhysicalObject(
                object.definition
            );

        if (!copy) {
            return null;
        }

        copy.x =
            object.x + 35;

        copy.y =
            object.y + 35;

        copy.rotation =
            object.rotation;

        renderPhysicalObject(copy);

        selectPhysicalObject(copy);

        return copy;
    }


    /* ============================================================
       13. SUPPRESSION
    ============================================================ */

    function deletePhysicalObject(object) {

        if (!object) {
            return;
        }

        const index =
            physicalState.objects.indexOf(
                object
            );

        if (index === -1) {
            return;
        }

        physicalState.objects.splice(
            index,
            1
        );

        const element =
            document.querySelector(
                `[data-physical-object-id="${object.id}"]`
            );

        if (element) {
            element.remove();
        }

        if (
            physicalState.selectedId ===
            object.id
        ) {
            physicalState.selectedId = null;
        }

        showPhysicalToast(
            object.name +
            " supprimé"
        );
    }


    /* ============================================================
       14. CLAVIER
    ============================================================ */

    document.addEventListener(
        "keydown",
        function(event) {

            const selected =
                getSelectedPhysicalObject();

            if (!selected) {
                return;
            }

            if (event.key === "Delete") {

                event.preventDefault();

                deletePhysicalObject(
                    selected
                );

                return;
            }

            if (
                event.key.toLowerCase() === "r" &&
                !event.ctrlKey &&
                !event.altKey
            ) {

                rotatePhysicalObject(
                    selected
                );

                return;
            }

            if (
                event.ctrlKey &&
                event.key.toLowerCase() === "d"
            ) {

                event.preventDefault();

                duplicatePhysicalObject(
                    selected
                );
            }
        }
    );


    /* ============================================================
       15. OBJET SELECTIONNE
    ============================================================ */

    function getSelectedPhysicalObject() {

        if (!physicalState.selectedId) {
            return null;
        }

        return (
            physicalState.objects.find(
                function(object) {
                    return (
                        object.id ===
                        physicalState.selectedId
                    );
                }
            ) || null
        );
    }


    /* ============================================================
       16. TOAST
    ============================================================ */

    function showPhysicalToast(message) {

        const toast =
            $("electronicToast");

        if (!toast) {
            return;
        }

        toast.textContent =
            message;

        toast.classList.add("show");

        clearTimeout(
            showPhysicalToast.timer
        );

        showPhysicalToast.timer =
            setTimeout(
                function() {
                    toast.classList.remove("show");
                },
                1800
            );
    }


    /* ============================================================
       17. CARTE BIBLIOTHEQUE
    ============================================================ */

    function createPhysicalLibraryCard(
        type,
        definition
    ) {

        const grid =
            $("componentLibraryGrid");

        if (!grid) {
            return null;
        }

        const old =
            grid.querySelector(
                `[data-physical-library-type="${type}"]`
            );

        if (old) {
            return old;
        }

        const card =
            document.createElement("article");

        card.className =
            "fobas-library-card fobas-physical-library-card";

        card.dataset.physicalLibraryType =
            type;

        card.innerHTML = `
            <div class="fobas-library-visual">
                <div class="fobas-library-3d fobas-physical-preview">
                    ${physicalVisual(definition)}
                </div>
            </div>

            <div class="fobas-library-info">

                <strong>
                    ${escapeHTML(definition.name)}
                </strong>

                <span>
                    ${escapeHTML(definition.label)}
                </span>

                <small>
                    ${escapeHTML(definition.value || "")}
                </small>

            </div>

            <button
                type="button"
                class="fobas-library-add-btn"
                data-physical-add="${escapeHTML(type)}"
            >
                ＋ Ajouter
            </button>
        `;

        grid.appendChild(card);

        return card;
    }


    /* ============================================================
       18. AFFICHER LES OBJETS PHYSIQUES
    ============================================================ */

    function renderPhysicalLibrary() {

        const grid =
            $("componentLibraryGrid");

        if (!grid) {
            return;
        }

        Object.keys(
            PHYSICAL_COMPONENTS
        ).forEach(
            function(type) {

                createPhysicalLibraryCard(
                    type,
                    PHYSICAL_COMPONENTS[type]
                );

            }
        );
    }


    /* ============================================================
       19. FILTRAGE PHYSIQUE
       ------------------------------------------------------------
       Important:
       stopPropagation empêche le système principal de
       renderCategory() de vider immédiatement la grille.
    ============================================================ */

    function showOnlyPhysicalCards() {

        renderPhysicalLibrary();

        const grid =
            $("componentLibraryGrid");

        if (!grid) {
            return;
        }

        grid
            .querySelectorAll(
                ".fobas-library-card"
            )
            .forEach(
                function(card) {

                    card.style.display =
                        card.dataset.physicalLibraryType
                            ? ""
                            : "none";
                }
            );
    }


    /* ============================================================
       20. CATEGORIE
    ============================================================ */

    function addPhysicalCategoryButton() {

        const categories =
            $("componentCategories");

        if (!categories) {
            return;
        }

        let button =
            $("physicalComponentsCategoryBtn");

        if (!button) {

            button =
                document.createElement("button");

            button.id =
                "physicalComponentsCategoryBtn";

            button.className =
                "component-category-btn";

            button.type =
                "button";

            button.dataset.category =
                "physical-components";

            button.textContent =
                "🤖 Cartes & Robotique";

            categories.appendChild(button);
        }

        if (
            button.dataset.fobasPhysicalBound ===
            "true"
        ) {
            return;
        }

        button.dataset.fobasPhysicalBound =
            "true";

        button.addEventListener(
            "click",
            function(event) {

                event.preventDefault();
                event.stopPropagation();

                showOnlyPhysicalCards();

                document
                    .querySelectorAll(
                        "#componentCategories .component-category-btn"
                    )
                    .forEach(
                        function(item) {
                            item.classList.remove(
                                "active"
                            );
                        }
                    );

                button.classList.add("active");
            }
        );
    }


    /* ============================================================
       21. AJOUT BOUTON
    ============================================================ */

    document.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    "[data-physical-add]"
                );

            if (!button) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const type =
                button.dataset.physicalAdd;

            const definition =
                PHYSICAL_COMPONENTS[type];

            if (!definition) {
                return;
            }

            createPhysicalObject(
                definition
            );
        },
        true
    );


    /* ============================================================
       22. PREPARATION BIBLIOTHEQUE
    ============================================================ */

    function preparePhysicalLibrary() {

        installPhysicalCSS();

        addPhysicalCategoryButton();

        renderPhysicalLibrary();
    }


    /* ============================================================
       23. OUVERTURE BIBLIOTHEQUE
    ============================================================ */

    document.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    "#libraryBtn"
                );

            if (!button) {
                return;
            }

            setTimeout(
                function() {
                    preparePhysicalLibrary();
                },
                60
            );
        }
    );


    /* ============================================================
       24. SURVEILLANCE DU PANEL
       ------------------------------------------------------------
       Si le moteur principal reconstruit la grille, les cartes
       physiques sont automatiquement remises.
    ============================================================ */

    function observeLibraryGrid() {

        const grid =
            $("componentLibraryGrid");

        if (!grid) {
            setTimeout(
                observeLibraryGrid,
                200
            );
            return;
        }

        if (
            grid.dataset.fobasPhysicalObserver ===
            "true"
        ) {
            return;
        }

        grid.dataset.fobasPhysicalObserver =
            "true";

        const observer =
            new MutationObserver(
                function() {

                    const physicalCategory =
                        $("physicalComponentsCategoryBtn");

                    if (
                        physicalCategory &&
                        physicalCategory.classList.contains(
                            "active"
                        )
                    ) {
                        setTimeout(
                            function() {
                                showOnlyPhysicalCards();
                            },
                            0
                        );
                    }
                }
            );

        observer.observe(
            grid,
            {
                childList: true,
                subtree: true
            }
        );
    }


    /* ============================================================
       25. API PUBLIQUE
    ============================================================ */

    window.FOBAS_PHYSICAL_COMPONENTS =
        PHYSICAL_COMPONENTS;

    window.FOBAS_PHYSICAL_LAB = {

        objects:
            physicalState.objects,

        add:
            function(type) {

                const definition =
                    PHYSICAL_COMPONENTS[type];

                if (!definition) {
                    console.error(
                        "Objet physique inconnu:",
                        type
                    );
                    return null;
                }

                return createPhysicalObject(
                    definition
                );
            },

        select:
            selectPhysicalObject,

        rotate:
            rotatePhysicalObject,

        duplicate:
            duplicatePhysicalObject,

        remove:
            deletePhysicalObject,

        getSelected:
            getSelectedPhysicalObject,

        refreshLibrary:
            preparePhysicalLibrary
    };


    /* ============================================================
       26. INITIALISATION
    ============================================================ */

    function initializePhysicalExtension() {

        const canvas =
            getCanvas();

        const layer =
            getLayer();

        if (!canvas || !layer) {

            setTimeout(
                initializePhysicalExtension,
                100
            );

            return;
        }

        installPhysicalCSS();

        addPhysicalCategoryButton();

        renderPhysicalLibrary();

        observeLibraryGrid();

        console.log(
            "FOBAS Physical Component Extension V2 prête.",
            Object.keys(
                PHYSICAL_COMPONENTS
            ).length,
            "objets disponibles."
        );
    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initializePhysicalExtension,
            {
                once: true
            }
        );

    } else {

        initializePhysicalExtension();
    }


})();








