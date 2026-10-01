"use strict";

/* ================================================================
   FOBAS — LABORATOIRE PRATIQUE DE FORMATION EN CARRELAGE
   Fichier : laboratoirecarrelagefobas.js
   Version : 1.0.0

   Architecture :
   - JavaScript natif uniquement
   - Aucun framework
   - Aucun CDN
   - Aucun Three.js
   - Données dynamiques
   - Sauvegarde localStorage
   - Navigation dynamique
   - Pédagogie dynamique
   - Chapitres ajoutables
   - Dictionnaire Carrelage dynamique
   - SVG professionnels sans dépendance externe
   - Simulations pratiques
   - Calculs
   - Missions
   - Contrôle qualité
   - Analyse des erreurs
   - Évaluation
   - Zoom tactile deux doigts Android
   ================================================================ */


const FOBAS_TILE = (() => {

    /* ============================================================
       01 — CONFIGURATION
       ============================================================ */

    const STORAGE_KEY =
        "FOBAS_TILE_LABORATORY_V1";

    const CANVAS_WIDTH = 2400;
    const CANVAS_HEIGHT = 1800;

    const $ = (id) =>
        document.getElementById(id);

    const clamp = (value, min, max) =>
        Math.min(max, Math.max(min, value));

    const escapeHTML = (value) =>
        String(value ?? "").replace(
            /[&<>"']/g,
            character => ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[character]
        );

    const createId = (prefix = "id") =>
        `${prefix}_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 9)}`;


    /* ============================================================
       02 — ÉTAT INITIAL
       ============================================================ */

    const createDefaultState = () => ({

        section: "accueil",

        pedagogicalMode: "theorie",

        selectedChapter: "chapter_01",

        selectedMission: null,

        libraryCategory: "Tous",

        progress: {
            completedModules: 0,
            successfulExercises: 0,
            completedAssignments: 0,
            completedMissions: 0
        },

        competencies: {
            "Mesurage": 0,
            "Traçage": 0,
            "Découpe": 0,
            "Pose": 0,
            "Jointoiement": 0,
            "Sécurité": 0
        },

        work: {

            roomLength: 4,
            roomWidth: 3.5,

            tileLength: 0.60,
            tileWidth: 0.60,

            wastePercent: 8,

            jointWidth: 0.003,

            tilesPlaced: 0,

            cutCount: 0,

            traceAxes: {
                x: false,
                y: false,
                grid: false
            },

            selectedSurface: "sol"
        },

        chapters: [

            {
                id: "chapter_01",

                title:
                    "Chapitre 1 — Introduction au carrelage",

                theorie:
                    "Le carrelage est un revêtement destiné à couvrir "
                    + "une surface préparée. Le professionnel doit "
                    + "maîtriser le choix des matériaux, le contrôle "
                    + "du support, le mesurage, le traçage, la découpe, "
                    + "la pose, le jointoiement, les finitions et la sécurité.",

                pratique:
                    "Identifier le support, organiser la zone de travail, "
                    + "vérifier les conditions générales et préparer "
                    + "les outils nécessaires.",

                exercices: [
                    "Citer trois types de supports pouvant recevoir un carrelage.",
                    "Pourquoi faut-il contrôler le support avant la pose ?"
                ],

                devoir:
                    "Décrire les grandes étapes d'un chantier de carrelage "
                    + "dans leur ordre logique.",

                evaluation:
                    "Expliquer le cycle complet d'un projet de carrelage."
            },

            {
                id: "chapter_02",

                title:
                    "Chapitre 2 — Outils et équipements",

                theorie:
                    "Les outils professionnels comprennent notamment "
                    + "le mètre, le niveau, l'équerre, la truelle, le "
                    + "peigne à colle, la taloche, le coupe-carreaux, "
                    + "le matériel de mélange et les systèmes de nivellement. "
                    + "Chaque outil possède une fonction précise.",

                pratique:
                    "Identifier chaque outil et l'associer à son utilisation.",

                exercices: [
                    "Quel outil sert à contrôler l'horizontalité ?",
                    "À quoi sert un peigne à colle ?"
                ],

                devoir:
                    "Créer une fiche présentant dix outils professionnels.",

                evaluation:
                    "Identifier correctement les outils présentés."
            },

            {
                id: "chapter_03",

                title:
                    "Chapitre 3 — Supports et préparation",

                theorie:
                    "Le support doit présenter des conditions compatibles "
                    + "avec le système de pose choisi. Il doit être préparé "
                    + "et débarrassé des éléments pouvant compromettre "
                    + "l'adhérence ou la qualité du résultat.",

                pratique:
                    "Inspecter une surface virtuelle et identifier ses "
                    + "défauts avant la pose.",

                exercices: [
                    "Citer quatre contrôles importants du support.",
                    "Pourquoi faut-il éliminer les poussières et salissures ?"
                ],

                devoir:
                    "Établir une procédure complète de préparation d'un sol.",

                evaluation:
                    "Effectuer correctement le contrôle préparatoire."
            },

            {
                id: "chapter_04",

                title:
                    "Chapitre 4 — Mesurage et calcul",

                theorie:
                    "Pour une surface rectangulaire, la surface se calcule "
                    + "par longueur × largeur. La quantité de carreaux doit "
                    + "tenir compte du format choisi, des coupes et d'une "
                    + "réserve adaptée au projet.",

                pratique:
                    "Mesurer une pièce virtuelle puis calculer sa surface "
                    + "et une quantité estimative de carreaux.",

                exercices: [
                    "Calculer la surface d'une pièce de 4 m × 3,5 m.",
                    "Pourquoi prévoit-on une réserve de matériau ?"
                ],

                devoir:
                    "Calculer les besoins d'une pièce de votre choix.",

                evaluation:
                    "Effectuer les calculs avec des unités cohérentes."
            },

            {
                id: "chapter_05",

                title:
                    "Chapitre 5 — Traçage et calepinage",

                theorie:
                    "Le calepinage organise la disposition des carreaux "
                    + "avant la pose. Les axes, les joints, les coupes et "
                    + "les points de départ sont étudiés afin de produire "
                    + "une disposition régulière.",

                pratique:
                    "Créer des axes et positionner les premiers carreaux "
                    + "dans le laboratoire.",

                exercices: [
                    "Quel est le rôle des axes de référence ?",
                    "Pourquoi anticiper les coupes périphériques ?"
                ],

                devoir:
                    "Réaliser un plan de calepinage simple.",

                evaluation:
                    "Produire une disposition cohérente des carreaux."
            },

            {
                id: "chapter_06",

                title:
                    "Chapitre 6 — Découpe des carreaux",

                theorie:
                    "Une découpe commence par une mesure et un traçage "
                    + "corrects. L'outil est choisi en fonction du type "
                    + "de coupe et du matériau. Les protections adaptées "
                    + "doivent être utilisées.",

                pratique:
                    "Choisir un procédé de découpe et effectuer une "
                    + "simulation de coupe.",

                exercices: [
                    "Pourquoi mesurer avant de couper ?",
                    "Pourquoi le choix de l'outil est-il important ?"
                ],

                devoir:
                    "Comparer deux méthodes de découpe.",

                evaluation:
                    "Choisir une méthode adaptée à la situation."
            },

            {
                id: "chapter_07",

                title:
                    "Chapitre 7 — Pose des carreaux",

                theorie:
                    "La pose nécessite un support préparé, un système "
                    + "de fixation approprié, une répartition régulière "
                    + "de l'adhésif, un positionnement précis et le "
                    + "respect des joints.",

                pratique:
                    "Positionner progressivement des carreaux dans "
                    + "la zone de travail.",

                exercices: [
                    "Quel est le rôle des joints ?",
                    "Pourquoi contrôler l'alignement pendant la pose ?"
                ],

                devoir:
                    "Décrire une méthode de pose pour un sol intérieur.",

                evaluation:
                    "Réaliser une série de poses correctement alignées."
            },

            {
                id: "chapter_08",

                title:
                    "Chapitre 8 — Jointoiement et finitions",

                theorie:
                    "Le jointoiement complète le revêtement. Le produit "
                    + "choisi doit être compatible avec le système utilisé. "
                    + "L'application, le nettoyage et les finitions doivent "
                    + "être réalisés méthodiquement.",

                pratique:
                    "Simuler l'application du joint et le nettoyage final.",

                exercices: [
                    "Pourquoi nettoyer les résidus de joint ?",
                    "Quelle différence existe entre colle et joint ?"
                ],

                devoir:
                    "Rédiger une procédure de finition.",

                evaluation:
                    "Contrôler la régularité et la propreté des joints."
            },

            {
                id: "chapter_09",

                title:
                    "Chapitre 9 — Sécurité professionnelle",

                theorie:
                    "La sécurité concerne l'organisation du chantier, "
                    + "les équipements de protection, l'utilisation des "
                    + "outils, la propreté de la zone et la prévention "
                    + "des risques associés aux opérations réalisées.",

                pratique:
                    "Identifier les situations dangereuses dans une "
                    + "scène virtuelle.",

                exercices: [
                    "Citer cinq mesures de sécurité.",
                    "Pourquoi maintenir une zone de travail propre ?"
                ],

                devoir:
                    "Créer une checklist de sécurité pour un chantier.",

                evaluation:
                    "Identifier et corriger les principaux risques."
            }

        ],

        dictionary: [

            [
                "Adhésif",
                "Produit utilisé pour fixer les carreaux sur un support "
                + "dans le cadre d'un système de pose approprié."
            ],

            [
                "Calepinage",
                "Planification de la disposition des carreaux, des joints "
                + "et des coupes avant l'exécution."
            ],

            [
                "Carreau",
                "Élément de revêtement destiné à couvrir une surface."
            ],

            [
                "Chape",
                "Couche de mortier pouvant servir notamment à constituer "
                + "ou régulariser un support de sol."
            ],

            [
                "Croisillon",
                "Accessoire utilisé pour maintenir un espacement régulier "
                + "entre certains carreaux."
            ],

            [
                "Double encollage",
                "Méthode consistant, lorsque le système de pose le prévoit, "
                + "à appliquer l'adhésif sur le support et sur le dos "
                + "du carreau."
            ],

            [
                "Équerre",
                "Outil permettant notamment de contrôler ou tracer "
                + "des angles droits."
            ],

            [
                "Joint",
                "Espace situé entre deux carreaux et rempli avec "
                + "un produit de jointoiement adapté."
            ],

            [
                "Jointoiement",
                "Opération consistant à remplir les espaces entre "
                + "les carreaux avec un produit adapté."
            ],

            [
                "Niveau à bulle",
                "Instrument servant à contrôler l'horizontalité "
                + "et la verticalité."
            ],

            [
                "Peigne à colle",
                "Truelle dentée permettant de répartir un adhésif "
                + "avec des sillons réguliers."
            ],

            [
                "Planéité",
                "Degré de régularité d'une surface par rapport "
                + "à un plan de référence."
            ],

            [
                "Support",
                "Surface destinée à recevoir le système de carrelage."
            ],

            [
                "Système de nivellement",
                "Accessoires destinés à aider au maintien de la planéité "
                + "relative entre les carreaux pendant la pose."
            ],

            [
                "Traçage",
                "Action de reporter sur le support les lignes, axes "
                + "et repères nécessaires au travail."
            ],

            [
                "Mortier",
                "Mélange utilisé dans différentes opérations du bâtiment "
                + "selon sa formulation et son application."
            ],

            [
                "Coupe-carreaux",
                "Outil destiné à réaliser certaines coupes de carreaux."
            ],

            [
                "Efflorescence",
                "Dépôt pouvant apparaître à la surface de certains "
                + "matériaux sous l'effet de migration de sels."
            ],

            [
                "Nivelle",
                "Terme courant pouvant désigner un outil ou dispositif "
                + "servant au contrôle du niveau selon le contexte."
            ],

            [
                "Calibre",
                "Dimension ou caractéristique utilisée pour classer "
                + "ou identifier certains produits."
            ]

        ],

        missions: [

            {
                id: "mission_01",

                title:
                    "Mission 1 — Petite salle",

                description:
                    "Mesurer une pièce de 4 m × 3,5 m et préparer "
                    + "une pose de carreaux de 60 × 60 cm avec une "
                    + "réserve pédagogique de 8 %.",

                difficulty:
                    "Débutant"
            },

            {
                id: "mission_02",

                title:
                    "Mission 2 — Salon avec ouverture",

                description:
                    "Créer un calepinage, gérer une ouverture et "
                    + "contrôler les coupes périphériques.",

                difficulty:
                    "Intermédiaire"
            },

            {
                id: "mission_03",

                title:
                    "Mission 3 — Salle de bain",

                description:
                    "Préparer une surface comportant des angles "
                    + "et obstacles puis contrôler les finitions.",

                difficulty:
                    "Avancé"
            }

        ],

        errors: []

    });


    /* ============================================================
       03 — CHARGEMENT / SAUVEGARDE
       ============================================================ */

    let state = loadState();


    function loadState() {

        const defaults =
            createDefaultState();

        try {

            const stored =
                localStorage.getItem(STORAGE_KEY);

            if (!stored) {
                return defaults;
            }

            const saved =
                JSON.parse(stored);

            const result =
                Object.assign({}, defaults, saved);

            result.progress =
                Object.assign(
                    {},
                    defaults.progress,
                    saved.progress || {}
                );

            result.competencies =
                Object.assign(
                    {},
                    defaults.competencies,
                    saved.competencies || {}
                );

            result.work =
                Object.assign(
                    {},
                    defaults.work,
                    saved.work || {}
                );

            result.work.traceAxes =
                Object.assign(
                    {},
                    defaults.work.traceAxes,
                    saved.work?.traceAxes || {}
                );

            if (
                !Array.isArray(saved.chapters) ||
                !saved.chapters.length
            ) {
                result.chapters =
                    defaults.chapters;
            }

            if (
                !Array.isArray(saved.dictionary) ||
                !saved.dictionary.length
            ) {
                result.dictionary =
                    defaults.dictionary;
            }

            if (
                !Array.isArray(saved.missions) ||
                !saved.missions.length
            ) {
                result.missions =
                    defaults.missions;
            }

            return result;

        } catch (error) {

            return defaults;
        }
    }


    function saveState() {

        try {

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(state)
            );

        } catch (error) {

            setStatus(
                "Impossible de sauvegarder localement."
            );
        }
    }


    /* ============================================================
       04 — NAVIGATION
       ============================================================ */

    const sectionMap = {

        "accueil":
            "sectionAccueil",

        "tableau-de-bord":
            "sectionTableauDeBord",

        "pedagogique":
            "sectionPedagogique",

        "bibliotheque":
            "sectionBibliotheque",

        "preparation":
            "sectionPreparation",

        "mesurage":
            "sectionMesurage",

        "tracage":
            "sectionTracage",

        "decoupe":
            "sectionDecoupe",

        "pose":
            "sectionPose",

        "murs-surfaces":
            "sectionMursSurfaces",

        "calculatrice":
            "sectionCalculatrice",

        "controle-qualite":
            "sectionControleQualite",

        "missions":
            "sectionMissions",

        "analyse-erreurs":
            "sectionAnalyseErreurs",

        "evaluation-competences":
            "sectionEvaluationCompetences",

        "dictionnaire":
            "sectionDictionnaireCarrelage"

    };


    function getSectionLabel(section) {

        const labels = {

            "accueil":
                "Accueil",

            "tableau-de-bord":
                "Tableau de Bord",

            "pedagogique":
                "Pédagogique",

            "bibliotheque":
                "Bibliothèque",

            "preparation":
                "Préparation",

            "mesurage":
                "Mesurage & Calcul",

            "tracage":
                "Traçage",

            "decoupe":
                "Découpe",

            "pose":
                "Pose",

            "murs-surfaces":
                "Murs & Surfaces",

            "calculatrice":
                "Calculatrice",

            "controle-qualite":
                "Contrôle & Qualité",

            "missions":
                "Missions",

            "analyse-erreurs":
                "Analyse des Erreurs",

            "evaluation-competences":
                "Évaluation des Compétences",

            "dictionnaire":
                "Dictionnaire Carrelage"

        };

        return labels[section] || section;
    }


    function showSection(section, announce = true) {

        if (!sectionMap[section]) {
            section = "accueil";
        }

        state.section =
            section;

        Object.entries(sectionMap)
            .forEach(
                ([key, elementId]) => {

                    const sectionElement =
                        $(elementId);

                    if (sectionElement) {

                        sectionElement.hidden =
                            key !== section;
                    }

                }
            );


        document
            .querySelectorAll(
                "#mainNavigation [data-section]"
            )
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.section === section
                );

            });


        saveState();

        if (announce) {

            setStatus(
                `Section active : ${getSectionLabel(section)}.`
            );
        }

    }


    /* ============================================================
       05 — MESSAGE D'ÉTAT
       ============================================================ */

    function setStatus(message) {

        const status =
            $("laboratoryStatus");

        if (status) {
            status.textContent =
                message;
        }
    }


    /* ============================================================
       06 — BOUTON DICTIONNAIRE DYNAMIQUE
       ============================================================ */

    function createDictionarySection() {

        if (
            document.querySelector(
                '[data-section="dictionnaire"]'
            )
        ) {
            return;
        }


        const navigation =
            $("mainNavigation");

        const main =
            $("laboratoryMain");

        if (!navigation || !main) {
            return;
        }


        const button =
            document.createElement("button");

        button.type =
            "button";

        button.id =
            "navDictionnaireCarrelage";

        button.className =
            "nav-button";

        button.dataset.section =
            "dictionnaire";

        button.innerHTML =
            `
            <span class="nav-icon" aria-hidden="true">
                📖
            </span>
            <span>Dictionnaire Carrelage</span>
            `;


        navigation.appendChild(button);


        const section =
            document.createElement("section");

        section.id =
            "sectionDictionnaireCarrelage";

        section.className =
            "laboratory-section";

        section.dataset.sectionContent =
            "dictionnaire";

        section.hidden =
            true;


        section.innerHTML =
            `
            <div class="section-header">

                <span class="section-kicker">
                    RÉFÉRENCE
                </span>

                <h2>
                    Dictionnaire Carrelage
                </h2>

                <p>
                    Définitions essentielles des principaux
                    termes techniques du métier du carrelage.
                </p>

            </div>

            <div
                id="dictionarySearchWrap"
                class="lab-panel"
            >

                <label>
                    Rechercher un terme
                    <input
                        id="dictionarySearch"
                        type="search"
                        placeholder="Ex. joint, support, calepinage..."
                        autocomplete="off"
                    >
                </label>

            </div>

            <div
                id="dictionaryGrid"
                class="library-grid"
                style="margin-top:16px"
            ></div>
            `;


        main.appendChild(section);
    }


    /* ============================================================
       07 — DICTIONNAIRE
       ============================================================ */

    function renderDictionary() {

        createDictionarySection();

        const grid =
            $("dictionaryGrid");

        if (!grid) {
            return;
        }


        const searchInput =
            $("dictionarySearch");

        const query =
            (searchInput?.value || "")
                .trim()
                .toLowerCase();


        const terms =
            state.dictionary
                .filter(item => {

                    const term =
                        String(item[0])
                            .toLowerCase();

                    const definition =
                        String(item[1])
                            .toLowerCase();

                    return (
                        !query ||
                        term.includes(query) ||
                        definition.includes(query)
                    );

                });


        if (!terms.length) {

            grid.innerHTML =
                `
                <div class="lab-panel">

                    <strong>
                        Aucun terme trouvé.
                    </strong>

                    <p>
                        Essayez un autre mot-clé.
                    </p>

                </div>
                `;

            return;
        }


        grid.innerHTML =
            terms
                .map(
                    ([term, definition]) =>
                        `
                        <article class="library-card">

                            <div
                                class="library-card-image"
                            >

                                <svg
                                    class="fobas-svg-object"
                                    viewBox="0 0 240 140"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >

                                    <defs>

                                        <linearGradient
                                            id="dictionaryGradient"
                                            x1="0"
                                            y1="0"
                                            x2="1"
                                            y2="1"
                                        >

                                            <stop
                                                offset="0%"
                                                stop-color="#ffffff"
                                            />

                                            <stop
                                                offset="100%"
                                                stop-color="#bae6fd"
                                            />

                                        </linearGradient>

                                    </defs>

                                    <rect
                                        x="40"
                                        y="25"
                                        width="160"
                                        height="90"
                                        rx="12"
                                        fill="url(#dictionaryGradient)"
                                        stroke="#475569"
                                        stroke-width="3"
                                    />

                                    <path
                                        d="M70 55H170"
                                        stroke="#0284c7"
                                        stroke-width="5"
                                        stroke-linecap="round"
                                    />

                                    <path
                                        d="M70 75H150"
                                        stroke="#64748b"
                                        stroke-width="4"
                                        stroke-linecap="round"
                                    />

                                    <path
                                        d="M70 94H160"
                                        stroke="#64748b"
                                        stroke-width="4"
                                        stroke-linecap="round"
                                    />

                                </svg>

                            </div>

                            <div
                                class="library-card-content"
                            >

                                <h3>
                                    ${escapeHTML(term)}
                                </h3>

                                <p>
                                    ${escapeHTML(definition)}
                                </p>

                            </div>

                        </article>
                        `
                )
                .join("");
    }


    /* ============================================================
       08 — TABLEAU DE BORD
       ============================================================ */

    function calculateGlobalProgress() {

        const chapterCount =
            state.chapters.length;

        const missionCount =
            state.missions.length;

        const total =
            Math.max(
                1,
                chapterCount +
                missionCount +
                10
            );


        const completed =
            state.progress.completedModules +
            state.progress.completedMissions +
            state.progress.successfulExercises;


        return clamp(
            Math.round(
                completed / total * 100
            ),
            0,
            100
        );
    }


    function renderDashboard() {

        const progress =
            calculateGlobalProgress();


        if ($("dashboardProgress")) {

            $("dashboardProgress")
                .textContent =
                `${progress} %`;
        }


        if ($("dashboardCompletedModules")) {

            $("dashboardCompletedModules")
                .textContent =
                state.progress.completedModules;
        }


        if ($("dashboardSuccessfulExercises")) {

            $("dashboardSuccessfulExercises")
                .textContent =
                state.progress.successfulExercises;
        }


        if ($("dashboardCompletedMissions")) {

            $("dashboardCompletedMissions")
                .textContent =
                state.progress.completedMissions;
        }


        const competencyList =
            $("competencyProgressList");

        if (!competencyList) {
            return;
        }


        competencyList.innerHTML =
            Object.entries(
                state.competencies
            )
                .map(
                    ([name, value]) =>
                        `
                        <div>

                            <div
                                style="
                                display:flex;
                                justify-content:space-between;
                                gap:10px;
                                margin-bottom:5px;
                                "
                            >

                                <strong>
                                    ${escapeHTML(name)}
                                </strong>

                                <span>
                                    ${clamp(value, 0, 100)}%
                                </span>

                            </div>

                            <div class="progress-track">

                                <div
                                    class="progress-value"
                                    style="
                                    width:${clamp(value, 0, 100)}%
                                    "
                                ></div>

                            </div>

                        </div>
                        `
                )
                .join("");
    }


    /* ============================================================
       09 — PÉDAGOGIE
       ============================================================ */

    function renderPedagogy() {

        document
            .querySelectorAll(
                ".pedagogical-tab"
            )
            .forEach(button => {

                button.classList.toggle(
                    "active",
                    button.dataset.pedagogicalMode ===
                    state.pedagogicalMode
                );

            });


        const chapterList =
            $("pedagogicalChapterList");

        const content =
            $("pedagogicalContent");


        if (!chapterList || !content) {
            return;
        }


        chapterList.innerHTML =
            state.chapters
                .map(
                    chapter =>
                        `
                        <button
                            type="button"
                            class="nav-button
                            ${chapter.id === state.selectedChapter
                                ? "active"
                                : ""}"
                            data-chapter-id="${escapeHTML(chapter.id)}"
                            style="
                            width:100%;
                            justify-content:flex-start;
                            margin-bottom:6px;
                            "
                        >
                            ${escapeHTML(chapter.title)}
                        </button>
                        `
                )
                .join("")
                +
                `
                <button
                    id="addChapterButton"
                    type="button"
                    class="primary-action-button"
                    style="
                    width:100%;
                    margin-top:6px;
                    "
                >
                    ＋ Ajouter un chapitre
                </button>
                `;


        let chapter =
            state.chapters.find(
                item =>
                    item.id ===
                    state.selectedChapter
            );


        if (!chapter) {

            chapter =
                state.chapters[0];

            if (chapter) {
                state.selectedChapter =
                    chapter.id;
            }
        }


        if (!chapter) {
            return;
        }


        let html = "";


        switch (state.pedagogicalMode) {

            case "theorie":

                html =
                    `
                    <article class="lab-panel">

                        <span class="status-badge info">
                            THÉORIE
                        </span>

                        <h3>
                            ${escapeHTML(chapter.title)}
                        </h3>

                        <p>
                            ${escapeHTML(chapter.theorie)}
                        </p>

                        <button
                            type="button"
                            class="primary-action-button"
                            data-complete-module="${escapeHTML(chapter.id)}"
                        >
                            ✓ Marquer le module terminé
                        </button>

                    </article>
                    `;

                break;


            case "pratique":

                html =
                    `
                    <article class="lab-panel">

                        <span class="status-badge success">
                            PRATIQUE
                        </span>

                        <h3>
                            ${escapeHTML(chapter.title)}
                        </h3>

                        <p>
                            ${escapeHTML(chapter.pratique)}
                        </p>

                        <button
                            type="button"
                            class="primary-action-button"
                            data-open-practice="${escapeHTML(chapter.id)}"
                        >
                            Ouvrir la pratique
                        </button>

                    </article>
                    `;

                break;


            case "exercices":

                html =
                    `
                    <article class="lab-panel">

                        <span class="status-badge info">
                            EXERCICES
                        </span>

                        <h3>
                            Exercices — ${escapeHTML(chapter.title)}
                        </h3>

                        ${
                            chapter.exercices
                                .map(
                                    (exercise, index) =>
                                        `
                                        <div
                                            class="lab-panel"
                                            style="margin:10px 0"
                                        >

                                            <strong>
                                                Exercice ${index + 1}
                                            </strong>

                                            <p>
                                                ${escapeHTML(exercise)}
                                            </p>

                                            <button
                                                type="button"
                                                class="lab-tool-button"
                                                data-exercise="${escapeHTML(chapter.id)}"
                                            >
                                                Valider ma réponse
                                            </button>

                                        </div>
                                        `
                                )
                                .join("")
                        }

                    </article>
                    `;

                break;


            case "devoirs":

                html =
                    `
                    <article class="lab-panel">

                        <span class="status-badge warning">
                            DEVOIR
                        </span>

                        <h3>
                            Devoir — ${escapeHTML(chapter.title)}
                        </h3>

                        <p>
                            ${escapeHTML(chapter.devoir)}
                        </p>

                        <textarea
                            id="assignmentAnswer"
                            placeholder="Écrivez votre travail ici..."
                        ></textarea>

                        <button
                            type="button"
                            class="primary-action-button"
                            data-submit-assignment="${escapeHTML(chapter.id)}"
                            style="margin-top:10px"
                        >
                            Enregistrer le devoir
                        </button>

                    </article>
                    `;

                break;


            case "evaluation":

                html =
                    `
                    <article class="lab-panel">

                        <span class="status-badge success">
                            ÉVALUATION
                        </span>

                        <h3>
                            Évaluation — ${escapeHTML(chapter.title)}
                        </h3>

                        <p>
                            ${escapeHTML(chapter.evaluation)}
                        </p>

                        <button
                            type="button"
                            class="primary-action-button"
                            data-evaluate-chapter="${escapeHTML(chapter.id)}"
                        >
                            Valider l'évaluation
                        </button>

                    </article>
                    `;

                break;
        }


        content.innerHTML =
            html;
    }


    function addChapter() {

        const title =
            window.prompt(
                "Titre du nouveau chapitre :",
                `Chapitre ${state.chapters.length + 1} — Nouveau module`
            );


        if (!title || !title.trim()) {
            return;
        }


        const newChapter = {

            id:
                createId("chapter"),

            title:
                title.trim(),

            theorie:
                "Ajoutez ici le contenu théorique "
                + "du nouveau chapitre.",

            pratique:
                "Ajoutez ici la procédure pratique "
                + "du nouveau chapitre.",

            exercices: [
                "Ajoutez ici le premier exercice "
                + "du nouveau chapitre."
            ],

            devoir:
                "Ajoutez ici le devoir du nouveau chapitre.",

            evaluation:
                "Ajoutez ici les critères d'évaluation "
                + "du nouveau chapitre."

        };


        state.chapters.push(
            newChapter
        );

        state.selectedChapter =
            newChapter.id;


        saveState();

        renderPedagogy();

        renderDashboard();

        setStatus(
            "Nouveau chapitre ajouté avec succès."
        );
    }


    function completeModule(chapterId) {

        const exists =
            state.chapters.some(
                chapter =>
                    chapter.id === chapterId
            );


        if (!exists) {
            return;
        }


        state.progress.completedModules =
            clamp(
                state.progress.completedModules + 1,
                0,
                state.chapters.length
            );


        state.competencies.Sécurité =
            clamp(
                state.competencies.Sécurité + 2,
                0,
                100
            );


        saveState();

        renderDashboard();

        renderEvaluation();

        setStatus(
            "Module pédagogique enregistré comme terminé."
        );
    }


    function completeExercise() {

        state.progress.successfulExercises++;

        saveState();

        renderDashboard();

        setStatus(
            "Exercice enregistré comme réussi."
        );
    }


    function submitAssignment(chapterId) {

        const answer =
            $("assignmentAnswer");


        if (
            !answer ||
            answer.value.trim().length < 10
        ) {

            setStatus(
                "Veuillez rédiger une réponse avant d'enregistrer le devoir."
            );

            return;
        }


        state.progress.completedAssignments++;

        saveState();

        renderDashboard();

        setStatus(
            `Devoir du chapitre ${chapterId} enregistré localement.`
        );
    }


    function evaluateChapter(chapterId) {

        const chapter =
            state.chapters.find(
                item =>
                    item.id === chapterId
            );


        if (!chapter) {
            return;
        }


        state.competencies.Mesurage =
            clamp(
                state.competencies.Mesurage + 3,
                0,
                100
            );


        state.competencies.Sécurité =
            clamp(
                state.competencies.Sécurité + 3,
                0,
                100
            );


        saveState();

        renderDashboard();

        renderEvaluation();

        setStatus(
            `Évaluation de ${chapter.title} enregistrée.`
        );
    }


    /* ============================================================
       10 — BIBLIOTHÈQUE
       ============================================================ */

    const libraryItems = [

        {
            category: "Outil",
            name: "Mètre ruban",
            description:
                "Mesurer les longueurs et dimensions.",
            symbol: "📏"
        },

        {
            category: "Outil",
            name: "Niveau à bulle",
            description:
                "Contrôler l'horizontalité et la verticalité.",
            symbol: "📐"
        },

        {
            category: "Outil",
            name: "Peigne à colle",
            description:
                "Répartir l'adhésif avec des sillons réguliers.",
            symbol: "▤"
        },

        {
            category: "Outil",
            name: "Truelle",
            description:
                "Manipuler ou étaler certains matériaux selon le procédé.",
            symbol: "◈"
        },

        {
            category: "Outil",
            name: "Coupe-carreaux",
            description:
                "Réaliser certaines coupes de carreaux.",
            symbol: "◫"
        },

        {
            category: "Outil",
            name: "Taloche",
            description:
                "Utilisée selon l'opération pour travailler ou nettoyer.",
            symbol: "▰"
        },

        {
            category: "Matériau",
            name: "Carreau 60 × 60 cm",
            description:
                "Format utilisé dans plusieurs simulations.",
            symbol: "⬜"
        },

        {
            category: "Matériau",
            name: "Adhésif",
            description:
                "Produit de fixation adapté au système de pose.",
            symbol: "◆"
        },

        {
            category: "Matériau",
            name: "Produit de jointoiement",
            description:
                "Produit destiné à remplir les espaces entre les carreaux.",
            symbol: "▦"
        },

        {
            category: "Sécurité",
            name: "Protection des yeux",
            description:
                "Protection à utiliser selon les risques de la tâche.",
            symbol: "◉"
        },

        {
            category: "Sécurité",
            name: "Gants adaptés",
            description:
                "Protection des mains choisie selon la tâche.",
            symbol: "◌"
        }

    ];


    function renderLibrary() {

        const filters =
            $("libraryFilters");

        const grid =
            $("libraryGrid");


        if (!filters || !grid) {
            return;
        }


        const categories = [
            "Tous",
            ...new Set(
                libraryItems.map(
                    item =>
                        item.category
                )
            )
        ];


        filters.innerHTML =
            categories
                .map(
                    category =>
                        `
                        <button
                            type="button"
                            class="lab-tool-button
                            ${state.libraryCategory === category
                                ? "active"
                                : ""}"
                            data-library-category="${escapeHTML(category)}"
                        >
                            ${escapeHTML(category)}
                        </button>
                        `
                )
                .join("");


        const filtered =
            libraryItems.filter(
                item =>
                    state.libraryCategory === "Tous" ||
                    item.category ===
                    state.libraryCategory
            );


        grid.innerHTML =
            filtered
                .map(
                    (item, index) =>
                        `
                        <article class="library-card">

                            <div
                                class="library-card-image"
                            >

                                <svg
                                    class="fobas-svg-object"
                                    viewBox="0 0 240 140"
                                    xmlns="http://www.w3.org/2000/svg"
                                >

                                    <defs>

                                        <linearGradient
                                            id="toolGradient${index}"
                                            x1="0"
                                            y1="0"
                                            x2="1"
                                            y2="1"
                                        >

                                            <stop
                                                offset="0%"
                                                stop-color="#ffffff"
                                            />

                                            <stop
                                                offset="100%"
                                                stop-color="#bae6fd"
                                            />

                                        </linearGradient>

                                    </defs>

                                    <ellipse
                                        cx="120"
                                        cy="112"
                                        rx="68"
                                        ry="10"
                                        fill="#64748b"
                                        opacity=".18"
                                    />

                                    <rect
                                        x="55"
                                        y="30"
                                        width="130"
                                        height="70"
                                        rx="14"
                                        fill="url(#toolGradient${index})"
                                        stroke="#475569"
                                        stroke-width="3"
                                    />

                                    <text
                                        x="120"
                                        y="76"
                                        text-anchor="middle"
                                        font-size="35"
                                    >
                                        ${escapeHTML(item.symbol)}
                                    </text>

                                </svg>

                            </div>

                            <div
                                class="library-card-content"
                            >

                                <span class="status-badge info">
                                    ${escapeHTML(item.category)}
                                </span>

                                <h3>
                                    ${escapeHTML(item.name)}
                                </h3>

                                <p>
                                    ${escapeHTML(item.description)}
                                </p>

                                <button
                                    type="button"
                                    class="lab-tool-button"
                                    data-library-detail="${index}"
                                >
                                    Détails
                                </button>

                            </div>

                        </article>
                        `
                )
                .join("");
    }


    function showLibraryDetail(index) {

        const item =
            libraryItems[index];

        const panel =
            $("libraryDetailPanel");


        if (!item || !panel) {
            return;
        }


        panel.hidden =
            false;


        panel.innerHTML =
            `
            <span class="status-badge info">
                ${escapeHTML(item.category)}
            </span>

            <h3>
                ${escapeHTML(item.name)}
            </h3>

            <p>
                ${escapeHTML(item.description)}
            </p>

            <button
                type="button"
                class="lab-tool-button"
                data-close-library
            >
                Fermer
            </button>
            `;
    }


    /* ============================================================
       11 — SVG / LABORATOIRE
       ============================================================ */

    function createRoomSVG(type) {

        const length =
            Number(state.work.roomLength);

        const width =
            Number(state.work.roomWidth);

        const drawingScale =
            180;


        const roomWidth =
            Math.max(
                180,
                length * drawingScale
            );

        const roomHeight =
            Math.max(
                160,
                width * drawingScale
            );


        let additional =
            "";


        if (type === "mesurage") {

            additional =
                `
                <line
                    x1="260"
                    y1="${190 + roomHeight}"
                    x2="${260 + roomWidth}"
                    y2="${190 + roomHeight}"
                    stroke="#0284c7"
                    stroke-width="5"
                />

                <text
                    x="${260 + roomWidth / 2}"
                    y="${235 + roomHeight}"
                    text-anchor="middle"
                    font-size="30"
                    font-weight="700"
                    fill="#0369a1"
                >
                    ${length.toFixed(2)} m
                </text>

                <line
                    x1="${245 + roomWidth}"
                    y1="180"
                    x2="${245 + roomWidth}"
                    y2="${180 + roomHeight}"
                    stroke="#0284c7"
                    stroke-width="5"
                />

                <text
                    x="${235 + roomWidth}"
                    y="${180 + roomHeight / 2}"
                    transform="
                    rotate(90 ${235 + roomWidth} ${180 + roomHeight / 2})
                    "
                    text-anchor="middle"
                    font-size="30"
                    font-weight="700"
                    fill="#0369a1"
                >
                    ${width.toFixed(2)} m
                </text>
                `;
        }


        if (type === "tracage") {

            if (
                state.work.traceAxes.x
            ) {

                additional +=
                    `
                    <line
                        x1="260"
                        y1="${180 + roomHeight / 2}"
                        x2="${260 + roomWidth}"
                        y2="${180 + roomHeight / 2}"
                        stroke="#dc2626"
                        stroke-width="5"
                        stroke-dasharray="20 12"
                    />
                    `;
            }


            if (
                state.work.traceAxes.y
            ) {

                additional +=
                    `
                    <line
                        x1="${260 + roomWidth / 2}"
                        y1="180"
                        x2="${260 + roomWidth / 2}"
                        y2="${180 + roomHeight}"
                        stroke="#2563eb"
                        stroke-width="5"
                        stroke-dasharray="20 12"
                    />
                    `;
            }


            if (
                state.work.traceAxes.grid
            ) {

                const tilePx =
                    108;

                for (
                    let x = 260;
                    x < 260 + roomWidth;
                    x += tilePx
                ) {

                    additional +=
                        `
                        <line
                            x1="${x}"
                            y1="180"
                            x2="${x}"
                            y2="${180 + roomHeight}"
                            stroke="#94a3b8"
                            stroke-width="2"
                            opacity=".55"
                        />
                        `;
                }


                for (
                    let y = 180;
                    y < 180 + roomHeight;
                    y += tilePx
                ) {

                    additional +=
                        `
                        <line
                            x1="260"
                            y1="${y}"
                            x2="${260 + roomWidth}"
                            y2="${y}"
                            stroke="#94a3b8"
                            stroke-width="2"
                            opacity=".55"
                        />
                        `;
                }
            }
        }


        if (type === "pose") {

            additional =
                renderPlacedTiles();
        }


        return `
        <svg
            class="fobas-svg-object"
            width="${CANVAS_WIDTH}"
            height="${CANVAS_HEIGHT}"
            viewBox="0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="Zone de simulation"
        >

            <defs>

                <linearGradient
                    id="roomGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="1"
                >

                    <stop
                        offset="0%"
                        stop-color="#ffffff"
                    />

                    <stop
                        offset="100%"
                        stop-color="#cbd5e1"
                    />

                </linearGradient>

                <filter
                    id="roomShadow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="150%"
                >

                    <feDropShadow
                        dx="12"
                        dy="18"
                        stdDeviation="12"
                        flood-color="#0f172a"
                        flood-opacity=".20"
                    />

                </filter>

            </defs>


            <rect
                x="0"
                y="0"
                width="${CANVAS_WIDTH}"
                height="${CANVAS_HEIGHT}"
                fill="#eef2f7"
            />


            <g filter="url(#roomShadow)">

                <rect
                    x="260"
                    y="180"
                    width="${roomWidth}"
                    height="${roomHeight}"
                    rx="10"
                    fill="url(#roomGradient)"
                    stroke="#475569"
                    stroke-width="6"
                />

            </g>


            <text
                x="260"
                y="135"
                font-size="38"
                font-weight="800"
                fill="#0f172a"
            >
                ${escapeHTML(
                    getSectionLabel(type)
                )}
            </text>


            <text
                x="260"
                y="${220 + roomHeight}"
                font-size="28"
                fill="#334155"
            >
                Surface :
                ${(length * width).toFixed(2)}
                m²
            </text>


            ${additional}

        </svg>
        `;
    }


    function renderPlacedTiles() {

        const output = [];

        const tileSize =
            104;

        const columns =
            Math.max(
                1,
                Math.floor(
                    state.work.roomLength /
                    state.work.tileLength
                )
            );

        const rows =
            Math.max(
                1,
                Math.floor(
                    state.work.roomWidth /
                    state.work.tileWidth
                )
            );


        let placed =
            state.work.tilesPlaced;


        for (
            let row = 0;
            row < rows && placed > 0;
            row++
        ) {

            for (
                let column = 0;
                column < columns && placed > 0;
                column++
            ) {

                const x =
                    260 +
                    column *
                    (tileSize + 4);

                const y =
                    180 +
                    row *
                    (tileSize + 4);


                output.push(
                    `
                    <g>

                        <rect
                            x="${x}"
                            y="${y}"
                            width="${tileSize}"
                            height="${tileSize}"
                            rx="3"
                            fill="#f8fafc"
                            stroke="#64748b"
                            stroke-width="3"
                        />

                        <path
                            d="
                            M${x}
                            ${y + 8}
                            H${x + tileSize}
                            "
                            stroke="#ffffff"
                            stroke-width="6"
                            opacity=".9"
                        />

                        <path
                            d="
                            M${x + 8}
                            ${y}
                            V${y + tileSize}
                            "
                            stroke="#e2e8f0"
                            stroke-width="3"
                        />

                    </g>
                    `
                );

                placed--;
            }
        }


        return output.join("");
    }


    function drawLaboratoryCanvas(type) {

        const canvas =
            document.querySelector(
                `[data-laboratory-canvas="${type}"]`
            );


        if (!canvas) {
            return;
        }


        canvas.innerHTML =
            createRoomSVG(type);
    }


    /* ============================================================
       12 — WORKSPACES
       ============================================================ */

    const workspaceIds = {

        preparation:
            "preparationWorkspace",

        mesurage:
            "measurementWorkspace",

        tracage:
            "tracingWorkspace",

        decoupe:
            "cuttingWorkspace",

        pose:
            "placementWorkspace",

        "murs-surfaces":
            "wallsSurfacesWorkspace"

    };


    function createWorkspaceCanvas(type) {

        return `
            <div
                class="laboratory-canvas"
                data-laboratory-canvas="${escapeHTML(type)}"
                style="
                width:${CANVAS_WIDTH}px;
                height:${CANVAS_HEIGHT}px;
                min-width:${CANVAS_WIDTH}px;
                min-height:${CANVAS_HEIGHT}px;
                "
            ></div>
        `;
    }


    function createWorkspaceControls(type) {

        if (type === "preparation") {

            return `
                <div class="lab-panel">

                    <h3>
                        Préparation du chantier
                    </h3>

                    <p>
                        Contrôlez les dimensions et préparez
                        la surface avant l'exécution.
                    </p>

                    <div
                        style="
                        display:grid;
                        grid-template-columns:
                        repeat(auto-fit,minmax(160px,1fr));
                        gap:10px;
                        "
                    >

                        <label>
                            Longueur (m)

                            <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                data-work-field="roomLength"
                                value="${state.work.roomLength}"
                            >

                        </label>

                        <label>
                            Largeur (m)

                            <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                data-work-field="roomWidth"
                                value="${state.work.roomWidth}"
                            >

                        </label>

                    </div>

                    <button
                        type="button"
                        class="primary-action-button"
                        data-preparation-check
                        style="margin-top:12px"
                    >
                        Contrôler la préparation
                    </button>

                </div>
            `;
        }


        if (type === "mesurage") {

            return `
                <div class="lab-panel">

                    <h3>
                        Mesurage & Calcul
                    </h3>

                    <div
                        style="
                        display:grid;
                        grid-template-columns:
                        repeat(auto-fit,minmax(160px,1fr));
                        gap:10px;
                        "
                    >

                        <label>
                            Longueur (m)

                            <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                data-work-field="roomLength"
                                value="${state.work.roomLength}"
                            >

                        </label>

                        <label>
                            Largeur (m)

                            <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                data-work-field="roomWidth"
                                value="${state.work.roomWidth}"
                            >

                        </label>

                        <label>
                            Réserve (%)

                            <input
                                type="number"
                                min="0"
                                max="50"
                                step="1"
                                data-work-field="wastePercent"
                                value="${state.work.wastePercent}"
                            >

                        </label>

                    </div>

                    <div
                        id="measurementResult"
                        class="lab-panel"
                        style="margin-top:12px"
                    ></div>

                    <button
                        type="button"
                        class="primary-action-button"
                        data-measurement-check
                        style="margin-top:12px"
                    >
                        Valider le mesurage
                    </button>

                </div>
            `;
        }


        if (type === "tracage") {

            return `
                <div class="lab-panel">

                    <h3>
                        Traçage & Calepinage
                    </h3>

                    <p>
                        Créez les axes et préparez la disposition
                        des carreaux.
                    </p>

                    <div
                        style="
                        display:flex;
                        flex-wrap:wrap;
                        gap:8px;
                        "
                    >

                        <button
                            type="button"
                            class="lab-tool-button"
                            data-trace-action="axis-x"
                        >
                            Tracer axe horizontal
                        </button>

                        <button
                            type="button"
                            class="lab-tool-button"
                            data-trace-action="axis-y"
                        >
                            Tracer axe vertical
                        </button>

                        <button
                            type="button"
                            class="lab-tool-button"
                            data-trace-action="grid"
                        >
                            Afficher le calepinage
                        </button>

                        <button
                            type="button"
                            class="lab-tool-button"
                            data-trace-action="reset"
                        >
                            Effacer les repères
                        </button>

                    </div>

                </div>
            `;
        }


        if (type === "decoupe") {

            return `
                <div class="lab-panel">

                    <h3>
                        Laboratoire de Découpe
                    </h3>

                    <p>
                        Chaque opération commence par une mesure
                        et un traçage précis.
                    </p>

                    <div
                        style="
                        display:flex;
                        flex-wrap:wrap;
                        gap:8px;
                        "
                    >

                        <button
                            type="button"
                            class="lab-tool-button"
                            data-cut-action="straight"
                        >
                            Coupe droite
                        </button>

                        <button
                            type="button"
                            class="lab-tool-button"
                            data-cut-action="corner"
                        >
                            Découpe d'angle
                        </button>

                        <button
                            type="button"
                            class="lab-tool-button"
                            data-cut-action="round"
                        >
                            Passage circulaire
                        </button>

                    </div>

                    <p id="cutResult">
                        Aucune découpe enregistrée.
                    </p>

                </div>
            `;
        }


        if (type === "pose") {

            return `
                <div class="lab-panel">

                    <h3>
                        Laboratoire de Pose
                    </h3>

                    <p>
                        Ajoutez progressivement les carreaux
                        et contrôlez leur alignement.
                    </p>

                    <div
                        style="
                        display:flex;
                        flex-wrap:wrap;
                        gap:8px;
                        "
                    >

                        <button
                            type="button"
                            class="primary-action-button"
                            data-placement-action="add"
                        >
                            ＋ Poser un carreau
                        </button>

                        <button
                            type="button"
                            class="lab-tool-button"
                            data-placement-action="remove"
                        >
                            − Retirer le dernier
                        </button>

                        <button
                            type="button"
                            class="lab-tool-button"
                            data-placement-action="align"
                        >
                            Contrôler l'alignement
                        </button>

                        <button
                            type="button"
                            class="lab-tool-button"
                            data-placement-action="reset"
                        >
                            Réinitialiser la pose
                        </button>

                    </div>

                    <p>
                        Carreaux posés :
                        <strong id="tilesPlacedValue">
                            ${state.work.tilesPlaced}
                        </strong>
                    </p>

                </div>
            `;
        }


        if (type === "murs-surfaces") {

            return `
                <div class="lab-panel">

                    <h3>
                        Murs & Surfaces
                    </h3>

                    <p>
                        Sélectionnez une surface pour adapter
                        la simulation.
                    </p>

                    <div
                        style="
                        display:flex;
                        flex-wrap:wrap;
                        gap:8px;
                        "
                    >

                        <button
                            type="button"
                            class="lab-tool-button"
                            data-surface-type="sol"
                        >
                            Sol
                        </button>

                        <button
                            type="button"
                            class="lab-tool-button"
                            data-surface-type="mur"
                        >
                            Mur
                        </button>

                        <button
                            type="button"
                            class="lab-tool-button"
                            data-surface-type="douche"
                        >
                            Douche
                        </button>

                    </div>

                    <div
                        id="surfaceStatus"
                        class="lab-panel"
                        style="margin-top:12px"
                    >
                        Surface actuelle :
                        <strong>
                            ${escapeHTML(
                                state.work.selectedSurface
                            )}
                        </strong>
                    </div>

                </div>
            `;
        }


        return "";
    }


    function renderWorkspace(type) {

        const container =
            $(workspaceIds[type]);


        if (!container) {
            return;
        }


        container.innerHTML =
            createWorkspaceControls(type)
            +
            `
            <div
                class="lab-panel"
                style="
                margin-top:14px;
                padding:10px;
                "
            >

                <div
                    style="
                    display:flex;
                    flex-wrap:wrap;
                    justify-content:space-between;
                    gap:8px;
                    margin-bottom:10px;
                    "
                >

                    <strong>
                        Espace de simulation
                    </strong>

                    <span class="status-badge info">
                        ${CANVAS_WIDTH} × ${CANVAS_HEIGHT}
                    </span>

                </div>

                <div
                    class="simulation-workspace"
                    style="
                    min-height:720px;
                    overflow:auto;
                    "
                >

                    ${createWorkspaceCanvas(type)}

                </div>

                <p
                    style="
                    color:#64748b;
                    font-size:.78rem;
                    margin:8px 0 0;
                    "
                >
                    Android : utilisez deux doigts pour zoomer
                    et déplacer visuellement la zone de travail.
                </p>

            </div>
            `;


        drawLaboratoryCanvas(type);

        updateMeasurementResult();

    }


    /* ============================================================
       13 — MESURAGE
       ============================================================ */

    function updateMeasurementResult() {

        const result =
            $("measurementResult");


        if (!result) {
            return;
        }


        const area =
            state.work.roomLength *
            state.work.roomWidth;


        const tileArea =
            state.work.tileLength *
            state.work.tileWidth;


        if (
            area <= 0 ||
            tileArea <= 0
        ) {

            result.innerHTML =
                "Dimensions invalides.";

            return;
        }


        const exactTiles =
            area /
            tileArea;


        const requiredTiles =
            Math.ceil(
                exactTiles *
                (
                    1 +
                    state.work.wastePercent /
                    100
                )
            );


        result.innerHTML =
            `
            <strong>
                Surface :
            </strong>
            ${area.toFixed(2)} m²

            <br>

            <strong>
                Surface d'un carreau :
            </strong>
            ${tileArea.toFixed(3)} m²

            <br>

            <strong>
                Quantité théorique :
            </strong>
            ${Math.ceil(exactTiles)} carreaux

            <br>

            <strong>
                Avec ${state.work.wastePercent}% de réserve :
            </strong>
            ${requiredTiles} carreaux
            `;
    }


    function validateMeasurement() {

        const area =
            state.work.roomLength *
            state.work.roomWidth;


        if (
            state.work.roomLength <= 0 ||
            state.work.roomWidth <= 0
        ) {

            addError(
                "danger",
                "Mesurage invalide",
                "Les dimensions doivent être supérieures à zéro."
            );

            return;
        }


        state.competencies.Mesurage =
            clamp(
                state.competencies.Mesurage + 15,
                0,
                100
            );


        saveState();

        renderDashboard();

        renderEvaluation();

        setStatus(
            `Mesurage validé : ${area.toFixed(2)} m².`
        );
    }


    /* ============================================================
       14 — PRÉPARATION
       ============================================================ */

    function validatePreparation() {

        if (
            state.work.roomLength <= 0 ||
            state.work.roomWidth <= 0
        ) {

            addError(
                "danger",
                "Préparation impossible",
                "Les dimensions de la zone doivent être valides."
            );

            return;
        }


        state.competencies.Sécurité =
            clamp(
                state.competencies.Sécurité + 10,
                0,
                100
            );


        saveState();

        renderDashboard();

        renderEvaluation();

        setStatus(
            "Préparation du chantier contrôlée."
        );
    }


    /* ============================================================
       15 — TRAÇAGE
       ============================================================ */

    function traceAction(action) {

        switch (action) {

            case "axis-x":

                state.work.traceAxes.x =
                    !state.work.traceAxes.x;

                state.competencies.Traçage =
                    clamp(
                        state.competencies.Traçage + 8,
                        0,
                        100
                    );

                break;


            case "axis-y":

                state.work.traceAxes.y =
                    !state.work.traceAxes.y;

                state.competencies.Traçage =
                    clamp(
                        state.competencies.Traçage + 8,
                        0,
                        100
                    );

                break;


            case "grid":

                state.work.traceAxes.grid =
                    !state.work.traceAxes.grid;

                state.competencies.Traçage =
                    clamp(
                        state.competencies.Traçage + 5,
                        0,
                        100
                    );

                break;


            case "reset":

                state.work.traceAxes = {
                    x: false,
                    y: false,
                    grid: false
                };

                break;

        }


        saveState();

        renderWorkspace(
            "tracage"
        );

        renderDashboard();

        renderEvaluation();

        setStatus(
            "Repères de traçage mis à jour."
        );
    }


    /* ============================================================
       16 — DÉCOUPE
       ============================================================ */

    function cutAction(type) {

        state.work.cutCount++;

        state.competencies.Découpe =
            clamp(
                state.competencies.Découpe + 8,
                0,
                100
            );


        saveState();


        renderWorkspace(
            "decoupe"
        );


        const result =
            $("cutResult");


        if (result) {

            result.textContent =
                `Découpe ${type} réalisée. `
                + `Nombre total : ${state.work.cutCount}.`;
        }


        renderDashboard();

        renderEvaluation();

        setStatus(
            `Découpe ${type} enregistrée.`
        );
    }


    /* ============================================================
       17 — POSE
       ============================================================ */

    function placementAction(action) {

        switch (action) {

            case "add":

                state.work.tilesPlaced++;

                state.competencies.Pose =
                    clamp(
                        state.competencies.Pose + 3,
                        0,
                        100
                    );

                break;


            case "remove":

                state.work.tilesPlaced =
                    Math.max(
                        0,
                        state.work.tilesPlaced - 1
                    );

                break;


            case "align":

                state.competencies.Traçage =
                    clamp(
                        state.competencies.Traçage + 8,
                        0,
                        100
                    );

                state.competencies.Pose =
                    clamp(
                        state.competencies.Pose + 5,
                        0,
                        100
                    );

                setStatus(
                    "Contrôle d'alignement effectué."
                );

                break;


            case "reset":

                state.work.tilesPlaced =
                    0;

                break;

        }


        saveState();

        renderWorkspace(
            "pose"
        );

        renderDashboard();

        renderEvaluation();

        const value =
            $("tilesPlacedValue");

        if (value) {
            value.textContent =
                state.work.tilesPlaced;
        }
    }


    /* ============================================================
       18 — SURFACES
       ============================================================ */

    function selectSurface(surface) {

        state.work.selectedSurface =
            surface;


        state.competencies.Pose =
            clamp(
                state.competencies.Pose + 3,
                0,
                100
            );


        saveState();

        renderWorkspace(
            "murs-surfaces"
        );

        renderDashboard();

        renderEvaluation();

        setStatus(
            `Surface sélectionnée : ${surface}.`
        );
    }


    /* ============================================================
       19 — CALCULATRICE PROFESSIONNELLE
       ============================================================ */

    function renderCalculator() {

        const container =
            $("professionalCalculatorWorkspace");


        if (!container) {
            return;
        }


        container.innerHTML =
            `
            <div class="calculator-panel">

                <h3>
                    Calculatrice Professionnelle
                </h3>

                <p>
                    Calculez la surface, la quantité estimative
                    de carreaux et le coût pédagogique.
                </p>

                <div
                    style="
                    display:grid;
                    grid-template-columns:
                    repeat(auto-fit,minmax(150px,1fr));
                    gap:10px;
                    "
                >

                    <label>
                        Longueur (m)

                        <input
                            id="calcLength"
                            type="number"
                            min="0"
                            step="0.01"
                            value="${state.work.roomLength}"
                        >
                    </label>

                    <label>
                        Largeur (m)

                        <input
                            id="calcWidth"
                            type="number"
                            min="0"
                            step="0.01"
                            value="${state.work.roomWidth}"
                        >
                    </label>

                    <label>
                        Carreau L (m)

                        <input
                            id="calcTileLength"
                            type="number"
                            min="0"
                            step="0.01"
                            value="${state.work.tileLength}"
                        >
                    </label>

                    <label>
                        Carreau l (m)

                        <input
                            id="calcTileWidth"
                            type="number"
                            min="0"
                            step="0.01"
                            value="${state.work.tileWidth}"
                        >
                    </label>

                    <label>
                        Réserve (%)

                        <input
                            id="calcWaste"
                            type="number"
                            min="0"
                            max="50"
                            step="1"
                            value="${state.work.wastePercent}"
                        >
                    </label>

                    <label>
                        Prix / carreau

                        <input
                            id="calcTilePrice"
                            type="number"
                            min="0"
                            step="1"
                            value="0"
                        >
                    </label>

                </div>


                <button
                    type="button"
                    class="primary-action-button"
                    data-run-calculation
                    style="margin-top:14px"
                >
                    Calculer
                </button>


                <div
                    id="calculatorResult"
                    class="lab-panel"
                    style="margin-top:14px"
                >
                    Entrez les données puis lancez le calcul.
                </div>

            </div>
            `;
    }


    function runProfessionalCalculation() {

        const length =
            Number(
                $("calcLength")?.value
            );

        const width =
            Number(
                $("calcWidth")?.value
            );

        const tileLength =
            Number(
                $("calcTileLength")?.value
            );

        const tileWidth =
            Number(
                $("calcTileWidth")?.value
            );

        const waste =
            Number(
                $("calcWaste")?.value
            );

        const price =
            Number(
                $("calcTilePrice")?.value
            );


        if (
            !(
                length > 0 &&
                width > 0 &&
                tileLength > 0 &&
                tileWidth > 0 &&
                waste >= 0
            )
        ) {

            setStatus(
                "Veuillez saisir des valeurs valides."
            );

            return;
        }


        const area =
            length * width;


        const tileArea =
            tileLength * tileWidth;


        const theoretical =
            area / tileArea;


        const quantity =
            Math.ceil(
                theoretical *
                (
                    1 +
                    waste / 100
                )
            );


        const total =
            quantity * price;


        const result =
            $("calculatorResult");


        if (result) {

            result.innerHTML =
                `
                <strong>
                    Surface :
                </strong>
                ${area.toFixed(2)} m²

                <br>

                <strong>
                    Surface d'un carreau :
                </strong>
                ${tileArea.toFixed(3)} m²

                <br>

                <strong>
                    Quantité théorique :
                </strong>
                ${Math.ceil(theoretical)}

                <br>

                <strong>
                    Quantité avec réserve :
                </strong>
                ${quantity}

                <br>

                <strong>
                    Coût estimatif des carreaux :
                </strong>
                ${total.toFixed(2)}

                <br><br>

                <small>
                    Ce calcul est une estimation pédagogique.
                    Le calepinage réel peut modifier les coupes
                    et les pertes.
                </small>
                `;
        }


        state.work.roomLength =
            length;

        state.work.roomWidth =
            width;

        state.work.tileLength =
            tileLength;

        state.work.tileWidth =
            tileWidth;

        state.work.wastePercent =
            waste;


        state.competencies.Mesurage =
            clamp(
                state.competencies.Mesurage + 5,
                0,
                100
            );


        saveState();

        renderDashboard();

        renderEvaluation();

        setStatus(
            "Calcul professionnel effectué."
        );
    }


    /* ============================================================
       20 — MISSIONS
       ============================================================ */

    function renderMissions() {

        const list =
            $("missionsList");

        const workspace =
            $("missionWorkspace");


        if (!list) {
            return;
        }


        list.innerHTML =
            state.missions
                .map(
                    mission =>
                        `
                        <article class="mission-card">

                            <div
                                class="mission-card-image"
                            >

                                <svg
                                    class="fobas-svg-object"
                                    viewBox="0 0 240 140"
                                    xmlns="http://www.w3.org/2000/svg"
                                >

                                    <defs>

                                        <linearGradient
                                            id="missionGradient${escapeHTML(mission.id)}"
                                            x1="0"
                                            y1="0"
                                            x2="1"
                                            y2="1"
                                        >

                                            <stop
                                                offset="0%"
                                                stop-color="#ffffff"
                                            />

                                            <stop
                                                offset="100%"
                                                stop-color="#bae6fd"
                                            />

                                        </linearGradient>

                                    </defs>

                                    <ellipse
                                        cx="120"
                                        cy="118"
                                        rx="75"
                                        ry="10"
                                        fill="#64748b"
                                        opacity=".20"
                                    />

                                    <rect
                                        x="38"
                                        y="25"
                                        width="164"
                                        height="82"
                                        rx="8"
                                        fill="url(#missionGradient${escapeHTML(mission.id)})"
                                        stroke="#475569"
                                        stroke-width="3"
                                    />

                                    <path
                                        d="M50 45H190"
                                        stroke="#94a3b8"
                                        stroke-width="2"
                                    />

                                    <path
                                        d="M50 68H190"
                                        stroke="#94a3b8"
                                        stroke-width="2"
                                    />

                                    <path
                                        d="M90 25V107"
                                        stroke="#94a3b8"
                                        stroke-width="2"
                                    />

                                    <path
                                        d="M145 25V107"
                                        stroke="#94a3b8"
                                        stroke-width="2"
                                    />

                                </svg>

                            </div>

                            <div
                                class="mission-card-content"
                            >

                                <span class="status-badge info">
                                    ${escapeHTML(mission.difficulty)}
                                </span>

                                <h3>
                                    ${escapeHTML(mission.title)}
                                </h3>

                                <p>
                                    ${escapeHTML(mission.description)}
                                </p>

                                <button
                                    type="button"
                                    class="primary-action-button"
                                    data-start-mission="${escapeHTML(mission.id)}"
                                >
                                    Commencer
                                </button>

                            </div>

                        </article>
                        `
                )
                .join("");


        if (
            workspace &&
            state.selectedMission
        ) {

            const mission =
                state.missions.find(
                    item =>
                        item.id ===
                        state.selectedMission
                );


            if (mission) {

                workspace.hidden =
                    false;

                workspace.innerHTML =
                    `
                    <div class="lab-panel">

                        <span class="status-badge success">
                            MISSION ACTIVE
                        </span>

                        <h3>
                            ${escapeHTML(mission.title)}
                        </h3>

                        <p>
                            ${escapeHTML(mission.description)}
                        </p>

                        <div
                            style="
                            display:flex;
                            flex-wrap:wrap;
                            gap:8px;
                            "
                        >

                            <button
                                type="button"
                                class="primary-action-button"
                                data-complete-mission="${escapeHTML(mission.id)}"
                            >
                                Terminer la mission
                            </button>

                            <button
                                type="button"
                                class="lab-tool-button"
                                data-cancel-mission
                            >
                                Fermer
                            </button>

                        </div>

                    </div>
                    `;

            }

        } else if (workspace) {

            workspace.hidden =
                true;
        }
    }


    function startMission(id) {

        const exists =
            state.missions.some(
                mission =>
                    mission.id === id
            );


        if (!exists) {
            return;
        }


        state.selectedMission =
            id;


        saveState();

        renderMissions();

        setStatus(
            "Mission démarrée."
        );
    }


    function completeMission(id) {

        const mission =
            state.missions.find(
                item =>
                    item.id === id
            );


        if (!mission) {
            return;
        }


        state.progress.completedMissions++;


        state.competencies.Pose =
            clamp(
                state.competencies.Pose + 10,
                0,
                100
            );


        state.competencies.Sécurité =
            clamp(
                state.competencies.Sécurité + 5,
                0,
                100
            );


        state.selectedMission =
            null;


        saveState();

        renderMissions();

        renderDashboard();

        renderEvaluation();

        setStatus(
            `Mission "${mission.title}" terminée.`
        );
    }


    /* ============================================================
       21 — CONTRÔLE QUALITÉ
       ============================================================ */

    function renderQualityControl() {

        const container =
            $("qualityControlWorkspace");


        if (!container) {
            return;
        }


        container.innerHTML =
            `
            <div class="lab-panel">

                <h3>
                    Contrôle & Qualité
                </h3>

                <p>
                    Ajustez les indicateurs puis lancez
                    le contrôle pédagogique.
                </p>

                <div
                    style="
                    display:grid;
                    gap:12px;
                    "
                >

                    <label>
                        Planéité

                        <input
                            id="qualityPlaneity"
                            type="range"
                            min="0"
                            max="100"
                            value="${state.competencies.Pose}"
                        >

                    </label>

                    <label>
                        Alignement

                        <input
                            id="qualityAlignment"
                            type="range"
                            min="0"
                            max="100"
                            value="${state.competencies.Traçage}"
                        >

                    </label>

                    <label>
                        Joints

                        <input
                            id="qualityJoints"
                            type="range"
                            min="0"
                            max="100"
                            value="${state.competencies.Jointoiement}"
                        >

                    </label>

                </div>


                <button
                    type="button"
                    class="primary-action-button"
                    data-quality-check
                    style="margin-top:14px"
                >
                    Lancer le contrôle
                </button>


                <div
                    id="qualityResult"
                    class="lab-panel"
                    style="margin-top:14px"
                >
                    Contrôle non lancé.
                </div>

            </div>
            `;
    }


    function runQualityControl() {

        const planeity =
            Number(
                $("qualityPlaneity")?.value || 0
            );

        const alignment =
            Number(
                $("qualityAlignment")?.value || 0
            );

        const joints =
            Number(
                $("qualityJoints")?.value || 0
            );


        const average =
            Math.round(
                (
                    planeity +
                    alignment +
                    joints
                ) / 3
            );


        if (
            average < 60
        ) {

            addError(
                "danger",
                "Qualité insuffisante",
                "Plusieurs contrôles doivent être repris avant validation."
            );

        } else if (
            average < 80
        ) {

            addError(
                "warning",
                "Qualité à améliorer",
                "Le résultat nécessite encore des corrections."
            );

        } else {

            addError(
                "success",
                "Contrôle satisfaisant",
                "Les indicateurs de cette simulation sont conformes au seuil pédagogique."
            );
        }


        state.competencies.Pose =
            Math.max(
                state.competencies.Pose,
                average
            );


        state.competencies.Jointoiement =
            Math.max(
                state.competencies.Jointoiement,
                joints
            );


        saveState();


        const result =
            $("qualityResult");


        if (result) {

            result.innerHTML =
                `
                <strong>
                    Résultat :
                    ${average} %
                </strong>

                <p>
                    ${
                        average >= 80
                            ? "Contrôle satisfaisant dans cette simulation."
                            : "Des points doivent être corrigés avant validation."
                    }
                </p>
                `;
        }


        renderDashboard();

        renderErrors();

        renderEvaluation();

        setStatus(
            "Contrôle qualité terminé."
        );
    }


    /* ============================================================
       22 — ANALYSE DES ERREURS
       ============================================================ */

    function renderErrors() {

        const container =
            $("errorAnalysisWorkspace");


        if (!container) {
            return;
        }


        if (!state.errors.length) {

            container.innerHTML =
                `
                <div class="lab-panel">

                    <strong>
                        Aucune erreur enregistrée.
                    </strong>

                    <p>
                        Les contrôles effectués dans les différents
                        laboratoires alimenteront automatiquement
                        cette section.
                    </p>

                </div>
                `;

            return;
        }


        container.innerHTML =
            state.errors
                .map(
                    error =>
                        `
                        <div
                            class="error-item ${escapeHTML(error.type)}"
                        >

                            <strong>
                                ${escapeHTML(error.title)}
                            </strong>

                            <p>
                                ${escapeHTML(error.text)}
                            </p>

                        </div>
                        `
                )
                .join("");
    }


    function addError(
        type,
        title,
        text
    ) {

        state.errors.unshift({

            id:
                createId("error"),

            type,

            title,

            text,

            createdAt:
                new Date().toISOString()

        });


        state.errors =
            state.errors.slice(
                0,
                30
            );


        saveState();

        renderErrors();
    }


    /* ============================================================
       23 — ÉVALUATION DES COMPÉTENCES
       ============================================================ */

    function calculateCompetencyAverage() {

        const values =
            Object.values(
                state.competencies
            );


        if (!values.length) {
            return 0;
        }


        return Math.round(
            values.reduce(
                (sum, value) =>
                    sum + Number(value || 0),
                0
            ) / values.length
        );
    }


    function renderEvaluation() {

        const container =
            $("competencyEvaluationWorkspace");


        if (!container) {
            return;
        }


        const average =
            calculateCompetencyAverage();


        container.innerHTML =
            `
            <div class="evaluation-score-card">

                <div>
                    Indice global de compétences
                </div>

                <div class="evaluation-score">
                    ${average}%
                </div>

                <div class="progress-track">

                    <div
                        class="progress-value"
                        style="width:${average}%"
                    ></div>

                </div>

                <div
                    style="
                    display:grid;
                    gap:10px;
                    margin-top:18px;
                    "
                >

                    ${
                        Object.entries(
                            state.competencies
                        )
                            .map(
                                ([name, value]) =>
                                    `
                                    <div>

                                        <div
                                            style="
                                            display:flex;
                                            justify-content:space-between;
                                            "
                                        >

                                            <strong>
                                                ${escapeHTML(name)}
                                            </strong>

                                            <span>
                                                ${clamp(value,0,100)}%
                                            </span>

                                        </div>

                                        <div
                                            class="progress-track"
                                        >

                                            <div
                                                class="progress-value"
                                                style="
                                                width:${clamp(value,0,100)}%
                                                "
                                            ></div>

                                        </div>

                                    </div>
                                    `
                            )
                            .join("")
                    }

                </div>


                <button
                    type="button"
                    class="primary-action-button"
                    data-refresh-evaluation
                    style="margin-top:18px"
                >
                    Actualiser l'évaluation
                </button>

            </div>
            `;
    }


    /* ============================================================
       24 — ÉCOUTE VOCALE
       ============================================================ */

    function speakText(text) {

        if (
            !(
                "speechSynthesis" in
                window
            )
        ) {

            setStatus(
                "La synthèse vocale n'est pas disponible sur cet appareil."
            );

            return;
        }


        window.speechSynthesis.cancel();


        const utterance =
            new SpeechSynthesisUtterance(
                text
            );


        utterance.lang =
            "fr-FR";

        utterance.rate =
            0.95;

        utterance.pitch =
            1;


        window.speechSynthesis.speak(
            utterance
        );
    }


    /* ============================================================
       25 — GESTION DU MENU MOBILE
       ============================================================ */

    function initializeMobileMenu() {

        const toggle =
            $("mainMenuToggle");

        const navigation =
            $("mainNavigation");


        if (!toggle || !navigation) {
            return;
        }


        toggle.addEventListener(
            "click",
            () => {

                const open =
                    navigation.dataset.mobileOpen ===
                    "true";


                navigation.dataset.mobileOpen =
                    String(!open);


                toggle.setAttribute(
                    "aria-expanded",
                    String(!open)
                );


                if (
                    window.innerWidth <= 640
                ) {

                    navigation.style.display =
                        open
                            ? ""
                            : "flex";
                }

            }
        );

    }


    /* ============================================================
       26 — PINCH ZOOM ANDROID
       ============================================================ */

    function initializePinchZoom() {

        const activeTouches =
            new WeakMap();


        document.addEventListener(
            "touchstart",
            event => {

                const canvas =
                    event.target.closest(
                        ".laboratory-canvas"
                    );


                if (!canvas) {
                    return;
                }


                if (
                    event.touches.length === 2
                ) {

                    const first =
                        event.touches[0];

                    const second =
                        event.touches[1];


                    const distance =
                        Math.hypot(
                            first.clientX -
                            second.clientX,

                            first.clientY -
                            second.clientY
                        );


                    activeTouches.set(
                        canvas,
                        {
                            initialDistance:
                                distance,

                            scale:
                                1
                        }
                    );

                }

            },
            {
                passive: true
            }
        );


        document.addEventListener(
            "touchmove",
            event => {

                const canvas =
                    event.target.closest(
                        ".laboratory-canvas"
                    );


                if (
                    !canvas ||
                    event.touches.length !== 2
                ) {
                    return;
                }


                const data =
                    activeTouches.get(
                        canvas
                    );


                if (!data) {
                    return;
                }


                const first =
                    event.touches[0];

                const second =
                    event.touches[1];


                const distance =
                    Math.hypot(
                        first.clientX -
                        second.clientX,

                        first.clientY -
                        second.clientY
                    );


                const scale =
                    clamp(
                        data.scale *
                        (
                            distance /
                            data.initialDistance
                        ),

                        0.35,

                        4
                    );


                canvas.style.transform =
                    `scale(${scale})`;

                canvas.style.transformOrigin =
                    "center center";


                event.preventDefault();

            },
            {
                passive: false
            }
        );


        document.addEventListener(
            "touchend",
            event => {

                const canvas =
                    event.target.closest(
                        ".laboratory-canvas"
                    );


                if (!canvas) {
                    return;
                }


                if (
                    event.touches.length < 2
                ) {

                    activeTouches.delete(
                        canvas
                    );
                }

            },
            {
                passive: true
            }
        );

    }


    /* ============================================================
       27 — CHAMPS DE TRAVAIL
       ============================================================ */

    function updateWorkField(
        field,
        value
    ) {

        const number =
            Number(value);


        if (
            !Number.isFinite(number)
        ) {
            return;
        }


        switch (field) {

            case "roomLength":

                state.work.roomLength =
                    Math.max(
                        0.1,
                        number
                    );

                break;


            case "roomWidth":

                state.work.roomWidth =
                    Math.max(
                        0.1,
                        number
                    );

                break;


            case "tileLength":

                state.work.tileLength =
                    Math.max(
                        0.01,
                        number
                    );

                break;


            case "tileWidth":

                state.work.tileWidth =
                    Math.max(
                        0.01,
                        number
                    );

                break;


            case "wastePercent":

                state.work.wastePercent =
                    clamp(
                        number,
                        0,
                        50
                    );

                break;

        }


        saveState();


        updateMeasurementResult();


        [
            "preparation",
            "mesurage",
            "tracage",
            "pose",
            "murs-surfaces"
        ]
            .forEach(
                type => {

                    const canvas =
                        document.querySelector(
                            `[data-laboratory-canvas="${type}"]`
                        );

                    if (canvas) {
                        canvas.innerHTML =
                            createRoomSVG(type);
                    }

                }
            );
    }


    /* ============================================================
       28 — ÉVÉNEMENTS
       ============================================================ */

    function bindEvents() {

        document.addEventListener(
            "click",
            event => {

                const navigationButton =
                    event.target.closest(
                        "#mainNavigation [data-section]"
                    );


                if (navigationButton) {

                    showSection(
                        navigationButton.dataset.section
                    );

                    return;
                }


                const modeButton =
                    event.target.closest(
                        "[data-pedagogical-mode]"
                    );


                if (modeButton) {

                    state.pedagogicalMode =
                        modeButton.dataset.pedagogicalMode;

                    saveState();

                    renderPedagogy();

                    setStatus(
                        `Mode pédagogique : ${state.pedagogicalMode}.`
                    );

                    return;
                }


                const chapterButton =
                    event.target.closest(
                        "[data-chapter-id]"
                    );


                if (chapterButton) {

                    state.selectedChapter =
                        chapterButton.dataset.chapterId;

                    saveState();

                    renderPedagogy();

                    return;
                }


                if (
                    event.target.closest(
                        "#addChapterButton"
                    )
                ) {

                    addChapter();

                    return;
                }


                const completeModuleButton =
                    event.target.closest(
                        "[data-complete-module]"
                    );


                if (completeModuleButton) {

                    completeModule(
                        completeModuleButton.dataset.completeModule
                    );

                    return;
                }


                const exerciseButton =
                    event.target.closest(
                        "[data-exercise]"
                    );


                if (exerciseButton) {

                    completeExercise();

                    return;
                }


                const assignmentButton =
                    event.target.closest(
                        "[data-submit-assignment]"
                    );


                if (assignmentButton) {

                    submitAssignment(
                        assignmentButton.dataset.submitAssignment
                    );

                    return;
                }


                const evaluationChapterButton =
                    event.target.closest(
                        "[data-evaluate-chapter]"
                    );


                if (evaluationChapterButton) {

                    evaluateChapter(
                        evaluationChapterButton.dataset.evaluateChapter
                    );

                    return;
                }


                const libraryCategory =
                    event.target.closest(
                        "[data-library-category]"
                    );


                if (libraryCategory) {

                    state.libraryCategory =
                        libraryCategory.dataset.libraryCategory;

                    saveState();

                    renderLibrary();

                    return;
                }


                const libraryDetail =
                    event.target.closest(
                        "[data-library-detail]"
                    );


                if (libraryDetail) {

                    showLibraryDetail(
                        Number(
                            libraryDetail.dataset.libraryDetail
                        )
                    );

                    return;
                }


                if (
                    event.target.closest(
                        "[data-close-library]"
                    )
                ) {

                    const panel =
                        $("libraryDetailPanel");

                    if (panel) {
                        panel.hidden =
                            true;
                    }

                    return;
                }


                const preparationCheck =
                    event.target.closest(
                        "[data-preparation-check]"
                    );


                if (preparationCheck) {

                    validatePreparation();

                    return;
                }


                const measurementCheck =
                    event.target.closest(
                        "[data-measurement-check]"
                    );


                if (measurementCheck) {

                    validateMeasurement();

                    return;
                }


                const trace =
                    event.target.closest(
                        "[data-trace-action]"
                    );


                if (trace) {

                    traceAction(
                        trace.dataset.traceAction
                    );

                    return;
                }


                const cut =
                    event.target.closest(
                        "[data-cut-action]"
                    );


                if (cut) {

                    cutAction(
                        cut.dataset.cutAction
                    );

                    return;
                }


                const placement =
                    event.target.closest(
                        "[data-placement-action]"
                    );


                if (placement) {

                    placementAction(
                        placement.dataset.placementAction
                    );

                    return;
                }


                const surface =
                    event.target.closest(
                        "[data-surface-type]"
                    );


                if (surface) {

                    selectSurface(
                        surface.dataset.surfaceType
                    );

                    return;
                }


                const calculation =
                    event.target.closest(
                        "[data-run-calculation]"
                    );


                if (calculation) {

                    runProfessionalCalculation();

                    return;
                }


                const mission =
                    event.target.closest(
                        "[data-start-mission]"
                    );


                if (mission) {

                    startMission(
                        mission.dataset.startMission
                    );

                    return;
                }


                const completeMissionButton =
                    event.target.closest(
                        "[data-complete-mission]"
                    );


                if (completeMissionButton) {

                    completeMission(
                        completeMissionButton.dataset.completeMission
                    );

                    return;
                }


                if (
                    event.target.closest(
                        "[data-cancel-mission]"
                    )
                ) {

                    state.selectedMission =
                        null;

                    saveState();

                    renderMissions();

                    setStatus(
                        "Mission fermée."
                    );

                    return;
                }


                const quality =
                    event.target.closest(
                        "[data-quality-check]"
                    );


                if (quality) {

                    runQualityControl();

                    return;
                }


                if (
                    event.target.closest(
                        "[data-refresh-evaluation]"
                    )
                ) {

                    renderEvaluation();

                    setStatus(
                        "Évaluation actualisée."
                    );

                    return;
                }


                if (
                    event.target.closest(
                        "#startLaboratoryButton"
                    )
                ) {

                    showSection(
                        "pedagogique"
                    );

                    return;
                }

            }
        );


        document.addEventListener(
            "input",
            event => {

                const field =
                    event.target.dataset.workField;


                if (field) {

                    updateWorkField(
                        field,
                        event.target.value
                    );

                    return;
                }


                if (
                    event.target.id ===
                    "dictionarySearch"
                ) {

                    renderDictionary();

                }

            }
        );


        document.addEventListener(
            "change",
            event => {

                const field =
                    event.target.dataset.workField;


                if (field) {

                    updateWorkField(
                        field,
                        event.target.value
                    );

                }

            }
        );

    }


    /* ============================================================
       29 — INITIALISATION
       ============================================================ */

    function renderAll() {

        createDictionarySection();

        renderDashboard();

        renderPedagogy();

        renderDictionary();

        renderLibrary();

        renderWorkspace(
            "preparation"
        );

        renderWorkspace(
            "mesurage"
        );

        renderWorkspace(
            "tracage"
        );

        renderWorkspace(
            "decoupe"
        );

        renderWorkspace(
            "pose"
        );

        renderWorkspace(
            "murs-surfaces"
        );

        renderCalculator();

        renderQualityControl();

        renderMissions();

        renderErrors();

        renderEvaluation();

        showSection(
            state.section,
            false
        );

        saveState();
    }


    function initialize() {

        bindEvents();

        initializeMobileMenu();

        initializePinchZoom();

        renderAll();

        setStatus(
            "Laboratoire prêt — données sauvegardées localement."
        );

    }


    return {

        initialize,

        renderAll,

        showSection

    };

})();


/* ================================================================
   DÉMARRAGE
   ================================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        FOBAS_TILE.initialize();

    }
);