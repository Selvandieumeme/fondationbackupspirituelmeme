/* ================================================================
   FOBAS — PÉDAGOGIQUE ÉLECTRONIQUE & ROBOTIQUE
   JAVASCRIPT PRINCIPAL
   VERSION : 1.0.0

   ARCHITECTURE :
   - Moteur pédagogique dynamique
   - Chapitres extensibles
   - Chapitre 1 complet
   - SVG 3D natif
   - Aucun Three.js
   - Aucun framework externe
   - Préparé pour Chapitre 2, 3, 4...
================================================================ */


/* ================================================================
   01 — CONFIGURATION GÉNÉRALE
================================================================ */

const FOBAS_PEDAGOGICAL_CONFIG = {

    simulationURL:
        "https://fondationbackupspirituel.com/simulationelectroniquesfobas.html",

    storageKey:
        "FOBAS_ELECTRONIQUE_PEDAGOGIQUE_STATE",

    defaultChapter:
        "chapitre-1",

    language:
        "fr",

    version:
        "1.0.0"
};


/* ================================================================
   02 — ÉTAT GLOBAL
================================================================ */

const FOBAS_PEDAGOGICAL_STATE = {

    currentChapterId:
        null,

    currentView:
        "welcome",

    initialized:
        false

};


/* ================================================================
   03 — RÉFÉRENCES DOM
================================================================ */

const dom = {};

function cacheDOM() {

    dom.app =
        document.getElementById(
            "fobasPedagogicalApp"
        );

    dom.header =
        document.getElementById(
            "fobasPedagogicalHeader"
        );

    dom.toolbar =
        document.getElementById(
            "pedagogicalToolbar"
        );

    dom.main =
        document.getElementById(
            "pedagogicalMain"
        );

    dom.welcome =
        document.getElementById(
            "pedagogicalWelcome"
        );

    dom.welcomeVisual =
        document.getElementById(
            "welcomeVisual"
        );

    dom.chaptersWorkspace =
        document.getElementById(
            "chaptersWorkspace"
        );

    dom.chaptersList =
        document.getElementById(
            "chaptersList"
        );

    dom.chapterWorkspace =
        document.getElementById(
            "chapterContentWorkspace"
        );

    dom.chapterHeader =
        document.getElementById(
            "chapterHeader"
        );

    dom.chapterVisual =
        document.getElementById(
            "chapterVisual"
        );

    dom.chapterSections =
        document.getElementById(
            "chapterSections"
        );

    dom.theorieContent =
        document.getElementById(
            "theorieContent"
        );

    dom.pratiqueContent =
        document.getElementById(
            "pratiqueContent"
        );

    dom.exerciceContent =
        document.getElementById(
            "exerciceContent"
        );

    dom.devoirContent =
        document.getElementById(
            "devoirContent"
        );

    dom.chapterCounter =
        document.getElementById(
            "chapterCounter"
        );

    dom.learningStatus =
        document.getElementById(
            "learningStatus"
        );

    dom.loading =
        document.getElementById(
            "pedagogicalLoading"
        );

    dom.error =
        document.getElementById(
            "pedagogicalError"
        );

    dom.errorMessage =
        document.getElementById(
            "pedagogicalErrorMessage"
        );

    dom.homeBtn =
        document.getElementById(
            "homeBtn"
        );

    dom.chaptersBtn =
        document.getElementById(
            "chaptersBtn"
        );

    dom.backToSimulationBtn =
        document.getElementById(
            "backToSimulationBtn"
        );

    dom.startLearningBtn =
        document.getElementById(
            "startLearningBtn"
        );

    dom.previousChapterBtn =
        document.getElementById(
            "previousChapterBtn"
        );

    dom.allChaptersBtn =
        document.getElementById(
            "allChaptersBtn"
        );

    dom.nextChapterBtn =
        document.getElementById(
            "nextChapterBtn"
        );

    dom.retryBtn =
        document.getElementById(
            "retryPedagogicalBtn"
        );
}


/* ================================================================
   04 — OUTILS
================================================================ */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function showLoading(show = true) {

    if (!dom.loading) {
        return;
    }

    dom.loading.hidden = !show;
}


function showError(message) {

    if (!dom.error) {
        return;
    }

    if (dom.errorMessage) {

        dom.errorMessage.textContent =
            message ||
            "Une erreur est survenue.";
    }

    dom.error.hidden = false;
}


function hideError() {

    if (dom.error) {
        dom.error.hidden = true;
    }
}


function scrollToTop() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ================================================================
   05 — STRUCTURE PÉDAGOGIQUE
   ---------------------------------------------------------------
   IMPORTANT :
   Pour ajouter un nouveau chapitre, il suffit d'ajouter un nouvel
   objet dans FOBAS_CHAPTERS.
================================================================ */

const FOBAS_CHAPTERS = [

    /* ============================================================
       CHAPITRE 1
    ============================================================ */

    {

        id:
            "chapitre-1",

        number:
            1,

        title:
            "Les bases de l'Électronique et de la Robotique",

        shortTitle:
            "Bases de l'Électronique & Robotique",

        subtitle:
            "Comprendre les principes fondamentaux avant de construire un système électronique ou robotique.",

        description:
            "Ce premier chapitre introduit les grandeurs électriques, les composants fondamentaux, le circuit électrique, les capteurs, les actionneurs et le rôle du contrôleur dans un système robotique.",

        keywords: [

            {
                fr: "Tension",
                en: "Voltage"
            },

            {
                fr: "Courant",
                en: "Current"
            },

            {
                fr: "Résistance",
                en: "Resistance"
            },

            {
                fr: "Puissance",
                en: "Power"
            },

            {
                fr: "Circuit électrique",
                en: "Electrical Circuit"
            },

            {
                fr: "Capteur",
                en: "Sensor"
            },

            {
                fr: "Actionneur",
                en: "Actuator"
            },

            {
                fr: "Microcontrôleur",
                en: "Microcontroller"
            },

            {
                fr: "Commande",
                en: "Control"
            },

            {
                fr: "Alimentation",
                en: "Power Supply"
            }

        ],

        theorie: {

            introduction:
                "L'électronique est l'étude et l'utilisation des composants et des circuits permettant de contrôler, mesurer, transformer et traiter des signaux électriques. La robotique utilise ces principes pour donner à une machine la capacité de percevoir son environnement, de prendre des décisions et d'effectuer des actions.",

            sections: [

                {

                    title:
                        "1. Qu'est-ce que l'électronique ?",

                    paragraphs: [

                        "L'électronique repose sur la circulation et le contrôle de l'énergie électrique et des signaux électriques à travers différents composants.",

                        "Un système électronique peut recevoir une alimentation, traiter une information et produire une action. Les composants sont reliés entre eux pour former un circuit fonctionnel."

                    ]

                },

                {

                    title:
                        "2. Les quatre grandeurs fondamentales",

                    paragraphs: [

                        "<strong>Tension (Voltage)</strong> : différence de potentiel électrique entre deux points. Elle s'exprime en volt (V).",

                        "<strong>Courant (Current)</strong> : déplacement de charges électriques dans un circuit. Il s'exprime en ampère (A).",

                        "<strong>Résistance (Resistance)</strong> : opposition au passage du courant électrique. Elle s'exprime en ohm (Ω).",

                        "<strong>Puissance (Power)</strong> : quantité d'énergie électrique transférée ou consommée par unité de temps. Elle s'exprime en watt (W)."

                    ]

                },

                {

                    title:
                        "3. La loi d'Ohm",

                    paragraphs: [

                        "La relation fondamentale entre la tension, le courant et la résistance est donnée par la loi d'Ohm.",

                        "<strong>U = R × I</strong>",

                        "Avec U représentant la tension en volts, R la résistance en ohms et I le courant en ampères.",

                        "Cette relation permet de déterminer une grandeur lorsque les deux autres sont connues."

                    ]

                },

                {

                    title:
                        "4. Le circuit électrique",

                    paragraphs: [

                        "Un circuit électrique doit permettre au courant de circuler dans une boucle conductrice entre une source d'énergie et les composants.",

                        "Un circuit élémentaire peut contenir une source d'alimentation, des conducteurs, un interrupteur et une charge telle qu'une lampe ou une LED.",

                        "Une coupure dans le chemin électrique peut empêcher le fonctionnement du circuit."

                    ]

                },

                {

                    title:
                        "5. Les composants électroniques fondamentaux",

                    paragraphs: [

                        "<strong>Résistance (Resistor)</strong> : limite ou contrôle le courant.",

                        "<strong>LED (Light Emitting Diode)</strong> : produit de la lumière lorsqu'elle est correctement alimentée.",

                        "<strong>Condensateur (Capacitor)</strong> : stocke temporairement de l'énergie électrique.",

                        "<strong>Diode (Diode)</strong> : favorise la circulation du courant dans un sens déterminé.",

                        "<strong>Interrupteur (Switch)</strong> : permet d'ouvrir ou de fermer un circuit.",

                        "<strong>Transistor (Transistor)</strong> : peut être utilisé comme commutateur électronique ou élément d'amplification."

                    ]

                },

                {

                    title:
                        "6. Introduction à la robotique",

                    paragraphs: [

                        "Un robot est un système capable d'exécuter des actions à partir d'informations provenant de son environnement ou d'un programme.",

                        "Un système robotique élémentaire peut être représenté par quatre fonctions : alimentation, perception, traitement et action.",

                        "<strong>Capteur (Sensor)</strong> : recueille une information.",

                        "<strong>Contrôleur (Controller)</strong> : traite l'information selon une logique programmée.",

                        "<strong>Actionneur (Actuator)</strong> : transforme une commande en action physique."

                    ]

                },

                {

                    title:
                        "7. Le rôle du microcontrôleur",

                    paragraphs: [

                        "Un <strong>microcontrôleur (Microcontroller)</strong> est un circuit programmable capable de lire des entrées, exécuter un programme et commander des sorties.",

                        "Dans un robot, il peut recevoir l'information d'un capteur de distance, décider de ralentir puis commander un moteur.",

                        "Le microcontrôleur constitue donc une interface essentielle entre la perception, le traitement et l'action."

                    ]

                }

            ]

        },


        pratique: {

            introduction:
                "La pratique consiste à identifier les éléments d'un petit système électronique et à comprendre leur rôle avant de réaliser des montages plus complexes.",

            steps: [

                {

                    number:
                        1,

                    title:
                        "Identifier l'alimentation",

                    description:
                        "Repérez la source d'énergie et vérifiez sa tension nominale avant de connecter les composants."

                },

                {

                    number:
                        2,

                    title:
                        "Identifier les composants",

                    description:
                        "Distinguez la résistance, la LED, les fils conducteurs et l'interrupteur."

                },

                {

                    number:
                        3,

                    title:
                        "Former le circuit",

                    description:
                        "Reliez les composants de manière à créer une boucle électrique complète."

                },

                {

                    number:
                        4,

                    title:
                        "Vérifier la polarité",

                    description:
                        "Avant l'alimentation, vérifiez les bornes positives et négatives lorsque les composants sont polarisés."

                },

                {

                    number:
                        5,

                    title:
                        "Observer le fonctionnement",

                    description:
                        "Fermez le circuit et observez le comportement de la charge. Une LED correctement montée doit produire de la lumière."

                },

                {

                    number:
                        6,

                    title:
                        "Relier l'idée à la robotique",

                    description:
                        "Remplacez mentalement l'interrupteur par une commande électronique et la charge par un actionneur. Vous obtenez le principe général d'un système robotique commandé."

                }

            ],

            objective:
                "À la fin de cette pratique, l'apprenant doit être capable d'identifier les principaux éléments d'un circuit simple et d'expliquer le chemin entre alimentation, commande et action."

        },


        exercice: {

            introduction:
                "Répondez aux questions suivantes en utilisant les notions étudiées dans la théorie.",

            questions: [

                {
                    number: 1,
                    question:
                        "Quelle est l'unité de mesure de la tension électrique ?"
                },

                {
                    number: 2,
                    question:
                        "Quelle est l'unité de mesure du courant électrique ?"
                },

                {
                    number: 3,
                    question:
                        "Quel composant limite généralement le courant dans un circuit ?"
                },

                {
                    number: 4,
                    question:
                        "Écrivez la loi d'Ohm."
                },

                {
                    number: 5,
                    question:
                        "Quel est le rôle d'un capteur dans un robot ?"
                },

                {
                    number: 6,
                    question:
                        "Quel est le rôle d'un actionneur ?"
                },

                {
                    number: 7,
                    question:
                        "Quel élément peut traiter les informations reçues par les capteurs ?"
                },

                {
                    number: 8,
                    question:
                        "Pourquoi faut-il vérifier la polarité avant d'alimenter certains composants ?"
                }

            ],

            challenge:
                "Défi : expliquez avec vos propres mots le fonctionnement d'un robot capable de détecter un obstacle et de s'arrêter automatiquement."

        },


        devoir: {

            introduction:
                "Le devoir permet de vérifier votre compréhension globale du chapitre et votre capacité à relier les concepts électroniques aux systèmes robotiques.",

            mission:
                "Concevez sur papier l'architecture d'un petit robot autonome capable de détecter un obstacle et de commander un moteur.",

            requirements: [

                "Identifier une source d'alimentation adaptée.",

                "Choisir un capteur permettant de détecter l'obstacle.",

                "Identifier le contrôleur chargé de traiter l'information.",

                "Identifier l'actionneur responsable du mouvement.",

                "Représenter les connexions principales entre les éléments.",

                "Expliquer le fonctionnement du système étape par étape."

            ],

            expected:
                "Le devoir doit présenter une architecture claire comprenant au minimum : Alimentation (Power Supply), Capteur (Sensor), Contrôleur (Controller) et Actionneur (Actuator).",

            evaluation:
                [

                    "Exactitude des notions électroniques.",

                    "Compréhension du rôle des composants.",

                    "Cohérence de l'architecture robotique.",

                    "Clarté du schéma.",

                    "Qualité de l'explication technique."

                ]

        }

    }

];


/* ================================================================
   06 — UTILITAIRES PÉDAGOGIQUES
================================================================ */

function getChapterById(id) {

    return FOBAS_CHAPTERS.find(
        chapter => chapter.id === id
    ) || null;
}


function getChapterIndex(id) {

    return FOBAS_CHAPTERS.findIndex(
        chapter => chapter.id === id
    );

}


function getPreviousChapter(id) {

    const index =
        getChapterIndex(id);

    if (index <= 0) {
        return null;
    }

    return FOBAS_CHAPTERS[index - 1];
}


function getNextChapter(id) {

    const index =
        getChapterIndex(id);

    if (
        index < 0 ||
        index >= FOBAS_CHAPTERS.length - 1
    ) {
        return null;
    }

    return FOBAS_CHAPTERS[index + 1];
}


/* ================================================================
   07 — COMPTEUR DE CHAPITRES
================================================================ */

function updateChapterCounter() {

    if (!dom.chapterCounter) {
        return;
    }

    const count =
        FOBAS_CHAPTERS.length;

    dom.chapterCounter.innerHTML =
        `Chapitres : <strong>${count}</strong>`;
}


/* ================================================================
   08 — LISTE DES CHAPITRES
================================================================ */

function renderChapterList() {

    if (!dom.chaptersList) {
        return;
    }

    dom.chaptersList.innerHTML = "";

    FOBAS_CHAPTERS.forEach(
        chapter => {

            const card =
                document.createElement("article");

            card.className =
                "chapter-card";

            card.dataset.chapterId =
                chapter.id;

            card.setAttribute(
                "role",
                "button"
            );

            card.setAttribute(
                "tabindex",
                "0"
            );

            const keywords =
                chapter.keywords
                    .slice(0, 4)
                    .map(
                        keyword =>
                            `<span class="chapter-keyword">
                                ${escapeHTML(keyword.fr)}
                                (${escapeHTML(keyword.en)})
                            </span>`
                    )
                    .join("");

            card.innerHTML = `

                <div class="chapter-card-number">
                    CHAPITRE ${escapeHTML(chapter.number)}
                </div>

                <h3>
                    ${escapeHTML(chapter.title)}
                </h3>

                <p>
                    ${escapeHTML(chapter.description)}
                </p>

                <div class="chapter-keywords">
                    ${keywords}
                </div>

                <div class="chapter-card-action">
                    Étudier le chapitre →
                </div>

            `;

            card.addEventListener(
                "click",
                () => openChapter(chapter.id)
            );

            card.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        openChapter(
                            chapter.id
                        );
                    }

                }
            );

            dom.chaptersList.appendChild(
                card
            );

        }
    );
}


/* ================================================================
   09 — RENDU DES MOTS CLÉS
================================================================ */

function renderKeywords(chapter) {

    if (
        !chapter ||
        !Array.isArray(chapter.keywords)
    ) {
        return "";
    }

    return `

        <div class="chapter-keywords-panel">

            <div class="section-kicker">
                TERMES CLÉS
            </div>

            <div class="keywords-grid">

                ${chapter.keywords
                    .map(
                        keyword => `

                            <div class="keyword-item">

                                <strong>
                                    ${escapeHTML(keyword.fr)}
                                </strong>

                                <span>
                                    ${escapeHTML(keyword.en)}
                                </span>

                            </div>

                        `
                    )
                    .join("")}

            </div>

        </div>

    `;
}


/* ================================================================
   10 — RENDU DE LA THÉORIE
================================================================ */

function renderTheory(chapter) {

    if (
        !chapter ||
        !chapter.theorie ||
        !dom.theorieContent
    ) {
        return;
    }

    let html = "";

    if (chapter.theorie.introduction) {

        html += `
            <div class="lesson-introduction">
                <p>
                    ${chapter.theorie.introduction}
                </p>
            </div>
        `;
    }

    if (
        Array.isArray(
            chapter.theorie.sections
        )
    ) {

        chapter.theorie.sections.forEach(
            section => {

                html += `

                    <div class="lesson-card">

                        <h4>
                            ${escapeHTML(section.title)}
                        </h4>

                        ${
                            Array.isArray(
                                section.paragraphs
                            )
                            ?
                            section.paragraphs
                                .map(
                                    paragraph =>
                                        `<p>${paragraph}</p>`
                                )
                                .join("")
                            :
                            ""
                        }

                    </div>

                `;

            }
        );

    }

    html +=
        renderKeywords(chapter);

    dom.theorieContent.innerHTML =
        html;
}


/* ================================================================
   11 — RENDU DE LA PRATIQUE
================================================================ */

function renderPractice(chapter) {

    if (
        !chapter ||
        !chapter.pratique ||
        !dom.pratiqueContent
    ) {
        return;
    }

    let html = "";

    if (chapter.pratique.introduction) {

        html += `
            <div class="lesson-introduction">
                <p>
                    ${escapeHTML(
                        chapter.pratique.introduction
                    )}
                </p>
            </div>
        `;
    }

    if (
        Array.isArray(
            chapter.pratique.steps
        )
    ) {

        html += `
            <div class="practice-steps">
        `;

        chapter.pratique.steps.forEach(
            step => {

                html += `

                    <div class="practice-step">

                        <div class="practice-step-number">
                            ${escapeHTML(step.number)}
                        </div>

                        <div class="practice-step-content">

                            <h4>
                                ${escapeHTML(step.title)}
                            </h4>

                            <p>
                                ${escapeHTML(
                                    step.description
                                )}
                            </p>

                        </div>

                    </div>

                `;

            }
        );

        html += `
            </div>
        `;
    }

    if (chapter.pratique.objective) {

        html += `

            <div class="objective-box">

                <strong>
                    Objectif pratique
                </strong>

                <p>
                    ${escapeHTML(
                        chapter.pratique.objective
                    )}
                </p>

            </div>

        `;
    }

    dom.pratiqueContent.innerHTML =
        html;
}


/* ================================================================
   12 — RENDU DES EXERCICES
================================================================ */

function renderExercise(chapter) {

    if (
        !chapter ||
        !chapter.exercice ||
        !dom.exerciceContent
    ) {
        return;
    }

    let html = "";

    if (chapter.exercice.introduction) {

        html += `
            <div class="lesson-introduction">
                <p>
                    ${escapeHTML(
                        chapter.exercice.introduction
                    )}
                </p>
            </div>
        `;
    }

    if (
        Array.isArray(
            chapter.exercice.questions
        )
    ) {

        html += `
            <div class="exercise-list">
        `;

        chapter.exercice.questions.forEach(
            question => {

                html += `

                    <div class="exercise-question">

                        <div class="exercise-number">
                            ${escapeHTML(
                                question.number
                            )}
                        </div>

                        <div class="exercise-question-body">

                            <p>
                                ${escapeHTML(
                                    question.question
                                )}
                            </p>

                            <div class="answer-line">
                                Votre réponse :
                            </div>

                        </div>

                    </div>

                `;

            }
        );

        html += `
            </div>
        `;
    }

    if (chapter.exercice.challenge) {

        html += `

            <div class="challenge-box">

                <strong>
                    Défi technique
                </strong>

                <p>
                    ${escapeHTML(
                        chapter.exercice.challenge
                    )}
                </p>

            </div>

        `;
    }

    dom.exerciceContent.innerHTML =
        html;
}


/* ================================================================
   13 — RENDU DU DEVOIR
================================================================ */

function renderHomework(chapter) {

    if (
        !chapter ||
        !chapter.devoir ||
        !dom.devoirContent
    ) {
        return;
    }

    let html = "";

    if (chapter.devoir.introduction) {

        html += `
            <div class="lesson-introduction">
                <p>
                    ${escapeHTML(
                        chapter.devoir.introduction
                    )}
                </p>
            </div>
        `;
    }

    if (chapter.devoir.mission) {

        html += `

            <div class="mission-box">

                <span class="section-kicker">
                    MISSION
                </span>

                <h4>
                    Travail demandé
                </h4>

                <p>
                    ${escapeHTML(
                        chapter.devoir.mission
                    )}
                </p>

            </div>

        `;
    }

    if (
        Array.isArray(
            chapter.devoir.requirements
        )
    ) {

        html += `

            <div class="lesson-card">

                <h4>
                    Éléments à fournir
                </h4>

                <ul>

                    ${chapter.devoir.requirements
                        .map(
                            item =>
                                `<li>${escapeHTML(item)}</li>`
                        )
                        .join("")}

                </ul>

            </div>

        `;
    }

    if (chapter.devoir.expected) {

        html += `

            <div class="expected-box">

                <strong>
                    Résultat attendu
                </strong>

                <p>
                    ${escapeHTML(
                        chapter.devoir.expected
                    )}
                </p>

            </div>

        `;
    }

    if (
        Array.isArray(
            chapter.devoir.evaluation
        )
    ) {

        html += `

            <div class="lesson-card">

                <h4>
                    Critères d'évaluation
                </h4>

                <ul>

                    ${chapter.devoir.evaluation
                        .map(
                            item =>
                                `<li>${escapeHTML(item)}</li>`
                        )
                        .join("")}

                </ul>

            </div>

        `;
    }

    dom.devoirContent.innerHTML =
        html;
}


/* ================================================================
   14 — EN-TÊTE DU CHAPITRE
================================================================ */

function renderChapterHeader(chapter) {

    if (
        !chapter ||
        !dom.chapterHeader
    ) {
        return;
    }

    dom.chapterHeader.innerHTML = `

        <span class="section-kicker">
            CHAPITRE ${escapeHTML(chapter.number)}
        </span>

        <h2>
            ${escapeHTML(chapter.title)}
        </h2>

        <p>
            ${escapeHTML(chapter.subtitle)}
        </p>

        <div class="chapter-meta">

            <span>
                ${escapeHTML(chapter.shortTitle)}
            </span>

            <span>
                ${chapter.keywords.length}
                termes clés
            </span>

        </div>

    `;
}


/* ================================================================
   15 — SVG 3D : UTILITAIRES
================================================================ */

function svgDefs() {

    return `

        <defs>

            <linearGradient
                id="fobasSvgBackground"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
            >

                <stop
                    offset="0%"
                    stop-color="#102f52"
                />

                <stop
                    offset="55%"
                    stop-color="#071a31"
                />

                <stop
                    offset="100%"
                    stop-color="#030b16"
                />

            </linearGradient>


            <linearGradient
                id="fobasMetal"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
            >

                <stop
                    offset="0%"
                    stop-color="#dbe8f5"
                />

                <stop
                    offset="28%"
                    stop-color="#6f88a1"
                />

                <stop
                    offset="55%"
                    stop-color="#d3e0eb"
                />

                <stop
                    offset="100%"
                    stop-color="#344b63"
                />

            </linearGradient>


            <linearGradient
                id="fobasBlueSurface"
                x1="0"
                y1="0"
                x2="0.9"
                y2="1"
            >

                <stop
                    offset="0%"
                    stop-color="#42b4ff"
                />

                <stop
                    offset="45%"
                    stop-color="#0878ff"
                />

                <stop
                    offset="100%"
                    stop-color="#03428f"
                />

            </linearGradient>


            <linearGradient
                id="fobasGoldSurface"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
            >

                <stop
                    offset="0%"
                    stop-color="#fff18a"
                />

                <stop
                    offset="45%"
                    stop-color="#ffd21c"
                />

                <stop
                    offset="100%"
                    stop-color="#bd7600"
                />

            </linearGradient>


            <radialGradient
                id="fobasGlow"
                cx="50%"
                cy="50%"
                r="50%"
            >

                <stop
                    offset="0%"
                    stop-color="#49b9ff"
                    stop-opacity="0.75"
                />

                <stop
                    offset="45%"
                    stop-color="#0878ff"
                    stop-opacity="0.18"
                />

                <stop
                    offset="100%"
                    stop-color="#0878ff"
                    stop-opacity="0"
                />

            </radialGradient>


            <filter
                id="fobasShadow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
            >

                <feDropShadow
                    dx="0"
                    dy="18"
                    stdDeviation="15"
                    flood-color="#000000"
                    flood-opacity="0.5"
                />

            </filter>


            <filter
                id="fobasSoftGlow"
                x="-100%"
                y="-100%"
                width="300%"
                height="300%"
            >

                <feGaussianBlur
                    stdDeviation="9"
                    result="blur"
                />

            </filter>

        </defs>

    `;
}


/* ================================================================
   16 — SVG 3D ACCUEIL
================================================================ */

function createWelcomeSVG() {

    return `

        <svg
            viewBox="0 0 900 600"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Laboratoire électronique et robotique en trois dimensions"
            preserveAspectRatio="xMidYMid meet"
        >

            ${svgDefs()}

            <rect
                width="900"
                height="600"
                rx="35"
                fill="url(#fobasSvgBackground)"
            />

            <ellipse
                cx="450"
                cy="505"
                rx="330"
                ry="52"
                fill="#000000"
                opacity="0.38"
                filter="url(#fobasSoftGlow)"
            />


            <!-- Halo central -->

            <circle
                cx="450"
                cy="285"
                r="225"
                fill="url(#fobasGlow)"
            />


            <!-- Carte électronique 3D -->

            <g
                transform="translate(220 170)"
                filter="url(#fobasShadow)"
            >

                <polygon
                    points="0,55 365,0 480,70 115,130"
                    fill="#0a4c7d"
                    stroke="#4fbaff"
                    stroke-width="3"
                />

                <polygon
                    points="115,130 480,70 480,250 115,310"
                    fill="#06345c"
                    stroke="#2d8fd0"
                    stroke-width="3"
                />

                <polygon
                    points="0,55 115,130 115,310 0,235"
                    fill="#082b4b"
                    stroke="#1c6da4"
                    stroke-width="3"
                />


                <!-- pistes -->

                <g
                    fill="none"
                    stroke="#ffd21c"
                    stroke-width="5"
                    stroke-linecap="round"
                    opacity="0.9"
                >

                    <path d="M60 105 L165 85 L215 120" />
                    <path d="M190 78 L285 52 L350 82" />
                    <path d="M245 145 L350 115 L420 140" />
                    <path d="M160 205 L270 175 L350 195" />
                    <path d="M285 220 L395 185" />

                </g>


                <!-- microcontrôleur -->

                <polygon
                    points="175,105 300,83 350,112 225,138"
                    fill="#111c2a"
                    stroke="#7ca4c6"
                    stroke-width="3"
                />

                <polygon
                    points="225,138 350,112 350,180 225,206"
                    fill="#08111d"
                    stroke="#4e7596"
                    stroke-width="3"
                />

                <polygon
                    points="175,105 225,138 225,206 175,173"
                    fill="#0b1725"
                    stroke="#4e7596"
                    stroke-width="3"
                />


                <!-- pins -->

                <g
                    stroke="#d6e5f2"
                    stroke-width="4"
                >

                    <path d="M165 120 L145 115" />
                    <path d="M165 137 L145 132" />
                    <path d="M165 154 L145 149" />
                    <path d="M165 171 L145 166" />

                    <path d="M350 122 L370 118" />
                    <path d="M350 140 L370 136" />
                    <path d="M350 158 L370 154" />
                    <path d="M350 176 L370 172" />

                </g>


                <!-- condensateurs -->

                <g>

                    <ellipse
                        cx="75"
                        cy="190"
                        rx="24"
                        ry="14"
                        fill="#d8e6ef"
                    />

                    <rect
                        x="51"
                        y="190"
                        width="48"
                        height="48"
                        fill="url(#fobasMetal)"
                    />

                    <ellipse
                        cx="75"
                        cy="238"
                        rx="24"
                        ry="14"
                        fill="#516a81"
                    />

                    <ellipse
                        cx="415"
                        cy="104"
                        rx="22"
                        ry="13"
                        fill="#d8e6ef"
                    />

                    <rect
                        x="393"
                        y="104"
                        width="44"
                        height="44"
                        fill="url(#fobasMetal)"
                    />

                </g>


                <!-- LED -->

                <circle
                    cx="395"
                    cy="220"
                    r="19"
                    fill="#55c5ff"
                    opacity="0.35"
                    filter="url(#fobasSoftGlow)"
                />

                <circle
                    cx="395"
                    cy="220"
                    r="11"
                    fill="#42baff"
                />

            </g>


            <!-- Robot simplifié -->

            <g
                transform="translate(595 155)"
                filter="url(#fobasShadow)"
            >

                <!-- antenne -->

                <line
                    x1="92"
                    y1="5"
                    x2="92"
                    y2="55"
                    stroke="#a9bfd3"
                    stroke-width="8"
                />

                <circle
                    cx="92"
                    cy="0"
                    r="13"
                    fill="url(#fobasGoldSurface)"
                />


                <!-- tête -->

                <rect
                    x="25"
                    y="52"
                    width="135"
                    height="105"
                    rx="28"
                    fill="url(#fobasMetal)"
                    stroke="#8fa9bf"
                    stroke-width="4"
                />


                <!-- yeux -->

                <circle
                    cx="65"
                    cy="101"
                    r="18"
                    fill="#061321"
                    stroke="#39b8ff"
                    stroke-width="5"
                />

                <circle
                    cx="120"
                    cy="101"
                    r="18"
                    fill="#061321"
                    stroke="#39b8ff"
                    stroke-width="5"
                />

                <circle
                    cx="65"
                    cy="101"
                    r="6"
                    fill="#ffffff"
                />

                <circle
                    cx="120"
                    cy="101"
                    r="6"
                    fill="#ffffff"
                />


                <!-- corps -->

                <rect
                    x="0"
                    y="177"
                    width="185"
                    height="165"
                    rx="35"
                    fill="url(#fobasBlueSurface)"
                    stroke="#5bc2ff"
                    stroke-width="4"
                />


                <!-- panneau -->

                <rect
                    x="45"
                    y="214"
                    width="95"
                    height="75"
                    rx="12"
                    fill="#06182c"
                    stroke="#67c8ff"
                    stroke-width="3"
                />

                <circle
                    cx="70"
                    cy="250"
                    r="10"
                    fill="#ffd21c"
                />

                <circle
                    cx="115"
                    cy="250"
                    r="10"
                    fill="#42baff"
                />


                <!-- bras -->

                <path
                    d="M0 205 L-65 255 L-38 280 L30 235"
                    fill="url(#fobasMetal)"
                    stroke="#8fa9bf"
                    stroke-width="5"
                />

                <path
                    d="M185 205 L250 255 L225 280 L158 235"
                    fill="url(#fobasMetal)"
                    stroke="#8fa9bf"
                    stroke-width="5"
                />


                <!-- roues -->

                <ellipse
                    cx="42"
                    cy="348"
                    rx="34"
                    ry="22"
                    fill="#101c29"
                    stroke="#738da5"
                    stroke-width="5"
                />

                <ellipse
                    cx="143"
                    cy="348"
                    rx="34"
                    ry="22"
                    fill="#101c29"
                    stroke="#738da5"
                    stroke-width="5"
                />

            </g>


            <!-- texte -->

            <text
                x="450"
                y="565"
                text-anchor="middle"
                fill="#ffffff"
                font-size="24"
                font-family="Segoe UI, Arial, sans-serif"
                font-weight="800"
                letter-spacing="2"
            >
                ÉLECTRONIQUE • ROBOTIQUE
            </text>

        </svg>

    `;
}


/* ================================================================
   17 — SVG 3D CHAPITRE 1
================================================================ */

function createChapterOneSVG() {

    return `

        <svg
            viewBox="0 0 1100 680"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="Circuit électronique et architecture robotique du chapitre 1"
            preserveAspectRatio="xMidYMid meet"
        >

            ${svgDefs()}

            <rect
                width="1100"
                height="680"
                rx="38"
                fill="url(#fobasSvgBackground)"
            />


            <!-- réseau lumineux -->

            <g
                fill="none"
                stroke="#0878ff"
                stroke-width="2"
                opacity="0.24"
            >

                <path d="M80 130 H1020" />
                <path d="M80 270 H1020" />
                <path d="M80 410 H1020" />
                <path d="M80 550 H1020" />

                <path d="M180 70 V610" />
                <path d="M380 70 V610" />
                <path d="M580 70 V610" />
                <path d="M780 70 V610" />
                <path d="M980 70 V610" />

            </g>


            <!-- SOURCE -->

            <g
                transform="translate(85 245)"
                filter="url(#fobasShadow)"
            >

                <polygon
                    points="0,35 150,0 205,35 55,75"
                    fill="#d7e4ee"
                    stroke="#8da8be"
                    stroke-width="3"
                />

                <polygon
                    points="55,75 205,35 205,185 55,225"
                    fill="#667e95"
                    stroke="#a9c0d2"
                    stroke-width="3"
                />

                <polygon
                    points="0,35 55,75 55,225 0,185"
                    fill="#445d74"
                    stroke="#7892a9"
                    stroke-width="3"
                />

                <circle
                    cx="93"
                    cy="110"
                    r="24"
                    fill="#071426"
                    stroke="#ff3f54"
                    stroke-width="6"
                />

                <text
                    x="93"
                    y="118"
                    text-anchor="middle"
                    fill="#ffffff"
                    font-size="23"
                    font-weight="900"
                >
                    +
                </text>

                <circle
                    cx="155"
                    cy="94"
                    r="14"
                    fill="#071426"
                    stroke="#38aaff"
                    stroke-width="5"
                />

                <text
                    x="100"
                    y="260"
                    text-anchor="middle"
                    fill="#ffffff"
                    font-size="21"
                    font-weight="800"
                >
                    ALIMENTATION
                </text>

                <text
                    x="100"
                    y="288"
                    text-anchor="middle"
                    fill="#ffd21c"
                    font-size="17"
                    font-weight="700"
                >
                    POWER SUPPLY
                </text>

            </g>


            <!-- CIRCUIT -->

            <g
                transform="translate(330 170)"
                filter="url(#fobasShadow)"
            >

                <!-- carte -->

                <polygon
                    points="0,70 380,0 500,65 120,140"
                    fill="#0878ff"
                    stroke="#55c2ff"
                    stroke-width="4"
                />

                <polygon
                    points="120,140 500,65 500,355 120,430"
                    fill="#064c91"
                    stroke="#238bd1"
                    stroke-width="4"
                />

                <polygon
                    points="0,70 120,140 120,430 0,355"
                    fill="#073965"
                    stroke="#1b6ca4"
                    stroke-width="4"
                />


                <!-- pistes -->

                <g
                    fill="none"
                    stroke="#ffd21c"
                    stroke-width="6"
                    stroke-linecap="round"
                >

                    <path d="M55 105 L190 78 L250 112" />

                    <path d="M160 180 L300 145 L405 178" />

                    <path d="M165 275 L285 245 L390 270" />

                    <path d="M210 350 L340 320 L440 338" />

                </g>


                <!-- résistance -->

                <g
                    transform="translate(55 170)"
                >

                    <path
                        d="M0 0 L25 -5 L40 15 L60 8 L80 28 L100 18 L120 38 L145 30"
                        fill="none"
                        stroke="#ffffff"
                        stroke-width="8"
                    />

                    <text
                        x="72"
                        y="70"
                        text-anchor="middle"
                        fill="#ffffff"
                        font-size="17"
                        font-weight="700"
                    >
                        RÉSISTANCE
                    </text>

                    <text
                        x="72"
                        y="92"
                        text-anchor="middle"
                        fill="#ffd21c"
                        font-size="14"
                    >
                        RESISTOR
                    </text>

                </g>


                <!-- microcontrôleur -->

                <polygon
                    points="225,120 350,95 410,130 285,157"
                    fill="#111b29"
                    stroke="#8aa9c0"
                    stroke-width="3"
                />

                <polygon
                    points="285,157 410,130 410,245 285,272"
                    fill="#07111d"
                    stroke="#63839d"
                    stroke-width="3"
                />

                <polygon
                    points="225,120 285,157 285,272 225,235"
                    fill="#0b1725"
                    stroke="#63839d"
                    stroke-width="3"
                />

                <text
                    x="320"
                    y="210"
                    text-anchor="middle"
                    fill="#42baff"
                    font-size="19"
                    font-weight="900"
                >
                    MCU
                </text>


                <!-- LED -->

                <circle
                    cx="435"
                    cy="290"
                    r="35"
                    fill="#39b8ff"
                    opacity="0.22"
                    filter="url(#fobasSoftGlow)"
                />

                <circle
                    cx="435"
                    cy="290"
                    r="17"
                    fill="#49c5ff"
                    stroke="#ffffff"
                    stroke-width="3"
                />

                <text
                    x="435"
                    y="335"
                    text-anchor="middle"
                    fill="#ffffff"
                    font-size="15"
                    font-weight="700"
                >
                    LED
                </text>

            </g>


            <!-- ROBOT -->

            <g
                transform="translate(825 185)"
                filter="url(#fobasShadow)"
            >

                <!-- antenne -->

                <line
                    x1="90"
                    y1="0"
                    x2="90"
                    y2="50"
                    stroke="#d6e3ef"
                    stroke-width="7"
                />

                <circle
                    cx="90"
                    cy="0"
                    r="12"
                    fill="url(#fobasGoldSurface)"
                />


                <!-- tête -->

                <rect
                    x="20"
                    y="50"
                    width="140"
                    height="105"
                    rx="27"
                    fill="url(#fobasMetal)"
                    stroke="#9bb3c7"
                    stroke-width="4"
                />

                <circle
                    cx="60"
                    cy="100"
                    r="18"
                    fill="#061321"
                    stroke="#42baff"
                    stroke-width="5"
                />

                <circle
                    cx="120"
                    cy="100"
                    r="18"
                    fill="#061321"
                    stroke="#42baff"
                    stroke-width="5"
                />

                <circle
                    cx="60"
                    cy="100"
                    r="5"
                    fill="#ffffff"
                />

                <circle
                    cx="120"
                    cy="100"
                    r="5"
                    fill="#ffffff"
                />


                <!-- corps -->

                <rect
                    x="0"
                    y="175"
                    width="180"
                    height="160"
                    rx="30"
                    fill="url(#fobasBlueSurface)"
                    stroke="#62c4ff"
                    stroke-width="4"
                />


                <!-- capteur -->

                <rect
                    x="48"
                    y="215"
                    width="84"
                    height="55"
                    rx="10"
                    fill="#061522"
                    stroke="#7dd2ff"
                    stroke-width="3"
                />

                <circle
                    cx="75"
                    cy="242"
                    r="11"
                    fill="#ffd21c"
                />

                <circle
                    cx="105"
                    cy="242"
                    r="11"
                    fill="#42baff"
                />


                <!-- roues -->

                <ellipse
                    cx="38"
                    cy="345"
                    rx="34"
                    ry="21"
                    fill="#111b28"
                    stroke="#8298ab"
                    stroke-width="5"
                />

                <ellipse
                    cx="142"
                    cy="345"
                    rx="34"
                    ry="21"
                    fill="#111b28"
                    stroke="#8298ab"
                    stroke-width="5"
                />


                <text
                    x="90"
                    y="395"
                    text-anchor="middle"
                    fill="#ffffff"
                    font-size="19"
                    font-weight="800"
                >
                    ROBOT
                </text>

                <text
                    x="90"
                    y="420"
                    text-anchor="middle"
                    fill="#ffd21c"
                    font-size="14"
                    font-weight="700"
                >
                    ROBOTIC SYSTEM
                </text>

            </g>


            <!-- FLUX DE DONNÉES -->

            <g
                fill="none"
                stroke="#42baff"
                stroke-width="5"
                stroke-linecap="round"
                stroke-dasharray="10 12"
            >

                <path
                    d="M535 255 C650 210 735 190 820 230"
                />

                <path
                    d="M820 350 C710 390 620 420 520 405"
                />

            </g>


            <text
                x="550"
                y="610"
                text-anchor="middle"
                fill="#ffffff"
                font-size="25"
                font-weight="900"
                letter-spacing="2"
            >
                ALIMENTATION → TRAITEMENT → ACTION
            </text>

        </svg>

    `;
}


/* ================================================================
   18 — RENDU SVG DU CHAPITRE
================================================================ */

function renderChapterVisual(chapter) {

    if (
        !dom.chapterVisual ||
        !chapter
    ) {
        return;
    }

    if (
        chapter.id ===
        "chapitre-1"
    ) {

        dom.chapterVisual.innerHTML =
            createChapterOneSVG();

        return;
    }


    /*
       Pour les futurs chapitres :
       un générateur SVG pourra être ajouté ici sans modifier
       le moteur pédagogique.
    */

    dom.chapterVisual.innerHTML =
        createGenericSVG(chapter);

}


/* ================================================================
   19 — SVG GÉNÉRIQUE POUR FUTURS CHAPITRES
================================================================ */

function createGenericSVG(chapter) {

    return `

        <svg
            viewBox="0 0 1000 600"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
            aria-label="${escapeHTML(chapter.title)}"
            preserveAspectRatio="xMidYMid meet"
        >

            ${svgDefs()}

            <rect
                width="1000"
                height="600"
                rx="35"
                fill="url(#fobasSvgBackground)"
            />

            <circle
                cx="500"
                cy="290"
                r="220"
                fill="url(#fobasGlow)"
            />

            <g
                transform="translate(300 150)"
                filter="url(#fobasShadow)"
            >

                <polygon
                    points="0,70 320,0 430,65 110,135"
                    fill="url(#fobasBlueSurface)"
                    stroke="#5bc4ff"
                    stroke-width="4"
                />

                <polygon
                    points="110,135 430,65 430,275 110,345"
                    fill="#06477f"
                    stroke="#2b92d3"
                    stroke-width="4"
                />

                <polygon
                    points="0,70 110,135 110,345 0,280"
                    fill="#07355e"
                    stroke="#2674a8"
                    stroke-width="4"
                />

                <g
                    fill="none"
                    stroke="#ffd21c"
                    stroke-width="6"
                    stroke-linecap="round"
                >

                    <path d="M55 100 L150 80 L210 112" />
                    <path d="M155 175 L260 145 L350 170" />
                    <path d="M170 255 L280 225 L375 245" />

                </g>

                <rect
                    x="190"
                    y="105"
                    width="120"
                    height="105"
                    rx="12"
                    fill="#071321"
                    stroke="#8db0c8"
                    stroke-width="4"
                />

                <text
                    x="250"
                    y="168"
                    text-anchor="middle"
                    fill="#42baff"
                    font-size="24"
                    font-weight="900"
                >
                    FOBAS
                </text>

            </g>

            <text
                x="500"
                y="525"
                text-anchor="middle"
                fill="#ffffff"
                font-size="27"
                font-family="Segoe UI, Arial, sans-serif"
                font-weight="800"
            >
                ${escapeHTML(chapter.shortTitle)}
            </text>

        </svg>

    `;
}


/* ================================================================
   20 — RENDU COMPLET D'UN CHAPITRE
================================================================ */

function renderChapter(chapter) {

    if (!chapter) {
        return;
    }

    showLoading(false);

    hideError();

    renderChapterHeader(
        chapter
    );

    renderChapterVisual(
        chapter
    );

    renderTheory(
        chapter
    );

    renderPractice(
        chapter
    );

    renderExercise(
        chapter
    );

    renderHomework(
        chapter
    );

    updateChapterNavigation(
        chapter
    );

    if (dom.learningStatus) {

        dom.learningStatus.textContent =
            `Chapitre ${chapter.number} — ${chapter.shortTitle}`;
    }

}


/* ================================================================
   21 — NAVIGATION ENTRE CHAPITRES
================================================================ */

function updateChapterNavigation(chapter) {

    const previous =
        getPreviousChapter(
            chapter.id
        );

    const next =
        getNextChapter(
            chapter.id
        );


    if (dom.previousChapterBtn) {

        dom.previousChapterBtn.disabled =
            !previous;

        dom.previousChapterBtn.style.opacity =
            previous ? "1" : "0.45";

        dom.previousChapterBtn.style.cursor =
            previous ? "pointer" : "not-allowed";

    }


    if (dom.nextChapterBtn) {

        dom.nextChapterBtn.disabled =
            !next;

        dom.nextChapterBtn.style.opacity =
            next ? "1" : "0.45";

        dom.nextChapterBtn.style.cursor =
            next ? "pointer" : "not-allowed";

    }

}


/* ================================================================
   22 — AFFICHAGE DE LA LISTE DES CHAPITRES
================================================================ */

function showChapters() {

    FOBAS_PEDAGOGICAL_STATE.currentView =
        "chapters";

    if (dom.welcome) {
        dom.welcome.hidden = true;
    }

    if (dom.chapterWorkspace) {
        dom.chapterWorkspace.hidden = true;
    }

    if (dom.chaptersWorkspace) {
        dom.chaptersWorkspace.hidden = false;
    }

    if (dom.learningStatus) {
        dom.learningStatus.textContent =
            "Sélection du chapitre";
    }

    if (dom.homeBtn) {
        dom.homeBtn.classList.remove(
            "active"
        );
    }

    if (dom.chaptersBtn) {
        dom.chaptersBtn.classList.add(
            "active"
        );
    }

    scrollToTop();
}


/* ================================================================
   23 — AFFICHAGE ACCUEIL
================================================================ */

function showWelcome() {

    FOBAS_PEDAGOGICAL_STATE.currentView =
        "welcome";

    FOBAS_PEDAGOGICAL_STATE.currentChapterId =
        null;

    if (dom.welcome) {
        dom.welcome.hidden = false;
    }

    if (dom.chaptersWorkspace) {
        dom.chaptersWorkspace.hidden = true;
    }

    if (dom.chapterWorkspace) {
        dom.chapterWorkspace.hidden = true;
    }

    if (dom.learningStatus) {
        dom.learningStatus.textContent =
            "Parcours pédagogique";
    }

    if (dom.homeBtn) {
        dom.homeBtn.classList.add(
            "active"
        );
    }

    if (dom.chaptersBtn) {
        dom.chaptersBtn.classList.remove(
            "active"
        );
    }

    scrollToTop();
}


/* ================================================================
   24 — OUVRIR UN CHAPITRE
================================================================ */

function openChapter(chapterId) {

    const chapter =
        getChapterById(
            chapterId
        );

    if (!chapter) {

        showError(
            "Le chapitre demandé est introuvable."
        );

        return;
    }


    try {

        FOBAS_PEDAGOGICAL_STATE.currentChapterId =
            chapter.id;

        FOBAS_PEDAGOGICAL_STATE.currentView =
            "chapter";

        if (dom.welcome) {
            dom.welcome.hidden = true;
        }

        if (dom.chaptersWorkspace) {
            dom.chaptersWorkspace.hidden = true;
        }

        if (dom.chapterWorkspace) {
            dom.chapterWorkspace.hidden = false;
        }

        if (dom.homeBtn) {
            dom.homeBtn.classList.remove(
                "active"
            );
        }

        if (dom.chaptersBtn) {
            dom.chaptersBtn.classList.remove(
                "active"
            );
        }

        renderChapter(
            chapter
        );

        saveState();

        scrollToTop();

    }
    catch (error) {

        console.error(
            "FOBAS Pedagogical Engine:",
            error
        );

        showError(
            "Le contenu du chapitre n'a pas pu être affiché correctement."
        );

    }

}


/* ================================================================
   25 — CHAPITRE PRÉCÉDENT
================================================================ */

function openPreviousChapter() {

    const current =
        getChapterById(
            FOBAS_PEDAGOGICAL_STATE.currentChapterId
        );

    if (!current) {
        showChapters();
        return;
    }

    const previous =
        getPreviousChapter(
            current.id
        );

    if (previous) {

        openChapter(
            previous.id
        );
    }

}


/* ================================================================
   26 — CHAPITRE SUIVANT
================================================================ */

function openNextChapter() {

    const current =
        getChapterById(
            FOBAS_PEDAGOGICAL_STATE.currentChapterId
        );

    if (!current) {
        showChapters();
        return;
    }

    const next =
        getNextChapter(
            current.id
        );

    if (next) {

        openChapter(
            next.id
        );
    }

}


/* ================================================================
   27 — SAUVEGARDE DE L'ÉTAT
================================================================ */

function saveState() {

    try {

        const state = {

            currentChapterId:
                FOBAS_PEDAGOGICAL_STATE.currentChapterId,

            currentView:
                FOBAS_PEDAGOGICAL_STATE.currentView

        };

        localStorage.setItem(
            FOBAS_PEDAGOGICAL_CONFIG.storageKey,
            JSON.stringify(state)
        );

    }
    catch (error) {

        console.warn(
            "FOBAS : impossible de sauvegarder l'état.",
            error
        );

    }

}


/* ================================================================
   28 — RESTAURATION DE L'ÉTAT
================================================================ */

function restoreState() {

    try {

        const raw =
            localStorage.getItem(
                FOBAS_PEDAGOGICAL_CONFIG.storageKey
            );

        if (!raw) {
            return;
        }

        const saved =
            JSON.parse(raw);

        if (
            saved &&
            saved.currentChapterId &&
            getChapterById(
                saved.currentChapterId
            )
        ) {

            openChapter(
                saved.currentChapterId
            );

        }

    }
    catch (error) {

        console.warn(
            "FOBAS : état précédent invalide.",
            error
        );

    }

}


/* ================================================================
   29 — ÉVÉNEMENTS
================================================================ */

function bindEvents() {

    if (dom.homeBtn) {

        dom.homeBtn.addEventListener(
            "click",
            showWelcome
        );

    }


    if (dom.chaptersBtn) {

        dom.chaptersBtn.addEventListener(
            "click",
            showChapters
        );

    }


    if (dom.startLearningBtn) {

        dom.startLearningBtn.addEventListener(
            "click",
            showChapters
        );

    }


    if (dom.backToSimulationBtn) {

        dom.backToSimulationBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    FOBAS_PEDAGOGICAL_CONFIG.simulationURL;

            }
        );

    }


    if (dom.allChaptersBtn) {

        dom.allChaptersBtn.addEventListener(
            "click",
            showChapters
        );

    }


    if (dom.previousChapterBtn) {

        dom.previousChapterBtn.addEventListener(
            "click",
            openPreviousChapter
        );

    }


    if (dom.nextChapterBtn) {

        dom.nextChapterBtn.addEventListener(
            "click",
            openNextChapter
        );

    }


    if (dom.retryBtn) {

        dom.retryBtn.addEventListener(
            "click",
            () => {

                hideError();

                renderChapterList();

                showChapters();

            }
        );

    }

}


/* ================================================================
   30 — INITIALISATION DE L'APPLICATION
================================================================ */

function initializeFOBASPedagogical() {

    try {

        cacheDOM();

        if (!dom.app) {

            throw new Error(
                "L'élément #fobasPedagogicalApp est introuvable."
            );

        }

        showLoading(true);

        updateChapterCounter();

        renderChapterList();

        bindEvents();

        if (dom.welcomeVisual) {

            dom.welcomeVisual.innerHTML =
                createWelcomeSVG();

        }

        showLoading(false);

        FOBAS_PEDAGOGICAL_STATE.initialized =
            true;

        /*
           L'application démarre toujours sur l'accueil.
           L'état sauvegardé peut ensuite restaurer le dernier chapitre.
        */

        showWelcome();

    }
    catch (error) {

        console.error(
            "FOBAS — ERREUR INITIALISATION :",
            error
        );

        showLoading(false);

        showError(
            "Le moteur pédagogique n'a pas pu être initialisé."
        );

    }

}


/* ================================================================
   31 — DÉMARRAGE
================================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeFOBASPedagogical,
        {
            once: true
        }
    );

}
else {

    initializeFOBASPedagogical();

}


/* ================================================================
   32 — API PUBLIQUE FOBAS
   ---------------------------------------------------------------
   Ces fonctions restent accessibles pour de futures extensions.
================================================================ */

window.FOBASPedagogical = {

    openChapter,

    showChapters,

    showWelcome,

    getChapterById,

    getChapterIndex,

    getPreviousChapter,

    getNextChapter,

    renderChapterList,

    renderChapter,

    chapters:
        FOBAS_CHAPTERS

};