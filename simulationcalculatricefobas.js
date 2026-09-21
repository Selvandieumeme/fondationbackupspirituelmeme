(() => {
    'use strict';

    /* ============================================================
       FOBAS — CALCULATRICE CHIMIE & PHYSIQUE 3D
       ENGINE: FOBAS_SCIENTIFIC_CALCULATOR_3D_V1
       ------------------------------------------------------------
       • 100% vanilla JavaScript
       • Aucune dépendance externe / aucun Three.js
       • Compatible avec le HTML fourni
       • Clavier scientifique réel
       • Fonctions Chimie + Physique
       • Formules, unités, historique
       • Visualisation 3D CSS dynamique + interaction tactile
       ============================================================ */

    const ENGINE_NAME = 'FOBAS_SCIENTIFIC_CALCULATOR_3D_V1';
    const ENGINE_VERSION = '1.0.0';
    const STORAGE_KEY = 'FOBAS_SCIENTIFIC_CALCULATOR_STATE_V1';
    const HISTORY_KEY = 'FOBAS_SCIENTIFIC_CALCULATOR_HISTORY_V1';
    const DEGREE_MODE = true;

    const state = {
        mode: 'chemistry',
        expression: '',
        result: '0',
        unit: '—',
        formula: 'Formula — —',
        steps: 'Entrez une valeur ou sélectionnez une fonction scientifique.',
        calculationState: 'READY',
        status: 'READY',
        history: [],
        lastFunction: null,
        lastNumericResult: null,
        visual: {
            scale: 1,
            rotateX: -12,
            rotateY: 18,
            translateX: 0,
            translateY: 0
        }
    };

    const dom = {};

    const $ = (id) => document.getElementById(id);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const CHEMICAL_ELEMENTS = {
        H: 1.008,
        He: 4.002602,
        Li: 6.94,
        Be: 9.0121831,
        B: 10.81,
        C: 12.011,
        N: 14.007,
        O: 15.999,
        F: 18.998403163,
        Ne: 20.1797,
        Na: 22.98976928,
        Mg: 24.305,
        Al: 26.9815385,
        Si: 28.085,
        P: 30.973761998,
        S: 32.06,
        Cl: 35.45,
        Ar: 39.948,
        K: 39.0983,
        Ca: 40.078,
        Sc: 44.955908,
        Ti: 47.867,
        V: 50.9415,
        Cr: 51.9961,
        Mn: 54.938044,
        Fe: 55.845,
        Co: 58.933194,
        Ni: 58.6934,
        Cu: 63.546,
        Zn: 65.38,
        Ga: 69.723,
        Ge: 72.630,
        As: 74.921595,
        Se: 78.971,
        Br: 79.904,
        Kr: 83.798,
        Rb: 85.4678,
        Sr: 87.62,
        Y: 88.90584,
        Zr: 91.224,
        Nb: 92.90637,
        Mo: 95.95,
        Tc: 98,
        Ru: 101.07,
        Rh: 102.90550,
        Pd: 106.42,
        Ag: 107.8682,
        Cd: 112.414,
        In: 114.818,
        Sn: 118.710,
        Sb: 121.760,
        Te: 127.60,
        I: 126.90447,
        Xe: 131.293,
        Cs: 132.90545196,
        Ba: 137.327,
        La: 138.90547,
        Ce: 140.116,
        Pr: 140.90766,
        Nd: 144.242,
        Sm: 150.36,
        Eu: 151.964,
        Gd: 157.25,
        Tb: 158.92535,
        Dy: 162.500,
        Ho: 164.93033,
        Er: 167.259,
        Tm: 168.93422,
        Yb: 173.045,
        Lu: 174.9668,
        Hf: 178.49,
        Ta: 180.94788,
        W: 183.84,
        Re: 186.207,
        Os: 190.23,
        Ir: 192.217,
        Pt: 195.084,
        Au: 196.966569,
        Hg: 200.592,
        Tl: 204.38,
        Pb: 207.2,
        Bi: 208.98040,
        Po: 209,
        At: 210,
        Rn: 222,
        Fr: 223,
        Ra: 226,
        Ac: 227,
        Th: 232.0377,
        Pa: 231.03588,
        U: 238.02891
    };

    const ELEMENT_SYMBOLS = Object.keys(CHEMICAL_ELEMENTS).sort((a, b) => b.length - a.length);

    const CHEMISTRY_FUNCTIONS = {
        molarMass: {
            title: 'Masse molaire',
            formula: 'M = Σ(nᵢ × Mᵢ)',
            unit: 'g·mol⁻¹',
            fields: [{ id: 'formula', label: 'Formule chimique', type: 'text', placeholder: 'Ex. H2SO4', defaultValue: 'H2O' }]
        },
        moles: {
            title: 'Moles',
            formula: 'n = m / M',
            unit: 'mol',
            fields: [
                { id: 'mass', label: 'Masse m', unit: 'g', type: 'number', step: 'any', defaultValue: '18' },
                { id: 'molarMass', label: 'Masse molaire M', unit: 'g·mol⁻¹', type: 'number', step: 'any', defaultValue: '18.015' }
            ]
        },
        mass: {
            title: 'Masse',
            formula: 'm = n × M',
            unit: 'g',
            fields: [
                { id: 'moles', label: 'Quantité de matière n', unit: 'mol', type: 'number', step: 'any', defaultValue: '1' },
                { id: 'molarMass', label: 'Masse molaire M', unit: 'g·mol⁻¹', type: 'number', step: 'any', defaultValue: '18.015' }
            ]
        },
        volume: {
            title: 'Volume molaire',
            formula: 'V = n × Vₘ',
            unit: 'L',
            fields: [
                { id: 'moles', label: 'Quantité de matière n', unit: 'mol', type: 'number', step: 'any', defaultValue: '1' },
                { id: 'molarVolume', label: 'Volume molaire Vₘ', unit: 'L·mol⁻¹', type: 'number', step: 'any', defaultValue: '22.414' }
            ]
        },
        molarity: {
            title: 'Molarité',
            formula: 'C = n / V',
            unit: 'mol·L⁻¹',
            fields: [
                { id: 'moles', label: 'Quantité de matière n', unit: 'mol', type: 'number', step: 'any', defaultValue: '0.5' },
                { id: 'volume', label: 'Volume V', unit: 'L', type: 'number', step: 'any', defaultValue: '1' }
            ]
        },
        dilution: {
            title: 'Dilution',
            formula: 'C₁V₁ = C₂V₂',
            unit: 'unité selon la grandeur calculée',
            fields: [
                { id: 'c1', label: 'Concentration C₁', unit: 'mol·L⁻¹', type: 'number', step: 'any', defaultValue: '1' },
                { id: 'v1', label: 'Volume V₁', unit: 'L', type: 'number', step: 'any', defaultValue: '0.1' },
                { id: 'c2', label: 'Concentration C₂', unit: 'mol·L⁻¹', type: 'number', step: 'any', defaultValue: '0.1' },
                { id: 'v2', label: 'Volume V₂ (laisser vide pour le calcul)', unit: 'L', type: 'number', step: 'any', defaultValue: '' }
            ],
            note: 'Laissez exactement une des quatre valeurs vide pour calculer cette inconnue.'
        },
        concentration: {
            title: 'Concentration massique',
            formula: 'Cₘ = m / V',
            unit: 'g·L⁻¹',
            fields: [
                { id: 'mass', label: 'Masse m', unit: 'g', type: 'number', step: 'any', defaultValue: '10' },
                { id: 'volume', label: 'Volume V', unit: 'L', type: 'number', step: 'any', defaultValue: '0.5' }
            ]
        },
        density: {
            title: 'Densité / masse volumique',
            formula: 'ρ = m / V',
            unit: 'g·mL⁻¹',
            fields: [
                { id: 'mass', label: 'Masse m', unit: 'g', type: 'number', step: 'any', defaultValue: '100' },
                { id: 'volume', label: 'Volume V', unit: 'mL', type: 'number', step: 'any', defaultValue: '50' }
            ]
        },
        ph: {
            title: 'pH / pOH',
            formula: 'pH = −log₁₀[H⁺] ; pOH = −log₁₀[OH⁻] ; pH+pOH=14',
            unit: 'pH',
            fields: [
                { id: 'concentration', label: '[H⁺] ou [OH⁻]', unit: 'mol·L⁻¹', type: 'number', step: 'any', defaultValue: '1e-3' },
                { id: 'species', label: 'Espèce', type: 'select', options: [{ value: 'H+', label: 'H⁺' }, { value: 'OH-', label: 'OH⁻' }], defaultValue: 'H+' }
            ]
        },
        stoichiometry: {
            title: 'Stœchiométrie',
            formula: 'Rapport stœchiométrique = ν₂ / ν₁',
            unit: 'mol',
            fields: [
                { id: 'coefficient1', label: 'Coefficient ν₁', type: 'number', step: 'any', defaultValue: '2' },
                { id: 'amount1', label: 'Quantité n₁', unit: 'mol', type: 'number', step: 'any', defaultValue: '1' },
                { id: 'coefficient2', label: 'Coefficient ν₂', type: 'number', step: 'any', defaultValue: '1' }
            ]
        },
        yield: {
            title: 'Rendement',
            formula: 'η = (quantité réelle / quantité théorique) × 100',
            unit: '%',
            fields: [
                { id: 'actual', label: 'Quantité réelle', unit: 'unité identique à la théorie', type: 'number', step: 'any', defaultValue: '8' },
                { id: 'theoretical', label: 'Quantité théorique', unit: 'unité identique à la réalité', type: 'number', step: 'any', defaultValue: '10' }
            ]
        },
        idealGas: {
            title: 'Gaz parfaits',
            formula: 'PV = nRT',
            unit: 'variable',
            fields: [
                { id: 'p', label: 'Pression P', unit: 'Pa', type: 'number', step: 'any', defaultValue: '101325' },
                { id: 'v', label: 'Volume V', unit: 'm³', type: 'number', step: 'any', defaultValue: '0.022414' },
                { id: 'n', label: 'Quantité n', unit: 'mol', type: 'number', step: 'any', defaultValue: '1' },
                { id: 't', label: 'Température T', unit: 'K', type: 'number', step: 'any', defaultValue: '273.15' },
                { id: 'unknown', label: 'Grandeur à calculer', type: 'select', options: [
                    { value: 'p', label: 'P — Pression' },
                    { value: 'v', label: 'V — Volume' },
                    { value: 'n', label: 'n — Quantité' },
                    { value: 't', label: 'T — Température' }
                ], defaultValue: 'p' }
            ]
        },
        chemicalEquation: {
            title: 'Équation chimique',
            formula: 'Équilibrage atomique',
            unit: '—',
            fields: [
                { id: 'equation', label: 'Équation', type: 'text', placeholder: 'Ex. H2 + O2 -> H2O', defaultValue: 'H2 + O2 -> H2O' }
            ]
        },
        chemistryUnits: {
            title: 'Unités chimiques',
            formula: 'Conversion scientifique',
            unit: 'unité cible',
            fields: [
                { id: 'value', label: 'Valeur', type: 'number', step: 'any', defaultValue: '1' },
                { id: 'from', label: 'De', type: 'select', options: [
                    { value: 'mol', label: 'mol' }, { value: 'mmol', label: 'mmol' },
                    { value: 'g', label: 'g' }, { value: 'kg', label: 'kg' },
                    { value: 'L', label: 'L' }, { value: 'mL', label: 'mL' },
                    { value: 'm3', label: 'm³' }, { value: 'Pa', label: 'Pa' },
                    { value: 'kPa', label: 'kPa' }, { value: 'bar', label: 'bar' },
                    { value: 'atm', label: 'atm' }
                ], defaultValue: 'mol' },
                { id: 'to', label: 'Vers', type: 'select', options: [
                    { value: 'mol', label: 'mol' }, { value: 'mmol', label: 'mmol' },
                    { value: 'g', label: 'g' }, { value: 'kg', label: 'kg' },
                    { value: 'L', label: 'L' }, { value: 'mL', label: 'mL' },
                    { value: 'm3', label: 'm³' }, { value: 'Pa', label: 'Pa' },
                    { value: 'kPa', label: 'kPa' }, { value: 'bar', label: 'bar' },
                    { value: 'atm', label: 'atm' }
                ], defaultValue: 'mmol' }
            ]
        }
    };

    const PHYSICS_FUNCTIONS = {
        speed: {
            title: 'Vitesse', formula: 'v = d / t', unit: 'm·s⁻¹',
            fields: [
                { id: 'distance', label: 'Distance d', unit: 'm', type: 'number', step: 'any', defaultValue: '100' },
                { id: 'time', label: 'Temps t', unit: 's', type: 'number', step: 'any', defaultValue: '10' }
            ]
        },
        acceleration: {
            title: 'Accélération', formula: 'a = Δv / Δt', unit: 'm·s⁻²',
            fields: [
                { id: 'dv', label: 'Variation de vitesse Δv', unit: 'm·s⁻¹', type: 'number', step: 'any', defaultValue: '20' },
                { id: 'dt', label: 'Variation de temps Δt', unit: 's', type: 'number', step: 'any', defaultValue: '4' }
            ]
        },
        force: {
            title: 'Force', formula: 'F = m × a', unit: 'N',
            fields: [
                { id: 'mass', label: 'Masse m', unit: 'kg', type: 'number', step: 'any', defaultValue: '10' },
                { id: 'acceleration', label: 'Accélération a', unit: 'm·s⁻²', type: 'number', step: 'any', defaultValue: '9.81' }
            ]
        },
        work: {
            title: 'Travail', formula: 'W = F × d × cos(θ)', unit: 'J',
            fields: [
                { id: 'force', label: 'Force F', unit: 'N', type: 'number', step: 'any', defaultValue: '100' },
                { id: 'distance', label: 'Distance d', unit: 'm', type: 'number', step: 'any', defaultValue: '5' },
                { id: 'angle', label: 'Angle θ', unit: '°', type: 'number', step: 'any', defaultValue: '0' }
            ]
        },
        energy: {
            title: 'Énergie cinétique', formula: 'E = ½mv²', unit: 'J',
            fields: [
                { id: 'mass', label: 'Masse m', unit: 'kg', type: 'number', step: 'any', defaultValue: '2' },
                { id: 'speed', label: 'Vitesse v', unit: 'm·s⁻¹', type: 'number', step: 'any', defaultValue: '10' }
            ]
        },
        power: {
            title: 'Puissance mécanique', formula: 'P = W / t', unit: 'W',
            fields: [
                { id: 'work', label: 'Travail W', unit: 'J', type: 'number', step: 'any', defaultValue: '1000' },
                { id: 'time', label: 'Temps t', unit: 's', type: 'number', step: 'any', defaultValue: '20' }
            ]
        },
        pressure: {
            title: 'Pression', formula: 'P = F / A', unit: 'Pa',
            fields: [
                { id: 'force', label: 'Force F', unit: 'N', type: 'number', step: 'any', defaultValue: '100' },
                { id: 'area', label: 'Surface A', unit: 'm²', type: 'number', step: 'any', defaultValue: '0.5' }
            ]
        },
        physicalDensity: {
            title: 'Densité physique', formula: 'ρ = m / V', unit: 'kg·m⁻³',
            fields: [
                { id: 'mass', label: 'Masse m', unit: 'kg', type: 'number', step: 'any', defaultValue: '10' },
                { id: 'volume', label: 'Volume V', unit: 'm³', type: 'number', step: 'any', defaultValue: '2' }
            ]
        },
        ohmLaw: {
            title: 'Loi d’Ohm', formula: 'V = I × R', unit: 'variable',
            fields: [
                { id: 'v', label: 'Tension V', unit: 'V', type: 'number', step: 'any', defaultValue: '12' },
                { id: 'i', label: 'Courant I', unit: 'A', type: 'number', step: 'any', defaultValue: '2' },
                { id: 'r', label: 'Résistance R', unit: 'Ω', type: 'number', step: 'any', defaultValue: '6' },
                { id: 'unknown', label: 'Grandeur à calculer', type: 'select', options: [
                    { value: 'v', label: 'V — Tension' }, { value: 'i', label: 'I — Courant' }, { value: 'r', label: 'R — Résistance' }
                ], defaultValue: 'v' }
            ]
        },
        electricPower: {
            title: 'Puissance électrique', formula: 'P = V × I', unit: 'W',
            fields: [
                { id: 'v', label: 'Tension V', unit: 'V', type: 'number', step: 'any', defaultValue: '230' },
                { id: 'i', label: 'Courant I', unit: 'A', type: 'number', step: 'any', defaultValue: '2' }
            ]
        },
        resistance: {
            title: 'Résistance', formula: 'R = V / I', unit: 'Ω',
            fields: [
                { id: 'v', label: 'Tension V', unit: 'V', type: 'number', step: 'any', defaultValue: '12' },
                { id: 'i', label: 'Courant I', unit: 'A', type: 'number', step: 'any', defaultValue: '2' }
            ]
        },
        electricCharge: {
            title: 'Charge électrique', formula: 'Q = I × t', unit: 'C',
            fields: [
                { id: 'i', label: 'Courant I', unit: 'A', type: 'number', step: 'any', defaultValue: '2' },
                { id: 't', label: 'Temps t', unit: 's', type: 'number', step: 'any', defaultValue: '60' }
            ]
        },
        frequency: {
            title: 'Fréquence', formula: 'f = 1 / T', unit: 'Hz',
            fields: [{ id: 'period', label: 'Période T', unit: 's', type: 'number', step: 'any', defaultValue: '0.02' }]
        },
        wave: {
            title: 'Ondes', formula: 'v = λf', unit: 'm',
            fields: [
                { id: 'speed', label: 'Vitesse de propagation v', unit: 'm·s⁻¹', type: 'number', step: 'any', defaultValue: '343' },
                { id: 'frequency', label: 'Fréquence f', unit: 'Hz', type: 'number', step: 'any', defaultValue: '1000' }
            ]
        },
        temperature: {
            title: 'Température', formula: 'K = °C + 273.15 ; °F = °C × 9/5 + 32', unit: 'K / °F',
            fields: [
                { id: 'value', label: 'Température', type: 'number', step: 'any', defaultValue: '25' },
                { id: 'from', label: 'Unité source', type: 'select', options: [
                    { value: 'C', label: '°C Celsius' }, { value: 'K', label: 'K Kelvin' }, { value: 'F', label: '°F Fahrenheit' }
                ], defaultValue: 'C' },
                { id: 'to', label: 'Unité cible', type: 'select', options: [
                    { value: 'C', label: '°C Celsius' }, { value: 'K', label: 'K Kelvin' }, { value: 'F', label: '°F Fahrenheit' }
                ], defaultValue: 'K' }
            ]
        },
        physicsUnits: {
            title: 'Unités physiques', formula: 'Conversion d’unités SI', unit: 'unité cible',
            fields: [
                { id: 'value', label: 'Valeur', type: 'number', step: 'any', defaultValue: '1' },
                { id: 'from', label: 'De', type: 'select', options: [
                    { value: 'm', label: 'm' }, { value: 'km', label: 'km' }, { value: 'cm', label: 'cm' }, { value: 'mm', label: 'mm' },
                    { value: 's', label: 's' }, { value: 'min', label: 'min' }, { value: 'h', label: 'h' },
                    { value: 'N', label: 'N' }, { value: 'kN', label: 'kN' },
                    { value: 'J', label: 'J' }, { value: 'kJ', label: 'kJ' },
                    { value: 'W', label: 'W' }, { value: 'kW', label: 'kW' },
                    { value: 'Pa', label: 'Pa' }, { value: 'kPa', label: 'kPa' }, { value: 'bar', label: 'bar' },
                    { value: 'Hz', label: 'Hz' }, { value: 'kHz', label: 'kHz' },
                    { value: 'V', label: 'V' }, { value: 'mV', label: 'mV' },
                    { value: 'A', label: 'A' }, { value: 'mA', label: 'mA' }
                ], defaultValue: 'm' },
                { id: 'to', label: 'Vers', type: 'select', options: [
                    { value: 'm', label: 'm' }, { value: 'km', label: 'km' }, { value: 'cm', label: 'cm' }, { value: 'mm', label: 'mm' },
                    { value: 's', label: 's' }, { value: 'min', label: 'min' }, { value: 'h', label: 'h' },
                    { value: 'N', label: 'N' }, { value: 'kN', label: 'kN' },
                    { value: 'J', label: 'J' }, { value: 'kJ', label: 'kJ' },
                    { value: 'W', label: 'W' }, { value: 'kW', label: 'kW' },
                    { value: 'Pa', label: 'Pa' }, { value: 'kPa', label: 'kPa' }, { value: 'bar', label: 'bar' },
                    { value: 'Hz', label: 'Hz' }, { value: 'kHz', label: 'kHz' },
                    { value: 'V', label: 'V' }, { value: 'mV', label: 'mV' },
                    { value: 'A', label: 'A' }, { value: 'mA', label: 'mA' }
                ], defaultValue: 'km' }
            ]
        }
    };

    function cacheDom() {
        const ids = [
            'fobasCalculatorApp', 'calculatorStatus', 'displayMode', 'displayExpression', 'displayResult', 'displayUnit',
            'chemistryModeBtn', 'physicsModeBtn', 'chemistryPanel', 'physicsPanel', 'calculationState', 'formulaDisplay', 'calculationSteps',
            'scientific3DViewport', 'threeDScene', 'calculatorVisualObject', 'chemistryMoleculeVisual', 'physicsVectorVisual', 'visualHint',
            'zoomOutBtn', 'resetViewBtn', 'zoomInBtn', 'visualModeBadge', 'visualInfoMode', 'visualInfoStatus',
            'formulaBtn', 'unitsBtn', 'historyBtn', 'clearHistoryBtn'
        ];
        ids.forEach(id => { dom[id] = $(id); });
    }

    function safeText(node, value) {
        if (node) node.textContent = value == null ? '' : String(value);
    }

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function formatNumber(value, maxDecimals = 10) {
        if (!Number.isFinite(value)) return 'Erreur';
        if (Math.abs(value) < 1e-12) value = 0;
        const abs = Math.abs(value);
        if ((abs !== 0 && abs < 1e-7) || abs >= 1e12) {
            return value.toExponential(Math.min(8, maxDecimals));
        }
        return Number(value.toFixed(maxDecimals)).toLocaleString('fr-FR', {
            maximumFractionDigits: maxDecimals,
            useGrouping: false
        });
    }

    function parseNumber(value, label = 'Valeur') {
        const normalized = String(value ?? '').trim().replace(',', '.');
        if (!normalized) throw new Error(`${label} est requis.`);
        const number = Number(normalized);
        if (!Number.isFinite(number)) throw new Error(`${label} doit être un nombre valide.`);
        return number;
    }

    function setStatus(text, type = 'ready') {
        state.status = text;
        safeText(dom.calculatorStatus, `● ${text}`);
        safeText(dom.visualInfoStatus, text);
        if (dom.calculatorStatus) {
            dom.calculatorStatus.dataset.status = type;
            dom.calculatorStatus.classList.remove('status-ready', 'status-busy', 'status-error', 'status-success');
            dom.calculatorStatus.classList.add(`status-${type}`);
        }
    }

    function setCalculation(formula, steps, result, unit = '—', calcState = 'DONE') {
        state.formula = formula;
        state.steps = steps;
        state.result = result;
        state.unit = unit;
        state.calculationState = calcState;
        safeText(dom.formulaDisplay, formula);
        safeText(dom.calculationSteps, steps);
        safeText(dom.displayResult, result);
        safeText(dom.displayUnit, unit);
        safeText(dom.calculationState, calcState);
    }

    function updateDisplay() {
        safeText(dom.displayMode, state.mode === 'chemistry' ? 'CHEMISTRY • SCIENTIFIC' : 'PHYSICS • SCIENTIFIC');
        safeText(dom.displayExpression, state.expression || '0');
        safeText(dom.displayResult, state.result || '0');
        safeText(dom.displayUnit, state.unit || '—');
    }

    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                mode: state.mode,
                expression: state.expression,
                result: state.result,
                unit: state.unit,
                formula: state.formula,
                steps: state.steps,
                calculationState: state.calculationState,
                visual: state.visual
            }));
            localStorage.setItem(HISTORY_KEY, JSON.stringify(state.history.slice(0, 100)));
        } catch (_) {
            // Le fonctionnement de la calculatrice ne dépend pas du stockage.
        }
    }

    function loadState() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
            if (saved && typeof saved === 'object') {
                state.mode = saved.mode === 'physics' ? 'physics' : 'chemistry';
                state.expression = typeof saved.expression === 'string' ? saved.expression : '';
                state.result = typeof saved.result === 'string' ? saved.result : '0';
                state.unit = typeof saved.unit === 'string' ? saved.unit : '—';
                state.formula = typeof saved.formula === 'string' ? saved.formula : 'Formula — —';
                state.steps = typeof saved.steps === 'string' ? saved.steps : 'Entrez une valeur ou sélectionnez une fonction scientifique.';
                state.calculationState = typeof saved.calculationState === 'string' ? saved.calculationState : 'READY';
                if (saved.visual) Object.assign(state.visual, saved.visual);
            }
            const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
            if (Array.isArray(history)) state.history = history.slice(0, 100);
        } catch (_) {
            state.history = [];
        }
    }

    function addHistory(entry) {
        state.history.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            mode: state.mode,
            ...entry
        });
        state.history = state.history.slice(0, 100);
        saveState();
    }

    function clearHistory() {
        state.history = [];
        saveState();
        showToast('Historique effacé.');
    }

    function showToast(message, type = 'info') {
        let container = $('fobasCalculatorToastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'fobasCalculatorToastContainer';
            Object.assign(container.style, {
                position: 'fixed',
                right: '18px',
                bottom: '18px',
                zIndex: '99999',
                display: 'grid',
                gap: '10px',
                maxWidth: 'min(92vw, 420px)',
                pointerEvents: 'none'
            });
            document.body.appendChild(container);
        }
        const toast = document.createElement('div');
        toast.textContent = message;
        Object.assign(toast.style, {
            padding: '12px 15px',
            borderRadius: '12px',
            background: type === 'error' ? 'rgba(120,20,30,.96)' : type === 'success' ? 'rgba(15,105,72,.96)' : 'rgba(7,25,45,.96)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,.18)',
            boxShadow: '0 12px 30px rgba(0,0,0,.35)',
            font: '600 13px/1.35 system-ui,sans-serif',
            pointerEvents: 'auto'
        });
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3200);
    }

    /* ============================================================
       MOTEUR MATHÉMATIQUE — PARSER SANS EVAL
       ============================================================ */

    function tokenizeExpression(expression) {
        const source = String(expression)
            .replace(/π/g, 'pi')
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/,/g, '.')
            .replace(/√/g, 'sqrt');

        const tokens = [];
        let i = 0;
        while (i < source.length) {
            const ch = source[i];
            if (/\s/.test(ch)) { i++; continue; }

            if (/[0-9.]/.test(ch)) {
                const start = i;
                let dotCount = 0;

                while (i < source.length && /[0-9.eE+-]/.test(source[i])) {
                    if (source[i] === '.') dotCount++;
                    if (dotCount > 1 && /[eE]/.test(source[i]) === false) break;
                    if (
                        (source[i] === '+' || source[i] === '-') &&
                        i > start &&
                        !/[eE]/.test(source[i - 1])
                    ) break;
                    i++;
                }

                const raw = source.slice(start, i);
                const number = Number(raw);

                if (!Number.isFinite(number)) {
                    throw new Error(`Nombre invalide : ${raw}`);
                }

                tokens.push({ type: 'number', value: number });
                continue;
            }

            if (/[A-Za-z]/.test(ch)) {
                const start = i;

                while (i < source.length && /[A-Za-z]/.test(source[i])) {
                    i++;
                }

                tokens.push({
                    type: 'name',
                    value: source.slice(start, i).toLowerCase()
                });

                continue;
            }

            if ('+-*/^%()'.includes(ch)) {
                tokens.push({
                    type: ch,
                    value: ch
                });
                i++;
                continue;
            }

            throw new Error(`Symbole non reconnu : ${ch}`);
        }

        return tokens;
    }

    function evaluateMathExpression(expression) {
        const tokens = tokenizeExpression(expression);

        if (!tokens.length) return 0;

        let pos = 0;

        const functions = {
            sin: x => DEGREE_MODE ? Math.sin(x * Math.PI / 180) : Math.sin(x),
            cos: x => DEGREE_MODE ? Math.cos(x * Math.PI / 180) : Math.cos(x),
            tan: x => DEGREE_MODE ? Math.tan(x * Math.PI / 180) : Math.tan(x),
            sqrt: x => Math.sqrt(x),
            log: x => Math.log10(x),
            ln: x => Math.log(x),
            abs: x => Math.abs(x),
            exp: x => Math.exp(x)
        };

        function peek() {
            return tokens[pos];
        }

        function take(type) {
            if (!tokens[pos] || tokens[pos].type !== type) {
                return false;
            }

            pos++;
            return true;
        }

        function parseExpression() {
            let value = parseTerm();

            while (
                peek() &&
                (peek().type === '+' || peek().type === '-')
            ) {
                const op = tokens[pos++].type;
                const right = parseTerm();

                value = op === '+'
                    ? value + right
                    : value - right;
            }

            return value;
        }

        function beginsPrimary(token) {
            return token && (
                token.type === 'number' ||
                token.type === 'name' ||
                token.type === '('
            );
        }

        function parseTerm() {
            let value = parsePower();

            while (peek()) {
                if (
                    peek().type === '*' ||
                    peek().type === '/'
                ) {
                    const op = tokens[pos++].type;
                    const right = parsePower();

                    if (op === '/' && right === 0) {
                        throw new Error('Division par zéro.');
                    }

                    value = op === '*'
                        ? value * right
                        : value / right;
                } else if (beginsPrimary(peek())) {
                    value *= parsePower();
                } else {
                    break;
                }
            }

            return value;
        }

        function parsePower() {
            let value = parseUnary();

            if (take('^')) {
                value = Math.pow(value, parsePower());
            }

            return value;
        }

        function parseUnary() {
            if (take('+')) return parseUnary();
            if (take('-')) return -parseUnary();
            return parsePrimary();
        }

        function parsePrimary() {
            const token = peek();

            if (!token) {
                throw new Error('Expression incomplète.');
            }

            let value;

            if (token.type === 'number') {
                pos++;
                value = token.value;

            } else if (token.type === 'name') {
                pos++;

                if (take('(')) {
                    const arg = parseExpression();

                    if (!take(')')) {
                        throw new Error('Parenthèse fermante manquante.');
                    }

                    const fn = functions[token.value];

                    if (!fn) {
                        throw new Error(`Fonction inconnue : ${token.value}`);
                    }

                    value = fn(arg);

                } else if (token.value === 'pi') {
                    value = Math.PI;

                } else if (token.value === 'e') {
                    value = Math.E;

                } else {
                    throw new Error(
                        `Constante ou fonction inconnue : ${token.value}`
                    );
                }

            } else if (take('(')) {
                value = parseExpression();

                if (!take(')')) {
                    throw new Error('Parenthèse fermante manquante.');
                }

            } else {
                throw new Error('Expression invalide.');
            }

            while (take('%')) {
                value /= 100;
            }

            if (!Number.isFinite(value)) {
                throw new Error('Résultat non défini.');
            }

            return value;
        }

        const result = parseExpression();

        if (pos < tokens.length) {
            throw new Error('Expression invalide ou incomplète.');
        }

        return result;
    }

    function handleKey(key) {
        if (/^[0-9]$/.test(key)) {
            appendExpression(key);
            return;
        }

        switch (key) {
            case 'clear':
                clearCalculator();
                break;

            case 'delete':
                deleteLast();
                break;

            case 'openParen':
                appendExpression('(');
                break;

            case 'closeParen':
                appendExpression(')');
                break;

            case 'percent':
                appendExpression('%');
                break;

            case 'sin':
                appendFunction('sin');
                break;

            case 'cos':
                appendFunction('cos');
                break;

            case 'tan':
                appendFunction('tan');
                break;

            case 'sqrt':
                appendFunction('sqrt');
                break;

            case 'power':
                appendExpression('^');
                break;

            case 'divide':
                appendExpression('÷');
                break;

            case 'multiply':
                appendExpression('×');
                break;

            case 'subtract':
                appendExpression('−');
                break;

            case 'add':
                appendExpression('+');
                break;

            case 'decimal':
                appendDecimal();
                break;

            case 'log':
                appendFunction('log');
                break;

            case 'ln':
                appendFunction('ln');
                break;

            case 'pi':
                appendConstant('π');
                break;

            case 'e':
                appendConstant('e');
                break;

            case 'equals':
                calculateExpression();
                break;

            default:
                break;
        }
    }

    function appendExpression(value) {
        state.expression += value;
        state.calculationState = 'INPUT';
        state.status = 'INPUT';

        updateDisplay();
        safeText(dom.calculationState, 'INPUT');
        setStatus('INPUT', 'busy');
        saveState();
    }

    function appendConstant(value) {
        const needMultiply = /[0-9πe)]$/.test(state.expression);

        state.expression += (
            needMultiply ? '×' : ''
        ) + value;

        state.calculationState = 'INPUT';

        updateDisplay();
        safeText(dom.calculationState, 'INPUT');
        setStatus('INPUT', 'busy');
        saveState();
    }

    function appendFunction(name) {
        const needMultiply = /[0-9πe)]$/.test(state.expression);

        state.expression += (
            needMultiply ? '×' : ''
        ) + `${name}(`;

        updateDisplay();
        safeText(dom.calculationState, 'INPUT');
        setStatus('INPUT', 'busy');
    }

    function appendDecimal() {
        const expression = state.expression;

        const match = expression.match(
            /(?:^|[+\-×÷^(])([0-9]*\.?[0-9]*)$/
        );

        const current = match ? match[1] : '';

        if (current.includes('.')) return;

        appendExpression(
            current ? '.' : '0.'
        );
    }

    function deleteLast() {
        if (!state.expression) return;

        state.expression = state.expression.slice(0, -1);

        updateDisplay();
        setStatus('INPUT', 'busy');
        safeText(dom.calculationState, 'INPUT');
    }

    function clearCalculator() {
        state.expression = '';
        state.result = '0';
        state.unit = '—';
        state.formula = 'Formula — —';
        state.steps = 'Entrez une valeur ou sélectionnez une fonction scientifique.';
        state.calculationState = 'READY';
        state.lastFunction = null;
        state.lastNumericResult = null;

        updateDisplay();

        setCalculation(
            state.formula,
            state.steps,
            '0',
            '—',
            'READY'
        );

        setStatus('READY', 'ready');
        saveState();
    }

    function calculateExpression() {
        if (!state.expression.trim()) return;

        try {
            const value = evaluateMathExpression(state.expression);
            const result = formatNumber(value);

            state.result = result;
            state.lastNumericResult = value;
            state.unit = '—';
            state.formula = `Expression = ${state.expression}`;
            state.steps =
                `Évaluation directe de l’expression.\n` +
                `Résultat numérique : ${result}`;
            state.calculationState = 'DONE';

            safeText(dom.displayResult, result);
            safeText(dom.displayUnit, '—');
            safeText(dom.formulaDisplay, state.formula);
            safeText(dom.calculationSteps, state.steps);
            safeText(dom.calculationState, 'DONE');

            setStatus('CALCULÉ', 'success');

            addHistory({
                expression: state.expression,
                result,
                unit: '—',
                title: 'Calcul scientifique'
            });

            updateVisualFromCalculation();
            saveState();

        } catch (error) {
            state.result = 'Erreur';
            state.calculationState = 'ERROR';

            setCalculation(
                'Expression invalide',
                error.message,
                'Erreur',
                '—',
                'ERROR'
            );

            setStatus('ERREUR', 'error');
            showToast(error.message, 'error');
        }
    }

    /* ============================================================
       PARSING DES FORMULES CHIMIQUES + MASSE MOLAIRE
       ============================================================ */

    function parseChemicalFormula(formula) {
        const clean = String(formula || '').replace(/\s+/g, '');

        if (!clean) {
            throw new Error('Formule chimique vide.');
        }

        let index = 0;

        function parseNumber() {
            const start = index;

            while (
                index < clean.length &&
                /[0-9]/.test(clean[index])
            ) {
                index++;
            }

            return start === index
                ? 1
                : Number(clean.slice(start, index));
        }

        function parseGroup(endChar = null) {
            const counts = {};

            while (index < clean.length) {
                if (
                    endChar &&
                    clean[index] === endChar
                ) {
                    index++;
                    return counts;
                }

                if (
                    clean[index] === '(' ||
                    clean[index] === '['
                ) {
                    const opener = clean[index++];
                    const closer = opener === '(' ? ')' : ']';
                    const inner = parseGroup(closer);
                    const multiplier = parseNumber();

                    Object.entries(inner).forEach(
                        ([symbol, count]) => {
                            counts[symbol] =
                                (counts[symbol] || 0) +
                                count * multiplier;
                        }
                    );

                    continue;
                }

                if (
                    clean[index] === ')' ||
                    clean[index] === ']'
                ) {
                    throw new Error(
                        `Parenthèse inattendue dans ${formula}.`
                    );
                }

                let symbol = null;

                for (const candidate of ELEMENT_SYMBOLS) {
                    if (
                        clean.startsWith(
                            candidate,
                            index
                        )
                    ) {
                        symbol = candidate;
                        break;
                    }
                }

                if (!symbol) {
                    throw new Error(
                        `Élément inconnu près de « ${clean.slice(index)} ».`
                    );
                }

                index += symbol.length;

                const multiplier = parseNumber();

                counts[symbol] =
                    (counts[symbol] || 0) +
                    multiplier;
            }

            if (endChar) {
                throw new Error(
                    `Symbole ${endChar} manquant dans ${formula}.`
                );
            }

            return counts;
        }

        const counts = parseGroup();

        return counts;
    }

    function calculateMolarMass(formula) {
        const counts = parseChemicalFormula(formula);

        let total = 0;
        const parts = [];

        Object.entries(counts).forEach(
            ([symbol, count]) => {
                const atomicMass =
                    CHEMICAL_ELEMENTS[symbol];

                total += atomicMass * count;

                parts.push(
                    `${symbol}: ${count} × ${atomicMass}`
                );
            }
        );

        return {
            value: total,
            counts,
            parts
        };
    }

    /* ============================================================
       ÉQUILIBRAGE CHIMIQUE — ALGÈBRE LINÉAIRE RATIONNELLE
       ============================================================ */

    function gcd(a, b) {
        a = Math.abs(a);
        b = Math.abs(b);

        while (b) {
            [a, b] = [b, a % b];
        }

        return a || 1;
    }

    function lcm(a, b) {
        return Math.abs(a * b) / gcd(a, b);
    }

    function parseEquationSide(side) {
        return side
            .split('+')
            .map(part => part.trim())
            .filter(Boolean)
            .map(part => {
                const match = part.match(
                    /^(\d+)?\s*([A-Za-z][A-Za-z0-9()\[\]]*)$/
                );

                if (!match) {
                    throw new Error(
                        `Espèce chimique invalide : ${part}`
                    );
                }

                return {
                    formula: match[2],
                    coefficient: match[1]
                        ? Number(match[1])
                        : 1,
                    atoms: parseChemicalFormula(match[2])
                };
            });
    }

    function rref(matrix) {
        const m = matrix.map(
            row => row.map(Number)
        );

        const rows = m.length;
        const cols = rows ? m[0].length : 0;

        let lead = 0;

        for (
            let r = 0;
            r < rows && lead < cols;
            r++
        ) {
            let i = r;

            while (
                i < rows &&
                Math.abs(m[i][lead]) < 1e-12
            ) {
                i++;
            }

            if (i === rows) {
                lead++;
                r--;
                continue;
            }

            [m[i], m[r]] =
                [m[r], m[i]];

            const pivot = m[r][lead];

            for (let j = 0; j < cols; j++) {
                m[r][j] /= pivot;
            }

            for (i = 0; i < rows; i++) {
                if (i === r) continue;

                const factor = m[i][lead];

                if (Math.abs(factor) < 1e-12) {
                    continue;
                }

                for (let j = 0; j < cols; j++) {
                    m[i][j] -= factor * m[r][j];
                }
            }

            lead++;
        }

        return m;
    }

    function nullspaceVector(matrix) {
        const reduced = rref(matrix);
        const rows = reduced.length;
        const cols = reduced[0]?.length || 0;

        const pivotCols = [];

        for (let r = 0; r < rows; r++) {
            const pivot =
                reduced[r].findIndex(
                    v => Math.abs(v) > 1e-10
                );

            if (pivot >= 0) {
                pivotCols.push(pivot);
            }
        }

        const freeCols = [];

        for (let c = 0; c < cols; c++) {
            if (!pivotCols.includes(c)) {
                freeCols.push(c);
            }
        }

        if (!freeCols.length) {
            throw new Error(
                'Cette équation ne possède pas de solution d’équilibrage non triviale.'
            );
        }

        const free = freeCols[0];
        const vector = Array(cols).fill(0);

        vector[free] = 1;

        for (
            let r = pivotCols.length - 1;
            r >= 0;
            r--
        ) {
            const pivot = pivotCols[r];

            let sum = 0;

            for (
                let c = pivot + 1;
                c < cols;
                c++
            ) {
                sum +=
                    reduced[r][c] *
                    vector[c];
            }

            vector[pivot] = -sum;
        }

        return vector;
    }

    function rationalize(
        value,
        maxDenominator = 10000
    ) {
        if (Math.abs(value) < 1e-12) {
            return { n: 0, d: 1 };
        }

        let bestN = Math.round(value);
        let bestD = 1;
        let bestError =
            Math.abs(value - bestN);

        for (
            let d = 1;
            d <= maxDenominator;
            d++
        ) {
            const n = Math.round(value * d);
            const error =
                Math.abs(value - n / d);

            if (error < bestError) {
                bestError = error;
                bestN = n;
                bestD = d;

                if (error < 1e-10) {
                    break;
                }
            }
        }

        const g = gcd(bestN, bestD);

        return {
            n: bestN / g,
            d: bestD / g
        };
    }

    function balanceEquation(equation) {
        const arrowMatch =
            equation.match(
                /(.+?)(?:->|→|=)(.+)/
            );

        if (!arrowMatch) {
            throw new Error(
                'Utilisez une flèche -> entre réactifs et produits.'
            );
        }

        const left =
            parseEquationSide(arrowMatch[1]);

        const right =
            parseEquationSide(arrowMatch[2]);

        const species = [
            ...left,
            ...right
        ];

        const elements = [
            ...new Set(
                species.flatMap(
                    s => Object.keys(s.atoms)
                )
            )
        ];

        const matrix =
            elements.map(element =>
                species.map((s, index) => {
                    const value =
                        s.atoms[element] || 0;

                    return index < left.length
                        ? value
                        : -value;
                })
            );

        const vector =
            nullspaceVector(matrix);

        const rationals =
            vector.map(rationalize);

        let commonDen =
            rationals.reduce(
                (acc, r) =>
                    lcm(acc, r.d),
                1
            );

        let ints =
            rationals.map(
                r =>
                    r.n *
                    (commonDen / r.d)
            );

        const sign =
            ints.find(
                v => Math.abs(v) > 0
            ) < 0
                ? -1
                : 1;

        ints =
            ints.map(
                v => v * sign
            );

        const common =
            ints.reduce(
                (acc, v) =>
                    gcd(
                        acc,
                        Math.round(v)
                    ),
                0
            ) || 1;

        ints =
            ints.map(
                v =>
                    Math.round(
                        v / common
                    )
            );

        if (ints.some(v => v <= 0)) {
            throw new Error(
                'Impossible d’obtenir des coefficients positifs. Vérifiez l’équation.'
            );
        }

        const leftText =
            left.map(
                (s, i) =>
                    `${ints[i] === 1 ? '' : ints[i] + ' '}${s.formula}`
            ).join(' + ');

        const rightText =
            right.map(
                (s, i) =>
                    `${ints[left.length + i] === 1 ? '' : ints[left.length + i] + ' '}${s.formula}`
            ).join(' + ');

        return {
            equation:
                `${leftText} → ${rightText}`,
            coefficients: ints,
            elements,
            reactants: left,
            products: right
        };
    }

    /* ============================================================
       CONVERSIONS
       ============================================================ */

    const UNIT_GROUPS = {
        mol: {
            mol: 1,
            mmol: 1000
        },

        mass: {
            g: 1,
            kg: 0.001
        },

        volume: {
            L: 1,
            mL: 1000,
            m3: 0.001
        },

        pressure: {
            Pa: 1,
            kPa: 0.001,
            bar: 1e-5,
            atm: 1 / 101325
        },

        length: {
            m: 1,
            km: 0.001,
            cm: 100,
            mm: 1000
        },

        time: {
            s: 1,
            min: 1 / 60,
            h: 1 / 3600
        },

        force: {
            N: 1,
            kN: 0.001
        },

        energy: {
            J: 1,
            kJ: 0.001
        },

        power: {
            W: 1,
            kW: 0.001
        },

        frequency: {
            Hz: 1,
            kHz: 0.001
        },

        voltage: {
            V: 1,
            mV: 1000
        },

        current: {
            A: 1,
            mA: 1000
        }
    };

    function findUnitGroup(unit) {
        return Object.entries(
            UNIT_GROUPS
        ).find(
            ([, group]) =>
                Object.prototype.hasOwnProperty.call(
                    group,
                    unit
                )
        );
    }

    function convertUnit(
        value,
        from,
        to
    ) {
        const fromGroup =
            findUnitGroup(from);

        const toGroup =
            findUnitGroup(to);

        if (
            !fromGroup ||
            !toGroup ||
            fromGroup[0] !== toGroup[0]
        ) {
            throw new Error(
                `Conversion incompatible : ${from} → ${to}.`
            );
        }

        const group =
            fromGroup[1];

        const base =
            value / group[from];

        return base * group[to];
    }

    /* ============================================================
       MODAL DYNAMIQUE POUR LES FONCTIONS SCIENTIFIQUES
       ============================================================ */

    function ensureModal() {
        if ($('fobasScientificModal')) {
            return $('fobasScientificModal');
        }

        const modal =
            document.createElement('div');

        modal.id =
            'fobasScientificModal';

        modal.hidden = true;

        Object.assign(
            modal.style,
            {
                position: 'fixed',
                inset: '0',
                zIndex: '100000',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '18px',
                background: 'rgba(2,8,16,.76)',
                backdropFilter: 'blur(8px)'
            }
        );

        modal.innerHTML = `
            <div
                id="fobasScientificModalCard"
                role="dialog"
                aria-modal="true"
                aria-labelledby="fobasScientificModalTitle"
                style="
                    width:min(720px,96vw);
                    max-height:90vh;
                    overflow:auto;
                    background:linear-gradient(145deg,#0b1b2d,#07111f);
                    color:#fff;
                    border:1px solid rgba(255,255,255,.14);
                    border-radius:22px;
                    box-shadow:0 28px 80px rgba(0,0,0,.55);
                    padding:22px;
                "
            >
                <div
                    style="
                        display:flex;
                        align-items:flex-start;
                        justify-content:space-between;
                        gap:14px;
                        margin-bottom:16px;
                    "
                >
                    <div>
                        <div
                            id="fobasScientificModalKicker"
                            style="
                                font:700 11px/1.2 system-ui,sans-serif;
                                letter-spacing:.16em;
                                opacity:.62;
                                text-transform:uppercase;
                            "
                        >
                            FOBAS SCIENTIFIC ENGINE
                        </div>

                        <h2
                            id="fobasScientificModalTitle"
                            style="
                                margin:5px 0 0;
                                font:800 24px/1.15 system-ui,sans-serif;
                            "
                        >
                            Calcul
                        </h2>
                    </div>

                    <button
                        type="button"
                        id="fobasScientificModalClose"
                        aria-label="Fermer"
                        style="
                            width:42px;
                            height:42px;
                            border-radius:12px;
                            border:1px solid rgba(255,255,255,.14);
                            background:#10243a;
                            color:#fff;
                            font-size:22px;
                            cursor:pointer;
                        "
                    >
                        ×
                    </button>
                </div>

                <div
                    id="fobasScientificModalFormula"
                    style="
                        padding:12px 14px;
                        border-radius:14px;
                        background:rgba(255,255,255,.055);
                        border:1px solid rgba(255,255,255,.08);
                        font:700 14px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;
                        margin-bottom:16px;
                    "
                >
                    —
                </div>

                <form
                    id="fobasScientificForm"
                ></form>

                <div
                    id="fobasScientificModalNote"
                    style="
                        margin-top:12px;
                        font:500 12px/1.45 system-ui,sans-serif;
                        opacity:.7;
                    "
                ></div>

                <div
                    style="
                        display:flex;
                        gap:10px;
                        justify-content:flex-end;
                        margin-top:20px;
                        flex-wrap:wrap;
                    "
                >
                    <button
                        type="button"
                        id="fobasScientificCancel"
                        style="
                            padding:12px 17px;
                            border-radius:12px;
                            border:1px solid rgba(255,255,255,.14);
                            background:#10243a;
                            color:#fff;
                            font-weight:800;
                            cursor:pointer;
                        "
                    >
                        Annuler
                    </button>

                    <button
                        type="submit"
                        form="fobasScientificForm"
                        id="fobasScientificCalculate"
                        style="
                            padding:12px 18px;
                            border-radius:12px;
                            border:1px solid rgba(255,211,76,.35);
                            background:#d8a900;
                            color:#07111f;
                            font-weight:900;
                            cursor:pointer;
                        "
                    >
                        CALCULER
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        $('fobasScientificModalClose')
            .addEventListener(
                'click',
                closeModal
            );

        $('fobasScientificCancel')
            .addEventListener(
                'click',
                closeModal
            );

        modal.addEventListener(
            'click',
            event => {
                if (event.target === modal) {
                    closeModal();
                }
            }
        );

        document.addEventListener(
            'keydown',
            event => {
                if (
                    event.key === 'Escape' &&
                    !modal.hidden
                ) {
                    closeModal();
                }
            }
        );

        return modal;
    }

    function openScientificFunction(name) {
        const library =
            state.mode === 'chemistry'
                ? CHEMISTRY_FUNCTIONS
                : PHYSICS_FUNCTIONS;

        const definition =
            library[name];

        if (!definition) return;

        const modal =
            ensureModal();

        const form =
            $('fobasScientificForm');

        form.innerHTML = '';

        safeText(
            $('fobasScientificModalTitle'),
            definition.title
        );

        safeText(
            $('fobasScientificModalFormula'),
            definition.formula
        );

        safeText(
            $('fobasScientificModalKicker'),
            `FOBAS ${
                state.mode === 'chemistry'
                    ? 'CHEMISTRY'
                    : 'PHYSICS'
            } ENGINE`
        );

        safeText(
            $('fobasScientificModalNote'),
            definition.note ||
            'Entrez les données puis lancez le calcul.'
        );

        definition.fields.forEach(
            field => {
                const wrap =
                    document.createElement('label');

                Object.assign(
                    wrap.style,
                    {
                        display: 'grid',
                        gap: '7px',
                        marginBottom: '13px'
                    }
                );

                const label =
                    document.createElement('span');

                label.textContent =
                    `${field.label}${
                        field.unit
                            ? ` (${field.unit})`
                            : ''
                    }`;

                label.style.cssText =
                    'font:700 13px/1.3 system-ui,sans-serif;opacity:.86;';

                wrap.appendChild(label);

                let input;

                if (field.type === 'select') {
                    input =
                        document.createElement('select');

                    field.options.forEach(
                        option => {
                            const opt =
                                document.createElement('option');

                            opt.value =
                                option.value;

                            opt.textContent =
                                option.label;

                            if (
                                option.value ===
                                field.defaultValue
                            ) {
                                opt.selected = true;
                            }

                            input.appendChild(opt);
                        }
                    );

                } else {
                    input =
                        document.createElement('input');

                    input.type =
                        field.type || 'text';

                    input.placeholder =
                        field.placeholder || '';

                    input.value =
                        field.defaultValue ?? '';

                    if (field.step) {
                        input.step =
                            field.step;
                    }

                    if (field.type === 'number') {
                        input.inputMode =
                            'decimal';
                    }
                }

                input.id =
                    `fobasField_${field.id}`;

                input.name =
                    field.id;

                input.required = false;

                Object.assign(
                    input.style,
                    {
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '12px 13px',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,.13)',
                        background: '#07111f',
                        color: '#fff',
                        outline: 'none',
                        font: '600 14px/1.2 system-ui,sans-serif'
                    }
                );

                wrap.appendChild(input);
                form.appendChild(wrap);
            }
        );

        form.dataset.function = name;

        modal.hidden = false;
        modal.style.display = 'flex';

        requestAnimationFrame(
            () => {
                const first =
                    form.querySelector(
                        'input,select'
                    );

                if (first) {
                    first.focus();
                }
            }
        );

        setStatus(
            'SAISIE SCIENTIFIQUE',
            'busy'
        );
    }

    function closeModal() {
        const modal =
            $('fobasScientificModal');

        if (!modal) return;

        modal.hidden = true;
        modal.style.display = 'none';

        setStatus(
            'READY',
            'ready'
        );
    }

    function getModalValues(definition) {
        const values = {};

        definition.fields.forEach(
            field => {
                const input =
                    $(`fobasField_${field.id}`);

                values[field.id] =
                    input
                        ? input.value.trim()
                        : '';
            }
        );

        return values;
    }

    function requireValue(
        values,
        key,
        label
    ) {
        if (values[key] === '') {
            throw new Error(
                `${label} est requis.`
            );
        }

        return parseNumber(
            values[key],
            label
        );
    }

    function runScientificCalculation(name) {
        const library =
            state.mode === 'chemistry'
                ? CHEMISTRY_FUNCTIONS
                : PHYSICS_FUNCTIONS;

        const definition =
            library[name];

        if (!definition) return;

        const values =
            getModalValues(definition);

        try {
            const output =
                state.mode === 'chemistry'
                    ? calculateChemistry(
                        name,
                        values
                    )
                    : calculatePhysics(
                        name,
                        values
                    );

            state.lastFunction =
                name;

            state.result =
                output.result;

            state.unit =
                output.unit || '—';

            state.formula =
                output.formula ||
                definition.formula;

            state.steps =
                output.steps || '';

            state.calculationState =
                'DONE';

            state.expression =
                output.expression ||
                output.result;

            state.lastNumericResult =
                Number.isFinite(
                    output.numericValue
                )
                    ? output.numericValue
                    : null;

            setCalculation(
                state.formula,
                state.steps,
                state.result,
                state.unit,
                'DONE'
            );

            setStatus(
                'CALCULÉ',
                'success'
            );

            updateDisplay();

            addHistory({
                expression:
                    state.expression,
                result:
                    state.result,
                unit:
                    state.unit,
                title:
                    definition.title,
                formula:
                    state.formula
            });

            updateVisualFromCalculation();
            saveState();
            closeModal();

        } catch (error) {
            setStatus(
                'ERREUR',
                'error'
            );

            showToast(
                error.message,
                'error'
            );

            safeText(
                $('fobasScientificModalNote'),
                error.message
            );
        }
    }

    /* ============================================================
       CALCULS CHIMIQUES
       ============================================================ */

    function calculateChemistry(
        name,
        v
    ) {
        switch (name) {
            case 'molarMass': {
                const formula =
                    v.formula;

                const data =
                    calculateMolarMass(
                        formula
                    );

                return {
                    result:
                        formatNumber(
                            data.value
                        ) +
                        ' g·mol⁻¹',

                    unit:
                        'g·mol⁻¹',

                    numericValue:
                        data.value,

                    expression:
                        formula,

                    formula:
                        'M = Σ(nᵢ × Mᵢ)',

                    steps:
                        `${formula}\n` +
                        `${data.parts.join(' + ')}\n` +
                        `M = ${formatNumber(data.value)} g·mol⁻¹`
                };
            }

            case 'moles': {
                const m =
                    requireValue(
                        v,
                        'mass',
                        'Masse m'
                    );

                const M =
                    requireValue(
                        v,
                        'molarMass',
                        'Masse molaire M'
                    );

                if (M <= 0) {
                    throw new Error(
                        'M doit être supérieure à 0.'
                    );
                }

                const n =
                    m / M;

                return {
                    result:
                        formatNumber(n),

                    unit:
                        'mol',

                    numericValue:
                        n,

                    expression:
                        `${m} / ${M}`,

                    formula:
                        'n = m / M',

                    steps:
                        `n = ${m} / ${M}\n` +
                        `n = ${formatNumber(n)} mol`
                };
            }

            case 'mass': {
                const n =
                    requireValue(
                        v,
                        'moles',
                        'Quantité n'
                    );

                const M =
                    requireValue(
                        v,
                        'molarMass',
                        'Masse molaire M'
                    );

                if (M < 0) {
                    throw new Error(
                        'M doit être positive.'
                    );
                }

                const m =
                    n * M;

                return {
                    result:
                        formatNumber(m),

                    unit:
                        'g',

                    numericValue:
                        m,

                    expression:
                        `${n} × ${M}`,

                    formula:
                        'm = n × M',

                    steps:
                        `m = ${n} × ${M}\n` +
                        `m = ${formatNumber(m)} g`
                };
            }

            case 'volume': {
                const n =
                    requireValue(
                        v,
                        'moles',
                        'Quantité n'
                    );

                const vm =
                    requireValue(
                        v,
                        'molarVolume',
                        'Volume molaire Vₘ'
                    );

                const volume =
                    n * vm;

                return {
                    result:
                        formatNumber(volume),

                    unit:
                        'L',

                    numericValue:
                        volume,

                    expression:
                        `${n} × ${vm}`,

                    formula:
                        'V = n × Vₘ',

                    steps:
                        `V = ${n} × ${vm}\n` +
                        `V = ${formatNumber(volume)} L`
                };
            }

            case 'molarity': {
                const n =
                    requireValue(
                        v,
                        'moles',
                        'Quantité n'
                    );

                const volume =
                    requireValue(
                        v,
                        'volume',
                        'Volume V'
                    );

                if (volume <= 0) {
                    throw new Error(
                        'Le volume doit être supérieur à 0.'
                    );
                }

                const c =
                    n / volume;

                return {
                    result:
                        formatNumber(c),

                    unit:
                        'mol·L⁻¹',

                    numericValue:
                        c,

                    expression:
                        `${n} / ${volume}`,

                    formula:
                        'C = n / V',

                    steps:
                        `C = ${n} / ${volume}\n` +
                        `C = ${formatNumber(c)} mol·L⁻¹`
                };
            }

            case 'dilution': {
                const keys = [
                    'c1',
                    'v1',
                    'c2',
                    'v2'
                ];

                const empty =
                    keys.filter(
                        k => v[k] === ''
                    );

                if (empty.length !== 1) {
                    throw new Error(
                        'Laissez exactement une valeur vide.'
                    );
                }

                const c1 =
                    v.c1 === ''
                        ? null
                        : parseNumber(
                            v.c1,
                            'C₁'
                        );

                const v1 =
                    v.v1 === ''
                        ? null
                        : parseNumber(
                            v.v1,
                            'V₁'
                        );

                const c2 =
                    v.c2 === ''
                        ? null
                        : parseNumber(
                            v.c2,
                            'C₂'
                        );

                const v2 =
                    v.v2 === ''
                        ? null
                        : parseNumber(
                            v.v2,
                            'V₂'
                        );

                let result;
                let unit;
                let expression;

                if (c1 === null) {
                    if (
                        v1 === 0 ||
                        v2 === 0
                    ) {
                        throw new Error(
                            'Division par zéro.'
                        );
                    }

                    result =
                        c2 * v2 / v1;

                    unit =
                        'mol·L⁻¹';

                    expression =
                        `${c2}×${v2}/${v1}`;

                } else if (v1 === null) {
                    if (c2 === 0) {
                        throw new Error(
                            'Division par zéro.'
                        );
                    }

                    result =
                        c2 * v2 / c1;

                    unit =
                        'L';

                    expression =
                        `${c2}×${v2}/${c1}`;

                } else if (c2 === null) {
                    if (v2 === 0) {
                        throw new Error(
                            'Division par zéro.'
                        );
                    }

                    result =
                        c1 * v1 / v2;

                    unit =
                        'mol·L⁻¹';

                    expression =
                        `${c1}×${v1}/${v2}`;

                } else {
                    if (c2 === 0) {
                        throw new Error(
                            'Division par zéro.'
                        );
                    }

                    result =
                        c1 * v1 / c2;

                    unit =
                        'L';

                    expression =
                        `${c1}×${v1}/${c2}`;
                }

                return {
                    result:
                        formatNumber(result),

                    unit,

                    numericValue:
                        result,

                    expression,

                    formula:
                        'C₁V₁ = C₂V₂',

                    steps:
                        `Conservation de la quantité de soluté.\n` +
                        `Résultat = ${formatNumber(result)} ${unit}`
                };
            }

            case 'concentration': {
                const m =
                    requireValue(
                        v,
                        'mass',
                        'Masse m'
                    );

                const volume =
                    requireValue(
                        v,
                        'volume',
                        'Volume V'
                    );

                if (volume <= 0) {
                    throw new Error(
                        'Le volume doit être supérieur à 0.'
                    );
                }

                const c =
                    m / volume;

                return {
                    result:
                        formatNumber(c),

                    unit:
                        'g·L⁻¹',

                    numericValue:
                        c,

                    expression:
                        `${m}/${volume}`,

                    formula:
                        'Cₘ = m / V',

                    steps:
                        `Cₘ = ${m} / ${volume}\n` +
                        `Cₘ = ${formatNumber(c)} g·L⁻¹`
                };
            }

            case 'density': {
                const m =
                    requireValue(
                        v,
                        'mass',
                        'Masse m'
                    );

                const volume =
                    requireValue(
                        v,
                        'volume',
                        'Volume V'
                    );

                if (volume <= 0) {
                    throw new Error(
                        'Le volume doit être supérieur à 0.'
                    );
                }

                const rho =
                    m / volume;

                return {
                    result:
                        formatNumber(rho),

                    unit:
                        'g·mL⁻¹',

                    numericValue:
                        rho,

                    expression:
                        `${m}/${volume}`,

                    formula:
                        'ρ = m / V',

                    steps:
                        `ρ = ${m} / ${volume}\n` +
                        `ρ = ${formatNumber(rho)} g·mL⁻¹`
                };
            }

            case 'ph': {
                const c =
                    requireValue(
                        v,
                        'concentration',
                        'Concentration'
                    );

                if (c <= 0) {
                    throw new Error(
                        'La concentration doit être supérieure à 0.'
                    );
                }

                if (v.species === 'OH-') {
                    const poh =
                        -Math.log10(c);

                    const ph =
                        14 - poh;

                    return {
                        result:
                            formatNumber(poh),

                        unit:
                            'pOH',

                        numericValue:
                            poh,

                        expression:
                            `−log10(${c})`,

                        formula:
                            'pOH = −log₁₀[OH⁻]',

                        steps:
                            `[OH⁻] = ${c} mol·L⁻¹\n` +
                            `pOH = ${formatNumber(poh)}\n` +
                            `pH = 14 − pOH = ${formatNumber(ph)}`
                    };
                }

                const ph =
                    -Math.log10(c);

                const poh =
                    14 - ph;

                return {
                    result:
                        formatNumber(ph),

                    unit:
                        'pH',

                    numericValue:
                        ph,

                    expression:
                        `−log10(${c})`,

                    formula:
                        'pH = −log₁₀[H⁺]',

                    steps:
                        `[H⁺] = ${c} mol·L⁻¹\n` +
                        `pH = ${formatNumber(ph)}\n` +
                        `pOH = 14 − pH = ${formatNumber(poh)}`
                };
            }

            case 'stoichiometry': {
                const nu1 =
                    requireValue(
                        v,
                        'coefficient1',
                        'ν₁'
                    );

                const n1 =
                    requireValue(
                        v,
                        'amount1',
                        'n₁'
                    );

                const nu2 =
                    requireValue(
                        v,
                        'coefficient2',
                        'ν₂'
                    );

                if (nu1 === 0) {
                    throw new Error(
                        'ν₁ ne peut pas être zéro.'
                    );
                }

                const n2 =
                    n1 * nu2 / nu1;

                return {
                    result:
                        formatNumber(n2),

                    unit:
                        'mol',

                    numericValue:
                        n2,

                    expression:
                        `${n1}×${nu2}/${nu1}`,

                    formula:
                        'n₂ = n₁ × ν₂ / ν₁',

                    steps:
                        `n₂ = ${n1} × ${nu2} / ${nu1}\n` +
                        `n₂ = ${formatNumber(n2)} mol`
                };
            }

            case 'yield': {
                const actual =
                    requireValue(
                        v,
                        'actual',
                        'Quantité réelle'
                    );

                const theoretical =
                    requireValue(
                        v,
                        'theoretical',
                        'Quantité théorique'
                    );

                if (theoretical <= 0) {
                    throw new Error(
                        'La quantité théorique doit être supérieure à 0.'
                    );
                }

                const eta =
                    actual /
                    theoretical *
                    100;

                return {
                    result:
                        formatNumber(eta),

                    unit:
                        '%',

                    numericValue:
                        eta,

                    expression:
                        `${actual}/${theoretical}×100`,

                    formula:
                        'η = (réel / théorique) × 100',

                    steps:
                        `η = (${actual} / ${theoretical}) × 100\n` +
                        `η = ${formatNumber(eta)} %`
                };
            }

            case 'idealGas': {
                const R =
                    8.314462618;

                const unknown =
                    v.unknown;

                const p =
                    v.p === ''
                        ? null
                        : parseNumber(
                            v.p,
                            'P'
                        );

                const volume =
                    v.v === ''
                        ? null
                        : parseNumber(
                            v.v,
                            'V'
                        );

                const n =
                    v.n === ''
                        ? null
                        : parseNumber(
                            v.n,
                            'n'
                        );

                const t =
                    v.t === ''
                        ? null
                        : parseNumber(
                            v.t,
                            'T'
                        );

                let result;
                let unit;
                let expression;

                if (unknown === 'p') {
                    if (
                        volume <= 0 ||
                        n === null ||
                        t <= 0
                    ) {
                        throw new Error(
                            'Données invalides pour P.'
                        );
                    }

                    result =
                        n * R * t / volume;

                    unit =
                        'Pa';

                    expression =
                        `${n}×${R}×${t}/${volume}`;

                } else if (unknown === 'v') {
                    if (
                        p <= 0 ||
                        n === null ||
                        t <= 0
                    ) {
                        throw new Error(
                            'Données invalides pour V.'
                        );
                    }

                    result =
                        n * R * t / p;

                    unit =
                        'm³';

                    expression =
                        `${n}×${R}×${t}/${p}`;

                } else if (unknown === 'n') {
                    if (
                        p <= 0 ||
                        volume <= 0 ||
                        t <= 0
                    ) {
                        throw new Error(
                            'Données invalides pour n.'
                        );
                    }

                    result =
                        p * volume /
                        (R * t);

                    unit =
                        'mol';

                    expression =
                        `${p}×${volume}/(${R}×${t})`;

                } else {
                    if (
                        p <= 0 ||
                        volume <= 0 ||
                        n === null
                    ) {
                        throw new Error(
                            'Données invalides pour T.'
                        );
                    }

                    result =
                        p * volume /
                        (n * R);

                    unit =
                        'K';

                    expression =
                        `${p}×${volume}/(${n}×${R})`;
                }

                return {
                    result:
                        formatNumber(result),

                    unit,

                    numericValue:
                        result,

                    expression,

                    formula:
                        'PV = nRT',

                    steps:
                        `R = ${R} J·mol⁻¹·K⁻¹\n` +
                        `Grandeur calculée : ${unknown.toUpperCase()}\n` +
                        `Résultat = ${formatNumber(result)} ${unit}`
                };
            }

            case 'chemicalEquation': {
                const data =
                    balanceEquation(
                        v.equation
                    );

                return {
                    result:
                        data.equation,

                    unit:
                        '—',

                    numericValue:
                        null,

                    expression:
                        v.equation,

                    formula:
                        'Équilibrage atomique',

                    steps:
                        `Équation proposée : ${v.equation}\n` +
                        `Équation équilibrée : ${data.equation}\n` +
                        `Atomes vérifiés : ${data.elements.join(', ')}`
                };
            }

            case 'chemistryUnits': {
                const value =
                    requireValue(
                        v,
                        'value',
                        'Valeur'
                    );

                const result =
                    convertUnit(
                        value,
                        v.from,
                        v.to
                    );

                return {
                    result:
                        formatNumber(result),

                    unit:
                        v.to,

                    numericValue:
                        result,

                    expression:
                        `${value} ${v.from}`,

                    formula:
                        'Conversion d’unités',

                    steps:
                        `${value} ${v.from} → ${formatNumber(result)} ${v.to}`
                };
            }

            default:
                throw new Error(
                    'Fonction chimique non implémentée.'
                );
        }
    }

    /* ============================================================
       CALCULS PHYSIQUES
       ============================================================ */

    function calculatePhysics(
        name,
        v
    ) {
        switch (name) {
            case 'speed': {
                const d =
                    requireValue(
                        v,
                        'distance',
                        'Distance d'
                    );

                const t =
                    requireValue(
                        v,
                        'time',
                        'Temps t'
                    );

                if (t === 0) {
                    throw new Error(
                        'Le temps ne peut pas être zéro.'
                    );
                }

                const r =
                    d / t;

                return {
                    result:
                        formatNumber(r),

                    unit:
                        'm·s⁻¹',

                    numericValue:
                        r,

                    expression:
                        `${d}/${t}`,

                    formula:
                        'v = d / t',

                    steps:
                        `v = ${d} / ${t}\n` +
                        `v = ${formatNumber(r)} m·s⁻¹`
                };
            }

            case 'acceleration': {
                const dv =
                    requireValue(
                        v,
                        'dv',
                        'Δv'
                    );

                const dt =
                    requireValue(
                        v,
                        'dt',
                        'Δt'
                    );

                if (dt === 0) {
                    throw new Error(
                        'Δt ne peut pas être zéro.'
                    );
                }

                const r =
                    dv / dt;

                return {
                    result:
                        formatNumber(r),

                    unit:
                        'm·s⁻²',

                    numericValue:
                        r,

                    expression:
                        `${dv}/${dt}`,

                    formula:
                        'a = Δv / Δt',

                    steps:
                        `a = ${dv} / ${dt}\n` +
                        `a = ${formatNumber(r)} m·s⁻²`
                };
            }

            case 'force': {
                const m =
                    requireValue(
                        v,
                        'mass',
                        'Masse'
                    );

                const a =
                    requireValue(
                        v,
                        'acceleration',
                        'Accélération'
                    );

                const r =
                    m * a;

                return {
                    result:
                        formatNumber(r),

                    unit:
                        'N',

                    numericValue:
                        r,

                    expression:
                        `${m}×${a}`,

                    formula:
                        'F = m × a',

                    steps:
                        `F = ${m} × ${a}\n` +
                        `F = ${formatNumber(r)} N`
                };
            }

            case 'work': {
                const F =
                    requireValue(
                        v,
                        'force',
                        'Force'
                    );

                const d =
                    requireValue(
                        v,
                        'distance',
                        'Distance'
                    );

                const angle =
                    requireValue(
                        v,
                        'angle',
                        'Angle'
                    );

                const r =
                    F *
                    d *
                    Math.cos(
                        angle *
                        Math.PI /
                        180
                    );

                return {
                    result:
                        formatNumber(r),

                    unit:
                        'J',

                    numericValue:
                        r,

                    expression:
                        `${F}×${d}×cos(${angle})`,

                    formula:
                        'W = F × d × cos(θ)',

                    steps:
                        `W = ${F} × ${d} × cos(${angle}°)\n` +
                        `W = ${formatNumber(r)} J`
                };
            }

            case 'energy': {
                const m =
                    requireValue(
                        v,
                        'mass',
                        'Masse'
                    );

                const speed =
                    requireValue(
                        v,
                        'speed',
                        'Vitesse'
                    );

                const r =
                    0.5 *
                    m *
                    speed ** 2;

                return {
                    result:
                        formatNumber(r),

                    unit:
                        'J',

                    numericValue:
                        r,

                    expression:
                        `0.5×${m}×${speed}²`,

                    formula:
                        'E = ½mv²',

                    steps:
                        `E = ½ × ${m} × ${speed}²\n` +
                        `E = ${formatNumber(r)} J`
                };
            }

            case 'power': {
                const work =
                    requireValue(
                        v,
                        'work',
                        'Travail'
                    );

                const t =
                    requireValue(
                        v,
                        'time',
                        'Temps'
                    );

                if (t === 0) {
                    throw new Error(
                        'Le temps ne peut pas être zéro.'
                    );
                }

                const r =
                    work / t;

                return {
                    result:
                        formatNumber(r),

                    unit:
                        'W',

                    numericValue:
                        r,

                    expression:
                        `${work}/${t}`,

                    formula:
                        'P = W / t',

                    steps:
                        `P = ${work} / ${t}\n` +
                        `P = ${formatNumber(r)} W`
                };
            }

            case 'pressure': {
                const F =
                    requireValue(
                        v,
                        'force',
                        'Force'
                    );

                const A =
                    requireValue(
                        v,
                        'area',
                        'Surface'
                    );

                if (A <= 0) {
                    throw new Error(
                        'La surface doit être supérieure à 0.'
                    );
                }

                const r =
                    F / A;

                return {
                    result:
                        formatNumber(r),

                    unit:
                        'Pa',

                    numericValue:
                        r,

                    expression:
                        `${F}/${A}`,

                    formula:
                        'P = F / A',

                    steps:
                        `P = ${F} / ${A}\n` +
                        `P = ${formatNumber(r)} Pa`
                };
            }

            case 'physicalDensity': {
                const m =
                    requireValue(
                        v,
                        'mass',
                        'Masse'
                    );

                const V =
                    requireValue(
                        v,
                        'volume',
                        'Volume'
                    );

                if (V <= 0) {
                    throw new Error(
                        'Le volume doit être supérieur à 0.'
                    );
                }

                const r =
                    m / V;

                return {
                    result:
                        formatNumber(r),

                    unit:
                        'kg·m⁻³',

                    numericValue:
                        r,

                    expression:
                        `${m}/${V}`,

                    formula:
                        'ρ = m / V',

                    steps:
                        `ρ = ${m} / ${V}\n` +
                        `ρ = ${formatNumber(r)} kg·m⁻³`
                };
            }

            case 'ohmLaw': {
                const unknown =
                    v.unknown;

                const V =
                    requireValue(
                        v,
                        'v',
                        'Tension V'
                    );

                const I =
                    requireValue(
                        v,
                        'i',
                        'Courant I'
                    );

                const R =
                    requireValue(
                        v,
                        'r',
                        'Résistance R'
                    );

                let r;
                let unit;
                let expression;

                if (unknown === 'v') {
                    r =
                        I * R;

                    unit =
                        'V';

                    expression =
                        `${I}×${R}`;

                } else if (unknown === 'i') {
                    if (R === 0) {
                        throw new Error(
                            'R ne peut pas être zéro.'
                        );
                    }

                    r =
                        V / R;

                    unit =
                        'A';

                    expression =
                        `${V}/${R}`;

                } else {
                    if (I === 0) {
                        throw new Error(
                            'I ne peut pas être zéro.'
                        );
                    }

                    r =
                        V / I;

                    unit =
                        'Ω';

                    expression =
                        `${V}/${I}`;
                }

                return {
                    result:
                        formatNumber(r),

                    unit,

                    numericValue:
                        r,

                    expression,

                    formula:
                        'V = I × R',

                    steps:
                        `Grandeur recherchée : ${unknown.toUpperCase()}\n` +
                        `Résultat = ${formatNumber(r)} ${unit}`
                };
            }

            case 'electricPower': {
                const V =
                    requireValue(
                        v,
                        'v',
                        'Tension V'
                    );

                const I =
                    requireValue(
                        v,
                        'i',
                        'Courant I'
                    );

                const r =
                    V * I;

                return {
                    result:
                        formatNumber(r),

                    unit:
                        'W',

                    numericValue:
                        r,

                    expression:
                        `${V}×${I}`,

                    formula:
                        'P = V × I',

                    steps:
                        `P = ${V} × ${I}\n` +
                        `P = ${formatNumber(r)} W`
                };
            }

            case 'resistance': {
                const V =
                    requireValue(
                        v,
                        'v',
                        'Tension V'
                    );

                const I =
                    requireValue(
                        v,
                        'i',
                        'Courant I'
                    );

                if (I === 0) {
                    throw new Error(
                        'I ne peut pas être zéro.'
                    );
                }

                const r =
                    V / I;

                return {
                    result:
                        formatNumber(r),

                    unit:
                        'Ω',

                    numericValue:
                        r,

                    expression:
                        `${V}/${I}`,

                    formula:
                        'R = V / I',

                    steps:
                        `R = ${V} / ${I}\n` +
                        `R = ${formatNumber(r)} Ω`
                };
            }

            case 'electricCharge': {
                const I =
                    requireValue(
                        v,
                        'i',
                        'Courant I'
                    );

                const t =
                    requireValue(
                        v,
                        't',
                        'Temps'
                    );

                const r =
                    I * t;

                return {
                    result:
                        formatNumber(r),

                    unit:
                        'C',

                    numericValue:
                        r,

                    expression:
                        `${I}×${t}`,

                    formula:
                        'Q = I × t',

                    steps:
                        `Q = ${I} × ${t}\n` +
                        `Q = ${formatNumber(r)} C`
                };
            }

            case 'frequency': {
                const T =
                    requireValue(
                        v,
                        'period',
                        'Période T'
                    );

                if (T <= 0) {
                    throw new Error(
                        'La période doit être supérieure à 0.'
                    );
                }

                const r =
                    1 / T;

                return {
                    result:
                        formatNumber(r),

                    unit:
                        'Hz',

                    numericValue:
                        r,

                    expression:
                        `1/${T}`,

                    formula:
                        'f = 1 / T',

                    steps:
                        `f = 1 / ${T}\n` +
                        `f = ${formatNumber(r)} Hz`
                };
            }

            case 'wave': {
                const speed =
                    requireValue(
                        v,
                        'speed',
                        'Vitesse v'
                    );

                const frequency =
                    requireValue(
                        v,
                        'frequency',
                        'Fréquence f'
                    );

                if (frequency === 0) {
                    throw new Error(
                        'La fréquence ne peut pas être zéro.'
                    );
                }

                const r =
                    speed / frequency;

                return {
                    result:
                        formatNumber(r),

                    unit:
                        'm',

                    numericValue:
                        r,

                    expression:
                        `${speed}/${frequency}`,

                    formula:
                        'λ = v / f',

                    steps:
                        `λ = ${speed} / ${frequency}\n` +
                        `λ = ${formatNumber(r)} m`
                };
            }

            case 'temperature': {
                const value =
                    requireValue(
                        v,
                        'value',
                        'Température'
                    );

                let celsius;

                if (v.from === 'C') {
                    celsius =
                        value;

                } else if (v.from === 'K') {
                    celsius =
                        value - 273.15;

                } else {
                    celsius =
                        (value - 32) *
                        5 /
                        9;
                }

                let result;

                if (v.to === 'C') {
                    result =
                        celsius;

                } else if (v.to === 'K') {
                    result =
                        celsius + 273.15;

                } else {
                    result =
                        celsius *
                        9 /
                        5 +
                        32;
                }

                return {
                    result:
                        formatNumber(result),

                    unit:
                        v.to === 'C'
                            ? '°C'
                            : v.to === 'K'
                                ? 'K'
                                : '°F',

                    numericValue:
                        result,

                    expression:
                        `${value} ${v.from}`,

                    formula:
                        'Conversion de température',

                    steps:
                        `${value} ${v.from} → ${formatNumber(result)} ${v.to}`
                };
            }

            case 'physicsUnits': {
                const value =
                    requireValue(
                        v,
                        'value',
                        'Valeur'
                    );

                const result =
                    convertUnit(
                        value,
                        v.from,
                        v.to
                    );

                return {
                    result:
                        formatNumber(result),

                    unit:
                        v.to,

                    numericValue:
                        result,

                    expression:
                        `${value} ${v.from}`,

                    formula:
                        'Conversion d’unités SI',

                    steps:
                        `${value} ${v.from} → ${formatNumber(result)} ${v.to}`
                };
            }

            default:
                throw new Error(
                    'Fonction physique non implémentée.'
                );
        }
    }

    /* ============================================================
       MODE CHIMIE / PHYSIQUE
       ============================================================ */

    function setMode(mode) {
        state.mode =
            mode === 'physics'
                ? 'physics'
                : 'chemistry';

        const chemistry =
            state.mode === 'chemistry';

        if (dom.chemistryModeBtn) {
            dom.chemistryModeBtn.classList.toggle(
                'active',
                chemistry
            );

            dom.chemistryModeBtn.setAttribute(
                'aria-pressed',
                String(chemistry)
            );
        }

        if (dom.physicsModeBtn) {
            dom.physicsModeBtn.classList.toggle(
                'active',
                !chemistry
            );

            dom.physicsModeBtn.setAttribute(
                'aria-pressed',
                String(!chemistry)
            );
        }

        if (dom.chemistryPanel) {
            dom.chemistryPanel.hidden =
                !chemistry;

            dom.chemistryPanel.classList.toggle(
                'active',
                chemistry
            );
        }

        if (dom.physicsPanel) {
            dom.physicsPanel.hidden =
                chemistry;

            dom.physicsPanel.classList.toggle(
                'active',
                !chemistry
            );
        }

        safeText(
            dom.visualModeBadge,
            chemistry
                ? 'CHIMIE'
                : 'PHYSIQUE'
        );

        safeText(
            dom.visualInfoMode,
            chemistry
                ? 'CHIMIE'
                : 'PHYSIQUE'
        );

        safeText(
            dom.displayMode,
            chemistry
                ? 'CHEMISTRY • SCIENTIFIC'
                : 'PHYSICS • SCIENTIFIC'
        );

        update3DMode();

        setStatus(
            chemistry
                ? 'CHIMIE ACTIVE'
                : 'PHYSIQUE ACTIVE',
            'ready'
        );

        saveState();
    }

    /* ============================================================
       VISUALISATION 3D CSS — SANS THREE.JS
       ============================================================ */

    function update3DMode() {
        if (
            !dom.chemistryMoleculeVisual ||
            !dom.physicsVectorVisual
        ) {
            return;
        }

        const chemistry =
            state.mode === 'chemistry';

        dom.chemistryMoleculeVisual.hidden =
            !chemistry;

        dom.physicsVectorVisual.hidden =
            chemistry;

        if (dom.threeDScene) {
            dom.threeDScene.dataset.mode =
                state.mode;

            dom.threeDScene.style.setProperty(
                '--fobas-rotate-x',
                `${state.visual.rotateX}deg`
            );

            dom.threeDScene.style.setProperty(
                '--fobas-rotate-y',
                `${state.visual.rotateY}deg`
            );

            dom.threeDScene.style.setProperty(
                '--fobas-scale',
                state.visual.scale
            );

            dom.threeDScene.style.setProperty(
                '--fobas-tx',
                `${state.visual.translateX}px`
            );

            dom.threeDScene.style.setProperty(
                '--fobas-ty',
                `${state.visual.translateY}px`
            );
        }

        updateVisualObject();
    }

    function updateVisualObject() {
        const obj =
            dom.calculatorVisualObject;

        if (!obj) return;

        obj.style.transform =
            `translate3d(` +
            `${state.visual.translateX}px,` +
            `${state.visual.translateY}px,0) ` +
            `scale(${state.visual.scale}) ` +
            `rotateX(${state.visual.rotateX}deg) ` +
            `rotateY(${state.visual.rotateY}deg)`;

        obj.style.transformStyle =
            'preserve-3d';

        obj.style.willChange =
            'transform';

        obj.style.filter =
            `drop-shadow(0 ${
                18 +
                state.visual.scale * 8
            }px ${
                24 +
                state.visual.scale * 12
            }px rgba(0,0,0,.42))`;

        const keyboard =
            obj.querySelector(
                '.visual-keyboard'
            );

        if (keyboard) {
            keyboard.style.transform =
                `translateZ(18px) ` +
                `rotateX(${
                    Math.max(
                        -8,
                        state.visual.rotateX / 2
                    )
                }deg)`;
        }
    }

    function updateVisualFromCalculation() {
        const value =
            state.lastNumericResult;

        if (
            dom.chemistryMoleculeVisual &&
            state.mode === 'chemistry'
        ) {
            const molecule =
                dom.chemistryMoleculeVisual;

            molecule.dataset.active =
                state.lastFunction ||
                'calculation';

            const atoms =
                molecule.querySelectorAll(
                    '.atom'
                );

            atoms.forEach(
                (atom, index) => {
                    const phase =
                        Number.isFinite(value)
                            ? Math.min(
                                1,
                                Math.abs(value) / 100
                            )
                            : .5;

                    atom.style.transform =
                        `translateZ(${
                            20 +
                            phase * 30 +
                            index * 6
                        }px) ` +
                        `scale(${
                            0.92 +
                            phase * .18
                        })`;
                }
            );

            const bonds =
                molecule.querySelectorAll(
                    '.bond'
                );

            bonds.forEach(
                bond => {
                    bond.style.transformOrigin =
                        'left center';
                }
            );
        }

        if (
            dom.physicsVectorVisual &&
            state.mode === 'physics'
        ) {
            const arrow =
                dom.physicsVectorVisual.querySelector(
                    '.vector-arrow'
                );

            if (arrow) {
                const magnitude =
                    Number.isFinite(value)
                        ? clamp(
                            Math.log10(
                                Math.abs(value) + 1
                            ) / 4,
                            .15,
                            1
                        )
                        : .35;

                arrow.style.transform =
                    `translateZ(35px) ` +
                    `scaleX(${
                        .35 +
                        magnitude * 1.5
                    }) ` +
                    `rotate(-12deg)`;
            }
        }
    }

    function setVisualScale(delta) {
        state.visual.scale =
            clamp(
                Number(state.visual.scale) +
                delta,
                .55,
                1.8
            );

        update3DMode();
        saveState();
    }

    function resetVisual() {
        state.visual = {
            scale: 1,
            rotateX: -12,
            rotateY: 18,
            translateX: 0,
            translateY: 0
        };

        update3DMode();
        saveState();

        showToast(
            'Vue 3D réinitialisée.',
            'success'
        );
    }

    function bindVisualInteraction() {
        const viewport =
            dom.scientific3DViewport;

        if (!viewport) return;

        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        let moved = false;
        let pinchStartDistance = null;
        let pinchStartScale = 1;

        viewport.addEventListener(
            'pointerdown',
            event => {
                if (
                    event.pointerType === 'mouse' &&
                    event.button !== 0
                ) {
                    return;
                }

                dragging = true;
                moved = false;

                lastX =
                    event.clientX;

                lastY =
                    event.clientY;

                try {
                    viewport.setPointerCapture(
                        event.pointerId
                    );
                } catch (_) {}
            }
        );

        viewport.addEventListener(
            'pointermove',
            event => {
                if (!dragging) return;

                const dx =
                    event.clientX -
                    lastX;

                const dy =
                    event.clientY -
                    lastY;

                if (
                    Math.abs(dx) +
                    Math.abs(dy) >
                    2
                ) {
                    moved = true;
                }

                lastX =
                    event.clientX;

                lastY =
                    event.clientY;

                state.visual.rotateY +=
                    dx * .45;

                state.visual.rotateX =
                    clamp(
                        state.visual.rotateX -
                        dy * .35,
                        -55,
                        55
                    );

                update3DMode();
            }
        );

        viewport.addEventListener(
            'pointerup',
            event => {
                dragging = false;

                try {
                    viewport.releasePointerCapture(
                        event.pointerId
                    );
                } catch (_) {}

                saveState();
            }
        );

        viewport.addEventListener(
            'pointercancel',
            () => {
                dragging = false;
            }
        );

        viewport.addEventListener(
            'wheel',
            event => {
                event.preventDefault();

                setVisualScale(
                    event.deltaY > 0
                        ? -.08
                        : .08
                );
            },
            {
                passive: false
            }
        );

        viewport.addEventListener(
            'touchstart',
            event => {
                if (
                    event.touches.length === 2
                ) {
                    pinchStartDistance =
                        Math.hypot(
                            event.touches[0].clientX -
                            event.touches[1].clientX,

                            event.touches[0].clientY -
                            event.touches[1].clientY
                        );

                    pinchStartScale =
                        state.visual.scale;
                }
            },
            {
                passive: true
            }
        );

        viewport.addEventListener(
            'touchmove',
            event => {
                if (
                    event.touches.length !== 2 ||
                    !pinchStartDistance
                ) {
                    return;
                }

                const distance =
                    Math.hypot(
                        event.touches[0].clientX -
                        event.touches[1].clientX,

                        event.touches[0].clientY -
                        event.touches[1].clientY
                    );

                state.visual.scale =
                    clamp(
                        pinchStartScale *
                        (
                            distance /
                            pinchStartDistance
                        ),
                        .55,
                        1.8
                    );

                update3DMode();
            },
            {
                passive: true
            }
        );

        viewport.addEventListener(
            'touchend',
            () => {
                pinchStartDistance =
                    null;

                saveState();
            },
            {
                passive: true
            }
        );

        if (dom.visualHint) {
            setTimeout(
                () => {
                    if (!moved) {
                        dom.visualHint.style.opacity =
                            '0';
                    }
                },
                5000
            );
        }
    }

    /* ============================================================
       PANNEAUX FORMULES / UNITÉS / HISTORIQUE
       ============================================================ */

    function openUtilityModal(
        title,
        contentHTML
    ) {
        const modal =
            ensureModal();

        const form =
            $('fobasScientificForm');

        form.dataset.function =
            '';

        form.innerHTML =
            contentHTML;

        safeText(
            $('fobasScientificModalTitle'),
            title
        );

        safeText(
            $('fobasScientificModalFormula'),
            'FOBAS SCIENTIFIC REFERENCE'
        );

        safeText(
            $('fobasScientificModalKicker'),
            'FOBAS UTILITY ENGINE'
        );

        safeText(
            $('fobasScientificModalNote'),
            ''
        );

        const calculateButton =
            $('fobasScientificCalculate');

        if (calculateButton) {
            calculateButton.style.display =
                'none';
        }

        modal.hidden = false;
        modal.style.display = 'flex';

        if (calculateButton) {
            setTimeout(
                () => {
                    calculateButton.style.display =
                        '';
                },
                0
            );
        }
    }

    function openFormulaUtility() {
        const library =
            state.mode === 'chemistry'
                ? CHEMISTRY_FUNCTIONS
                : PHYSICS_FUNCTIONS;

        const rows =
            Object.values(library)
                .map(
                    item =>
                        `<div style="padding:11px 12px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.035);margin-bottom:8px;"><strong style="display:block;margin-bottom:4px;">${escapeHTML(item.title)}</strong><span style="font:600 12px/1.45 ui-monospace,SFMono-Regular,monospace;opacity:.75;">${escapeHTML(item.formula)}</span></div>`
                )
                .join('');

        openUtilityModal(
            `Formules — ${
                state.mode === 'chemistry'
                    ? 'Chimie'
                    : 'Physique'
            }`,
            `<div>${rows}</div>`
        );
    }

    function openUnitsUtility() {
        const groups =
            Object.entries(UNIT_GROUPS)
                .map(
                    ([name, units]) =>
                        `<div style="padding:11px 12px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.035);margin-bottom:8px;"><strong style="display:block;text-transform:uppercase;margin-bottom:5px;">${escapeHTML(name)}</strong><span style="opacity:.72;">${Object.keys(units).join(' · ')}</span></div>`
                )
                .join('');

        openUtilityModal(
            'Unités disponibles',
            `<div>${groups}</div>`
        );
    }

    function openHistoryUtility() {
        const rows =
            state.history.length
                ? state.history
                    .map(
                        item =>
                            `<div style="padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.035);margin-bottom:8px;"><strong>${escapeHTML(item.title || 'Calcul')}</strong><div style="font:600 12px/1.4 ui-monospace,monospace;opacity:.72;margin-top:4px;">${escapeHTML(item.expression || '')}</div><div style="font:800 15px/1.4 system-ui,sans-serif;margin-top:5px;">${escapeHTML(item.result || '')} ${escapeHTML(item.unit || '')}</div></div>`
                    )
                    .join('')
                : '<div style="padding:22px;text-align:center;opacity:.7;">Aucun calcul enregistré.</div>';

        openUtilityModal(
            'Historique des calculs',
            `<div>${rows}</div>`
        );
    }

    function escapeHTML(value) {
        return String(value).replace(
            /[&<>'"]/g,
            char =>
                ({
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    "'": '&#39;',
                    '"': '&quot;'
                })[char]
        );
    }

    /* ============================================================
       ÉVÉNEMENTS
       ============================================================ */

    function bindEvents() {
        if (dom.chemistryModeBtn) {
            dom.chemistryModeBtn.addEventListener(
                'click',
                () => setMode('chemistry')
            );
        }

        if (dom.physicsModeBtn) {
            dom.physicsModeBtn.addEventListener(
                'click',
                () => setMode('physics')
            );
        }

        $$('.calculator-key[data-key]')
            .forEach(
                button => {
                    button.addEventListener(
                        'click',
                        () =>
                            handleKey(
                                button.dataset.key
                            )
                    );
                }
            );

        $$('.function-btn[data-function]')
            .forEach(
                button => {
                    button.addEventListener(
                        'click',
                        () =>
                            openScientificFunction(
                                button.dataset.function
                            )
                    );
                }
            );

        if (dom.formulaBtn) {
            dom.formulaBtn.addEventListener(
                'click',
                openFormulaUtility
            );
        }

        if (dom.unitsBtn) {
            dom.unitsBtn.addEventListener(
                'click',
                openUnitsUtility
            );
        }

        if (dom.historyBtn) {
            dom.historyBtn.addEventListener(
                'click',
                openHistoryUtility
            );
        }

        if (dom.clearHistoryBtn) {
            dom.clearHistoryBtn.addEventListener(
                'click',
                clearHistory
            );
        }

        if (dom.zoomOutBtn) {
            dom.zoomOutBtn.addEventListener(
                'click',
                () =>
                    setVisualScale(-.1)
            );
        }

        if (dom.zoomInBtn) {
            dom.zoomInBtn.addEventListener(
                'click',
                () =>
                    setVisualScale(.1)
            );
        }

        if (dom.resetViewBtn) {
            dom.resetViewBtn.addEventListener(
                'click',
                resetVisual
            );
        }

        document.addEventListener(
            'submit',
            event => {
                if (
                    event.target.id !==
                    'fobasScientificForm'
                ) {
                    return;
                }

                event.preventDefault();

                const name =
                    event.target.dataset.function;

                if (name) {
                    runScientificCalculation(
                        name
                    );
                }
            }
        );

        document.addEventListener(
            'keydown',
            event => {
                if (
                    event.ctrlKey ||
                    event.metaKey ||
                    event.altKey
                ) {
                    return;
                }

                if (
                    document.activeElement &&
                    /^(INPUT|TEXTAREA|SELECT)$/.test(
                        document.activeElement.tagName
                    )
                ) {
                    return;
                }

                const key =
                    event.key;

                if (
                    /^[0-9]$/.test(key)
                ) {
                    handleKey(key);
                    event.preventDefault();
                    return;
                }

                const map = {
                    '+': 'add',
                    '-': 'subtract',
                    '*': 'multiply',
                    '/': 'divide',
                    '.': 'decimal',
                    '(': 'openParen',
                    ')': 'closeParen',
                    '%': 'percent',
                    Enter: 'equals',
                    '=': 'equals',
                    Backspace: 'delete',
                    Escape: 'clear'
                };

                if (map[key]) {
                    handleKey(
                        map[key]
                    );

                    event.preventDefault();
                }
            }
        );
    }

    function ensure3DVisualStyles() {
        if (
            $('fobasCalculator3DInjectedStyle')
        ) {
            return;
        }

        const style =
            document.createElement('style');

        style.id =
            'fobasCalculator3DInjectedStyle';

        style.textContent = `
            #scientific3DViewport {
                perspective: 1100px;
                perspective-origin: 50% 45%;
                overflow: hidden;
            }

            #threeDScene {
                position: relative;
                width: 100%;
                height: 100%;
                transform-style: preserve-3d;
            }

            #calculatorVisualObject {
                transform-style: preserve-3d !important;
                transform-origin: 50% 50%;
                position: absolute;
                left: 50%;
                top: 48%;
                width: min(330px, 62%);
                aspect-ratio: 1.18 / 1;
                border-radius: 28px;
                background: linear-gradient(
                    145deg,
                    #142d46,
                    #07111f 58%,
                    #020913
                );
                border: 1px solid rgba(255,255,255,.18);
                box-shadow:
                    0 35px 70px rgba(0,0,0,.5),
                    inset 0 1px 0 rgba(255,255,255,.12);
                transition: transform .16s ease-out;
                overflow: visible;
            }

            #calculatorVisualObject::before,
            #calculatorVisualObject::after {
                content: '';
                position: absolute;
                inset: 7px;
                border-radius: 23px;
                pointer-events: none;
            }

            #calculatorVisualObject::before {
                transform:
                    translateZ(-22px)
                    translateY(18px);
                background: #030a12;
                opacity: .92;
            }

            #calculatorVisualObject::after {
                border:
                    1px solid
                    rgba(255,255,255,.08);
            }

            #calculatorVisualObject .visual-screen {
                position: absolute;
                left: 10%;
                top: 10%;
                width: 80%;
                height: 29%;
                border-radius: 13px;
                padding: 12px 15px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                justify-content: center;
                background:
                    linear-gradient(
                        155deg,
                        #142f35,
                        #071915
                    );
                border:
                    1px solid
                    rgba(160,255,220,.28);
                box-shadow:
                    inset 0 5px 15px rgba(0,0,0,.38),
                    0 8px 0 rgba(0,0,0,.16);
                transform:
                    translateZ(24px)
                    rotateX(2deg);
                color: #b8ffe4;
                text-shadow:
                    0 0 12px
                    rgba(130,255,210,.45);
            }

            #calculatorVisualObject
                .visual-screen span {
                font:
                    800 10px/1
                    system-ui,sans-serif;
                letter-spacing: .2em;
                opacity: .72;
            }

            #calculatorVisualObject
                .visual-screen strong {
                font:
                    900 20px/1.1
                    ui-monospace,
                    SFMono-Regular,
                    monospace;
                margin-top: 7px;
            }

            #calculatorVisualObject .visual-keyboard {
                position: absolute;
                left: 9%;
                right: 9%;
                bottom: 9%;
                height: 43%;
                display: grid;
                grid-template-columns:
                    repeat(4,1fr);
                gap: 7px;
                transform-style: preserve-3d;
                transform:
                    translateZ(18px);
            }

            #calculatorVisualObject
                .visual-keyboard span {
                display: block;
                border-radius: 7px;
                background:
                    linear-gradient(
                        145deg,
                        #35516b,
                        #101f2e
                    );
                border:
                    1px solid
                    rgba(255,255,255,.12);
                box-shadow:
                    0 5px 0 #020812,
                    inset 0 1px 0
                    rgba(255,255,255,.12);
                transform:
                    translateZ(10px);
            }

            #calculatorVisualObject
                .visual-depth-edge {
                position: absolute;
                left: 6%;
                right: 6%;
                bottom: -16px;
                height: 22px;
                border-radius:
                    0 0 18px 18px;
                background:
                    linear-gradient(
                        180deg,
                        #0a1725,
                        #020811
                    );
                transform:
                    translateZ(-18px)
                    rotateX(-12deg);
                opacity: .92;
            }

            #chemistryMoleculeVisual,
            #physicsVectorVisual {
                position: absolute;
                left: 50%;
                top: 50%;
                width: 180px;
                height: 180px;
                transform:
                    translate(-50%,-50%)
                    translateZ(90px);
                transform-style: preserve-3d;
                pointer-events: none;
            }

            #chemistryMoleculeVisual .atom {
                position: absolute;
                width: 44px;
                height: 44px;
                border-radius: 50%;
                transform-style: preserve-3d;
                box-shadow:
                    inset -8px -8px 14px
                    rgba(0,0,0,.35),
                    inset 5px 5px 9px
                    rgba(255,255,255,.25),
                    0 0 22px
                    rgba(100,190,255,.25);
            }

            #chemistryMoleculeVisual
                .atom-center {
                left: 68px;
                top: 68px;
                background:
                    radial-gradient(
                        circle at 32% 28%,
                        #fff,
                        #6ec5ff 26%,
                        #1260a8 70%,
                        #041528
                    );
                transform:
                    translateZ(45px);
            }

            #chemistryMoleculeVisual
                .atom-left {
                left: 10px;
                top: 42px;
                width: 34px;
                height: 34px;
                background:
                    radial-gradient(
                        circle at 32% 28%,
                        #fff,
                        #b9ffdf 25%,
                        #0e9870 72%,
                        #03291f
                    );
                transform:
                    translateZ(18px);
            }

            #chemistryMoleculeVisual
                .atom-right {
                right: 10px;
                top: 96px;
                width: 34px;
                height: 34px;
                background:
                    radial-gradient(
                        circle at 32% 28%,
                        #fff,
                        #ffd9a0 25%,
                        #bd6714 72%,
                        #341703
                    );
                transform:
                    translateZ(30px);
            }

            #chemistryMoleculeVisual .bond {
                position: absolute;
                height: 8px;
                border-radius: 99px;
                background:
                    linear-gradient(
                        90deg,
                        #8ed8ff,
                        #e9f7ff,
                        #8ed8ff
                    );
                box-shadow:
                    0 0 14px
                    rgba(120,210,255,.38);
                transform-origin:
                    left center;
            }

            #chemistryMoleculeVisual
                .bond-left {
                width: 62px;
                left: 43px;
                top: 75px;
                transform:
                    rotate(155deg)
                    translateZ(28px);
            }

            #chemistryMoleculeVisual
                .bond-right {
                width: 70px;
                left: 101px;
                top: 94px;
                transform:
                    rotate(27deg)
                    translateZ(35px);
            }

            #physicsVectorVisual .vector-axis {
                position: absolute;
                left: 50%;
                top: 50%;
                width: 105px;
                height: 3px;
                transform-origin:
                    left center;
                border-radius: 99px;
                opacity: .78;
                box-shadow:
                    0 0 10px
                    rgba(255,255,255,.3);
            }

            #physicsVectorVisual
                .x-axis {
                background: #ff6878;
                transform:
                    translateZ(10px)
                    rotate(0deg);
            }

            #physicsVectorVisual
                .y-axis {
                background: #66e69a;
                transform:
                    translateZ(20px)
                    rotate(-55deg);
            }

            #physicsVectorVisual
                .z-axis {
                background: #66b8ff;
                transform:
                    translateZ(30px)
                    rotate(55deg);
            }

            #physicsVectorVisual
                .vector-arrow {
                position: absolute;
                left: 50%;
                top: 50%;
                width: 86px;
                height: 5px;
                border-radius: 99px;
                background:
                    linear-gradient(
                        90deg,
                        #fff,
                        #ffc34d
                    );
                transform-origin:
                    left center;
                transform:
                    translateZ(55px)
                    rotate(-12deg);
                box-shadow:
                    0 0 18px
                    rgba(255,205,80,.65);
            }

            #physicsVectorVisual
                .vector-arrow::after {
                content:'';
                position:absolute;
                right:-2px;
                top:50%;
                transform:
                    translateY(-50%)
                    rotate(45deg);
                width:13px;
                height:13px;
                border-top:
                    4px solid #fff;
                border-right:
                    4px solid #fff;
            }
        `;

        document.head.appendChild(style);
    }

    function initVisualKeyboard() {
        if (!dom.calculatorVisualObject) {
            return;
        }

        const keys =
            dom.calculatorVisualObject
                .querySelector(
                    '.visual-keyboard'
                );

        if (!keys) return;

        keys.querySelectorAll('span')
            .forEach(
                (key, index) => {
                    key.dataset.keyIndex =
                        String(index + 1);

                    key.style.transform =
                        `translateZ(${
                            10 +
                            (index % 3) * 2
                        }px)`;

                    key.style.boxShadow =
                        '0 4px 0 rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.12)';
                }
            );
    }

    function exposeEngine() {
        window.FOBASScientificCalculator = {
            engine:
                ENGINE_NAME,

            version:
                ENGINE_VERSION,

            state,

            setMode,

            calculateExpression,

            openScientificFunction,

            clearCalculator,

            resetVisual,

            evaluateMathExpression,

            calculateMolarMass,

            balanceEquation,

            convertUnit
        };
    }

    function init() {
        cacheDom();

        loadState();

        bindEvents();

        ensure3DVisualStyles();

        initVisualKeyboard();

        bindVisualInteraction();

        setMode(
            state.mode
        );

        updateDisplay();

        setCalculation(
            state.formula,
            state.steps,
            state.result,
            state.unit,
            state.calculationState
        );

        update3DMode();

        setStatus(
            'READY',
            'ready'
        );

        exposeEngine();
    }

    if (
        document.readyState ===
        'loading'
    ) {
        document.addEventListener(
            'DOMContentLoaded',
            init,
            {
                once: true
            }
        );
    } else {
        init();
    }
})();