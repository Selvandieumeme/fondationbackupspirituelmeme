/* ================================================================
   FOBAS — LABORATOIRE ÉLECTRONIQUE & ROBOTIQUE
   ----------------------------------------------------------------
   FICHIER : simulationrobotiquefobas-data.js
   VERSION : 1.0.0
   TYPE    : DATASET PRINCIPAL
   ----------------------------------------------------------------
   IMPORTANT :
   - Ce fichier contient UNIQUEMENT les données du laboratoire.
   - Il est chargé AVANT simulationrobotiquefobas.js.
   - Aucun moteur, événement ou logique d'exécution ici.
   - Compatible avec FOBAS Robotics Engine 1.0.0.
================================================================ */

(function (window) {

    "use strict";


    /* ============================================================
       01 — CATÉGORIES
    ============================================================ */

    const categories = [

        "Tous",

        "Cartes",

        "Composants",

        "Capteurs",

        "Actionneurs",

        "Robotique",

        "Alimentation",

        "Connectique"

    ];


    /* ============================================================
       02 — OUTILS DE LABORATOIRE
    ============================================================ */

    const tools = [

        {
            id: "multimeter",
            name: "Multimètre numérique",
            icon: "🧰",
            category: "Mesure",
            type: "multimeter",
            description:
                "Mesure simulée de tension, courant, résistance et continuité."
        },

        {
            id: "oscilloscope",
            name: "Oscilloscope",
            icon: "📈",
            category: "Mesure",
            type: "oscilloscope",
            description:
                "Observation simulée des signaux électriques et PWM."
        },

        {
            id: "power-supply",
            name: "Alimentation de laboratoire",
            icon: "⚡",
            category: "Alimentation",
            type: "power-supply",
            description:
                "Source de tension continue réglable pour les montages."
        },

        {
            id: "logic-analyzer",
            name: "Analyseur logique",
            icon: "📊",
            category: "Mesure",
            type: "logic-analyzer",
            description:
                "Analyse des niveaux logiques numériques."
        },

        {
            id: "signal-generator",
            name: "Générateur de signaux",
            icon: "〰️",
            category: "Mesure",
            type: "signal-generator",
            description:
                "Génération de signaux périodiques simulés."
        },

        {
            id: "continuity-tester",
            name: "Testeur de continuité",
            icon: "🔔",
            category: "Diagnostic",
            type: "continuity-tester",
            description:
                "Vérification de la continuité électrique d'une connexion."
        },

        {
            id: "wire-cutter",
            name: "Pince coupante",
            icon: "✂️",
            category: "Outils",
            type: "wire-cutter",
            description:
                "Outil virtuel destiné aux opérations de câblage."
        },

        {
            id: "wire-stripper",
            name: "Pince à dénuder",
            icon: "🛠️",
            category: "Outils",
            type: "wire-stripper",
            description:
                "Préparation virtuelle des conducteurs."
        }

    ];


    /* ============================================================
       03 — CARTES / MICROCONTRÔLEURS
    ============================================================ */

    const components = [

        {
            id: "arduino-uno",
            name: "Arduino UNO",
            icon: "🧠",
            category: "Cartes",
            type: "microcontroller",
            family: "arduino",
            description:
                "Carte Arduino UNO compatible avec les principales instructions numériques et PWM simulées.",
            width: 180,
            height: 100,

            properties: {
                voltage: 5,
                logicVoltage: 5,
                current: 0.04,
                board: "UNO",
                pwmPins: [3, 5, 6, 9, 10, 11]
            },

            pins: [

                {
                    id: "5V",
                    name: "5V",
                    type: "power",
                    index: 0,
                    x: 10,
                    y: 20
                },

                {
                    id: "GND",
                    name: "GND",
                    type: "ground",
                    index: 1,
                    x: 10,
                    y: 80
                },

                {
                    id: "D2",
                    name: "D2",
                    type: "digital",
                    index: 2,
                    x: 40,
                    y: 0
                },

                {
                    id: "D3",
                    name: "D3 PWM",
                    type: "pwm",
                    index: 3,
                    x: 55,
                    y: 0
                },

                {
                    id: "D4",
                    name: "D4",
                    type: "digital",
                    index: 4,
                    x: 70,
                    y: 0
                },

                {
                    id: "D5",
                    name: "D5 PWM",
                    type: "pwm",
                    index: 5,
                    x: 85,
                    y: 0
                },

                {
                    id: "D6",
                    name: "D6 PWM",
                    type: "pwm",
                    index: 6,
                    x: 100,
                    y: 0
                },

                {
                    id: "D7",
                    name: "D7",
                    type: "digital",
                    index: 7,
                    x: 115,
                    y: 0
                },

                {
                    id: "D8",
                    name: "D8",
                    type: "digital",
                    index: 8,
                    x: 130,
                    y: 0
                },

                {
                    id: "D9",
                    name: "D9 PWM",
                    type: "pwm",
                    index: 9,
                    x: 145,
                    y: 0
                },

                {
                    id: "D10",
                    name: "D10 PWM",
                    type: "pwm",
                    index: 10,
                    x: 160,
                    y: 0
                },

                {
                    id: "D11",
                    name: "D11 PWM",
                    type: "pwm",
                    index: 11,
                    x: 175,
                    y: 0
                },

                {
                    id: "D12",
                    name: "D12",
                    type: "digital",
                    index: 12,
                    x: 190,
                    y: 0
                },

                {
                    id: "D13",
                    name: "D13",
                    type: "digital",
                    index: 13,
                    x: 205,
                    y: 0
                }

            ]
        },


        {
            id: "arduino-nano",
            name: "Arduino Nano",
            icon: "🧠",
            category: "Cartes",
            type: "microcontroller",
            family: "arduino",
            description:
                "Microcontrôleur compact adapté aux montages embarqués.",
            width: 150,
            height: 90,

            properties: {
                voltage: 5,
                logicVoltage: 5,
                board: "Nano",
                pwmPins: [3, 5, 6, 9, 10, 11]
            },

            pins: [

                { id: "5V", name: "5V", type: "power", index: 0, x: 10, y: 20 },
                { id: "GND", name: "GND", type: "ground", index: 1, x: 10, y: 70 },
                { id: "D2", name: "D2", type: "digital", index: 2, x: 40, y: 0 },
                { id: "D3", name: "D3 PWM", type: "pwm", index: 3, x: 55, y: 0 },
                { id: "D4", name: "D4", type: "digital", index: 4, x: 70, y: 0 },
                { id: "D5", name: "D5 PWM", type: "pwm", index: 5, x: 85, y: 0 },
                { id: "D6", name: "D6 PWM", type: "pwm", index: 6, x: 100, y: 0 },
                { id: "D7", name: "D7", type: "digital", index: 7, x: 115, y: 0 },
                { id: "D8", name: "D8", type: "digital", index: 8, x: 130, y: 0 },
                { id: "D9", name: "D9 PWM", type: "pwm", index: 9, x: 145, y: 0 },
                { id: "D10", name: "D10 PWM", type: "pwm", index: 10, x: 160, y: 0 },
                { id: "D11", name: "D11 PWM", type: "pwm", index: 11, x: 175, y: 0 },
                { id: "D12", name: "D12", type: "digital", index: 12, x: 190, y: 0 },
                { id: "D13", name: "D13", type: "digital", index: 13, x: 205, y: 0 }

            ]
        },


        {
            id: "arduino-mega",
            name: "Arduino Mega 2560",
            icon: "🧠",
            category: "Cartes",
            type: "microcontroller",
            family: "arduino",
            description:
                "Carte à grand nombre d'E/S numériques pour projets robotiques avancés.",
            width: 210,
            height: 110,

            properties: {
                voltage: 5,
                logicVoltage: 5,
                board: "Mega 2560",
                pwmPins: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
            },

            pins: [

                { id: "5V", name: "5V", type: "power", index: 0, x: 10, y: 20 },
                { id: "GND", name: "GND", type: "ground", index: 1, x: 10, y: 90 },
                { id: "D2", name: "D2 PWM", type: "pwm", index: 2, x: 40, y: 0 },
                { id: "D3", name: "D3 PWM", type: "pwm", index: 3, x: 55, y: 0 },
                { id: "D4", name: "D4 PWM", type: "pwm", index: 4, x: 70, y: 0 },
                { id: "D5", name: "D5 PWM", type: "pwm", index: 5, x: 85, y: 0 },
                { id: "D6", name: "D6 PWM", type: "pwm", index: 6, x: 100, y: 0 },
                { id: "D7", name: "D7 PWM", type: "pwm", index: 7, x: 115, y: 0 },
                { id: "D8", name: "D8 PWM", type: "pwm", index: 8, x: 130, y: 0 },
                { id: "D9", name: "D9 PWM", type: "pwm", index: 9, x: 145, y: 0 },
                { id: "D10", name: "D10 PWM", type: "pwm", index: 10, x: 160, y: 0 },
                { id: "D11", name: "D11 PWM", type: "pwm", index: 11, x: 175, y: 0 },
                { id: "D12", name: "D12", type: "digital", index: 12, x: 190, y: 0 },
                { id: "D13", name: "D13", type: "digital", index: 13, x: 205, y: 0 }

            ]
        },


        {
            id: "esp32-devkit",
            name: "ESP32 DevKit",
            icon: "📡",
            category: "Cartes",
            type: "esp32",
            family: "esp",
            description:
                "Carte ESP32 simulée pour applications IoT et robotique.",
            width: 170,
            height: 100,

            properties: {
                voltage: 3.3,
                logicVoltage: 3.3,
                board: "ESP32",
                pwmPins: [2, 4, 5, 12, 13, 14, 15, 18, 19, 21, 22, 23, 25, 26, 27, 32, 33]
            },

            pins: [

                { id: "3V3", name: "3V3", type: "power", index: 0, x: 10, y: 20 },
                { id: "GND", name: "GND", type: "ground", index: 1, x: 10, y: 80 },
                { id: "D2", name: "GPIO2", type: "digital", index: 2, x: 50, y: 0 },
                { id: "D4", name: "GPIO4", type: "digital", index: 4, x: 70, y: 0 },
                { id: "D5", name: "GPIO5", type: "digital", index: 5, x: 90, y: 0 },
                { id: "D18", name: "GPIO18", type: "pwm", index: 18, x: 110, y: 0 },
                { id: "D19", name: "GPIO19", type: "pwm", index: 19, x: 130, y: 0 },
                { id: "D21", name: "GPIO21", type: "digital", index: 21, x: 150, y: 0 }

            ]
        },


        {
            id: "esp8266-node",
            name: "ESP8266 NodeMCU",
            icon: "📡",
            category: "Cartes",
            type: "esp8266",
            family: "esp",
            description:
                "Carte Wi-Fi compacte pour applications IoT.",
            width: 165,
            height: 95,

            properties: {
                voltage: 3.3,
                logicVoltage: 3.3,
                board: "ESP8266",
                pwmPins: [0, 2, 4, 5, 12, 13, 14, 15]
            },

            pins: [

                { id: "3V3", name: "3V3", type: "power", index: 0, x: 10, y: 20 },
                { id: "GND", name: "GND", type: "ground", index: 1, x: 10, y: 75 },
                { id: "D0", name: "D0", type: "digital", index: 0, x: 50, y: 0 },
                { id: "D1", name: "D1", type: "digital", index: 1, x: 70, y: 0 },
                { id: "D2", name: "D2", type: "digital", index: 2, x: 90, y: 0 },
                { id: "D4", name: "D4", type: "digital", index: 4, x: 110, y: 0 },
                { id: "D5", name: "D5", type: "pwm", index: 5, x: 130, y: 0 },
                { id: "D14", name: "D14", type: "pwm", index: 14, x: 150, y: 0 }

            ]
        },


        /* ========================================================
           04 — ALIMENTATION
        ======================================================== */

        {
            id: "battery-9v",
            name: "Pile 9 V",
            icon: "🔋",
            category: "Alimentation",
            type: "battery",
            description:
                "Source continue 9 V.",
            width: 100,
            height: 80,

            properties: {
                voltage: 9,
                current: 0.5,
                capacity: 500
            },

            pins: [
                { id: "+", name: "+", type: "power", index: 0, x: 90, y: 20 },
                { id: "-", name: "-", type: "ground", index: 1, x: 90, y: 60 }
            ]
        },


        {
            id: "battery-liion",
            name: "Batterie Li-Ion 3.7 V",
            icon: "🔋",
            category: "Alimentation",
            type: "battery",
            description:
                "Batterie rechargeable simulée de 3,7 V.",
            width: 110,
            height: 80,

            properties: {
                voltage: 3.7,
                current: 2,
                capacity: 2200
            },

            pins: [
                { id: "+", name: "+", type: "power", index: 0, x: 100, y: 20 },
                { id: "-", name: "-", type: "ground", index: 1, x: 100, y: 60 }
            ]
        },


        {
            id: "power-supply-5v",
            name: "Alimentation 5 V",
            icon: "⚡",
            category: "Alimentation",
            type: "power-supply",
            description:
                "Alimentation stabilisée 5 V.",
            width: 130,
            height: 85,

            properties: {
                voltage: 5,
                current: 2,
                adjustable: false
            },

            pins: [
                { id: "VCC", name: "VCC", type: "power", index: 0, x: 115, y: 20 },
                { id: "GND", name: "GND", type: "ground", index: 1, x: 115, y: 65 }
            ]
        },


        {
            id: "power-supply-adjustable",
            name: "Alimentation réglable",
            icon: "⚡",
            category: "Alimentation",
            type: "power-supply",
            description:
                "Alimentation continue réglable simulée.",
            width: 140,
            height: 90,

            properties: {
                voltage: 12,
                current: 3,
                adjustable: true,
                minVoltage: 0,
                maxVoltage: 24
            },

            pins: [
                { id: "VOUT", name: "VOUT", type: "power", index: 0, x: 125, y: 20 },
                { id: "GND", name: "GND", type: "ground", index: 1, x: 125, y: 70 }
            ]
        },


        /* ========================================================
           05 — PROTOTYPAGE
        ======================================================== */

        {
            id: "breadboard-full",
            name: "Breadboard complète",
            icon: "▦",
            category: "Cartes",
            type: "breadboard",
            description:
                "Plaque d'essai virtuelle pour prototypage électronique.",
            width: 260,
            height: 160,

            properties: {
                rows: 30,
                columns: 10,
                voltageMax: 12
            },

            pins: []
        },


        {
            id: "breadboard-mini",
            name: "Mini Breadboard",
            icon: "▦",
            category: "Cartes",
            type: "breadboard",
            description:
                "Petite plaque d'essai virtuelle.",
            width: 190,
            height: 120,

            properties: {
                rows: 17,
                columns: 10,
                voltageMax: 12
            },

            pins: []
        },


        /* ========================================================
           06 — COMPOSANTS PASSIFS
        ======================================================== */

        {
            id: "resistor-220",
            name: "Résistance 220 Ω",
            icon: "〰️",
            category: "Composants",
            type: "resistor",
            description:
                "Résistance série couramment utilisée avec une LED.",
            width: 100,
            height: 60,

            properties: {
                resistance: 220,
                power: 0.25
            },

            pins: [
                { id: "1", name: "1", type: "passive", index: 0, x: 0, y: 30 },
                { id: "2", name: "2", type: "passive", index: 1, x: 100, y: 30 }
            ]
        },


        {
            id: "resistor-1k",
            name: "Résistance 1 kΩ",
            icon: "〰️",
            category: "Composants",
            type: "resistor",
            description:
                "Résistance de 1 kΩ pour limitation de courant et circuits de commande.",
            width: 100,
            height: 60,

            properties: {
                resistance: 1000,
                power: 0.25
            },

            pins: [
                { id: "1", name: "1", type: "passive", index: 0, x: 0, y: 30 },
                { id: "2", name: "2", type: "passive", index: 1, x: 100, y: 30 }
            ]
        },


        {
            id: "resistor-10k",
            name: "Résistance 10 kΩ",
            icon: "〰️",
            category: "Composants",
            type: "resistor",
            description:
                "Résistance adaptée aux pull-up et pull-down.",
            width: 100,
            height: 60,

            properties: {
                resistance: 10000,
                power: 0.25
            },

            pins: [
                { id: "1", name: "1", type: "passive", index: 0, x: 0, y: 30 },
                { id: "2", name: "2", type: "passive", index: 1, x: 100, y: 30 }
            ]
        },


        {
            id: "potentiometer-10k",
            name: "Potentiomètre 10 kΩ",
            icon: "🎚️",
            category: "Composants",
            type: "potentiometer",
            description:
                "Résistance variable avec curseur analogique.",
            width: 110,
            height: 80,

            properties: {
                resistance: 10000,
                position: 50
            },

            pins: [
                { id: "VCC", name: "VCC", type: "power", index: 0, x: 20, y: 0 },
                { id: "OUT", name: "OUT", type: "analog", index: 1, x: 55, y: 0 },
                { id: "GND", name: "GND", type: "ground", index: 2, x: 90, y: 0 }
            ]
        },


        {
            id: "capacitor-100uf",
            name: "Condensateur 100 µF",
            icon: "🔋",
            category: "Composants",
            type: "capacitor",
            description:
                "Condensateur électrolytique polarisé.",
            width: 90,
            height: 70,

            properties: {
                capacitance: 100,
                unit: "uF",
                voltage: 16
            },

            pins: [
                { id: "+", name: "+", type: "positive", index: 0, x: 20, y: 60 },
                { id: "-", name: "-", type: "negative", index: 1, x: 70, y: 60 }
            ]
        },


        {
            id: "diode-1n4007",
            name: "Diode 1N4007",
            icon: "▶️",
            category: "Composants",
            type: "diode",
            description:
                "Diode de protection contre les courants inverses.",
            width: 100,
            height: 60,

            properties: {
                forwardVoltage: 0.7,
                maxCurrent: 1
            },

            pins: [
                { id: "A", name: "A", type: "anode", index: 0, x: 0, y: 30 },
                { id: "K", name: "K", type: "cathode", index: 1, x: 100, y: 30 }
            ]
        },


        /* ========================================================
           07 — LEDS
        ======================================================== */

        {
            id: "led-red",
            name: "LED rouge",
            icon: "🔴",
            category: "Composants",
            type: "led",
            description:
                "LED rouge standard avec anode et cathode.",
            width: 80,
            height: 70,

            properties: {
                color: "red",
                forwardVoltage: 2,
                current: 0.02
            },

            pins: [
                { id: "A", name: "A", type: "anode", index: 0, x: 10, y: 35 },
                { id: "K", name: "K", type: "cathode", index: 1, x: 70, y: 35 }
            ]
        },


        {
            id: "led-green",
            name: "LED verte",
            icon: "🟢",
            category: "Composants",
            type: "led",
            description:
                "LED verte standard.",
            width: 80,
            height: 70,

            properties: {
                color: "green",
                forwardVoltage: 2.1,
                current: 0.02
            },

            pins: [
                { id: "A", name: "A", type: "anode", index: 0, x: 10, y: 35 },
                { id: "K", name: "K", type: "cathode", index: 1, x: 70, y: 35 }
            ]
        },


        {
            id: "led-blue",
            name: "LED bleue",
            icon: "🔵",
            category: "Composants",
            type: "led",
            description:
                "LED bleue à faible consommation.",
            width: 80,
            height: 70,

            properties: {
                color: "blue",
                forwardVoltage: 3.0,
                current: 0.02
            },

            pins: [
                { id: "A", name: "A", type: "anode", index: 0, x: 10, y: 35 },
                { id: "K", name: "K", type: "cathode", index: 1, x: 70, y: 35 }
            ]
        },


        {
            id: "led-rgb",
            name: "LED RGB",
            icon: "🌈",
            category: "Composants",
            type: "led-rgb",
            description:
                "LED RGB à quatre bornes.",
            width: 100,
            height: 80,

            properties: {
                color: "rgb",
                common: "cathode"
            },

            pins: [
                { id: "R", name: "R", type: "digital", index: 0, x: 10, y: 0 },
                { id: "G", name: "G", type: "digital", index: 1, x: 35, y: 0 },
                { id: "B", name: "B", type: "digital", index: 2, x: 60, y: 0 },
                { id: "K", name: "K", type: "ground", index: 3, x: 85, y: 0 }
            ]
        },


        /* ========================================================
           08 — COMMANDES
        ======================================================== */

        {
            id: "push-button",
            name: "Bouton poussoir",
            icon: "🔘",
            category: "Composants",
            type: "button",
            description:
                "Bouton momentané pour entrée numérique.",
            width: 90,
            height: 70,

            properties: {
                normallyOpen: true,
                pullupCompatible: true
            },

            pins: [
                { id: "1", name: "1", type: "digital", index: 0, x: 10, y: 35 },
                { id: "2", name: "2", type: "digital", index: 1, x: 80, y: 35 }
            ]
        },


        {
            id: "switch-spst",
            name: "Interrupteur SPST",
            icon: "⏻",
            category: "Composants",
            type: "switch",
            description:
                "Interrupteur simple marche/arrêt.",
            width: 100,
            height: 70,

            properties: {
                closed: false
            },

            pins: [
                { id: "1", name: "1", type: "generic", index: 0, x: 10, y: 35 },
                { id: "2", name: "2", type: "generic", index: 1, x: 90, y: 35 }
            ]
        },


        /* ========================================================
           09 — TRANSISTORS / RELAIS
        ======================================================== */

        {
            id: "transistor-npn-2n2222",
            name: "Transistor NPN 2N2222",
            icon: "🔺",
            category: "Composants",
            type: "transistor",
            description:
                "Transistor NPN pour commande de charges.",
            width: 100,
            height: 80,

            properties: {
                family: "NPN",
                maxCurrent: 0.6
            },

            pins: [
                { id: "B", name: "B", type: "base", index: 0, x: 10, y: 40 },
                { id: "C", name: "C", type: "collector", index: 1, x: 85, y: 20 },
                { id: "E", name: "E", type: "emitter", index: 2, x: 85, y: 60 }
            ]
        },


        {
            id: "relay-5v",
            name: "Relais 5 V",
            icon: "🔀",
            category: "Composants",
            type: "relay",
            description:
                "Relais électromécanique commandé en 5 V.",
            width: 120,
            height: 90,

            properties: {
                coilVoltage: 5,
                contacts: "NO-NC"
            },

            pins: [
                { id: "VCC", name: "VCC", type: "power", index: 0, x: 10, y: 15 },
                { id: "GND", name: "GND", type: "ground", index: 1, x: 10, y: 70 },
                { id: "COM", name: "COM", type: "generic", index: 2, x: 110, y: 15 },
                { id: "NO", name: "NO", type: "generic", index: 3, x: 110, y: 45 },
                { id: "NC", name: "NC", type: "generic", index: 4, x: 110, y: 75 }
            ]
        },


        /* ========================================================
           10 — CAPTEURS
        ======================================================== */

        {
            id: "ultrasonic-hc-sr04",
            name: "HC-SR04 Ultrason",
            icon: "📡",
            category: "Capteurs",
            type: "ultrasonic",
            description:
                "Capteur ultrasonique pour mesure de distance.",
            width: 130,
            height: 90,

            properties: {
                voltage: 5,
                distance: 100,
                minDistance: 2,
                maxDistance: 400
            },

            pins: [
                { id: "VCC", name: "VCC", type: "power", index: 0, x: 15, y: 0 },
                { id: "TRIG", name: "TRIG", type: "digital", index: 1, x: 45, y: 0 },
                { id: "ECHO", name: "ECHO", type: "digital", index: 2, x: 80, y: 0 },
                { id: "GND", name: "GND", type: "ground", index: 3, x: 115, y: 0 }
            ]
        },


        {
            id: "ldr-photoresistor",
            name: "LDR / Photorésistance",
            icon: "☀️",
            category: "Capteurs",
            type: "sensor",
            description:
                "Capteur analogique de luminosité.",
            width: 100,
            height: 80,

            properties: {
                sensor: "light",
                analogMin: 0,
                analogMax: 1023,
                value: 500
            },

            pins: [
                { id: "VCC", name: "VCC", type: "power", index: 0, x: 20, y: 0 },
                { id: "OUT", name: "OUT", type: "analog", index: 1, x: 50, y: 0 },
                { id: "GND", name: "GND", type: "ground", index: 2, x: 80, y: 0 }
            ]
        },


        {
            id: "dht11",
            name: "DHT11",
            icon: "🌡️",
            category: "Capteurs",
            type: "sensor",
            description:
                "Capteur numérique de température et humidité.",
            width: 100,
            height: 80,

            properties: {
                sensor: "temperature-humidity",
                temperature: 25,
                humidity: 50
            },

            pins: [
                { id: "VCC", name: "VCC", type: "power", index: 0, x: 20, y: 0 },
                { id: "DATA", name: "DATA", type: "digital", index: 1, x: 50, y: 0 },
                { id: "GND", name: "GND", type: "ground", index: 2, x: 80, y: 0 }
            ]
        },


        {
            id: "pir-hc-sr501",
            name: "PIR HC-SR501",
            icon: "👁️",
            category: "Capteurs",
            type: "sensor",
            description:
                "Capteur de mouvement infrarouge.",
            width: 120,
            height: 90,

            properties: {
                sensor: "motion",
                detected: false
            },

            pins: [
                { id: "VCC", name: "VCC", type: "power", index: 0, x: 20, y: 0 },
                { id: "OUT", name: "OUT", type: "digital", index: 1, x: 60, y: 0 },
                { id: "GND", name: "GND", type: "ground", index: 2, x: 100, y: 0 }
            ]
        },


        {
            id: "ir-obstacle",
            name: "Capteur IR obstacle",
            icon: "📡",
            category: "Capteurs",
            type: "sensor",
            description:
                "Détecteur infrarouge d'obstacles.",
            width: 110,
            height: 80,

            properties: {
                sensor: "obstacle",
                detected: false
            },

            pins: [
                { id: "VCC", name: "VCC", type: "power", index: 0, x: 20, y: 0 },
                { id: "OUT", name: "OUT", type: "digital", index: 1, x: 55, y: 0 },
                { id: "GND", name: "GND", type: "ground", index: 2, x: 90, y: 0 }
            ]
        },


        {
            id: "temperature-lm35",
            name: "LM35",
            icon: "🌡️",
            category: "Capteurs",
            type: "sensor",
            description:
                "Capteur analogique de température.",
            width: 100,
            height: 80,

            properties: {
                sensor: "temperature",
                temperature: 25,
                analogValue: 250
            },

            pins: [
                { id: "VCC", name: "VCC", type: "power", index: 0, x: 20, y: 0 },
                { id: "OUT", name: "OUT", type: "analog", index: 1, x: 50, y: 0 },
                { id: "GND", name: "GND", type: "ground", index: 2, x: 80, y: 0 }
            ]
        },


        {
            id: "sound-sensor",
            name: "Capteur sonore",
            icon: "🎤",
            category: "Capteurs",
            type: "sensor",
            description:
                "Capteur de niveau sonore avec sortie numérique.",
            width: 110,
            height: 80,

            properties: {
                sensor: "sound",
                level: 20
            },

            pins: [
                { id: "VCC", name: "VCC", type: "power", index: 0, x: 20, y: 0 },
                { id: "OUT", name: "OUT", type: "digital", index: 1, x: 55, y: 0 },
                { id: "GND", name: "GND", type: "ground", index: 2, x: 90, y: 0 }
            ]
        },


        {
            id: "mpu6050",
            name: "MPU6050",
            icon: "🧭",
            category: "Capteurs",
            type: "sensor",
            description:
                "Capteur inertiel accéléromètre et gyroscope.",
            width: 110,
            height: 90,

            properties: {
                sensor: "imu",
                i2c: true,
                address: "0x68"
            },

            pins: [
                { id: "VCC", name: "VCC", type: "power", index: 0, x: 15, y: 0 },
                { id: "GND", name: "GND", type: "ground", index: 1, x: 40, y: 0 },
                { id: "SDA", name: "SDA", type: "digital", index: 2, x: 70, y: 0 },
                { id: "SCL", name: "SCL", type: "digital", index: 3, x: 95, y: 0 }
            ]
        },


        /* ========================================================
           11 — ACTIONNEURS
        ======================================================== */

        {
            id: "dc-motor",
            name: "Moteur DC",
            icon: "⚙️",
            category: "Actionneurs",
            type: "motor",
            description:
                "Moteur à courant continu commandable par PWM.",
            width: 110,
            height: 90,

            properties: {
                voltage: 6,
                current: 0.5,
                maxRPM: 12000
            },

            pins: [
                { id: "+", name: "+", type: "power", index: 0, x: 15, y: 45 },
                { id: "-", name: "-", type: "ground", index: 1, x: 95, y: 45 }
            ]
        },


        {
            id: "servo-sg90",
            name: "Servo SG90",
            icon: "🔧",
            category: "Actionneurs",
            type: "servo",
            description:
                "Micro-servo commandé par signal PWM.",
            width: 120,
            height: 90,

            properties: {
                voltage: 5,
                angle: 90,
                minAngle: 0,
                maxAngle: 180
            },

            pins: [
                { id: "VCC", name: "VCC", type: "power", index: 0, x: 15, y: 0 },
                { id: "SIGNAL", name: "SIGNAL", type: "pwm", index: 1, x: 60, y: 0 },
                { id: "GND", name: "GND", type: "ground", index: 2, x: 105, y: 0 }
            ]
        },


        {
            id: "stepper-28byj48",
            name: "Moteur pas à pas 28BYJ-48",
            icon: "⚙️",
            category: "Actionneurs",
            type: "motor",
            description:
                "Moteur pas à pas pour mécanismes robotiques.",
            width: 130,
            height: 100,

            properties: {
                voltage: 5,
                stepsPerRevolution: 2048
            },

            pins: [
                { id: "IN1", name: "IN1", type: "digital", index: 0, x: 15, y: 0 },
                { id: "IN2", name: "IN2", type: "digital", index: 1, x: 45, y: 0 },
                { id: "IN3", name: "IN3", type: "digital", index: 2, x: 75, y: 0 },
                { id: "IN4", name: "IN4", type: "digital", index: 3, x: 105, y: 0 }
            ]
        },


        {
            id: "buzzer",
            name: "Buzzer",
            icon: "🔊",
            category: "Actionneurs",
            type: "buzzer",
            description:
                "Avertisseur sonore commandé par tone().",
            width: 90,
            height: 75,

            properties: {
                voltage: 5,
                frequency: 1000
            },

            pins: [
                { id: "+", name: "+", type: "digital", index: 0, x: 15, y: 35 },
                { id: "-", name: "-", type: "ground", index: 1, x: 75, y: 35 }
            ]
        },


        /* ========================================================
           12 — DRIVERS ROBOTIQUES
        ======================================================== */

        {
            id: "l298n-driver",
            name: "Driver moteur L298N",
            icon: "🚗",
            category: "Robotique",
            type: "motor-driver",
            description:
                "Double pont en H pour commande de moteurs DC.",
            width: 150,
            height: 110,

            properties: {
                logicVoltage: 5,
                motorVoltage: 12,
                channels: 2
            },

            pins: [
                { id: "VCC", name: "VCC", type: "power", index: 0, x: 15, y: 0 },
                { id: "GND", name: "GND", type: "ground", index: 1, x: 45, y: 0 },
                { id: "ENA", name: "ENA", type: "pwm", index: 2, x: 75, y: 0 },
                { id: "IN1", name: "IN1", type: "digital", index: 3, x: 105, y: 0 },
                { id: "IN2", name: "IN2", type: "digital", index: 4, x: 135, y: 0 },
                { id: "OUT1", name: "OUT1", type: "motor", index: 5, x: 35, y: 100 },
                { id: "OUT2", name: "OUT2", type: "motor", index: 6, x: 115, y: 100 }
            ]
        },


        {
            id: "l9110s-driver",
            name: "Driver moteur L9110S",
            icon: "🚗",
            category: "Robotique",
            type: "motor-driver",
            description:
                "Petit module double canal pour moteurs DC.",
            width: 140,
            height: 100,

            properties: {
                logicVoltage: 5,
                motorVoltage: 12,
                channels: 2
            },

            pins: [
                { id: "AIA", name: "AIA", type: "pwm", index: 0, x: 20, y: 0 },
                { id: "AIB", name: "AIB", type: "pwm", index: 1, x: 50, y: 0 },
                { id: "BIA", name: "BIA", type: "pwm", index: 2, x: 90, y: 0 },
                { id: "BIB", name: "BIB", type: "pwm", index: 3, x: 120, y: 0 },
                { id: "VCC", name: "VCC", type: "power", index: 4, x: 35, y: 90 },
                { id: "GND", name: "GND", type: "ground", index: 5, x: 105, y: 90 }
            ]
        },


        /* ========================================================
           13 — ROBOTIQUE
        ======================================================== */

        {
            id: "robot-chassis",
            name: "Châssis robot 2 roues",
            icon: "🤖",
            category: "Robotique",
            type: "robot-chassis",
            description:
                "Châssis virtuel pour robot mobile à deux roues.",
            width: 220,
            height: 130,

            properties: {
                wheels: 2,
                motors: 2
            },

            pins: []
        },


        {
            id: "robot-wheel",
            name: "Roue robotique",
            icon: "⭕",
            category: "Robotique",
            type: "wheel",
            description:
                "Roue utilisée avec un moteur DC.",
            width: 80,
            height: 80,

            properties: {
                diameter: 65
            },

            pins: []
        },


        {
            id: "robot-arm-servo",
            name: "Bras robotique servo",
            icon: "🦾",
            category: "Robotique",
            type: "servo",
            description:
                "Module de bras robotique commandé par servo.",
            width: 150,
            height: 120,

            properties: {
                voltage: 5,
                angle: 90,
                minAngle: 0,
                maxAngle: 180
            },

            pins: [
                { id: "VCC", name: "VCC", type: "power", index: 0, x: 20, y: 0 },
                { id: "SIGNAL", name: "SIGNAL", type: "pwm", index: 1, x: 75, y: 0 },
                { id: "GND", name: "GND", type: "ground", index: 2, x: 130, y: 0 }
            ]
        },


        /* ========================================================
           14 — CONNECTIQUE
        ======================================================== */

        {
            id: "jumper-male-male",
            name: "Jumper mâle-mâle",
            icon: "🔌",
            category: "Connectique",
            type: "jumper",
            description:
                "Fil de connexion pour prototypage.",
            width: 120,
            height: 45,

            properties: {
                color: "black",
                length: 20
            },

            pins: [
                { id: "A", name: "A", type: "generic", index: 0, x: 0, y: 20 },
                { id: "B", name: "B", type: "generic", index: 1, x: 120, y: 20 }
            ]
        },


        {
            id: "terminal-block",
            name: "Bornier 2 voies",
            icon: "🔌",
            category: "Connectique",
            type: "terminal",
            description:
                "Bornier de raccordement à deux bornes.",
            width: 90,
            height: 65,

            pins: [
                { id: "1", name: "1", type: "generic", index: 0, x: 20, y: 0 },
                { id: "2", name: "2", type: "generic", index: 1, x: 70, y: 0 }
            ]
        }

    ];


    /* ============================================================
       15 — BIBLIOTHÈQUE DE CODES
    ============================================================ */

    const codes = [

        {
            id: "led-on",
            title: "Allumer une LED",
            name: "LED ON",
            category: "Débutant",
            level: "Débutant",
            icon: "💡",

            description:
                "Configure une sortie numérique et maintient la LED allumée.",

            components: [
                "arduino-uno",
                "led-red",
                "resistor-220"
            ],

            source:
`const int LED_PIN = 13;

void setup() {
    pinMode(LED_PIN, OUTPUT);
}

void loop() {
    digitalWrite(LED_PIN, HIGH);
}`,

            code:
`const int LED_PIN = 13;

void setup() {
    pinMode(LED_PIN, OUTPUT);
}

void loop() {
    digitalWrite(LED_PIN, HIGH);
}`
        },


        {
            id: "led-blink",
            title: "Faire clignoter une LED",
            name: "LED BLINK",
            category: "Débutant",
            level: "Débutant",
            icon: "💡",

            description:
                "Commande une LED avec deux niveaux logiques séparés par un délai.",

            components: [
                "arduino-uno",
                "led-red",
                "resistor-220"
            ],

            source:
`const int LED_PIN = 13;

void setup() {
    pinMode(LED_PIN, OUTPUT);
}

void loop() {
    digitalWrite(LED_PIN, HIGH);
    delay(500);
    digitalWrite(LED_PIN, LOW);
    delay(500);
}`,

            code:
`const int LED_PIN = 13;

void setup() {
    pinMode(LED_PIN, OUTPUT);
}

void loop() {
    digitalWrite(LED_PIN, HIGH);
    delay(500);
    digitalWrite(LED_PIN, LOW);
    delay(500);
}`
        },


        {
            id: "button-led",
            title: "Bouton et LED",
            name: "BUTTON LED",
            category: "Débutant",
            level: "Débutant",
            icon: "🔘",

            description:
                "Exemple de commande d'une LED à partir d'un bouton.",

            components: [
                "arduino-uno",
                "push-button",
                "led-red",
                "resistor-220"
            ],

            source:
`const int BUTTON_PIN = 2;
const int LED_PIN = 13;

void setup() {
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    pinMode(LED_PIN, OUTPUT);
}

void loop() {
    int state = digitalRead(BUTTON_PIN);

    if (state == LOW) {
        digitalWrite(LED_PIN, HIGH);
    } else {
        digitalWrite(LED_PIN, LOW);
    }
}`,

            code:
`const int BUTTON_PIN = 2;
const int LED_PIN = 13;

void setup() {
    pinMode(BUTTON_PIN, INPUT_PULLUP);
    pinMode(LED_PIN, OUTPUT);
}

void loop() {
    int state = digitalRead(BUTTON_PIN);

    if (state == LOW) {
        digitalWrite(LED_PIN, HIGH);
    } else {
        digitalWrite(LED_PIN, LOW);
    }
}`
        },


        {
            id: "pwm-led",
            title: "Variation de luminosité par PWM",
            name: "PWM LED",
            category: "Intermédiaire",
            level: "Intermédiaire",
            icon: "🌗",

            description:
                "Commande une LED par une sortie PWM.",

            components: [
                "arduino-uno",
                "led-red",
                "resistor-220"
            ],

            source:
`const int LED_PIN = 9;

void setup() {
    pinMode(LED_PIN, OUTPUT);
}

void loop() {
    analogWrite(LED_PIN, 128);
}`,

            code:
`const int LED_PIN = 9;

void setup() {
    pinMode(LED_PIN, OUTPUT);
}

void loop() {
    analogWrite(LED_PIN, 128);
}`
        },


        {
            id: "buzzer-tone",
            title: "Buzzer sonore",
            name: "BUZZER",
            category: "Débutant",
            level: "Débutant",
            icon: "🔊",

            description:
                "Génère une tonalité sur une sortie numérique.",

            components: [
                "arduino-uno",
                "buzzer"
            ],

            source:
`const int BUZZER_PIN = 8;

void setup() {
    pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
    tone(BUZZER_PIN, 1000);
    delay(500);
    noTone(BUZZER_PIN);
    delay(500);
}`,

            code:
`const int BUZZER_PIN = 8;

void setup() {
    pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
    tone(BUZZER_PIN, 1000);
    delay(500);
    noTone(BUZZER_PIN);
    delay(500);
}`
        },


        {
            id: "motor-pwm",
            title: "Commande moteur par PWM",
            name: "MOTOR PWM",
            category: "Robotique",
            level: "Intermédiaire",
            icon: "⚙️",

            description:
                "Commande simulée de la vitesse d'un moteur par PWM.",

            components: [
                "arduino-uno",
                "dc-motor"
            ],

            source:
`const int MOTOR_PIN = 9;

void setup() {
    pinMode(MOTOR_PIN, OUTPUT);
}

void loop() {
    analogWrite(MOTOR_PIN, 180);
}`,

            code:
`const int MOTOR_PIN = 9;

void setup() {
    pinMode(MOTOR_PIN, OUTPUT);
}

void loop() {
    analogWrite(MOTOR_PIN, 180); 
}`
        },


        {
            id: "ultrasonic-basic",
            title: "Capteur ultrasonique",
            name: "HC-SR04",
            category: "Capteurs",
            level: "Intermédiaire",
            icon: "📡",

            description:
                "Structure de base pour piloter les broches TRIG et ECHO d'un HC-SR04.",

            components: [
                "arduino-uno",
                "ultrasonic-hc-sr04"
            ],

            source:
`const int TRIG_PIN = 7;
const int ECHO_PIN = 6;

void setup() {
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
}

void loop() {
    digitalWrite(TRIG_PIN, HIGH);
    delay(10);
    digitalWrite(TRIG_PIN, LOW);
}`,

            code:
`const int TRIG_PIN = 7;
const int ECHO_PIN = 6;

void setup() {
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
}

void loop() {
    digitalWrite(TRIG_PIN, HIGH);
    delay(10);
    digitalWrite(TRIG_PIN, LOW);
}`
        },


        {
            id: "servo-control",
            title: "Commande servo",
            name: "SERVO",
            category: "Robotique",
            level: "Intermédiaire",
            icon: "🔧",

            description:
                "Exemple de génération d'un signal PWM pour un actionneur servo.",

            components: [
                "arduino-uno",
                "servo-sg90"
            ],

            source:
`const int SERVO_PIN = 9;

void setup() {
    pinMode(SERVO_PIN, OUTPUT);
}

void loop() {
    analogWrite(SERVO_PIN, 128);
}`,

            code:
`const int SERVO_PIN = 9;

void setup() {
    pinMode(SERVO_PIN, OUTPUT);
}

void loop() {
    analogWrite(SERVO_PIN, 128);
}`
        },


        {
            id: "digital-output",
            title: "Sortie numérique",
            name: "DIGITAL OUTPUT",
            category: "Fondamentaux",
            level: "Débutant",
            icon: "🔌",

            description:
                "Exemple minimal de configuration d'une sortie numérique.",

            components: [
                "arduino-uno"
            ],

            source:
`const int OUTPUT_PIN = 8;

void setup() {
    pinMode(OUTPUT_PIN, OUTPUT);
}

void loop() {
    digitalWrite(OUTPUT_PIN, HIGH);
}`,

            code:
`const int OUTPUT_PIN = 8;

void setup() {
    pinMode(OUTPUT_PIN, OUTPUT);
}

void loop() {
    digitalWrite(OUTPUT_PIN, HIGH);`
        },


        {
            id: "multiple-outputs",
            title: "Deux sorties numériques",
            name: "MULTI OUTPUT",
            category: "Fondamentaux",
            level: "Débutant",
            icon: "🔌",

            description:
                "Commande de deux sorties numériques.",

            components: [
                "arduino-uno"
            ],

            source:
`const int OUT1 = 8;
const int OUT2 = 9;

void setup() {
    pinMode(OUT1, OUTPUT);
    pinMode(OUT2, OUTPUT);
}

void loop() {
    digitalWrite(OUT1, HIGH);
    digitalWrite(OUT2, LOW);
}`,

            code:
`const int OUT1 = 8;
const int OUT2 = 9;

void setup() {
    pinMode(OUT1, OUTPUT);
    pinMode(OUT2, OUTPUT);
}

void loop() {
    digitalWrite(OUT1, HIGH);
    digitalWrite(OUT2, LOW);
}`
        }


    ];


    /* ============================================================
       16 — MISSIONS PÉDAGOGIQUES
    ============================================================ */

    const missions = [

        {
            id: "mission-led",
            title: "Allumer une LED",
            name: "Allumer une LED",
            level: "Débutant",
            niveau: "Débutant",
            icon: "💡",

            description:
                "Construisez un montage avec une carte Arduino, une résistance et une LED. Programmez une sortie numérique.",

            objective:
                "La LED doit s'allumer avec une sortie numérique.",

            requiredComponents: [
                "arduino-uno",
                "led-red",
                "resistor-220"
            ],

            requiredCode:
                "digitalWrite",

            targetPin:
                13
        },


        {
            id: "mission-led-blink",
            title: "Clignotement automatique",
            name: "Clignotement automatique",
            level: "Débutant",
            niveau: "Débutant",
            icon: "💡",

            description:
                "Programmez une LED pour produire un clignotement périodique.",

            objective:
                "La LED doit être commandée par HIGH et LOW avec un délai.",

            requiredComponents: [
                "arduino-uno",
                "led-red",
                "resistor-220"
            ],

            requiredCode:
                "delay"
        },


        {
            id: "mission-button",
            title: "Bouton de commande",
            name: "Bouton de commande",
            level: "Débutant",
            niveau: "Débutant",
            icon: "🔘",

            description:
                "Utilisez un bouton poussoir comme entrée numérique et une LED comme sortie.",

            objective:
                "La LED doit suivre l'état du bouton.",

            requiredComponents: [
                "arduino-uno",
                "push-button",
                "led-red",
                "resistor-220"
            ],

            requiredCode:
                "digitalRead"
        },


        {
            id: "mission-pwm",
            title: "Contrôle de luminosité",
            name: "Contrôle de luminosité",
            level: "Intermédiaire",
            niveau: "Intermédiaire",
            icon: "🌗",

            description:
                "Utilisez une sortie PWM pour contrôler le niveau de puissance appliqué à une LED.",

            objective:
                "La luminosité de la LED doit être contrôlée par PWM.",

            requiredComponents: [
                "arduino-uno",
                "led-red",
                "resistor-220"
            ],

            requiredCode:
                "analogWrite"
        },


        {
            id: "mission-ultrasonic",
            title: "Détection ultrasonique",
            name: "Détection ultrasonique",
            level: "Intermédiaire",
            niveau: "Intermédiaire",
            icon: "📡",

            description:
                "Connectez un HC-SR04 à une carte Arduino et préparez les lignes TRIG et ECHO.",

            objective:
                "Mesurer une distance avec un capteur ultrasonique.",

            requiredComponents: [
                "arduino-uno",
                "ultrasonic-hc-sr04"
            ],

            requiredCode:
                "TRIG"
        },


        {
            id: "mission-motor",
            title: "Commande moteur",
            name: "Commande moteur",
            level: "Intermédiaire",
            niveau: "Intermédiaire",
            icon: "⚙️",

            description:
                "Utilisez une sortie PWM pour commander la puissance d'un moteur DC simulé.",

            objective:
                "Faire varier la vitesse du moteur par PWM.",

            requiredComponents: [
                "arduino-uno",
                "dc-motor"
            ],

            requiredCode:
                "analogWrite"
        },


        {
            id: "mission-buzzer",
            title: "Alerte sonore",
            name: "Alerte sonore",
            level: "Intermédiaire",
            niveau: "Intermédiaire",
            icon: "🔊",

            description:
                "Utilisez un buzzer pour produire une fréquence sonore.",

            objective:
                "Produire un signal sonore avec tone().",

            requiredComponents: [
                "arduino-uno",
                "buzzer"
            ],

            requiredCode:
                "tone"
        },


        {
            id: "mission-servo",
            title: "Actionneur servo",
            name: "Actionneur servo",
            level: "Intermédiaire",
            niveau: "Intermédiaire",
            icon: "🔧",

            description:
                "Commandez un servo par une sortie adaptée au contrôle PWM.",

            objective:
                "Commander un actionneur servo avec un signal PWM.",

            requiredComponents: [
                "arduino-uno",
                "servo-sg90"
            ],

            requiredCode:
                "analogWrite"
        },


        {
            id: "mission-robot",
            title: "Base de robot mobile",
            name: "Base de robot mobile",
            level: "Avancé",
            niveau: "Avancé",
            icon: "🤖",

            description:
                "Préparez une base robotique avec carte de contrôle, driver et moteurs.",

            objective:
                "Commander un moteur robotique par PWM.",

            requiredComponents: [
                "arduino-uno",
                "l298n-driver",
                "dc-motor",
                "robot-chassis"
            ],

            requiredCode:
                "analogWrite"
        },


        {
            id: "mission-capteur-lumiere",
            title: "Détection de luminosité",
            name: "Détection de luminosité",
            level: "Intermédiaire",
            niveau: "Intermédiaire",
            icon: "☀️",

            description:
                "Utilisez une LDR pour créer une entrée analogique de luminosité.",

            objective:
                "Lire une valeur analogique provenant d'un capteur de lumière.",

            requiredComponents: [
                "arduino-uno",
                "ldr-photoresistor"
            ],

            requiredCode:
                "analogRead"
        }

    ];


    /* ============================================================
       17 — EXPORT GLOBAL
    ============================================================ */

    window.FOBAS_ROBOTICS_DATA = {

        version: "1.0.0",

        name:
            "FOBAS — Laboratoire Électronique & Robotique",

        description:
            "Dataset principal du laboratoire électronique et robotique FOBAS.",

        categories: categories,

        tools: tools,

        components: components,

        codes: codes,

        missions: missions

    };


    /* ============================================================
       18 — ALIAS DE COMPATIBILITÉ
    ============================================================ */

    window.FOBAS_ROBOTICS_DATASET =
        window.FOBAS_ROBOTICS_DATA;

    window.FOBAS_DATA =
        window.FOBAS_ROBOTICS_DATA;

    window.FOBAS_ELECTRONIQUE_ROBOTIQUE_DATA =
        window.FOBAS_ROBOTICS_DATA;

    window.ROBOTICS_DATA =
        window.FOBAS_ROBOTICS_DATA;


})(window);