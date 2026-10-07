/* ============================================================
   MEME — APP THEOLOGIE FO BAS
   FICHYE : apptheologiefobas.js

   Version : 1.0
   Language: Haitian Creole (ht)

   OBJECTIFS
   ------------------------------------------------------------
   - Tout bouton HTML yo jwenn yon aksyon.
   - Navigation dinamik.
   - Etid / chapit / pwogrè.
   - IndexedDB + localStorage fallback.
   - Bookmarks.
   - Quiz.
   - Diksyonè.
   - MEME Tutor lokal.
   - Dark mode.
   - Zoom + pinch 2 dwèt Android.
   - Double tap zoom.
   - Search.
   - Offline status.
   - Modal / toast.
   - Accessibility.
   ============================================================ */

(() => {
    "use strict";

    /* =========================================================
       CONFIGURATION
       ========================================================= */

    const APP = {
        name: "MEME",
        version: "1.0",
        dbName: "MEMETheologieDB",
        dbVersion: 1,
        storeName: "appState",

        zoom: {
            min: 0.8,
            max: 1.8,
            step: 0.1,
            default: 1
        },

        reader: {
            minPinchScale: 0.8,
            maxPinchScale: 2.2,
            doubleTapDelay: 280,
            doubleTapZoom: 1.35
        },

        storageKey: "meme_theologie_state_v1"
    };


    /* =========================================================
       STUDY DATABASE
       ---------------------------------------------------------
       Kontni lokal la. Ou ka ajoute plis etid pita san chanje
       lojik aplikasyon an.
       ========================================================= */

    const STUDIES = [
        {
            id: "introduction-bible",
            title: "Entwodiksyon nan Bib la",
            category: "biblical",
            level: "Debitan",
            description:
                "Yon fondasyon pou konprann Bib la, estrikti li, liv li yo ak fason pou li etidye tèks biblik la.",
            duration: "4 chapit",
            color: "gold",
            chapters: [
                {
                    id: "bib-1",
                    title: "Kisa Bib la ye?",
                    summary:
                        "Konprann Bib la kòm yon koleksyon liv ki fòme yon sèl gwo istwa.",
                    content: `
                        <h2>Kisa Bib la ye?</h2>

                        <p>
                            Bib la se yon koleksyon liv ki te ekri nan diferan
                            peryòd istorik, pa diferan otè, nan diferan kontèks.
                            Malgre divèsite sa a, liv yo prezante yon gwo istwa
                            sou Bondye, limanite, peche, alyans, delivrans ak espwa.
                        </p>

                        <h3>De gwo pati</h3>

                        <p>
                            Tradisyon kretyèn nan divize Bib la an de gwo pati:
                            Ansyen Testaman ak Nouvo Testaman.
                        </p>

                        <ul>
                            <li><strong>Ansyen Testaman:</strong> istwa, lalwa,
                            pwezi, sajès ak pwofèt.</li>
                            <li><strong>Nouvo Testaman:</strong> lavi Jezi,
                            legliz primitif la ak ansèyman apot yo.</li>
                        </ul>

                        <div class="lesson-note">
                            <strong>Pwen kle:</strong>
                            Lè w ap etidye yon pasaj, pa izole vèsè a.
                            Gade kontèks li, liv la, otè a ak objektif pasaj la.
                        </div>
                    `
                },

                {
                    id: "bib-2",
                    title: "Ansyen Testaman ak Nouvo Testaman",
                    summary:
                        "Dekouvri relasyon ki genyen ant de gwo pati Bib la.",
                    content: `
                        <h2>Ansyen Testaman ak Nouvo Testaman</h2>

                        <p>
                            Ansyen ak Nouvo Testaman yo pa de liv ki pa gen rapò.
                            Yo fòme yon narasyon ki konekte.
                        </p>

                        <h3>Ansyen Testaman</h3>

                        <p>
                            Li prezante kreyasyon, istwa pèp Izrayèl,
                            alyans, lalwa, pwofèt yo ak anpil pwomès.
                        </p>

                        <h3>Nouvo Testaman</h3>

                        <p>
                            Li prezante ministè Jezi Kris, lanmò ak rezirèksyon li,
                            nesans legliz la ak ansèyman premye kretyen yo.
                        </p>

                        <div class="lesson-note">
                            <strong>Prensip etid:</strong>
                            Li chak pati nan limyè kontèks pa li epi chèche
                            relasyon ki genyen ant tèm yo.
                        </div>
                    `
                },

                {
                    id: "bib-3",
                    title: "Kontèks biblik",
                    summary:
                        "Aprann poukisa kontèks istorik, literè ak sosyal enpòtan.",
                    content: `
                        <h2>Kontèks biblik</h2>

                        <p>
                            Kontèks ede nou evite bay yon pasaj yon siyifikasyon
                            li pa t fèt pou genyen.
                        </p>

                        <h3>Kesyon pou poze</h3>

                        <ol>
                            <li>Ki moun ki ekri pasaj la?</li>
                            <li>Ki moun ki te resevwa li?</li>
                            <li>Ki sitiyasyon an?</li>
                            <li>Kisa ki vini anvan ak apre pasaj la?</li>
                            <li>Ki kalite literè tèks la genyen?</li>
                        </ol>

                        <p>
                            Yon bon etid pa sèlman mande:
                            "Kisa vèsè a di?"
                            Li mande tou:
                            "Kisa li vle di nan kontèks li?"
                        </p>
                    `
                },

                {
                    id: "bib-4",
                    title: "Kijan pou etidye yon pasaj",
                    summary:
                        "Yon metòd senp pou obsève, konprann epi aplike tèks la.",
                    content: `
                        <h2>Kijan pou etidye yon pasaj?</h2>

                        <h3>1. Obsèvasyon</h3>
                        <p>
                            Gade sa tèks la di san prese pou tire konklizyon.
                            Chèche mo ki repete, moun, aksyon ak koneksyon.
                        </p>

                        <h3>2. Entèpretasyon</h3>
                        <p>
                            Chèche siyifikasyon pasaj la nan kontèks li.
                        </p>

                        <h3>3. Aplikasyon</h3>
                        <p>
                            Reflechi sou fason verite ou konprann nan ka
                            enfliyanse fason ou panse ak aji.
                        </p>

                        <div class="lesson-note">
                            <strong>Fòmil:</strong>
                            Obsève → Entèprete → Aplike.
                        </div>
                    `
                }
            ]
        },

        {
            id: "christology",
            title: "Krisoloji: Konprann Jezi Kris",
            category: "theology",
            level: "Entèmedyè",
            description:
                "Etid sou idantite Jezi Kris, nati li ak siyifikasyon ministè li.",
            duration: "4 chapit",
            color: "blue",
            chapters: [
                {
                    id: "chr-1",
                    title: "Kiyès Jezi ye?",
                    summary:
                        "Yon entwodiksyon sou idantite Jezi nan teyoloji kretyèn.",
                    content: `
                        <h2>Kiyès Jezi ye?</h2>

                        <p>
                            Krisoloji se branch teyoloji ki konsantre sou
                            moun Jezi Kris la ak travay li.
                        </p>

                        <p>
                            Nan teyoloji kretyèn klasik, Jezi konprann kòm
                            Kris la, Pawòl la ki vin moun, epi kòm moun ki gen
                            yon plas santral nan plan delivrans lan.
                        </p>

                        <h3>De kestyon prensipal</h3>

                        <ul>
                            <li>Kiyès Jezi ye?</li>
                            <li>Kisa Jezi te vin fè?</li>
                        </ul>
                    `
                },

                {
                    id: "chr-2",
                    title: "Divinite ak limanite Kris",
                    summary:
                        "Konprann fason teyoloji kretyèn pale sou Jezi kòm vrè Bondye ak vrè moun.",
                    content: `
                        <h2>Divinite ak limanite Kris</h2>

                        <p>
                            Teyoloji kretyèn istorik la konfese Jezi kòm
                            vrèman Bondye epi vrèman moun.
                        </p>

                        <p>
                            Sa vle di kesyon sou idantite Kris la pa limite
                            sèlman nan moralite oswa nan ansèyman li.
                            Li touche fason kretyen konprann moun Jezi a.
                        </p>

                        <div class="lesson-note">
                            <strong>Pwen etid:</strong>
                            Lè w rankontre yon deklarasyon teyolojik sou Kris,
                            mande ki pasaj biblik ak ki lojik teyolojik ki
                            soutni deklarasyon an.
                        </div>
                    `
                },

                {
                    id: "chr-3",
                    title: "Travay Kris la",
                    summary:
                        "Yon entwodiksyon sou misyon ak travay Jezi.",
                    content: `
                        <h2>Travay Kris la</h2>

                        <p>
                            Travay Kris la gen ladan predikasyon Wayòm Bondye,
                            ministè li, lanmò li ak rezirèksyon li.
                        </p>

                        <p>
                            Diferan tradisyon teyolojik mete aksan sou diferan
                            aspè travay Kris la, men yo tout konsidere travay
                            Kris la kòm santral nan lafwa kretyèn.
                        </p>
                    `
                },

                {
                    id: "chr-4",
                    title: "Rezirèksyon an",
                    summary:
                        "Poukisa rezirèksyon Jezi enpòtan nan lafwa kretyèn.",
                    content: `
                        <h2>Rezirèksyon an</h2>

                        <p>
                            Rezirèksyon Jezi se youn nan deklarasyon santral
                            lafwa kretyèn nan. Li gen konsekans pou fason
                            kretyen konprann Kris, espwa ak lavni.
                        </p>

                        <p>
                            Pou etidye sijè a seryezman, li enpòtan pou li
                            temwayaj levanjil yo ak lòt tèks Nouvo Testaman
                            ki pale sou rezirèksyon an.
                        </p>
                    `
                }
            ]
        },

        {
            id: "trinity",
            title: "Trinite",
            category: "doctrine",
            level: "Entèmedyè",
            description:
                "Etid sou fason teyoloji kretyèn tradisyonèl la pale sou Papa, Pitit ak Sentespri.",
            duration: "4 chapit",
            color: "purple",
            chapters: [
                {
                    id: "tri-1",
                    title: "Entwodiksyon nan Trinite",
                    summary:
                        "Poukisa mo Trinite a itilize nan teyoloji kretyèn.",
                    content: `
                        <h2>Entwodiksyon nan Trinite</h2>

                        <p>
                            Trinite se fason teyoloji kretyèn tradisyonèl la
                            rezime ansèyman sou yon sèl Bondye epi relasyon
                            Papa, Pitit ak Sentespri.
                        </p>

                        <p>
                            Mo "Trinite" a sèvi kòm yon tèm teyolojik pou
                            òganize plizyè deklarasyon biblik ansanm.
                        </p>

                        <div class="lesson-note">
                            <strong>Atansyon:</strong>
                            Trinite pa vle di twa bondye. Doktrin nan kenbe
                            konfesyon yon sèl Bondye pandan li pale de Papa,
                            Pitit ak Sentespri.
                        </div>
                    `
                },

                {
                    id: "tri-2",
                    title: "Papa, Pitit ak Sentespri",
                    summary:
                        "Etid sou fason twa yo parèt nan ansèyman kretyèn.",
                    content: `
                        <h2>Papa, Pitit ak Sentespri</h2>

                        <p>
                            Nouvo Testaman an pale sou Papa, Pitit ak Sentespri
                            nan plizyè kontèks. Teyoloji pita te travay pou
                            eksplike relasyon sa yo avèk plis presizyon.
                        </p>

                        <p>
                            Etid serye mande pou pa konfonn diferan kategori
                            tankou "yon sèl Bondye" ak "distenksyon pèsonèl".
                        </p>
                    `
                },

                {
                    id: "tri-3",
                    title: "Langaj teyolojik",
                    summary:
                        "Konprann kèk mo yo itilize pou eksplike Trinite.",
                    content: `
                        <h2>Langaj teyolojik</h2>

                        <p>
                            Teyoloji sèvi ak tèm teknik pou eseye evite
                            kontradiksyon lè l ap pale sou Bondye.
                        </p>

                        <ul>
                            <li>Yon sèl Bondye.</li>
                            <li>Distinctions ant Papa, Pitit ak Sentespri.</li>
                            <li>Pa twa bondye separe.</li>
                        </ul>
                    `
                },

                {
                    id: "tri-4",
                    title: "Erè komen sou Trinite",
                    summary:
                        "Kèk konfizyon komen ak fason pou egzamine yo.",
                    content: `
                        <h2>Erè komen sou Trinite</h2>

                        <p>
                            Gen plizyè fason moun ka twò senplifye doktrin nan.
                            Se poutèt sa li itil pou konpare chak eksplikasyon
                            ak ansèyman li pretann reprezante.
                        </p>

                        <p>
                            Pi bon metòd la se defini tèm yo klèman,
                            prezante pozisyon an fidèlman epi egzamine
                            tèks ki itilize pou soutni li.
                        </p>
                    `
                }
            ]
        },

        {
            id: "church-history",
            title: "Istwa Legliz",
            category: "history",
            level: "Debitan",
            description:
                "Yon ti vwayaj atravè kèk gwo etap nan istwa legliz kretyèn.",
            duration: "4 chapit",
            color: "green",
            chapters: [
                {
                    id: "his-1",
                    title: "Premye legliz la",
                    summary:
                        "Kòmansman kominote kretyèn yo nan premye syèk yo.",
                    content: `
                        <h2>Premye legliz la</h2>

                        <p>
                            Premye kominote kretyèn yo te grandi nan kontèks
                            jwif ak Women premye syèk la.
                        </p>

                        <p>
                            Liv Travay Apot yo bay yon temwayaj enpòtan sou
                            ekspansyon mouvman kretyèn nan.
                        </p>
                    `
                },

                {
                    id: "his-2",
                    title: "Konsil ak doktrin",
                    summary:
                        "Poukisa premye syèk yo te gen gwo deba teyolojik.",
                    content: `
                        <h2>Konsil ak doktrin</h2>

                        <p>
                            Pandan plizyè syèk, kretyen yo te diskite sou
                            kestyon tankou idantite Kris ak relasyon li ak Papa.
                        </p>

                        <p>
                            Konsil yo te vin sèvi kòm youn nan mwayen istorik
                            legliz la te itilize pou fòmile konfesyon doktrinal.
                        </p>
                    `
                },

                {
                    id: "his-3",
                    title: "Reformasyon",
                    summary:
                        "Yon entwodiksyon sou gwo mouvman reformasyon an.",
                    content: `
                        <h2>Reformasyon</h2>

                        <p>
                            Reformasyon an te yon mouvman istorik ki te gen
                            gwo konsekans pou legliz oksidantal la.
                        </p>

                        <p>
                            Li te pote deba sou otorite, jistifikasyon,
                            legliz, sakreman ak relasyon ant tradisyon
                            ak Ekriti.
                        </p>
                    `
                },

                {
                    id: "his-4",
                    title: "Legliz jodi a",
                    summary:
                        "Divèsite tradisyon kretyèn nan epòk modèn lan.",
                    content: `
                        <h2>Legliz jodi a</h2>

                        <p>
                            Jodi a gen anpil tradisyon ak denominasyon kretyèn.
                            Yo pataje kèk konfesyon fondamantal pandan yo
                            ka diferan sou doktrin, litiji ak òganizasyon.
                        </p>

                        <p>
                            Etid istwa ede nou konprann kote anpil nan
                            diferans sa yo soti.
                        </p>
                    `
                }
            ]
        }
    ];


    /* =========================================================
       DICTIONARY
       ========================================================= */

    const DICTIONARY = [
        {
            term: "Alyans",
            letter: "A",
            definition:
                "Yon relasyon oswa angajman etabli ant pati yo. Nan Bib la, tèm nan gen yon plas enpòtan nan fason istwa relasyon Bondye ak pèp li prezante."
        },
        {
            term: "Apokalips",
            letter: "A",
            definition:
                "Yon fason literè ki souvan itilize imaj, senbòl ak revelasyon pou pale sou reyalite diven, jijman oswa espwa."
        },
        {
            term: "Ekriti",
            letter: "E",
            definition:
                "Yon fason kretyen yo souvan rele tèks biblik yo lè y ap pale sou otorite ak temwayaj yo."
        },
        {
            term: "Eschatoloji",
            letter: "E",
            definition:
                "Branch teyoloji ki etidye kesyon ki gen rapò ak fen listwa, jijman, rezirèksyon ak espwa final."
        },
        {
            term: "Jistis",
            letter: "J",
            definition:
                "Yon konsèp ki gen plizyè sans nan Bib la ak teyoloji, tankou sa ki dwat devan Bondye ak relasyon ki dwat ak lòt moun."
        },
        {
            term: "Jistifikasyon",
            letter: "J",
            definition:
                "Tèm teyolojik ki pale sou fason yon moun konsidere kòm jis devan Bondye, avèk diferan eksplikasyon nan divès tradisyon kretyèn."
        },
        {
            term: "Krisoloji",
            letter: "K",
            definition:
                "Branch teyoloji ki etidye moun Jezi Kris la ak travay li."
        },
        {
            term: "Sentespri",
            letter: "S",
            definition:
                "Non yo itilize nan tradisyon kretyèn pou pale sou Sentespri, youn nan sijè santral teyoloji Trinite."
        },
        {
            term: "Sanktifikasyon",
            letter: "S",
            definition:
                "Tèm ki itilize pou pale sou pwosesis kwasans nan sentete ak transfòmasyon lavi yon moun."
        },
        {
            term: "Sovtaj",
            letter: "S",
            definition:
                "Tèm jeneral pou pale sou delivrans oswa liberasyon Bondye bay; fason li defini ka varye selon kontèks teyolojik."
        },
        {
            term: "Trinite",
            letter: "T",
            definition:
                "Doktrin kretyèn tradisyonèl ki pale sou yon sèl Bondye nan relasyon Papa, Pitit ak Sentespri."
        },
        {
            term: "Teyoloji",
            letter: "T",
            definition:
                "Etid sistematik sou Bondye, lafwa, revelasyon ak lòt kesyon fondamantal sou reyalite diven."
        }
    ];


    /* =========================================================
       QUIZ DATA
       ========================================================= */

    const QUIZZES = {
        "introduction-bible": [
            {
                question: "Ki de gwo pati tradisyon kretyèn nan itilize pou divize Bib la?",
                answers: [
                    "Pwezi ak pwofesi",
                    "Ansyen Testaman ak Nouvo Testaman",
                    "Lalwa ak liv istwa",
                    "Evanjil ak Sòm"
                ],
                correct: 1,
                explanation:
                    "Bib kretyèn nan òganize an Ansyen Testaman ak Nouvo Testaman."
            },
            {
                question: "Ki premye etap nan metòd Obsève → Entèprete → Aplike?",
                answers: [
                    "Aplikasyon",
                    "Entèpretasyon",
                    "Obsèvasyon",
                    "Predikasyon"
                ],
                correct: 2,
                explanation:
                    "Obsèvasyon vini an premye: nou gade sa tèks la di anvan nou tire konklizyon."
            },
            {
                question: "Poukisa kontèks enpòtan?",
                answers: [
                    "Pou fè tèks la pi kout",
                    "Pou evite bay pasaj la yon siyifikasyon li pa t fèt pou genyen",
                    "Pou retire tout kestyon",
                    "Pou chanje tèks la"
                ],
                correct: 1,
                explanation:
                    "Kontèks ede nou konprann pasaj la nan anviwònman literè, istorik ak sosyal li."
            }
        ],

        "christology": [
            {
                question: "Ki branch teyoloji ki konsantre sou moun Jezi Kris la?",
                answers: [
                    "Eschatoloji",
                    "Krisoloji",
                    "Eklesyoloji",
                    "Apokalips"
                ],
                correct: 1,
                explanation:
                    "Krisoloji se branch teyoloji ki etidye moun Kris la ak travay li."
            },
            {
                question: "Ki de gwo kestyon Krisoloji poze?",
                answers: [
                    "Ki kote legliz ye? Ki lè sèvis la kòmanse?",
                    "Kiyès Jezi ye? Kisa Jezi te vin fè?",
                    "Ki moun ki ekri Sòm yo? Ki lang yo itilize?",
                    "Ki premye wa Izrayèl? Ki vil ki pi ansyen?"
                ],
                correct: 1,
                explanation:
                    "Krisoloji konsantre sou idantite Jezi ak travay li."
            },
            {
                question: "Kisa teyoloji kretyèn klasik la konfese sou Jezi?",
                answers: [
                    "Li te sèlman yon pwofesè",
                    "Li te sèlman yon zanj",
                    "Li vrèman Bondye epi vrèman moun",
                    "Li pa t gen okenn kò"
                ],
                correct: 2,
                explanation:
                    "Konfesyon kretyèn klasik la pale de Jezi kòm vrè Bondye ak vrè moun."
            }
        ],

        "trinity": [
            {
                question: "Kisa doktrin Trinite a pa vle di?",
                answers: [
                    "Yon sèl Bondye",
                    "Papa, Pitit ak Sentespri",
                    "Twa bondye separe",
                    "Yon sijè teyolojik"
                ],
                correct: 2,
                explanation:
                    "Trinite pa vle di twa bondye separe."
            },
            {
                question: "Poukisa mo Trinite a itil?",
                answers: [
                    "Pou ranplase Bib la",
                    "Pou òganize plizyè deklarasyon teyolojik ansanm",
                    "Pou di gen twa bondye",
                    "Pou retire tout mistè"
                ],
                correct: 1,
                explanation:
                    "Tèm nan ede teyoloji òganize ansèyman sou Bondye, Papa, Pitit ak Sentespri."
            }
        ],

        "church-history": [
            {
                question: "Ki liv Nouvo Testaman ki bay yon temwayaj enpòtan sou ekspansyon premye legliz la?",
                answers: [
                    "Travay Apot yo",
                    "Jenèz",
                    "Pwovèb",
                    "Malachi"
                ],
                correct: 0,
                explanation:
                    "Travay Apot yo rakonte anpil bagay sou premye kominote kretyèn yo ak ekspansyon mouvman an."
            },
            {
                question: "Ki sa Reformasyon an te afekte?",
                answers: [
                    "Sèlman achitekti",
                    "Otorite, jistifikasyon, legliz ak lòt kesyon teyolojik",
                    "Sèlman mizik",
                    "Sèlman kalandriye"
                ],
                correct: 1,
                explanation:
                    "Reformasyon an te pote gwo deba sou anpil kestyon teyolojik ak eklezyal."
            }
        ]
    };


    /* =========================================================
       STATE
       ========================================================= */

    const DEFAULT_STATE = {
        version: 1,

        currentView: "home",

        currentStudyId: null,
        currentChapterIndex: 0,

        completedChapters: [],
        startedStudies: [],
        bookmarks: [],

        studyZoom: APP.zoom.default,

        darkMode: false,

        quizCount: 0,

        quizResults: {},

        lastRead: null,

        memeMessages: [],

        lastUpdated: Date.now()
    };

    let state = clone(DEFAULT_STATE);

    let db = null;

    let currentCategory = "all";

    let currentQuiz = null;

    let modalPreviousFocus = null;

    let saveTimer = null;

    let pinchState = {
        active: false,
        startDistance: 0,
        startScale: 1,
        startCenterX: 0,
        startCenterY: 0
    };

    let lastTapTime = 0;


    /* =========================================================
       HELPERS
       ========================================================= */

    const $ = (selector, root = document) => {
        return root.querySelector(selector);
    };

    const $$ = (selector, root = document) => {
        return Array.from(root.querySelectorAll(selector));
    };

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    function round(value, decimals = 2) {
        const factor = 10 ** decimals;
        return Math.round(value * factor) / factor;
    }

    function normalizeText(value) {
        return String(value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim();
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatPercent(value) {
        return `${Math.round(clamp(value, 0, 100))}%`;
    }

    function nowISO() {
        return new Date().toISOString();
    }

    function uid(prefix = "id") {
        return `${prefix}_${Date.now()}_${Math.random()
            .toString(36)
            .slice(2, 9)}`;
    }

    function isElementVisible(element) {
        return !!element && !element.hidden;
    }

    function announce(message) {
        const live = $("#liveRegion");

        if (!live) {
            return;
        }

        live.textContent = "";

        window.setTimeout(() => {
            live.textContent = String(message);
        }, 20);
    }


    /* =========================================================
       TOAST
       ========================================================= */

    function showToast(message, type = "info", duration = 3000) {
        const container = $("#toastContainer");

        if (!container) {
            return;
        }

        const toast = document.createElement("div");

        toast.className = `meme-toast meme-toast-${type}`;

        toast.setAttribute("role", "status");

        toast.innerHTML = `
            <span class="meme-toast-icon">
                ${type === "success" ? "✓" :
                  type === "error" ? "!" :
                  type === "warning" ? "⚠" : "i"}
            </span>
            <span class="meme-toast-message">
                ${escapeHTML(message)}
            </span>
            <button type="button"
                    class="meme-toast-close"
                    aria-label="Fèmen notifikasyon">
                ✕
            </button>
        `;

        container.appendChild(toast);

        const close = () => {
            toast.classList.add("is-closing");

            window.setTimeout(() => {
                toast.remove();
            }, 180);
        };

        $(".meme-toast-close", toast)?.addEventListener("click", close);

        window.setTimeout(close, duration);
    }


    /* =========================================================
       DATABASE
       ========================================================= */

    function openDatabase() {
        return new Promise((resolve) => {
            if (!("indexedDB" in window)) {
                resolve(null);
                return;
            }

            const request = indexedDB.open(
                APP.dbName,
                APP.dbVersion
            );

            request.onupgradeneeded = (event) => {
                const database = event.target.result;

                if (!database.objectStoreNames.contains(APP.storeName)) {
                    database.createObjectStore(APP.storeName);
                }
            };

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = () => {
                resolve(null);
            };

            request.onblocked = () => {
                resolve(null);
            };
        });
    }

    function idbGet(key) {
        return new Promise((resolve) => {
            if (!db) {
                resolve(null);
                return;
            }

            try {
                const transaction = db.transaction(
                    APP.storeName,
                    "readonly"
                );

                const store = transaction.objectStore(APP.storeName);

                const request = store.get(key);

                request.onsuccess = () => {
                    resolve(request.result ?? null);
                };

                request.onerror = () => {
                    resolve(null);
                };
            } catch {
                resolve(null);
            }
        });
    }

    function idbSet(key, value) {
        return new Promise((resolve) => {
            if (!db) {
                resolve(false);
                return;
            }

            try {
                const transaction = db.transaction(
                    APP.storeName,
                    "readwrite"
                );

                const store = transaction.objectStore(APP.storeName);

                const request = store.put(value, key);

                request.onsuccess = () => {
                    resolve(true);
                };

                request.onerror = () => {
                    resolve(false);
                };
            } catch {
                resolve(false);
            }
        });
    }

    function readLocalStorage() {
        try {
            const raw = localStorage.getItem(APP.storageKey);

            if (!raw) {
                return null;
            }

            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    function writeLocalStorage() {
        try {
            localStorage.setItem(
                APP.storageKey,
                JSON.stringify(state)
            );

            return true;
        } catch {
            return false;
        }
    }

    async function loadState() {
        const databaseState = await idbGet("state");

        const localState = readLocalStorage();

        const loaded =
            databaseState ||
            localState ||
            clone(DEFAULT_STATE);

        state = {
            ...clone(DEFAULT_STATE),
            ...loaded
        };

        state.completedChapters =
            Array.isArray(state.completedChapters)
                ? state.completedChapters
                : [];

        state.startedStudies =
            Array.isArray(state.startedStudies)
                ? state.startedStudies
                : [];

        state.bookmarks =
            Array.isArray(state.bookmarks)
                ? state.bookmarks
                : [];

        state.memeMessages =
            Array.isArray(state.memeMessages)
                ? state.memeMessages
                : [];

        state.quizResults =
            state.quizResults &&
            typeof state.quizResults === "object"
                ? state.quizResults
                : {};

        state.studyZoom = clamp(
            Number(state.studyZoom) || 1,
            APP.zoom.min,
            APP.zoom.max
        );
    }

    async function persistState() {
        state.lastUpdated = Date.now();

        writeLocalStorage();

        await idbSet("state", state);
    }

    function saveStateSoon() {
        clearTimeout(saveTimer);

        saveTimer = window.setTimeout(() => {
            persistState();
        }, 250);
    }


    /* =========================================================
       STUDY HELPERS
       ========================================================= */

    function getStudy(studyId) {
        return STUDIES.find(study => study.id === studyId) || null;
    }

    function getChapter(studyId, chapterIndex) {
        const study = getStudy(studyId);

        if (!study) {
            return null;
        }

        return study.chapters[chapterIndex] || null;
    }

    function chapterKey(studyId, chapterId) {
        return `${studyId}:${chapterId}`;
    }

    function isChapterCompleted(studyId, chapterId) {
        return state.completedChapters.includes(
            chapterKey(studyId, chapterId)
        );
    }

    function getStudyProgress(studyId) {
        const study = getStudy(studyId);

        if (!study || !study.chapters.length) {
            return 0;
        }

        const completed = study.chapters.filter(chapter =>
            isChapterCompleted(studyId, chapter.id)
        ).length;

        return Math.round(
            (completed / study.chapters.length) * 100
        );
    }

    function getGlobalProgress() {
        const totalChapters = STUDIES.reduce(
            (total, study) => total + study.chapters.length,
            0
        );

        if (!totalChapters) {
            return 0;
        }

        const completed = state.completedChapters.length;

        return Math.round(
            (completed / totalChapters) * 100
        );
    }

    function getCompletedChapterCount() {
        return state.completedChapters.length;
    }

    function getStartedStudyCount() {
        return state.startedStudies.length;
    }

    function markStudyStarted(studyId) {
        if (!state.startedStudies.includes(studyId)) {
            state.startedStudies.push(studyId);
            saveStateSoon();
        }
    }

    function markChapterCompleted(studyId, chapterId) {
        const key = chapterKey(studyId, chapterId);

        if (!state.completedChapters.includes(key)) {
            state.completedChapters.push(key);
        }

        markStudyStarted(studyId);

        saveStateSoon();
    }


    /* =========================================================
       VIEW MANAGEMENT
       ========================================================= */

    function closeDrawer() {
        const drawer = $("#sideDrawer");
        const overlay = $("#drawerOverlay");

        drawer?.classList.remove("open");

        if (overlay) {
            overlay.hidden = true;
        }

        document.body.classList.remove("drawer-open");
    }

    function openDrawer() {
        const drawer = $("#sideDrawer");
        const overlay = $("#drawerOverlay");

        drawer?.classList.add("open");

        if (overlay) {
            overlay.hidden = false;
        }

        document.body.classList.add("drawer-open");
    }

    function updateNavigation(viewName) {
        $$(".nav-item[data-view]").forEach(button => {
            button.classList.toggle(
                "active",
                button.dataset.view === viewName
            );
        });
    }

    function setView(viewName, options = {}) {
        const allowedViews = [
            "home",
            "studies",
            "study-detail",
            "dictionary",
            "meme",
            "bookmarks",
            "progress",
            "settings"
        ];

        if (!allowedViews.includes(viewName)) {
            viewName = "home";
        }

        $$(".view[data-view-section]").forEach(view => {
            const isActive =
                view.dataset.viewSection === viewName;

            view.hidden = !isActive;
            view.classList.toggle("active-view", isActive);
        });

        state.currentView = viewName;

        updateNavigation(viewName);

        closeDrawer();

        if (!options.skipRender) {
            renderView(viewName);
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        saveStateSoon();

        announce(`Seksyon ${viewName} ouvri.`);
    }

    function renderView(viewName) {
        switch (viewName) {
            case "home":
                renderHome();
                break;

            case "studies":
                renderStudies();
                break;

            case "study-detail":
                renderLesson();
                break;

            case "dictionary":
                renderDictionary();
                break;

            case "meme":
                renderMemeHistory();
                break;

            case "bookmarks":
                renderBookmarks();
                break;

            case "progress":
                renderProgress();
                break;

            case "settings":
                renderSettings();
                break;
        }

        updateStats();
    }


    /* =========================================================
       HOME
       ========================================================= */

    function renderHome() {
        renderFeaturedStudies();
        renderContinueStudy();
        updateStats();
    }

    function renderFeaturedStudies() {
        const grid = $("#featuredStudiesGrid");

        if (!grid) {
            return;
        }

        const studies = STUDIES.slice(0, 4);

        grid.innerHTML = studies
            .map(study => createStudyCard(study))
            .join("");

        attachStudyCardEvents(grid);
    }

    function renderContinueStudy() {
        const container = $("#continueStudyContainer");

        if (!container) {
            return;
        }

        const last = state.lastRead;

        if (!last) {
            container.innerHTML = `
                <div class="empty-card">
                    <div class="empty-icon">▤</div>

                    <h3>
                        Ou poko kòmanse yon etid
                    </h3>

                    <p>
                        Chwazi yon etid pou MEME ka kòmanse swiv pwogrè ou.
                    </p>

                    <button class="primary-button"
                            type="button"
                            data-view-target="studies">
                        Gade etid yo
                    </button>
                </div>
            `;

            bindViewTargetButtons(container);

            return;
        }

        const study = getStudy(last.studyId);

        if (!study) {
            container.innerHTML = "";
            return;
        }

        const chapterIndex = clamp(
            Number(last.chapterIndex) || 0,
            0,
            study.chapters.length - 1
        );

        const chapter = study.chapters[chapterIndex];

        const progress = getStudyProgress(study.id);

        container.innerHTML = `
            <article class="study-card continue-card"
                     data-study-id="${escapeHTML(study.id)}">

                <div class="study-card-top">
                    <span class="study-category">
                        ${escapeHTML(categoryLabel(study.category))}
                    </span>

                    <span class="study-progress-mini">
                        ${progress}%
                    </span>
                </div>

                <h3>${escapeHTML(study.title)}</h3>

                <p>
                    ${escapeHTML(chapter.title)}
                </p>

                <div class="study-card-bottom">
                    <span>
                        Chapit ${chapterIndex + 1}/${study.chapters.length}
                    </span>

                    <button type="button"
                            class="primary-button small-button"
                            data-continue-study="${escapeHTML(study.id)}"
                            data-chapter-index="${chapterIndex}">
                        Kontinye →
                    </button>
                </div>
            </article>
        `;

        const button = $(
            "[data-continue-study]",
            container
        );

        button?.addEventListener("click", () => {
            openLesson(
                study.id,
                chapterIndex
            );
        });
    }


    /* =========================================================
       STUDIES
       ========================================================= */

    function categoryLabel(category) {
        const labels = {
            all: "Tout",
            biblical: "Etid Biblik",
            theology: "Teyoloji",
            doctrine: "Doktrin",
            history: "Istwa Legliz"
        };

        return labels[category] || category;
    }

    function createStudyCard(study) {
        const progress = getStudyProgress(study.id);

        return `
            <article class="study-card"
                     data-study-id="${escapeHTML(study.id)}">

                <div class="study-card-top">

                    <span class="study-category">
                        ${escapeHTML(categoryLabel(study.category))}
                    </span>

                    <span class="study-level">
                        ${escapeHTML(study.level)}
                    </span>

                </div>

                <div class="study-card-icon ${escapeHTML(study.color)}">
                    ▤
                </div>

                <h3>
                    ${escapeHTML(study.title)}
                </h3>

                <p>
                    ${escapeHTML(study.description)}
                </p>

                <div class="study-card-meta">

                    <span>
                        ${escapeHTML(study.duration)}
                    </span>

                    <span>
                        ${progress}%
                    </span>

                </div>

                <div class="progress-track study-card-progress">
                    <div class="progress-fill"
                         style="width:${progress}%">
                    </div>
                </div>

                <div class="study-card-actions">

                    <button type="button"
                            class="primary-button small-button"
                            data-open-study="${escapeHTML(study.id)}">
                        ${progress > 0 ? "Kontinye" : "Kòmanse"}
                    </button>

                    <button type="button"
                            class="secondary-button small-button"
                            data-open-quiz="${escapeHTML(study.id)}">
                        Quiz
                    </button>

                </div>

            </article>
        `;
    }

    function attachStudyCardEvents(root = document) {
        $$("[data-open-study]", root).forEach(button => {
            button.addEventListener("click", () => {
                openLesson(button.dataset.openStudy, 0);
            });
        });

        $$("[data-open-quiz]", root).forEach(button => {
            button.addEventListener("click", () => {
                openQuiz(button.dataset.openQuiz);
            });
        });
    }

    function renderStudies() {
        const grid = $("#allStudiesGrid");

        if (!grid) {
            return;
        }

        const filtered = STUDIES.filter(study => {
            return (
                currentCategory === "all" ||
                study.category === currentCategory
            );
        });

        if (!filtered.length) {
            grid.innerHTML = `
                <div class="empty-card">
                    <div class="empty-icon">▤</div>
                    <h3>Pa gen etid nan kategori sa a</h3>
                    <p>
                        Chwazi yon lòt kategori.
                    </p>
                </div>
            `;

            return;
        }

        grid.innerHTML = filtered
            .map(study => createStudyCard(study))
            .join("");

        attachStudyCardEvents(grid);
    }

    function setStudyCategory(category) {
        currentCategory = category || "all";

        $$(".category-tab").forEach(tab => {
            tab.classList.toggle(
                "active",
                tab.dataset.category === currentCategory
            );
        });

        renderStudies();
    }


    /* =========================================================
       LESSON
       ========================================================= */

    function openLesson(studyId, chapterIndex = 0) {
        const study = getStudy(studyId);

        if (!study) {
            showToast(
                "Etid sa a pa disponib.",
                "error"
            );
            return;
        }

        const safeIndex = clamp(
            Number(chapterIndex) || 0,
            0,
            study.chapters.length - 1
        );

        state.currentStudyId = study.id;
        state.currentChapterIndex = safeIndex;

        state.lastRead = {
            studyId: study.id,
            chapterIndex: safeIndex,
            updatedAt: nowISO()
        };

        markStudyStarted(study.id);

        setView("study-detail");

        applyReaderZoom();

        saveStateSoon();
    }

    function renderLesson() {
        const study = getStudy(state.currentStudyId);

        if (!study) {
            setView("studies");
            return;
        }

        const index = clamp(
            Number(state.currentChapterIndex) || 0,
            0,
            study.chapters.length - 1
        );

        state.currentChapterIndex = index;

        const chapter = study.chapters[index];

        const header = $("#lessonHeader");
        const content = $("#lessonContent");

        if (!header || !content) {
            return;
        }

        const progress = getStudyProgress(study.id);

        header.innerHTML = `
            <span class="eyebrow">
                ${escapeHTML(categoryLabel(study.category))}
            </span>

            <h1>
                ${escapeHTML(chapter.title)}
            </h1>

            <p>
                ${escapeHTML(chapter.summary)}
            </p>

            <div class="lesson-meta">
                <span>
                    ${escapeHTML(study.title)}
                </span>

                <span>
                    Chapit ${index + 1} sou ${study.chapters.length}
                </span>
            </div>
        `;

        content.innerHTML = `
            <div class="lesson-study-title">
                ${escapeHTML(study.title)}
            </div>

            ${chapter.content}

            <div class="lesson-completion-card">
                <strong>
                    Fini chapit sa?
                </strong>

                <p>
                    Make it complete to update your study progress.
                </p>

                <button type="button"
                        class="primary-button"
                        id="completeCurrentChapterButton">
                    ${isChapterCompleted(study.id, chapter.id)
                        ? "✓ Chapit fini"
                        : "Make chapit la fini"}
                </button>
            </div>
        `;

        const completeButton =
            $("#completeCurrentChapterButton");

        completeButton?.addEventListener("click", () => {
            markChapterCompleted(
                study.id,
                chapter.id
            );

            renderLesson();
            updateStats();

            showToast(
                "Chapit la make kòm fini.",
                "success"
            );
        });

        updateLessonControls(study, index);

        updateLessonProgress(study);

        updateSaveButtons(study, chapter);

        applyReaderZoom();

        initializeLessonLinks(content);
    }

    function initializeLessonLinks(root) {
        $$("[data-study-id]", root).forEach(element => {
            element.addEventListener("click", () => {
                openLesson(element.dataset.studyId);
            });
        });
    }

    function updateLessonControls(study, index) {
        const previous = $("#previousChapterButton");
        const next = $("#nextChapterButton");

        if (previous) {
            previous.disabled = index <= 0;
        }

        if (next) {
            next.disabled =
                index >= study.chapters.length - 1;
        }
    }

    function goToPreviousChapter() {
        const study = getStudy(state.currentStudyId);

        if (!study) {
            return;
        }

        if (state.currentChapterIndex <= 0) {
            showToast(
                "Ou deja sou premye chapit la.",
                "info"
            );
            return;
        }

        state.currentChapterIndex -= 1;

        state.lastRead = {
            studyId: study.id,
            chapterIndex: state.currentChapterIndex,
            updatedAt: nowISO()
        };

        renderLesson();

        saveStateSoon();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function goToNextChapter() {
        const study = getStudy(state.currentStudyId);

        if (!study) {
            return;
        }

        const current =
            study.chapters[state.currentChapterIndex];

        if (current) {
            markChapterCompleted(
                study.id,
                current.id
            );
        }

        if (
            state.currentChapterIndex >=
            study.chapters.length - 1
        ) {
            renderLesson();

            showToast(
                "Bravo! Ou fini tout chapit etid sa a.",
                "success"
            );

            updateStats();

            return;
        }

        state.currentChapterIndex += 1;

        state.lastRead = {
            studyId: study.id,
            chapterIndex: state.currentChapterIndex,
            updatedAt: nowISO()
        };

        renderLesson();

        saveStateSoon();

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }


    /* =========================================================
       BOOKMARKS
       ========================================================= */

    function bookmarkId(studyId, chapterId) {
        return `${studyId}:${chapterId}`;
    }

    function isBookmarked(studyId, chapterId) {
        return state.bookmarks.some(
            item =>
                item.id === bookmarkId(studyId, chapterId)
        );
    }

    function toggleBookmark(studyId, chapterId) {
        const study = getStudy(studyId);
        const chapter = study
            ? study.chapters.find(
                item => item.id === chapterId
            )
            : null;

        if (!study || !chapter) {
            return;
        }

        const id = bookmarkId(
            studyId,
            chapterId
        );

        const existingIndex =
            state.bookmarks.findIndex(
                item => item.id === id
            );

        if (existingIndex >= 0) {
            state.bookmarks.splice(
                existingIndex,
                1
            );

            showToast(
                "Yo retire chapit la nan sa ou te sove yo.",
                "info"
            );
        } else {
            state.bookmarks.push({
                id,
                studyId,
                chapterId,
                title: chapter.title,
                studyTitle: study.title,
                summary: chapter.summary,
                createdAt: nowISO()
            });

            showToast(
                "Chapit la sove.",
                "success"
            );
        }

        saveStateSoon();

        updateSaveButtons(study, chapter);

        updateStats();
    }

    function updateSaveButtons(study, chapter) {
        const saved =
            isBookmarked(
                study.id,
                chapter.id
            );

        const buttons = [
            $("#lessonSaveButton"),
            $("#saveReadingButton")
        ].filter(Boolean);

        buttons.forEach(button => {
            button.classList.toggle(
                "saved",
                saved
            );

            if (button.id === "lessonSaveButton") {
                button.innerHTML = saved
                    ? "★ <span>Sove</span>"
                    : "☆ <span>Sauvegarder</span>";
            } else {
                button.textContent =
                    saved
                        ? "★ Sove"
                        : "☆ Sauvegarder";
            }

            button.setAttribute(
                "aria-pressed",
                String(saved)
            );
        });
    }

    function renderBookmarks() {
        const container =
            $("#bookmarksContainer");

        if (!container) {
            return;
        }

        if (!state.bookmarks.length) {
            container.innerHTML = `
                <div class="empty-card">
                    <div class="empty-icon">☆</div>

                    <h3>
                        Pa gen anyen sove pou kounye a
                    </h3>

                    <p>
                        Lè ou jwenn yon pasaj ou vle konsève,
                        peze bouton « Sauvegarder ».
                    </p>

                    <button type="button"
                            class="primary-button"
                            data-view-target="studies">
                        Chèche yon etid
                    </button>
                </div>
            `;

            bindViewTargetButtons(container);

            return;
        }

        container.innerHTML = state.bookmarks
            .map(item => `
                <article class="saved-item"
                         data-bookmark-id="${escapeHTML(item.id)}">

                    <div>
                        <span class="eyebrow">
                            ${escapeHTML(item.studyTitle)}
                        </span>

                        <h3>
                            ${escapeHTML(item.title)}
                        </h3>

                        <p>
                            ${escapeHTML(item.summary)}
                        </p>
                    </div>

                    <div class="saved-item-actions">

                        <button type="button"
                                class="primary-button small-button"
                                data-open-bookmark="${escapeHTML(item.id)}">
                            Louvri
                        </button>

                        <button type="button"
                                class="secondary-button small-button"
                                data-remove-bookmark="${escapeHTML(item.id)}">
                            Retire
                        </button>

                    </div>

                </article>
            `)
            .join("");

        $$("[data-open-bookmark]", container)
            .forEach(button => {
                button.addEventListener("click", () => {
                    const item =
                        state.bookmarks.find(
                            bookmark =>
                                bookmark.id ===
                                button.dataset.openBookmark
                        );

                    if (!item) {
                        return;
                    }

                    const study =
                        getStudy(item.studyId);

                    if (!study) {
                        return;
                    }

                    const chapterIndex =
                        study.chapters.findIndex(
                            chapter =>
                                chapter.id ===
                                item.chapterId
                        );

                    openLesson(
                        item.studyId,
                        Math.max(0, chapterIndex)
                    );
                });
            });

        $$("[data-remove-bookmark]", container)
            .forEach(button => {
                button.addEventListener("click", () => {
                    const index =
                        state.bookmarks.findIndex(
                            bookmark =>
                                bookmark.id ===
                                button.dataset.removeBookmark
                        );

                    if (index >= 0) {
                        state.bookmarks.splice(
                            index,
                            1
                        );

                        saveStateSoon();
                        renderBookmarks();
                        updateStats();

                        showToast(
                            "Eleman an retire.",
                            "success"
                        );
                    }
                });
            });
    }


    /* =========================================================
       PROGRESS
       ========================================================= */

    function renderProgress() {
        const global =
            getGlobalProgress();

        const circle =
            $("#globalProgressCircle");

        const number =
            $("#globalProgressNumber");

        const motivation =
            $("#progressMotivation");

        const studies =
            $("#progressStudies");

        const chapters =
            $("#progressChapters");

        const quizzes =
            $("#progressQuizzes");

        const bookmarks =
            $("#progressBookmarks");

        if (circle) {
            circle.style.setProperty(
                "--progress",
                `${global * 3.6}deg`
            );
        }

        if (number) {
            number.textContent =
                formatPercent(global);
        }

        if (motivation) {
            if (global >= 100) {
                motivation.textContent =
                    "Bravo! Ou fini tout pwogram yo.";
            } else if (global >= 75) {
                motivation.textContent =
                    "Ou prèske rive. Kontinye konsa.";
            } else if (global >= 40) {
                motivation.textContent =
                    "Ou deja fè bon pwogrè. Kontinye avanse.";
            } else if (global > 0) {
                motivation.textContent =
                    "Chak chapit ou fini pote w pi devan.";
            } else {
                motivation.textContent =
                    "Chak etap ou fè nan etid la konte.";
            }
        }

        if (studies) {
            studies.textContent =
                getStartedStudyCount();
        }

        if (chapters) {
            chapters.textContent =
                getCompletedChapterCount();
        }

        if (quizzes) {
            quizzes.textContent =
                state.quizCount || 0;
        }

        if (bookmarks) {
            bookmarks.textContent =
                state.bookmarks.length;
        }

        renderStudyProgressList();
    }

    function renderStudyProgressList() {
        const container =
            $("#studyProgressList");

        if (!container) {
            return;
        }

        container.innerHTML = STUDIES
            .map(study => {
                const progress =
                    getStudyProgress(study.id);

                return `
                    <article class="study-progress-item">

                        <div class="study-progress-heading">
                            <div>
                                <strong>
                                    ${escapeHTML(study.title)}
                                </strong>

                                <span>
                                    ${escapeHTML(study.level)}
                                </span>
                            </div>

                            <strong>
                                ${progress}%
                            </strong>
                        </div>

                        <div class="progress-track">
                            <div class="progress-fill"
                                 style="width:${progress}%">
                            </div>
                        </div>

                        <div class="study-progress-actions">

                            <span>
                                ${study.chapters.filter(chapter =>
                                    isChapterCompleted(
                                        study.id,
                                        chapter.id
                                    )
                                ).length}
                                /
                                ${study.chapters.length}
                                chapit
                            </span>

                            <button type="button"
                                    class="secondary-button small-button"
                                    data-progress-study="${escapeHTML(study.id)}">
                                Louvri
                            </button>

                        </div>

                    </article>
                `;
            })
            .join("");

        $$("[data-progress-study]", container)
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        openLesson(
                            button.dataset.progressStudy,
                            0
                        );
                    }
                );
            });
    }


    /* =========================================================
       GLOBAL STATS
       ========================================================= */

    function updateStats() {
        const total =
            $("#totalStudiesCount");

        const completed =
            $("#completedLessonsCount");

        const saved =
            $("#savedItemsCount");

        const progress =
            $("#studyProgressPercent");

        const global =
            getGlobalProgress();

        if (total) {
            total.textContent =
                STUDIES.length;
        }

        if (completed) {
            completed.textContent =
                getCompletedChapterCount();
        }

        if (saved) {
            saved.textContent =
                state.bookmarks.length;
        }

        if (progress) {
            progress.textContent =
                formatPercent(global);
        }
    }


    /* =========================================================
       DICTIONARY
       ========================================================= */

    function renderDictionary(filter = "") {
        renderDictionaryAlphabet();

        const container =
            $("#dictionaryEntries");

        if (!container) {
            return;
        }

        const query =
            normalizeText(filter);

        const entries =
            DICTIONARY
                .filter(item => {
                    if (!query) {
                        return true;
                    }

                    return (
                        normalizeText(item.term)
                            .includes(query) ||
                        normalizeText(item.definition)
                            .includes(query)
                    );
                })
                .sort((a, b) =>
                    a.term.localeCompare(
                        b.term,
                        "ht"
                    )
                );

        if (!entries.length) {
            container.innerHTML = `
                <div class="empty-card">
                    <div class="empty-icon">A</div>
                    <h3>Pa jwenn tèm nan</h3>
                    <p>
                        Eseye yon lòt mo oswa yon lòt òtograf.
                    </p>
                </div>
            `;

            return;
        }

        container.innerHTML = entries
            .map(item => `
                <article class="dictionary-entry"
                         data-letter="${escapeHTML(item.letter)}">

                    <div class="dictionary-term">
                        <span>
                            ${escapeHTML(item.letter)}
                        </span>

                        <h3>
                            ${escapeHTML(item.term)}
                        </h3>
                    </div>

                    <p>
                        ${escapeHTML(item.definition)}
                    </p>

                    <button type="button"
                            class="text-button dictionary-save-button"
                            data-save-definition="${escapeHTML(item.term)}">
                        ☆ Sove
                    </button>

                </article>
            `)
            .join("");

        $$("[data-save-definition]", container)
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        const term =
                            button.dataset.saveDefinition;

                        const item =
                            DICTIONARY.find(
                                entry =>
                                    entry.term === term
                            );

                        if (!item) {
                            return;
                        }

                        saveDictionaryEntry(item);
                    }
                );
            });
    }

    function renderDictionaryAlphabet() {
        const container =
            $("#dictionaryAlphabet");

        if (!container) {
            return;
        }

        const letters = [
            ...new Set(
                DICTIONARY.map(item => item.letter)
            )
        ].sort();

        container.innerHTML = letters
            .map(letter => `
                <button type="button"
                        class="dictionary-letter"
                        data-dictionary-letter="${escapeHTML(letter)}">
                    ${escapeHTML(letter)}
                </button>
            `)
            .join("");

        $$("[data-dictionary-letter]", container)
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        const entry =
                            $(
                                `.dictionary-entry[data-letter="${CSS.escape(button.dataset.dictionaryLetter)}"]`
                            );

                        entry?.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }
                );
            });
    }

    function saveDictionaryEntry(item) {
        const id =
            `dictionary:${normalizeText(item.term)}`;

        const exists =
            state.bookmarks.some(
                bookmark =>
                    bookmark.id === id
            );

        if (exists) {
            showToast(
                "Tèm sa a deja sove.",
                "info"
            );
            return;
        }

        state.bookmarks.push({
            id,
            type: "dictionary",
            term: item.term,
            title: item.term,
            studyTitle: "Diksyonè Teyoloji",
            summary: item.definition,
            createdAt: nowISO()
        });

        saveStateSoon();

        updateStats();

        showToast(
            `${item.term} sove.`,
            "success"
        );
    }


    /* =========================================================
       SEARCH
       ========================================================= */

    function openSearch() {
        const panel =
            $("#searchPanel");

        if (!panel) {
            return;
        }

        panel.hidden = false;

        document.body.classList.add(
            "search-open"
        );

        const input =
            $("#globalSearchInput");

        window.setTimeout(() => {
            input?.focus();
        }, 50);

        renderSearchResults("");
    }

    function closeSearch() {
        const panel =
            $("#searchPanel");

        if (!panel) {
            return;
        }

        panel.hidden = true;

        document.body.classList.remove(
            "search-open"
        );
    }

    function clearSearch() {
        const input =
            $("#globalSearchInput");

        if (input) {
            input.value = "";
            input.focus();
        }

        renderSearchResults("");
    }

    function getSearchResults(query) {
        const q =
            normalizeText(query);

        if (!q) {
            return [];
        }

        const results = [];

        STUDIES.forEach(study => {
            const studyMatch =
                normalizeText(
                    `${study.title} ${study.description}`
                ).includes(q);

            if (studyMatch) {
                results.push({
                    type: "study",
                    id: study.id,
                    title: study.title,
                    subtitle: study.description
                });
            }

            study.chapters.forEach((chapter, index) => {
                const haystack =
                    normalizeText(
                        `${chapter.title} ${chapter.summary} ${chapter.content}`
                    );

                if (haystack.includes(q)) {
                    results.push({
                        type: "chapter",
                        studyId: study.id,
                        chapterIndex: index,
                        title: chapter.title,
                        subtitle: study.title
                    });
                }
            });
        });

        DICTIONARY.forEach(item => {
            const haystack =
                normalizeText(
                    `${item.term} ${item.definition}`
                );

            if (haystack.includes(q)) {
                results.push({
                    type: "dictionary",
                    title: item.term,
                    subtitle: item.definition
                });
            }
        });

        return results.slice(0, 50);
    }

    function renderSearchResults(query) {
        const container =
            $("#searchResults");

        if (!container) {
            return;
        }

        const q =
            String(query || "").trim();

        if (!q) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">⌕</span>

                    <h3>Kòmanse yon rechèch</h3>

                    <p>
                        Chèche nan etid, chapit, definisyon
                        ak lòt kontni aplikasyon an.
                    </p>
                </div>
            `;

            return;
        }

        const results =
            getSearchResults(q);

        if (!results.length) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">⌕</span>

                    <h3>Pa gen rezilta</h3>

                    <p>
                        MEME pa jwenn okenn kontni ki koresponn
                        ak "${escapeHTML(q)}".
                    </p>
                </div>
            `;

            return;
        }

        container.innerHTML = `
            <div class="search-result-count">
                ${results.length} rezilta
            </div>

            ${results.map((result, index) => `
                <button type="button"
                        class="search-result-item"
                        data-search-index="${index}">

                    <span class="search-result-icon">
                        ${result.type === "dictionary"
                            ? "A"
                            : result.type === "chapter"
                                ? "§"
                                : "▤"}
                    </span>

                    <span class="search-result-content">

                        <strong>
                            ${escapeHTML(result.title)}
                        </strong>

                        <small>
                            ${escapeHTML(result.subtitle)}
                        </small>

                    </span>

                </button>
            `).join("")}
        `;

        $$("[data-search-index]", container)
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        const result =
                            results[
                                Number(
                                    button.dataset.searchIndex
                                )
                            ];

                        if (!result) {
                            return;
                        }

                        closeSearch();

                        if (result.type === "study") {
                            openLesson(
                                result.id,
                                0
                            );
                        } else if (
                            result.type === "chapter"
                        ) {
                            openLesson(
                                result.studyId,
                                result.chapterIndex
                            );
                        } else {
                            setView("dictionary");

                            const input =
                                $("#dictionarySearchInput");

                            if (input) {
                                input.value =
                                    result.title;
                            }

                            renderDictionary(
                                result.title
                            );
                        }
                    }
                );
            });
    }


    /* =========================================================
       MEME TUTOR
       ---------------------------------------------------------
       Lokal sèlman.
       Pa envante sous ekstèn.
       ========================================================= */

    function renderMemeHistory() {
        const chat =
            $("#memeChat");

        if (!chat) {
            return;
        }

        const baseMessage = `
            <div class="meme-message assistant">

                <div class="message-avatar">
                    M
                </div>

                <div class="message-body">

                    <div class="message-name">
                        MEME
                    </div>

                    <p>
                        Bonjou. Mwen se MEME. Mwen ka ede w
                        eksplore kesyon biblik ak teyolojik yo
                        nan bon Kreyòl, etap pa etap.
                    </p>

                    <p>
                        Mwen pa envante sous ekstèn. Lè yon repons
                        bezwen verifikasyon entènèt oswa sous
                        akademik, aplikasyon lokal sa a ap di w
                        klèman sa li pa ka verifye.
                    </p>

                </div>
            </div>
        `;

        const history =
            state.memeMessages || [];

        chat.innerHTML =
            baseMessage +
            history.map(message =>
                createMemeMessage(message)
            ).join("");

        chat.scrollTop =
            chat.scrollHeight;
    }

    function createMemeMessage(message) {
        const role =
            message.role === "user"
                ? "user"
                : "assistant";

        const avatar =
            role === "user"
                ? "Ou"
                : "M";

        return `
            <div class="meme-message ${role}">

                <div class="message-avatar">
                    ${escapeHTML(avatar)}
                </div>

                <div class="message-body">

                    <div class="message-name">
                        ${role === "user" ? "Ou" : "MEME"}
                    </div>

                    ${formatMemeText(message.content)}

                </div>

            </div>
        `;
    }

    function formatMemeText(text) {
        const safe =
            escapeHTML(text);

        const paragraphs =
            safe
                .split(/\n{2,}/)
                .map(part =>
                    `<p>${part.replace(/\n/g, "<br>")}</p>`
                )
                .join("");

        return paragraphs;
    }

    function addMemeMessage(role, content) {
        state.memeMessages.push({
            id: uid("meme"),
            role,
            content,
            createdAt: nowISO()
        });

        if (state.memeMessages.length > 100) {
            state.memeMessages =
                state.memeMessages.slice(-100);
        }

        saveStateSoon();
    }

    function getLocalMemeAnswer(question) {
        const q =
            normalizeText(question);

        if (!q) {
            return "Ekri yon kestyon anvan ou voye mesaj la.";
        }

        if (
            q.includes("teyoloji") &&
            !q.includes("trinite")
        ) {
            return [
                "Teyoloji se etid sistematik sou Bondye, lafwa, revelasyon ak lòt kestyon fondamantal sou reyalite diven.",
                "",
                "Pou kòmanse, li itil pou separe twa etap:",
                "1. Obsève sa sous la di.",
                "2. Entèprete sa li vle di nan kontèks li.",
                "3. Reflechi sou konsekans ak aplikasyon li.",
                "",
                "Nan MEME, ou ka ale nan Diksyonè Teyoloji oswa kòmanse etid « Entwodiksyon nan Bib la »."
            ].join("\n");
        }

        if (
            q.includes("trinite") ||
            q.includes("trin")
        ) {
            return [
                "Nan teyoloji kretyèn tradisyonèl, Trinite se yon fason pou pale sou yon sèl Bondye pandan yo fè distenksyon ant Papa, Pitit ak Sentespri.",
                "",
                "Yon pwen enpòtan: doktrin Trinite a pa vle di twa bondye separe.",
                "",
                "Pou etidye sijè a pi fon, ouvri pwogram « Trinite » nan seksyon Etid yo. Li gen plizyè chapit ki prezante tèm nan etap pa etap."
            ].join("\n");
        }

        if (
            q.includes("ansyen") &&
            q.includes("nouvo") &&
            q.includes("testaman")
        ) {
            return [
                "Ansyen Testaman ak Nouvo Testaman se de gwo pati Bib kretyèn nan.",
                "",
                "Ansyen Testaman an gen istwa, lalwa, pwezi, sajès ak pwofèt. Nouvo Testaman an konsantre sou Jezi, premye kominote kretyèn yo ak ansèyman apot yo.",
                "",
                "Yo pa dwe etidye tankou de istwa ki pa gen rapò. Li enpòtan pou chèche koneksyon ki genyen ant yo pandan w ap respekte kontèks chak tèks."
            ].join("\n");
        }

        if (
            q.includes("jistifikasyon")
        ) {
            return [
                "Jistifikasyon se yon tèm teyolojik ki pale sou fason yon moun konsidere kòm jis devan Bondye.",
                "",
                "Diferan tradisyon kretyèn eksplike relasyon ant lafwa, gras, zèv ak jistifikasyon yon fason ki ka diferan sou kèk detay.",
                "",
                "Pou yon etid serye, li bon pou defini tèm yo epi konpare pasaj ak agiman diferan tradisyon yo san melanje pozisyon yo."
            ].join("\n");
        }

        if (
            q.includes("jezi") ||
            q.includes("kris")
        ) {
            return [
                "Krisoloji se branch teyoloji ki etidye moun Jezi Kris la ak travay li.",
                "",
                "De kestyon fondamantal yo se: « Kiyès Jezi ye? » ak « Kisa Jezi te vin fè? »",
                "",
                "MEME gen yon pwogram « Krisoloji: Konprann Jezi Kris » ou ka itilize pou kontinye etid la."
            ].join("\n");
        }

        if (
            q.includes("bib") ||
            q.includes("bib la")
        ) {
            return [
                "Bib la se yon koleksyon liv ki te ekri nan diferan peryòd ak kontèks.",
                "",
                "Pou etidye Bib la byen, MEME rekòmande metòd: Obsèvasyon → Entèpretasyon → Aplikasyon.",
                "",
                "Sa vle di: gade sa tèks la di, konprann li nan kontèks li, epi reflechi sou siyifikasyon li ak aplikasyon li."
            ].join("\n");
        }

        if (
            q.includes("konsèy") ||
            q.includes("kijan pou etidye")
        ) {
            return [
                "Men yon metòd senp pou etid biblik:",
                "",
                "1. Li pasaj la plizyè fwa.",
                "2. Idantifye mo oswa lide ki repete.",
                "3. Gade sa ki vini anvan ak apre.",
                "4. Idantifye kalite literè pasaj la.",
                "5. Fè diferans ant sa tèks la di ak sa ou ta renmen li di.",
                "6. Apre sa, reflechi sou aplikasyon an.",
                "",
                "Si ou vle, ou ka sèvi ak pwogram « Entwodiksyon nan Bib la » nan aplikasyon an."
            ].join("\n");
        }

        if (
            q.includes("sous") ||
            q.includes("referans") ||
            q.includes("verify")
        ) {
            return [
                "Nan vèsyon lokal sa a, mwen pa pral envante yon sous oswa pretann mwen te verifye yon sit entènèt mwen pa t konsilte.",
                "",
                "Pou yon kestyon ki mande sous ekstèn, repons ki serye dwe montre sous la oswa eksplike klèman limit verifikasyon an.",
                "",
                "Ou ka itilize kontni lokal MEME a kòm pwen depa pou etid, epi verifye kesyon ki pi avanse yo ak sous akademik oswa biblik serye."
            ].join("\n");
        }

        return [
            "Mwen konprann kestyon ou a, men mwen pa gen ase kontèks nan baz lokal MEME a pou m bay yon repons espesifik san m pa riske envante enfòmasyon.",
            "",
            "Eseye poze kestyon an pi presizeman, pa egzanp:",
            "• Kisa teyoloji ye?",
            "• Kisa Trinite vle di?",
            "• Kiyès Jezi ye nan Krisoloji?",
            "• Kijan pou etidye yon pasaj biblik?",
            "",
            "Pou kestyon ki bezwen sous ekstèn, sonje vèsyon lokal sa a pa pretann li fè verifikasyon entènèt."
        ].join("\n");
    }

    async function askMeme(question) {
        const clean =
            String(question || "").trim();

        if (!clean) {
            showToast(
                "Ekri yon kestyon anvan ou voye li.",
                "warning"
            );
            return;
        }

        const input =
            $("#memeInput");

        const sendButton =
            $("#memeSendButton");

        if (input) {
            input.value = "";
        }

        updateMemeCharacterCount();

        addMemeMessage(
            "user",
            clean
        );

        renderMemeHistory();

        if (sendButton) {
            sendButton.disabled = true;
        }

        const sourceStatus =
            $("#sourceStatusText");

        if (sourceStatus) {
            sourceStatus.textContent =
                "MEME ap prepare repons lokal la...";
        }

        await wait(250);

        const answer =
            await askMemeRemote(clean);

        addMemeMessage(
            "assistant",
            answer
        );

        renderMemeHistory();

        if (sourceStatus) {
            sourceStatus.textContent =
                "Repons sa a soti nan kontni lokal MEME; pa gen sous entènèt envante.";
        }

        if (sendButton) {
            sendButton.disabled = false;
        }
    }

    /*
     * Pwen koneksyon pou yon API pita.
     *
     * Pou kounye a nou retounen repons lokal.
     *
     * Si w mete backend pita, se fonksyon sa a sèlman
     * ou bezwen modifye.
     */
    async function askMemeRemote(question) {
        return getLocalMemeAnswer(question);
    }

    function wait(milliseconds) {
        return new Promise(resolve =>
            window.setTimeout(
                resolve,
                milliseconds
            )
        );
    }

    function updateMemeCharacterCount() {
        const input =
            $("#memeInput");

        const counter =
            $("#memeCharacterCount");

        if (!input || !counter) {
            return;
        }

        counter.textContent =
            `${input.value.length} / 12000`;
    }


    /* =========================================================
       READER ZOOM
       ========================================================= */

    function getReaderScale() {
        const reader =
            $("#lessonReader");

        if (!reader) {
            return 1;
        }

        const value =
            Number(
                reader.dataset.readerScale
            );

        return Number.isFinite(value)
            ? value
            : 1;
    }

    function setReaderScale(scale, options = {}) {
        const reader =
            $("#lessonReader");

        const content =
            $("#lessonContent");

        if (!reader || !content) {
            return;
        }

        const next =
            clamp(
                Number(scale) || 1,
                APP.reader.minPinchScale,
                APP.reader.maxPinchScale
            );

        reader.dataset.readerScale =
            String(round(next, 3));

        content.style.setProperty(
            "--pinch-scale",
            String(next)
        );

        content.style.transform =
            `scale(${next})`;

        content.style.transformOrigin =
            "top center";

        const zoomPercent =
            Math.round(next * 100);

        const zoomLevel =
            $("#zoomLevel");

        const indicator =
            $("#zoomIndicator");

        const indicatorValue =
            $("#zoomIndicatorValue");

        if (zoomLevel) {
            zoomLevel.textContent =
                `${zoomPercent}%`;
        }

        if (indicatorValue) {
            indicatorValue.textContent =
                `${zoomPercent}%`;
        }

        if (indicator) {
            indicator.hidden = false;

            clearTimeout(
                indicator._hideTimer
            );

            indicator._hideTimer =
                window.setTimeout(() => {
                    indicator.hidden = true;
                }, 900);
        }

        if (!options.pinchOnly) {
            state.studyZoom =
                clamp(
                    next,
                    APP.zoom.min,
                    APP.zoom.max
                );

            updateSettingsZoomDisplay();

            saveStateSoon();
        }
    }

    function applyReaderZoom() {
        const reader =
            $("#lessonReader");

        const content =
            $("#lessonContent");

        if (!reader || !content) {
            return;
        }

        const scale =
            clamp(
                Number(state.studyZoom) || 1,
                APP.zoom.min,
                APP.zoom.max
            );

        reader.dataset.readerScale =
            String(scale);

        content.style.transform =
            `scale(${scale})`;

        content.style.transformOrigin =
            "top center";

        content.style.setProperty(
            "--pinch-scale",
            String(scale)
        );

        const zoomLevel =
            $("#zoomLevel");

        if (zoomLevel) {
            zoomLevel.textContent =
                `${Math.round(scale * 100)}%`;
        }

        updateSettingsZoomDisplay();
    }

    function changeReaderZoom(delta) {
        const current =
            getReaderScale();

        const next =
            current + delta;

        setReaderScale(next);
    }

    function resetReaderZoom() {
        setReaderScale(
            APP.zoom.default
        );

        showToast(
            "Zoom reyajiste.",
            "success"
        );
    }

    function updateSettingsZoomDisplay() {
        const value =
            $("#settingsZoomValue");

        if (!value) {
            return;
        }

        value.textContent =
            `${Math.round(
                clamp(
                    state.studyZoom,
                    APP.zoom.min,
                    APP.zoom.max
                ) * 100
            )}%`;
    }


    /* =========================================================
       ANDROID PINCH 2 DWÈT
       ========================================================= */

    function getTouchDistance(touchA, touchB) {
        const dx =
            touchB.clientX -
            touchA.clientX;

        const dy =
            touchB.clientY -
            touchA.clientY;

        return Math.sqrt(
            dx * dx +
            dy * dy
        );
    }

    function getTouchCenter(touchA, touchB) {
        return {
            x:
                (touchA.clientX +
                    touchB.clientX) / 2,

            y:
                (touchA.clientY +
                    touchB.clientY) / 2
        };
    }

    function initializePinchZoom() {
        const reader =
            $("#lessonReader");

        if (!reader) {
            return;
        }

        reader.style.touchAction =
            "pan-y";

        reader.addEventListener(
            "touchstart",
            event => {
                if (event.touches.length !== 2) {
                    return;
                }

                const [a, b] =
                    event.touches;

                pinchState.active = true;

                pinchState.startDistance =
                    getTouchDistance(a, b);

                pinchState.startScale =
                    getReaderScale();

                const center =
                    getTouchCenter(a, b);

                pinchState.startCenterX =
                    center.x;

                pinchState.startCenterY =
                    center.y;

                reader.classList.add(
                    "pinch-active"
                );
            },
            {
                passive: true
            }
        );

        reader.addEventListener(
            "touchmove",
            event => {
                if (
                    !pinchState.active ||
                    event.touches.length !== 2
                ) {
                    return;
                }

                event.preventDefault();

                const [a, b] =
                    event.touches;

                const distance =
                    getTouchDistance(a, b);

                if (!pinchState.startDistance) {
                    return;
                }

                const ratio =
                    distance /
                    pinchState.startDistance;

                const scale =
                    clamp(
                        pinchState.startScale *
                        ratio,
                        APP.reader.minPinchScale,
                        APP.reader.maxPinchScale
                    );

                setReaderScale(
                    scale,
                    {
                        pinchOnly: true
                    }
                );
            },
            {
                passive: false
            }
        );

        reader.addEventListener(
            "touchend",
            event => {
                if (
                    pinchState.active &&
                    event.touches.length < 2
                ) {
                    pinchState.active = false;

                    reader.classList.remove(
                        "pinch-active"
                    );

                    state.studyZoom =
                        clamp(
                            getReaderScale(),
                            APP.zoom.min,
                            APP.zoom.max
                        );

                    updateSettingsZoomDisplay();

                    saveStateSoon();
                }
            },
            {
                passive: true
            }
        );

        reader.addEventListener(
            "touchcancel",
            () => {
                pinchState.active = false;

                reader.classList.remove(
                    "pinch-active"
                );
            },
            {
                passive: true
            }
        );

        /*
         * Double tap.
         */
        reader.addEventListener(
            "touchend",
            event => {
                if (event.changedTouches.length !== 1) {
                    return;
                }

                if (pinchState.active) {
                    return;
                }

                const currentTime =
                    Date.now();

                const delta =
                    currentTime -
                    lastTapTime;

                if (
                    delta > 0 &&
                    delta <
                    APP.reader.doubleTapDelay
                ) {
                    const current =
                        getReaderScale();

                    const target =
                        current >
                        APP.reader.doubleTapZoom
                            ? 1
                            : APP.reader.doubleTapZoom;

                    setReaderScale(
                        target
                    );
                }

                lastTapTime =
                    currentTime;
            },
            {
                passive: true
            }
        );
    }


    /* =========================================================
       QUIZ
       ========================================================= */

    function openQuiz(studyId) {
        const questions =
            QUIZZES[studyId];

        const study =
            getStudy(studyId);

        if (!study || !questions?.length) {
            showToast(
                "Pa gen quiz disponib pou etid sa a ankò.",
                "info"
            );
            return;
        }

        currentQuiz = {
            studyId,
            questions: clone(questions),
            index: 0,
            answers: {},
            score: 0,
            answeredCurrent: false
        };

        const quizView =
            $("#quizView");

        if (!quizView) {
            return;
        }

        quizView.hidden = false;

        document.body.classList.add(
            "quiz-open"
        );

        renderQuiz();
    }

    function closeQuiz() {
        const quizView =
            $("#quizView");

        if (quizView) {
            quizView.hidden = true;
        }

        document.body.classList.remove(
            "quiz-open"
        );

        currentQuiz = null;
    }

    function renderQuiz() {
        if (!currentQuiz) {
            return;
        }

        const total =
            currentQuiz.questions.length;

        const index =
            currentQuiz.index;

        const question =
            currentQuiz.questions[index];

        const study =
            getStudy(
                currentQuiz.studyId
            );

        const title =
            $("#quizTitle");

        const current =
            $("#quizCurrentQuestion");

        const totalElement =
            $("#quizTotalQuestions");

        const questionContainer =
            $("#quizQuestionContainer");

        const answers =
            $("#quizAnswers");

        const feedback =
            $("#quizFeedback");

        const progress =
            $("#quizProgressBar");

        const previous =
            $("#quizPreviousButton");

        const next =
            $("#quizNextButton");

        if (title) {
            title.textContent =
                study?.title || "Quiz";
        }

        if (current) {
            current.textContent =
                index + 1;
        }

        if (totalElement) {
            totalElement.textContent =
                total;
        }

        if (progress) {
            progress.style.width =
                `${((index + 1) / total) * 100}%`;
        }

        if (questionContainer) {
            questionContainer.innerHTML = `
                <div class="quiz-question">
                    <span class="eyebrow">
                        KESYON ${index + 1}
                    </span>

                    <h2>
                        ${escapeHTML(question.question)}
                    </h2>
                </div>
            `;
        }

        if (answers) {
            answers.innerHTML =
                question.answers
                    .map((answer, answerIndex) => {
                        const selected =
                            currentQuiz.answers[index];

                        let className =
                            "quiz-answer";

                        if (
                            selected ===
                            answerIndex
                        ) {
                            className +=
                                " selected";
                        }

                        if (
                            currentQuiz.answeredCurrent
                        ) {
                            if (
                                answerIndex ===
                                question.correct
                            ) {
                                className +=
                                    " correct";
                            } else if (
                                selected ===
                                answerIndex
                            ) {
                                className +=
                                    " incorrect";
                            }
                        }

                        return `
                            <button type="button"
                                    class="${className}"
                                    data-answer-index="${answerIndex}"
                                    ${currentQuiz.answeredCurrent
                                        ? "disabled"
                                        : ""}>
                                <span>
                                    ${String.fromCharCode(
                                        65 + answerIndex
                                    )}
                                </span>

                                <strong>
                                    ${escapeHTML(answer)}
                                </strong>
                            </button>
                        `;
                    })
                    .join("");

            $$("[data-answer-index]", answers)
                .forEach(button => {
                    button.addEventListener(
                        "click",
                        () => {
                            chooseQuizAnswer(
                                Number(
                                    button.dataset.answerIndex
                                )
                            );
                        }
                    );
                });
        }

        if (feedback) {
            if (
                currentQuiz.answeredCurrent
            ) {
                const selected =
                    currentQuiz.answers[index];

                const correct =
                    selected ===
                    question.correct;

                feedback.hidden = false;

                feedback.innerHTML = `
                    <strong>
                        ${correct ? "✓ Bon repons!" : "✕ Pa egzak."}
                    </strong>

                    <p>
                        ${escapeHTML(
                            question.explanation
                        )}
                    </p>
                `;
            } else {
                feedback.hidden = true;
                feedback.innerHTML = "";
            }
        }

        if (previous) {
            previous.disabled =
                index <= 0;
        }

        if (next) {
            if (index >= total - 1) {
                next.textContent =
                    "Fini quiz ✓";
            } else {
                next.textContent =
                    "Kontinye →";
            }

            next.disabled =
                !currentQuiz.answeredCurrent;
        }
    }

    function chooseQuizAnswer(answerIndex) {
        if (!currentQuiz) {
            return;
        }

        if (currentQuiz.answeredCurrent) {
            return;
        }

        const question =
            currentQuiz.questions[
                currentQuiz.index
            ];

        currentQuiz.answers[
            currentQuiz.index
        ] = answerIndex;

        if (
            answerIndex ===
            question.correct
        ) {
            currentQuiz.score += 1;
        }

        currentQuiz.answeredCurrent =
            true;

        renderQuiz();
    }

    function nextQuizQuestion() {
        if (!currentQuiz) {
            return;
        }

        if (!currentQuiz.answeredCurrent) {
            showToast(
                "Chwazi yon repons anvan ou kontinye.",
                "warning"
            );
            return;
        }

        if (
            currentQuiz.index >=
            currentQuiz.questions.length - 1
        ) {
            finishQuiz();
            return;
        }

        currentQuiz.index += 1;

        currentQuiz.answeredCurrent =
            Boolean(
                currentQuiz.answers[
                    currentQuiz.index
                ] !== undefined
            );

        renderQuiz();
    }

    function previousQuizQuestion() {
        if (!currentQuiz) {
            return;
        }

        if (currentQuiz.index <= 0) {
            return;
        }

        currentQuiz.index -= 1;

        currentQuiz.answeredCurrent =
            currentQuiz.answers[
                currentQuiz.index
            ] !== undefined;

        renderQuiz();
    }

    function finishQuiz() {
        if (!currentQuiz) {
            return;
        }

        const total =
            currentQuiz.questions.length;

        const score =
            currentQuiz.score;

        const percent =
            Math.round(
                (score / total) * 100
            );

        state.quizCount =
            Number(state.quizCount || 0) + 1;

        const oldResult =
            state.quizResults[
                currentQuiz.studyId
            ];

        state.quizResults[
            currentQuiz.studyId
        ] = {
            score,
            total,
            percent,
            attempts:
                Number(
                    oldResult?.attempts || 0
                ) + 1,
            lastAttempt: nowISO()
        };

        saveStateSoon();

        const quizView =
            $("#quizView");

        const container =
            $(".quiz-container", quizView);

        if (container) {
            container.innerHTML = `
                <div class="quiz-result">

                    <span class="eyebrow">
                        QUIZ FINI
                    </span>

                    <div class="quiz-result-score">
                        ${percent}%
                    </div>

                    <h1>
                        ${percent >= 70
                            ? "Bravo!"
                            : "Kontinye pratike."}
                    </h1>

                    <p>
                        Ou jwenn
                        <strong>${score}</strong>
                        bon repons sou
                        <strong>${total}</strong>.
                    </p>

                    <div class="quiz-result-actions">

                        <button type="button"
                                class="primary-button"
                                id="restartQuizButton">
                            Refè quiz la
                        </button>

                        <button type="button"
                                class="secondary-button"
                                id="closeQuizResultButton">
                            Fèmen
                        </button>

                    </div>
                </div>
            `;

            $("#restartQuizButton")
                ?.addEventListener(
                    "click",
                    () => {
                        openQuiz(
                            currentQuiz.studyId
                        );
                    }
                );

            $("#closeQuizResultButton")
                ?.addEventListener(
                    "click",
                    closeQuiz
                );
        }

        announce(
            `Quiz fini. Rezilta ${percent} pousan.`
        );
    }


    /* =========================================================
       SETTINGS
       ========================================================= */

    function applyDarkMode() {
        const root =
            document.documentElement;

        const button =
            $("#darkModeToggle");

        root.classList.toggle(
            "dark-mode",
            Boolean(state.darkMode)
        );

        document.body.classList.toggle(
            "dark-mode",
            Boolean(state.darkMode)
        );

        if (button) {
            button.setAttribute(
                "aria-checked",
                String(Boolean(state.darkMode))
            );

            button.classList.toggle(
                "active",
                Boolean(state.darkMode)
            );
        }

        updateThemeIcon();
    }

    function updateThemeIcon() {
        const icon =
            $("#themeIcon");

        if (!icon) {
            return;
        }

        icon.textContent =
            state.darkMode
                ? "☾"
                : "☼";
    }

    function toggleDarkMode() {
        state.darkMode =
            !state.darkMode;

        applyDarkMode();

        saveStateSoon();

        showToast(
            state.darkMode
                ? "Mòd nwa aktive."
                : "Mòd klè aktive.",
            "success"
        );
    }

    function changeSettingsZoom(delta) {
        const next =
            clamp(
                state.studyZoom + delta,
                APP.zoom.min,
                APP.zoom.max
            );

        state.studyZoom =
            round(next, 2);

        updateSettingsZoomDisplay();

        applyReaderZoom();

        saveStateSoon();
    }

    function renderSettings() {
        applyDarkMode();

        updateSettingsZoomDisplay();

        updateDatabaseStatus();
    }

    function updateDatabaseStatus() {
        const status =
            $("#databaseStatus");

        if (!status) {
            return;
        }

        if (db) {
            status.textContent =
                "IndexedDB aktif";
            status.classList.add("online");
        } else {
            status.textContent =
                "localStorage fallback";
            status.classList.add("warning");
        }
    }

    async function resetProgress() {
        const confirmed =
            window.confirm(
                "Èske ou sèten ou vle efase pwogrè, bookmark ak istwa MEME lokal yo?"
            );

        if (!confirmed) {
            return;
        }

        state = clone(
            DEFAULT_STATE
        );

        await persistState();

        currentCategory = "all";

        applyDarkMode();

        renderHome();

        setView(
            "home",
            {
                skipRender: true
            }
        );

        updateStats();

        showToast(
            "Done lokal yo reyajiste.",
            "success"
        );

        announce(
            "Pwogrè aplikasyon an reyajiste."
        );
    }


    /* =========================================================
       MODAL
       ========================================================= */

    function openModal({
        title = "MEME",
        body = "",
        footer = ""
    } = {}) {
        const modal =
            $("#globalModal");

        if (!modal) {
            return;
        }

        modalPreviousFocus =
            document.activeElement;

        const titleElement =
            $("#modalTitle");

        const bodyElement =
            $("#modalBody");

        const footerElement =
            $("#modalFooter");

        if (titleElement) {
            titleElement.textContent =
                title;
        }

        if (bodyElement) {
            bodyElement.innerHTML =
                body;
        }

        if (footerElement) {
            footerElement.innerHTML =
                footer;
        }

        modal.hidden = false;

        document.body.classList.add(
            "modal-open"
        );

        window.setTimeout(() => {
            $("#modalCloseButton")?.focus();
        }, 30);
    }

    function closeModal() {
        const modal =
            $("#globalModal");

        if (!modal) {
            return;
        }

        modal.hidden = true;

        document.body.classList.remove(
            "modal-open"
        );

        if (
            modalPreviousFocus &&
            typeof modalPreviousFocus.focus ===
                "function"
        ) {
            modalPreviousFocus.focus();
        }

        modalPreviousFocus = null;
    }

    function openProfileModal() {
        openModal({
            title: "Pwofil MEME",
            body: `
                <div class="profile-modal">

                    <div class="profile-modal-avatar">
                        M
                    </div>

                    <h3>
                        Elèv MEME
                    </h3>

                    <p>
                        Done pwofil sa a rete lokal sou aparèy ou.
                        Vèsyon sa a pa mande yon kont pou swiv
                        pwogrè etid ou.
                    </p>

                    <div class="profile-modal-stats">

                        <div>
                            <strong>
                                ${getStartedStudyCount()}
                            </strong>
                            <span>
                                Etid kòmanse
                            </span>
                        </div>

                        <div>
                            <strong>
                                ${getCompletedChapterCount()}
                            </strong>
                            <span>
                                Chapit fini
                            </span>
                        </div>

                        <div>
                            <strong>
                                ${state.bookmarks.length}
                            </strong>
                            <span>
                                Sove
                            </span>
                        </div>

                    </div>

                </div>
            `,
            footer: `
                <button type="button"
                        class="primary-button"
                        id="profileModalClose">
                    Fèmen
                </button>
            `
        });

        $("#profileModalClose")
            ?.addEventListener(
                "click",
                closeModal
            );
    }


    /* =========================================================
       CONNECTION
       ========================================================= */

    function updateConnectionStatus() {
        const status =
            $("#connectionStatus");

        const text =
            $("#connectionStatusText");

        if (!status || !text) {
            return;
        }

        if (navigator.onLine) {
            status.hidden = true;

            text.textContent =
                "Ou konekte.";
        } else {
            status.hidden = false;

            text.textContent =
                "Ou offline. Kontni lokal la toujou disponib.";
        }
    }


    /* =========================================================
       DATA-VIEW BUTTONS
       ========================================================= */

    function bindViewTargetButtons(root = document) {
        $$("[data-view-target]", root)
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        setView(
                            button.dataset.viewTarget
                        );
                    }
                );
            });
    }


    /* =========================================================
       EVENT LISTENERS
       ========================================================= */

    function bindNavigation() {
        $("#menuButton")
            ?.addEventListener(
                "click",
                openDrawer
            );

        $("#closeDrawerButton")
            ?.addEventListener(
                "click",
                closeDrawer
            );

        $("#drawerOverlay")
            ?.addEventListener(
                "click",
                closeDrawer
            );

        $$(".nav-item[data-view]")
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        setView(
                            button.dataset.view
                        );
                    }
                );
            });

        bindViewTargetButtons();
    }

    function bindHeaderActions() {
        $("#searchButton")
            ?.addEventListener(
                "click",
                openSearch
            );

        $("#closeSearchButton")
            ?.addEventListener(
                "click",
                closeSearch
            );

        $("#clearSearchButton")
            ?.addEventListener(
                "click",
                clearSearch
            );

        $("#themeButton")
            ?.addEventListener(
                "click",
                toggleDarkMode
            );

        $("#profileButton")
            ?.addEventListener(
                "click",
                openProfileModal
            );
    }

    function bindHomeActions() {
        $("#startStudyButton")
            ?.addEventListener(
                "click",
                () => {
                    setView("studies");
                }
            );

        $("#askMemeHeroButton")
            ?.addEventListener(
                "click",
                () => {
                    setView("meme");

                    window.setTimeout(() => {
                        $("#memeInput")?.focus();
                    }, 100);
                }
            );

        $("#openMemeButton")
            ?.addEventListener(
                "click",
                () => {
                    setView("meme");

                    window.setTimeout(() => {
                        $("#memeInput")?.focus();
                    }, 100);
                }
            );
    }

    function bindSearchActions() {
        $("#globalSearchInput")
            ?.addEventListener(
                "input",
                event => {
                    renderSearchResults(
                        event.target.value
                    );
                }
            );
    }

    function bindStudyActions() {
        $("#studyFilterButton")
            ?.addEventListener(
                "click",
                () => {
                    openModal({
                        title: "Filtre etid yo",
                        body: `
                            <p>
                                Chwazi kategori ou vle wè:
                            </p>

                            <div class="modal-filter-grid">

                                ${[
                                    ["all", "Tout"],
                                    ["biblical", "Etid Biblik"],
                                    ["theology", "Teyoloji"],
                                    ["doctrine", "Doktrin"],
                                    ["history", "Istwa Legliz"]
                                ].map(([value, label]) => `
                                    <button type="button"
                                            class="secondary-button"
                                            data-modal-category="${value}">
                                        ${label}
                                    </button>
                                `).join("")}

                            </div>
                        `
                    });

                    $$("[data-modal-category]")
                        .forEach(button => {
                            button.addEventListener(
                                "click",
                                () => {
                                    setStudyCategory(
                                        button.dataset.modalCategory
                                    );

                                    closeModal();

                                    setView(
                                        "studies"
                                    );
                                }
                            );
                        });
                }
            );

        $$(".category-tab")
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        setStudyCategory(
                            button.dataset.category
                        );
                    }
                );
            });

        $("#backToStudiesButton")
            ?.addEventListener(
                "click",
                () => {
                    setView("studies");
                }
            );

        $("#lessonCloseButton")
            ?.addEventListener(
                "click",
                () => {
                    setView("studies");
                }
            );

        $("#previousChapterButton")
            ?.addEventListener(
                "click",
                goToPreviousChapter
            );

        $("#nextChapterButton")
            ?.addEventListener(
                "click",
                goToNextChapter
            );

        $("#zoomOutButton")
            ?.addEventListener(
                "click",
                () => {
                    changeReaderZoom(
                        -APP.zoom.step
                    );
                }
            );

        $("#zoomInButton")
            ?.addEventListener(
                "click",
                () => {
                    changeReaderZoom(
                        APP.zoom.step
                    );
                }
            );

        $("#resetZoomButton")
            ?.addEventListener(
                "click",
                resetReaderZoom
            );

        $("#lessonSaveButton")
            ?.addEventListener(
                "click",
                saveCurrentLesson
            );

        $("#saveReadingButton")
            ?.addEventListener(
                "click",
                saveCurrentLesson
            );
    }

    function saveCurrentLesson() {
        const study =
            getStudy(state.currentStudyId);

        if (!study) {
            return;
        }

        const chapter =
            study.chapters[
                state.currentChapterIndex
            ];

        if (!chapter) {
            return;
        }

        toggleBookmark(
            study.id,
            chapter.id
        );
    }

    function bindDictionaryActions() {
        $("#dictionarySearchInput")
            ?.addEventListener(
                "input",
                event => {
                    renderDictionary(
                        event.target.value
                    );
                }
            );
    }

    function bindMemeActions() {
        $("#memeForm")
            ?.addEventListener(
                "submit",
                event => {
                    event.preventDefault();

                    const input =
                        $("#memeInput");

                    askMeme(
                        input?.value || ""
                    );
                }
            );

        $("#memeInput")
            ?.addEventListener(
                "input",
                updateMemeCharacterCount
            );

        $("#memeInput")
            ?.addEventListener(
                "keydown",
                event => {
                    if (
                        event.key === "Enter" &&
                        !event.shiftKey
                    ) {
                        event.preventDefault();

                        $("#memeForm")
                            ?.requestSubmit();
                    }
                }
            );

        $$(".suggestion-chip")
            .forEach(button => {
                button.addEventListener(
                    "click",
                    () => {
                        const input =
                            $("#memeInput");

                        if (!input) {
                            return;
                        }

                        input.value =
                            button.dataset.prompt || "";

                        updateMemeCharacterCount();

                        input.focus();
                    }
                );
            });
    }

    function bindSettingsActions() {
        $("#darkModeToggle")
            ?.addEventListener(
                "click",
                toggleDarkMode
            );

        $("#settingsZoomOut")
            ?.addEventListener(
                "click",
                () => {
                    changeSettingsZoom(
                        -APP.zoom.step
                    );
                }
            );

        $("#settingsZoomIn")
            ?.addEventListener(
                "click",
                () => {
                    changeSettingsZoom(
                        APP.zoom.step
                    );
                }
            );

        $("#resetProgressButton")
            ?.addEventListener(
                "click",
                resetProgress
            );
    }

    function bindModalActions() {
        $("#modalCloseButton")
            ?.addEventListener(
                "click",
                closeModal
            );

        $$(".modal-backdrop")
            .forEach(backdrop => {
                backdrop.addEventListener(
                    "click",
                    closeModal
                );
            });
    }

    function bindQuizActions() {
        $("#closeQuizButton")
            ?.addEventListener(
                "click",
                closeQuiz
            );

        $("#quizPreviousButton")
            ?.addEventListener(
                "click",
                previousQuizQuestion
            );

        $("#quizNextButton")
            ?.addEventListener(
                "click",
                nextQuizQuestion
            );
    }

    function bindGlobalKeyboard() {
        document.addEventListener(
            "keydown",
            event => {
                if (event.key === "Escape") {
                    closeDrawer();
                    closeSearch();
                    closeModal();

                    if (currentQuiz) {
                        closeQuiz();
                    }
                }

                if (
                    (event.ctrlKey ||
                        event.metaKey) &&
                    event.key.toLowerCase() === "k"
                ) {
                    event.preventDefault();

                    openSearch();
                }
            }
        );
    }

    function bindConnectionEvents() {
        window.addEventListener(
            "online",
            updateConnectionStatus
        );

        window.addEventListener(
            "offline",
            updateConnectionStatus
        );
    }


    /* =========================================================
       LOADING
       ========================================================= */

    function updateLoadingMessage(message) {
        const element =
            $("#loadingMessage");

        if (element) {
            element.textContent =
                message;
        }
    }

    async function finishLoading() {
        const loading =
            $("#loadingScreen");

        const main =
            $("#mainApplication");

        if (!loading || !main) {
            return;
        }

        updateLoadingMessage(
            "Done lokal yo pare..."
        );

        await wait(150);

        main.hidden = false;

        loading.classList.add(
            "is-hidden"
        );

        window.setTimeout(() => {
            loading.hidden = true;
        }, 350);
    }


    /* =========================================================
       HASH / BROWSER BACK
       ========================================================= */

    function updateHash(view) {
        const hash =
            `#${view}`;

        if (
            window.location.hash !==
            hash
        ) {
            history.replaceState(
                {
                    view
                },
                "",
                hash
            );
        }
    }

    function bindHistory() {
        window.addEventListener(
            "popstate",
            event => {
                const view =
                    event.state?.view ||
                    window.location.hash
                        .replace("#", "") ||
                    "home";

                setView(
                    view,
                    {
                        skipRender: false
                    }
                );
            }
        );
    }

    function initializeInitialView() {
        const hash =
            window.location.hash
                .replace("#", "");

        const valid = [
            "home",
            "studies",
            "dictionary",
            "meme",
            "bookmarks",
            "progress",
            "settings"
        ];

        if (
            valid.includes(hash)
        ) {
            state.currentView =
                hash;
        } else {
            state.currentView =
                "home";
        }

        setView(
            state.currentView,
            {
                skipRender: false
            }
        );
    }


    /* =========================================================
       APP INITIALIZATION
       ========================================================= */

    async function initializeApp() {
        try {
            updateLoadingMessage(
                "Ouvè baz done..."
            );

            db = await openDatabase();

            updateLoadingMessage(
                "Chaje done lokal yo..."
            );

            await loadState();

            updateLoadingMessage(
                "Prepare navigasyon..."
            );

            bindNavigation();
            bindHeaderActions();
            bindHomeActions();
            bindSearchActions();
            bindStudyActions();
            bindDictionaryActions();
            bindMemeActions();
            bindSettingsActions();
            bindModalActions();
            bindQuizActions();
            bindGlobalKeyboard();
            bindConnectionEvents();
            bindHistory();

            initializePinchZoom();

            applyDarkMode();

            updateConnectionStatus();

            updateMemeCharacterCount();

            renderDictionary();

            updateDatabaseStatus();

            renderHome();

            initializeInitialView();

            updateStats();

            await finishLoading();

            showToast(
                "MEME pare pou etid ou.",
                "success",
                2500
            );

        } catch (error) {
            console.error(
                "MEME initialization error:",
                error
            );

            /*
             * Menm si yon pati echwe, eseye montre aplikasyon an
             * olye pou paj la rete kole sou loading.
             */

            try {
                $("#mainApplication").hidden =
                    false;

                $("#loadingScreen").hidden =
                    true;
            } catch {
                /* no-op */
            }

            showToast(
                "MEME te rankontre yon pwoblèm pandan li t ap chaje. Done lokal yo pa efase.",
                "error",
                6000
            );
        }
    }


    /* =========================================================
       GLOBAL ERROR PROTECTION
       ========================================================= */

    window.addEventListener(
        "error",
        event => {
            console.error(
                "MEME runtime error:",
                event.error || event.message
            );
        }
    );

    window.addEventListener(
        "unhandledrejection",
        event => {
            console.error(
                "MEME promise error:",
                event.reason
            );
        }
    );


    /* =========================================================
       PUBLIC API
       ---------------------------------------------------------
       Sa pèmèt lòt script, si genyen, rele kèk fonksyon san
       yo pa bezwen manyen fonksyon entèn yo.
       ========================================================= */

    window.MEME = {
        version: APP.version,

        openStudy: openLesson,

        openQuiz,

        openSearch,

        askMeme,

        goHome: () => setView("home"),

        goStudies: () => setView("studies"),

        goDictionary: () => setView("dictionary"),

        goMeme: () => setView("meme"),

        goBookmarks: () => setView("bookmarks"),

        goProgress: () => setView("progress"),

        goSettings: () => setView("settings"),

        getState: () => clone(state),

        getStudies: () => clone(STUDIES),

        resetProgress,

        toggleDarkMode
    };


    /* =========================================================
       START
       ========================================================= */

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initializeApp,
            {
                once: true
            }
        );
    } else {
        initializeApp();
    }

})();