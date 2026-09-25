/* ============================================================
   APPHISTOIRESBIBLIQUESFOBAS.JS
   50 BÈL ISTWA NAN BIB LA
   Kreyòl Ayisyen
   ------------------------------------------------------------
   - Navigasyon dinamik
   - 20 premye istwa pare pou kòmanse
   - Fasil pou ajoute lòt istwa
   - Favori ak localStorage
   - Rechèch + kategori
   - Audio player
   - Jwèt biblik
   - Jwèt konesans jeneral
   - Repons + eksplikasyon + referans
   - Dark mode
   - Gwosè tèks
   - Share
   - SVG 3D-style otomatik
   - Touch / pinch zoom sou Android
   - Keyboard accessibility
   ============================================================ */

"use strict";

/* ============================================================
   1. CONFIGURATION
============================================================ */

const APP_CONFIG = {
    appName: "50 Bèl Istwa nan Bib la",
    version: "1.0.0",

    /* Premye kantite istwa nou vle montre */
    initialStories: 20,

    /* Lè w mete plis istwa nan DATABASE la,
       aplikasyon an ap ka montre yo otomatikman. */
    maxStories: 50,

    storage: {
        favorites: "biblik_favorites",
        settings: "biblik_settings",
        textSize: "biblik_text_size"
    },

    defaultTextSize: 1,

    gameQuestions: 10,

    audioFolder: "audio/",
    imageFolder: "images/"
};


/* ============================================================
   2. SVG 3D ICON SYSTEM
   Pa bezwen Three.js.
   Tout SVG yo pwodwi dirèkteman nan JS.
============================================================ */

const SVG_ICONS = {

    bible: `
        <svg viewBox="0 0 120 120" class="svg-3d-icon" aria-hidden="true">
            <defs>
                <linearGradient id="bookGold" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#fff1a8"/>
                    <stop offset="45%" stop-color="#e7b83f"/>
                    <stop offset="100%" stop-color="#8c5a12"/>
                </linearGradient>

                <linearGradient id="bookDark" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#68451a"/>
                    <stop offset="100%" stop-color="#24150a"/>
                </linearGradient>

                <filter id="bookShadow">
                    <feDropShadow dx="0" dy="8" stdDeviation="7"
                        flood-opacity=".35"/>
                </filter>
            </defs>

            <g filter="url(#bookShadow)">
                <path
                    d="M20 25 Q60 15 100 25 V91 Q60 80 20 91 Z"
                    fill="url(#bookDark)"
                />

                <path
                    d="M25 27 Q60 19 56 31 V83 Q43 76 25 81 Z"
                    fill="url(#bookGold)"
                />

                <path
                    d="M95 27 Q60 19 64 31 V83 Q77 76 95 81 Z"
                    fill="url(#bookGold)"
                />

                <path
                    d="M60 28 V85"
                    stroke="#fff3b4"
                    stroke-width="3"
                />

                <path
                    d="M39 39 L51 37 M70 37 L82 39"
                    stroke="#fff7cf"
                    stroke-width="3"
                    stroke-linecap="round"
                />

                <path
                    d="M39 49 L51 47 M70 47 L82 49"
                    stroke="#fff7cf"
                    stroke-width="2"
                    stroke-linecap="round"
                />
            </g>
        </svg>
    `,

    heart: `
        <svg viewBox="0 0 120 120" class="svg-3d-icon" aria-hidden="true">
            <defs>
                <linearGradient id="heartGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#ff9caa"/>
                    <stop offset="45%" stop-color="#e53958"/>
                    <stop offset="100%" stop-color="#85172b"/>
                </linearGradient>
                <filter id="heartShadow">
                    <feDropShadow dx="0" dy="8" stdDeviation="6"
                        flood-opacity=".3"/>
                </filter>
            </defs>

            <path
                filter="url(#heartShadow)"
                d="M60 100
                   C53 91 20 69 20 42
                   C20 25 34 16 48 20
                   C55 22 59 27 60 32
                   C62 27 66 22 73 20
                   C87 16 100 25 100 42
                   C100 69 67 91 60 100Z"
                fill="url(#heartGradient)"
            />

            <path
                d="M35 35 Q45 27 53 36"
                stroke="#ffd8df"
                stroke-width="6"
                stroke-linecap="round"
                fill="none"
                opacity=".7"
            />
        </svg>
    `,

    brain: `
        <svg viewBox="0 0 120 120" class="svg-3d-icon" aria-hidden="true">
            <defs>
                <linearGradient id="brainGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#d9b4ff"/>
                    <stop offset="50%" stop-color="#9a5de0"/>
                    <stop offset="100%" stop-color="#4b2378"/>
                </linearGradient>
                <filter id="brainShadow">
                    <feDropShadow dx="0" dy="7" stdDeviation="6"
                        flood-opacity=".35"/>
                </filter>
            </defs>

            <path
                filter="url(#brainShadow)"
                d="M60 96
                   C44 101 28 91 31 76
                   C17 72 16 54 28 47
                   C24 32 39 20 52 26
                   C60 14 76 20 78 31
                   C93 28 103 43 96 55
                   C105 68 94 82 84 82
                   C82 94 70 100 60 96Z"
                fill="url(#brainGradient)"
            />

            <path
                d="M54 31
                   C45 40 55 45 48 53
                   C42 60 52 65 47 74
                   C44 80 51 85 56 87"
                fill="none"
                stroke="#f0dcff"
                stroke-width="4"
                stroke-linecap="round"
            />

            <path
                d="M72 31
                   C81 39 72 46 79 53
                   C86 60 76 66 81 74"
                fill="none"
                stroke="#f0dcff"
                stroke-width="4"
                stroke-linecap="round"
            />
        </svg>
    `,

    target: `
        <svg viewBox="0 0 120 120" class="svg-3d-icon" aria-hidden="true">
            <defs>
                <radialGradient id="targetGradient">
                    <stop offset="0%" stop-color="#fff"/>
                    <stop offset="35%" stop-color="#ffd75a"/>
                    <stop offset="70%" stop-color="#e09a18"/>
                    <stop offset="100%" stop-color="#754b0d"/>
                </radialGradient>
                <filter id="targetShadow">
                    <feDropShadow dx="0" dy="8" stdDeviation="6"
                        flood-opacity=".35"/>
                </filter>
            </defs>

            <circle
                cx="60"
                cy="60"
                r="43"
                fill="url(#targetGradient)"
                filter="url(#targetShadow)"
            />

            <circle
                cx="60"
                cy="60"
                r="29"
                fill="none"
                stroke="#fff5c5"
                stroke-width="6"
            />

            <circle
                cx="60"
                cy="60"
                r="14"
                fill="#d6383e"
            />

            <path
                d="M83 25 L96 12"
                stroke="#e5edf7"
                stroke-width="6"
                stroke-linecap="round"
            />

            <path
                d="M96 12 L93 27 M96 12 L81 15"
                stroke="#e5edf7"
                stroke-width="4"
                stroke-linecap="round"
            />
        </svg>
    `,

    star: `
        <svg viewBox="0 0 120 120" class="svg-3d-icon" aria-hidden="true">
            <defs>
                <linearGradient id="starGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#fff4a8"/>
                    <stop offset="50%" stop-color="#ffc928"/>
                    <stop offset="100%" stop-color="#9c6300"/>
                </linearGradient>
                <filter id="starShadow">
                    <feDropShadow dx="0" dy="7" stdDeviation="6"
                        flood-opacity=".35"/>
                </filter>
            </defs>

            <path
                filter="url(#starShadow)"
                d="M60 12 L72 45 L108 46
                   L79 67 L89 102
                   L60 82 L31 102
                   L41 67 L12 46
                   L48 45 Z"
                fill="url(#starGradient)"
            />
        </svg>
    `,

    trophy: `
        <svg viewBox="0 0 120 120" class="svg-3d-icon" aria-hidden="true">
            <defs>
                <linearGradient id="trophyGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#fff1a0"/>
                    <stop offset="50%" stop-color="#e5a91f"/>
                    <stop offset="100%" stop-color="#76500b"/>
                </linearGradient>
                <filter id="trophyShadow">
                    <feDropShadow dx="0" dy="8" stdDeviation="6"
                        flood-opacity=".35"/>
                </filter>
            </defs>

            <g filter="url(#trophyShadow)">
                <path
                    d="M38 20 H82 V55
                       C82 70 72 80 60 80
                       C48 80 38 70 38 55Z"
                    fill="url(#trophyGradient)"
                />

                <path
                    d="M38 28 H22
                       C22 51 30 61 42 62"
                    fill="none"
                    stroke="#e6aa22"
                    stroke-width="8"
                    stroke-linecap="round"
                />

                <path
                    d="M82 28 H98
                       C98 51 90 61 78 62"
                    fill="none"
                    stroke="#e6aa22"
                    stroke-width="8"
                    stroke-linecap="round"
                />

                <path
                    d="M60 80 V96"
                    stroke="#d39a1d"
                    stroke-width="8"
                />

                <path
                    d="M39 101 H81"
                    stroke="#e8b72f"
                    stroke-width="10"
                    stroke-linecap="round"
                />
            </g>
        </svg>
    `,

    book: `
        <svg viewBox="0 0 120 120" class="svg-3d-icon" aria-hidden="true">
            <defs>
                <linearGradient id="smallBook" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stop-color="#7dc5ff"/>
                    <stop offset="50%" stop-color="#267ac4"/>
                    <stop offset="100%" stop-color="#123a67"/>
                </linearGradient>
            </defs>

            <path
                d="M20 25 Q60 17 100 25 V92 Q60 82 20 92Z"
                fill="url(#smallBook)"
            />

            <path
                d="M60 25 V87"
                stroke="#e8f5ff"
                stroke-width="3"
            />

            <path
                d="M34 42 L51 39 M69 39 L86 42"
                stroke="#e8f5ff"
                stroke-width="3"
                stroke-linecap="round"
            />

            <path
                d="M34 53 L51 50 M69 50 L86 53"
                stroke="#e8f5ff"
                stroke-width="2"
                stroke-linecap="round"
            />
        </svg>
    `
};


/* ============================================================
   3. STORY DATABASE
   ------------------------------------------------------------
   Pou ajoute yon nouvo istwa:
   ajoute yon nouvo objè nan STORIES.
============================================================ */

const STORIES = [

    {
        id: 1,
        title: "Kreyasyon Mond lan",
        category: "Kreyasyon",
        reference: "Jenèz 1:1–31",
        image: "images/kreyasyon.jpg",
        audio: "audio/kreyasyon.mp3",

        content: `
            <p>
                Nan kòmansman an, Bondye te kreye syèl la ak tè a.
                Tè a te san fòm e li te vid. Bondye te kòmanse mete
                lòd nan tout bagay.
            </p>

            <p>
                Bondye te di pou limyè parèt, epi limyè te parèt.
                Li te separe limyè ak fènwa. Apre sa, li te kreye
                syèl la, tè a, lanmè yo, plant yo, zetwal yo,
                solèy la ak lalin nan.
            </p>

            <p>
                Finalman, Bondye te kreye moun nan pòtre pa li.
                Bondye te gade tout sa li te fè yo, epi li te wè
                yo te bon anpil.
            </p>
        `,

        lesson:
            "Bondye se Kreyatè tout bagay. Li mete lòd nan sa ki te san fòm epi li bay lavi yon objektif.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te kreye syèl la ak tè a?",
                options: [
                    "Adan",
                    "Bondye",
                    "Noe",
                    "Abraram"
                ],
                answer: "Bondye",
                explanation:
                    "Bib la kòmanse avèk deklarasyon ki montre Bondye kòm Kreyatè syèl la ak tè a.",
                reference: "Jenèz 1:1"
            }
        ],

        generalQuestions: [
            {
                question: "Ki sa limyè ede nou fè nan lavi chak jou?",
                options: [
                    "Li ede nou wè",
                    "Li fè dlo disparèt",
                    "Li fè moun dòmi",
                    "Li kreye van"
                ],
                answer: "Li ede nou wè",
                explanation:
                    "Limyè pèmèt je moun ak anpil lòt bèt wè anviwònman yo.",
                source: "Istwa Kreyasyon Mond lan"
            }
        ]
    },


    {
        id: 2,
        title: "Adan ak Èv",
        category: "Kreyasyon",
        reference: "Jenèz 2–3",
        image: "images/adan-ev.jpg",
        audio: "audio/adan-ev.mp3",

        content: `
            <p>
                Bondye te mete Adan nan jaden Eden an. Li te ba li
                travay pou pran swen jaden an.
            </p>

            <p>
                Bondye te wè li pa t bon pou moun nan rete pou kont li,
                konsa li te kreye Èv pou vin yon konpayon pou Adan.
            </p>

            <p>
                Bondye te ba yo enstriksyon sou pyebwa yo nan jaden an.
                Istwa a montre enpòtans obeyisans ak konsekans chwa
                moun fè.
            </p>
        `,

        lesson:
            "Obeyisans ak responsablite gen yon plas enpòtan nan relasyon moun genyen avèk Bondye.",

        biblicalQuestions: [
            {
                question: "Ki kote Adan ak Èv te rete?",
                options: [
                    "Jaden Eden an",
                    "Vil Jeriko",
                    "Peyi Lejip",
                    "Mòn Sinayi"
                ],
                answer: "Jaden Eden an",
                explanation:
                    "Jenèz rakonte Adan te mete nan jaden Eden an.",
                reference: "Jenèz 2:8"
            }
        ],

        generalQuestions: [
            {
                question: "Ki sa yon jaden bezwen pou plant yo grandi?",
                options: [
                    "Dlo ak limyè",
                    "Wòch sèlman",
                    "Fènwa sèlman",
                    "Sab sèlman"
                ],
                answer: "Dlo ak limyè",
                explanation:
                    "Plant yo bezwen dlo ak limyè ansanm ak lòt eleman pou grandi.",
                source: "Istwa Adan ak Èv"
            }
        ]
    },


    {
        id: 3,
        title: "Noye ak Bwat la",
        category: "Gwo Evènman",
        reference: "Jenèz 6–9",
        image: "images/noye.jpg",
        audio: "audio/noye.mp3",

        content: `
            <p>
                Nan tan Noye a, Bondye te bay Noye yon misyon espesyal:
                bati yon gwo bwat pou pwoteje fanmi li ak bèt yo.
            </p>

            <p>
                Noye te suiv enstriksyon Bondye te ba li yo.
                Lè gwo dlo a te vini, bwat la te sèvi kòm pwoteksyon
                pou moun ak bèt ki te ladan l.
            </p>

            <p>
                Apre dlo yo te bese, Noye ak fanmi li soti nan bwat la.
                Istwa a rakonte alyans Bondye te fè avèk Noye.
            </p>
        `,

        lesson:
            "Istwa Noye a mete aksan sou obeyisans, konfyans ak alyans Bondye.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te bati bwat la?",
                options: [
                    "Moyiz",
                    "Noye",
                    "David",
                    "Pyè"
                ],
                answer: "Noye",
                explanation:
                    "Bondye te bay Noye enstriksyon pou bati bwat la.",
                reference: "Jenèz 6:14"
            }
        ],

        generalQuestions: [
            {
                question: "Ki kalite estrikti yon bwat gwo ka sèvi kòm?",
                options: [
                    "Yon mwayen transpò",
                    "Yon zetwal",
                    "Yon pyebwa",
                    "Yon rivyè"
                ],
                answer: "Yon mwayen transpò",
                explanation:
                    "Yon bato oswa bwat ki fèt pou flote ka sèvi pou transpò sou dlo.",
                source: "Istwa Noye ak Bwat la"
            }
        ]
    },


    {
        id: 4,
        title: "Abraram ak Pwomès Bondye",
        category: "Pèsonaj Biblik",
        reference: "Jenèz 12; 15; 17",
        image: "images/abram.jpg",
        audio: "audio/abram.mp3",

        content: `
            <p>
                Bondye te rele Abraram pou kite peyi kote li te rete a
                pou ale nan yon peyi Bondye t ap montre li.
            </p>

            <p>
                Bondye te fè Abraram plizyè pwomès. Istwa li montre
                yon relasyon kote konfyans ak lafwa te vin enpòtan.
            </p>
        `,

        lesson:
            "Lafwa vle di mete konfyans nan Bondye menm lè nou poko wè tout sa k ap vini.",

        biblicalQuestions: [
            {
                question: "Ki non Abraram te genyen anvan Bondye te chanje non li?",
                options: [
                    "Abram",
                    "Izarak",
                    "Jakòb",
                    "Ezaou"
                ],
                answer: "Abram",
                explanation:
                    "Nan Bib la, non Abram vin tounen Abraram.",
                reference: "Jenèz 17:5"
            }
        ],

        generalQuestions: [
            {
                question: "Ki sa yon pwomès ye?",
                options: [
                    "Yon angajman pou fè yon bagay",
                    "Yon jwèt",
                    "Yon manje",
                    "Yon vwayaj"
                ],
                answer: "Yon angajman pou fè yon bagay",
                explanation:
                    "Yon pwomès se yon angajman yon moun pran pou fè oswa bay yon bagay.",
                source: "Istwa Abraram ak Pwomès Bondye"
            }
        ]
    },


    {
        id: 5,
        title: "Izarak fèt",
        category: "Pèsonaj Biblik",
        reference: "Jenèz 21:1–7",
        image: "images/izarak.jpg",
        audio: "audio/izarak.mp3",

        content: `
            <p>
                Bondye te akonpli pwomès li te fè Abraram ak Sara.
                Sara te fè yon pitit gason nan laj li.
            </p>

            <p>
                Yo te rele pitit la Izarak, jan Bondye te mande yo.
                Nesans li te pote anpil lajwa nan fanmi an.
            </p>
        `,

        lesson:
            "Istwa Izarak la raple nou sou fidelite Bondye ak enpòtans pwomès li yo.",

        biblicalQuestions: [
            {
                question: "Ki jan pitit Abraram ak Sara a te rele?",
                options: [
                    "Izarak",
                    "Jakòb",
                    "Jozèf",
                    "Samyèl"
                ],
                answer: "Izarak",
                explanation:
                    "Jenèz 21 rakonte nesans Izarak.",
                reference: "Jenèz 21:3"
            }
        ],

        generalQuestions: [
            {
                question: "Ki relasyon Izarak te genyen ak Abraram?",
                options: [
                    "Pitit gason",
                    "Frè",
                    "Papa",
                    "Kouzen"
                ],
                answer: "Pitit gason",
                explanation:
                    "Izarak se te pitit Abraram ak Sara.",
                source: "Istwa Izarak fèt"
            }
        ]
    }

    /* ========================================================
       OU KA KONTINYE AK ISTWA 6 JISKA 50 ISIT LA.

       FÒMA A TOUJOU MENM:

       {
           id: 6,
           title: "...",
           category: "...",
           reference: "...",
           image: "images/...",
           audio: "audio/...",

           content: "...",

           lesson: "...",

           biblicalQuestions: [
               {
                   question: "...",
                   options: ["...", "...", "...", "..."],
                   answer: "...",
                   explanation: "...",
                   reference: "..."
               }
           ],

           generalQuestions: [
               {
                   question: "...",
                   options: ["...", "...", "...", "..."],
                   answer: "...",
                   explanation: "...",
                   source: "..."
               }
           ]
       }

    ======================================================== */
];


/* ============================================================
   4. APPLICATION STATE
============================================================ */

const state = {

    currentView: "home",

    currentStoryId: null,

    filteredStories: [],

    currentCategory: "all",

    searchTerm: "",

    favorites: [],

    textSize: 1,

    darkMode: false,

    biblicalGame: {
        questions: [],
        currentIndex: 0,
        score: 0,
        answered: false
    },

    generalGame: {
        questions: [],
        currentIndex: 0,
        score: 0,
        answered: false
    }
};


/* ============================================================
   5. DOM HELPERS
============================================================ */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

function byId(id) {
    return document.getElementById(id);
}


/* ============================================================
   6. STORAGE
============================================================ */

function loadStorage() {

    try {

        const favorites =
            localStorage.getItem(APP_CONFIG.storage.favorites);

        const settings =
            localStorage.getItem(APP_CONFIG.storage.settings);

        const textSize =
            localStorage.getItem(APP_CONFIG.storage.textSize);

        if (favorites) {
            state.favorites = JSON.parse(favorites);
        }

        if (settings) {

            const parsed = JSON.parse(settings);

            state.darkMode =
                Boolean(parsed.darkMode);
        }

        if (textSize) {
            state.textSize = Number(textSize) || 1;
        }

    } catch (error) {

        console.warn(
            "LocalStorage pa disponib oswa done yo pa valab.",
            error
        );
    }
}


function saveFavorites() {

    localStorage.setItem(
        APP_CONFIG.storage.favorites,
        JSON.stringify(state.favorites)
    );
}


function saveSettings() {

    localStorage.setItem(
        APP_CONFIG.storage.settings,
        JSON.stringify({
            darkMode: state.darkMode
        })
    );

    localStorage.setItem(
        APP_CONFIG.storage.textSize,
        String(state.textSize)
    );
}


/* ============================================================
   7. SVG INTEGRATION
============================================================ */

function injectSVGIcons() {

    const iconMap = {

        "📖": SVG_ICONS.bible,
        "❤️": SVG_ICONS.heart,
        "🧠": SVG_ICONS.brain,
        "🎯": SVG_ICONS.target,
        "🏆": SVG_ICONS.trophy
    };

    $$("[data-svg-icon]").forEach(element => {

        const name = element.dataset.svgIcon;

        if (SVG_ICONS[name]) {
            element.innerHTML = SVG_ICONS[name];
        }
    });

    /*
     * Pou eleman HTML ki deja gen emoji,
     * nou kite yo fonksyone nòmalman.
     *
     * SVG yo disponib tou pou JS itilize lè l ap
     * kreye cards ak kategori.
     */
}


function getCategoryIcon(category) {

    const icons = {

        "Kreyasyon": SVG_ICONS.star,

        "Pèsonaj Biblik": SVG_ICONS.bible,

        "Gwo Evènman": SVG_ICONS.book,

        "Jezi": SVG_ICONS.heart,

        "Lafwa": SVG_ICONS.star,

        "Mirak": SVG_ICONS.brain,

        "default": SVG_ICONS.bible
    };

    return icons[category] || icons.default;
}


/* ============================================================
   8. STORY HELPERS
============================================================ */

function getStoryById(id) {

    return STORIES.find(
        story => Number(story.id) === Number(id)
    );
}


function getAvailableStories() {

    return STORIES
        .slice(0, APP_CONFIG.maxStories);
}


function getCategories() {

    return [
        ...new Set(
            getAvailableStories()
                .map(story => story.category)
                .filter(Boolean)
        )
    ];
}


/* ============================================================
   9. IMAGE FALLBACK
============================================================ */

function createStoryImageFallback(story) {

    const title =
        escapeHTML(story.title || "Istwa Biblik");

    return `
        <div class="generated-story-visual"
             aria-label="${title}">
            <div class="generated-story-glow"></div>

            <div class="generated-story-icon">
                ${SVG_ICONS.bible}
            </div>

            <strong>${title}</strong>

            <small>
                ${escapeHTML(story.reference || "")}
            </small>
        </div>
    `;
}


/* ============================================================
   10. ESCAPE HTML
============================================================ */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* ============================================================
   11. RENDER STORY CARD
============================================================ */

function createStoryCard(story) {

    const template =
        byId("story-card-template");

    if (!template) {
        return null;
    }

    const clone =
        template.content.cloneNode(true);

    const card =
        $(".story-card", clone);

    const main =
        $(".story-card-main", clone);

    const image =
        $(".story-card-image", clone);

    const number =
        $(".story-card-number", clone);

    const category =
        $(".story-card-category", clone);

    const title =
        $(".story-card-title", clone);

    const reference =
        $(".story-card-reference", clone);

    const favorite =
        $(".story-card-favorite", clone);

    if (image) {

        image.src = story.image || "";
        image.alt = story.title || "";

        image.addEventListener(
            "error",
            () => {

                const wrapper =
                    image.parentElement;

                if (wrapper) {

                    image.style.display = "none";

                    if (!wrapper.querySelector(".generated-story-visual")) {

                        wrapper.insertAdjacentHTML(
                            "beforeend",
                            createStoryImageFallback(story)
                        );
                    }
                }
            }
        );
    }

    if (number) {
        number.textContent = story.id;
    }

    if (category) {
        category.textContent = story.category;
    }

    if (title) {
        title.textContent = story.title;
    }

    if (reference) {
        reference.textContent = story.reference;
    }

    if (favorite) {

        const isFavorite =
            state.favorites.includes(story.id);

        favorite.textContent =
            isFavorite ? "♥" : "♡";

        favorite.setAttribute(
            "aria-label",
            isFavorite
                ? "Retire istwa nan favori"
                : "Ajoute istwa nan favori"
        );

        favorite.addEventListener(
            "click",
            event => {

                event.stopPropagation();

                toggleFavorite(story.id);
            }
        );
    }

    if (main) {

        main.addEventListener(
            "click",
            () => openStory(story.id)
        );
    }

    return card;
}


/* ============================================================
   12. RENDER STORIES
============================================================ */

function renderFeaturedStories() {

    const container =
        byId("featured-stories-grid");

    if (!container) return;

    container.innerHTML = "";

    getAvailableStories()
        .slice(0, 4)
        .forEach(story => {

            const card =
                createStoryCard(story);

            if (card) {
                container.appendChild(card);
            }
        });
}


function renderStories() {

    const container =
        byId("all-stories-grid");

    if (!container) return;

    const stories =
        getFilteredStories();

    container.innerHTML = "";

    if (!stories.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">
                    ${SVG_ICONS.book}
                </div>

                <h3>
                    Pa gen istwa ki koresponn
                </h3>

                <p>
                    Eseye yon lòt mo oswa yon lòt kategori.
                </p>
            </div>
        `;

        return;
    }

    stories.forEach(story => {

        const card =
            createStoryCard(story);

        if (card) {
            container.appendChild(card);
        }
    });
}


function getFilteredStories() {

    let stories =
        getAvailableStories();

    if (state.currentCategory !== "all") {

        stories =
            stories.filter(
                story =>
                    story.category ===
                    state.currentCategory
            );
    }

    if (state.searchTerm) {

        const term =
            state.searchTerm.toLowerCase();

        stories =
            stories.filter(story => {

                return (
                    story.title
                        .toLowerCase()
                        .includes(term) ||

                    story.category
                        .toLowerCase()
                        .includes(term) ||

                    story.reference
                        .toLowerCase()
                        .includes(term)
                );
            });
    }

    return stories;
}


/* ============================================================
   13. CATEGORY RENDER
============================================================ */

function renderCategories() {

    const container =
        byId("categories-grid");

    if (!container) return;

    container.innerHTML = "";

    const template =
        byId("category-card-template");

    if (!template) return;

    getCategories().forEach(category => {

        const clone =
            template.content.cloneNode(true);

        const button =
            $(".category-card", clone);

        const icon =
            $(".category-card-icon", clone);

        const title =
            $(".category-card-title", clone);

        const count =
            $(".category-card-count", clone);

        if (icon) {
            icon.innerHTML =
                getCategoryIcon(category);
        }

        if (title) {
            title.textContent = category;
        }

        const amount =
            getAvailableStories()
                .filter(
                    story =>
                        story.category === category
                ).length;

        if (count) {

            count.textContent =
                `${amount} istwa`;
        }

        if (button) {

            button.addEventListener(
                "click",
                () => {

                    state.currentCategory =
                        category;

                    showView("stories");

                    renderCategoryFilters();
                    renderStories();
                }
            );
        }

        container.appendChild(clone);
    });
}


function renderCategoryFilters() {

    const container =
        byId("category-filter");

    if (!container) return;

    container.innerHTML = "";

    const allButton =
        document.createElement("button");

    allButton.type = "button";
    allButton.className =
        "filter-button";

    if (state.currentCategory === "all") {
        allButton.classList.add("active");
    }

    allButton.dataset.category = "all";
    allButton.textContent = "Tout";

    container.appendChild(allButton);

    getCategories().forEach(category => {

        const button =
            document.createElement("button");

        button.type = "button";
        button.className =
            "filter-button";

        button.dataset.category =
            category;

        button.textContent =
            category;

        if (state.currentCategory === category) {
            button.classList.add("active");
        }

        container.appendChild(button);
    });

    $$(".filter-button", container)
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    state.currentCategory =
                        button.dataset.category;

                    renderCategoryFilters();
                    renderStories();
                }
            );
        });
}


/* ============================================================
   14. FAVORITES
============================================================ */

function toggleFavorite(id) {

    const index =
        state.favorites.indexOf(id);

    if (index >= 0) {

        state.favorites.splice(index, 1);

        showToast(
            "Istwa a retire nan favori."
        );

    } else {

        state.favorites.push(id);

        showToast(
            "Istwa a ajoute nan favori."
        );
    }

    saveFavorites();

    renderStories();
    renderFeaturedStories();
    renderFavorites();

    if (state.currentStoryId === id) {
        updateFavoriteButton();
    }
}


function renderFavorites() {

    const container =
        byId("favorites-grid");

    const empty =
        byId("empty-favorites");

    if (!container) return;

    container.innerHTML = "";

    const stories =
        getAvailableStories()
            .filter(
                story =>
                    state.favorites.includes(story.id)
            );

    if (!stories.length) {

        if (empty) {
            empty.hidden = false;
        }

        return;
    }

    if (empty) {
        empty.hidden = true;
    }

    stories.forEach(story => {

        const card =
            createStoryCard(story);

        if (card) {
            container.appendChild(card);
        }
    });
}


/* ============================================================
   15. OPEN STORY
============================================================ */

function openStory(id) {

    const story =
        getStoryById(id);

    if (!story) {

        showToast(
            "Istwa sa a pa disponib toujou."
        );

        return;
    }

    state.currentStoryId =
        story.id;

    renderStoryDetail(story);

    showView("story-detail");
}


function renderStoryDetail(story) {

    const number =
        byId("story-number");

    const title =
        byId("story-title");

    const reference =
        byId("story-reference");

    const content =
        byId("story-content");

    const lesson =
        byId("story-lesson");

    const image =
        byId("story-image");

    const placeholder =
        byId("story-image-placeholder");

    const audio =
        byId("story-audio");

    if (number) {
        number.textContent =
            `Istwa ${story.id}`;
    }

    if (title) {
        title.textContent =
            story.title;
    }

    if (reference) {
        reference.textContent =
            story.reference;
    }

    if (content) {
        content.innerHTML =
            story.content;
    }

    if (lesson) {
        lesson.textContent =
            story.lesson;
    }

    if (image) {

        image.style.display = "block";

        image.src =
            story.image || "";

        image.alt =
            story.title;

        image.onerror = () => {

            image.style.display =
                "none";

            if (placeholder) {

                placeholder.hidden =
                    false;

                placeholder.innerHTML =
                    createStoryImageFallback(story);
            }
        };
    }

    if (audio) {

        audio.pause();

        audio.currentTime = 0;

        audio.src =
            story.audio || "";

        audio.load();
    }

    updateFavoriteButton();
    updateStoryPagination();

    applyTextSize();
    updateAudioUI();
}


function updateFavoriteButton() {

    const button =
        byId("story-favorite-button");

    if (!button || !state.currentStoryId) {
        return;
    }

    const favorite =
        state.favorites.includes(
            state.currentStoryId
        );

    button.textContent =
        favorite ? "♥" : "♡";

    button.setAttribute(
        "aria-label",
        favorite
            ? "Retire istwa nan favori"
            : "Ajoute istwa nan favori"
    );
}


/* ============================================================
   16. STORY PAGINATION
============================================================ */

function updateStoryPagination() {

    const previous =
        byId("previous-story-button");

    const next =
        byId("next-story-button");

    const stories =
        getAvailableStories();

    const index =
        stories.findIndex(
            story =>
                story.id === state.currentStoryId
        );

    if (previous) {

        previous.disabled =
            index <= 0;
    }

    if (next) {

        next.disabled =
            index < 0 ||
            index >= stories.length - 1;
    }
}


function openPreviousStory() {

    const stories =
        getAvailableStories();

    const index =
        stories.findIndex(
            story =>
                story.id === state.currentStoryId
        );

    if (index > 0) {

        openStory(
            stories[index - 1].id
        );
    }
}


function openNextStory() {

    const stories =
        getAvailableStories();

    const index =
        stories.findIndex(
            story =>
                story.id === state.currentStoryId
        );

    if (
        index >= 0 &&
        index < stories.length - 1
    ) {

        openStory(
            stories[index + 1].id
        );
    }
}


/* ============================================================
   17. NAVIGATION
============================================================ */

function showView(viewName) {

    state.currentView =
        viewName;

    $$(".app-view")
        .forEach(view => {

            const matches =
                view.dataset.viewSection ===
                viewName;

            view.hidden =
                !matches;

            view.classList.toggle(
                "active-view",
                matches
            );
        });

    $$(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.view === viewName
            );
        });

    closeSideMenu();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    if (viewName === "stories") {
        renderStories();
    }

    if (viewName === "favorites") {
        renderFavorites();
    }

    if (viewName === "categories") {
        renderCategories();
    }
}


function bindNavigation() {

    $$("[data-view]")
        .forEach(element => {

            element.addEventListener(
                "click",
                () => {

                    const view =
                        element.dataset.view;

                    if (view) {
                        showView(view);
                    }
                }
            );
        });
}


/* ============================================================
   18. SIDE MENU
============================================================ */

function openSideMenu() {

    const menu =
        byId("side-menu");

    const overlay =
        byId("menu-overlay");

    if (menu) {

        menu.classList.add("open");
        menu.setAttribute(
            "aria-hidden",
            "false"
        );
    }

    if (overlay) {

        overlay.classList.add("visible");

        overlay.setAttribute(
            "aria-hidden",
            "false"
        );
    }
}


function closeSideMenu() {

    const menu =
        byId("side-menu");

    const overlay =
        byId("menu-overlay");

    if (menu) {

        menu.classList.remove("open");

        menu.setAttribute(
            "aria-hidden",
            "true"
        );
    }

    if (overlay) {

        overlay.classList.remove("visible");

        overlay.setAttribute(
            "aria-hidden",
            "true"
        );
    }
}


/* ============================================================
   19. SEARCH
============================================================ */

function bindSearch() {

    const input =
        byId("story-search-input");

    const clear =
        byId("clear-story-search");

    if (input) {

        input.addEventListener(
            "input",
            () => {

                state.searchTerm =
                    input.value.trim();

                if (clear) {
                    clear.hidden =
                        !state.searchTerm;
                }

                renderStories();
            }
        );
    }

    if (clear) {

        clear.addEventListener(
            "click",
            () => {

                if (input) {
                    input.value = "";
                }

                state.searchTerm = "";

                clear.hidden = true;

                renderStories();
            }
        );
    }
}


/* ============================================================
   20. AUDIO PLAYER
============================================================ */

function setupAudio() {

    const audio =
        byId("story-audio");

    const play =
        byId("audio-play-button");

    const progress =
        byId("audio-progress");

    const volume =
        byId("audio-volume-button");

    if (!audio) return;

    if (play) {

        play.addEventListener(
            "click",
            async () => {

                try {

                    if (audio.paused) {

                        await audio.play();

                    } else {

                        audio.pause();
                    }

                } catch (error) {

                    showToast(
                        "Odyo sa a poko disponib."
                    );
                }
            }
        );
    }

    audio.addEventListener(
        "play",
        () => {

            if (play) {
                play.textContent = "⏸";
            }
        }
    );

    audio.addEventListener(
        "pause",
        () => {

            if (play) {
                play.textContent = "▶";
            }
        }
    );

    audio.addEventListener(
        "timeupdate",
        () => {

            updateAudioUI();
        }
    );

    audio.addEventListener(
        "loadedmetadata",
        () => {

            updateAudioUI();
        }
    );

    audio.addEventListener(
        "ended",
        () => {

            if (play) {
                play.textContent = "▶";
            }

            if (progress) {
                progress.value = 0;
            }
        }
    );

    if (progress) {

        progress.addEventListener(
            "input",
            () => {

                if (!audio.duration) {
                    return;
                }

                audio.currentTime =
                    (Number(progress.value) / 100) *
                    audio.duration;
            }
        );
    }

    if (volume) {

        volume.addEventListener(
            "click",
            () => {

                audio.muted =
                    !audio.muted;

                volume.textContent =
                    audio.muted
                        ? "🔇"
                        : "🔊";
            }
        );
    }
}


function updateAudioUI() {

    const audio =
        byId("story-audio");

    const progress =
        byId("audio-progress");

    const time =
        byId("audio-time");

    if (!audio) return;

    if (progress && audio.duration) {

        progress.value =
            (audio.currentTime /
                audio.duration) * 100;
    }

    if (time) {

        time.textContent =
            `${formatTime(audio.currentTime)}
             / ${formatTime(audio.duration)}`;
    }
}


function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "00:00";
    }

    const minutes =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60);

    return (
        String(minutes).padStart(2, "0") +
        ":" +
        String(secs).padStart(2, "0")
    );
}


/* ============================================================
   21. TEXT SIZE
============================================================ */

function applyTextSize() {

    const content =
        byId("story-content");

    if (!content) return;

    const size =
        Math.min(
            1.5,
            Math.max(
                0.8,
                state.textSize
            )
        );

    content.style.fontSize =
        `${size}em`;
}


function changeTextSize(amount) {

    state.textSize =
        Math.min(
            1.5,
            Math.max(
                0.8,
                state.textSize + amount
            )
        );

    applyTextSize();

    saveSettings();
}


function resetTextSize() {

    state.textSize =
        APP_CONFIG.defaultTextSize;

    applyTextSize();

    saveSettings();
}


/* ============================================================
   22. DARK MODE
============================================================ */

function applyDarkMode() {

    document.body.classList.toggle(
        "dark-mode",
        state.darkMode
    );

    const toggle =
        byId("dark-mode-toggle");

    if (toggle) {
        toggle.checked =
            state.darkMode;
    }
}


/* ============================================================
   23. BIBLICAL GAME
============================================================ */

function buildBiblicalQuestions(story = null) {

    let questions = [];

    if (story && story.biblicalQuestions) {

        questions =
            [...story.biblicalQuestions];

    } else {

        getAvailableStories()
            .forEach(item => {

                if (Array.isArray(item.biblicalQuestions)) {

                    item.biblicalQuestions
                        .forEach(question => {

                            questions.push({
                                ...question,
                                storyTitle:
                                    item.title
                            });
                        });
                }
            });
    }

    return shuffle(questions)
        .slice(
            0,
            APP_CONFIG.gameQuestions
        );
}


function startBiblicalGame(story = null) {

    state.biblicalGame = {

        questions:
            buildBiblicalQuestions(story),

        currentIndex: 0,

        score: 0,

        answered: false
    };

    if (!state.biblicalGame.questions.length) {

        showToast(
            "Nou bezwen ajoute kesyon biblik nan istwa yo."
        );

        return;
    }

    showView("biblical-game");

    const start =
        byId("biblical-game-start");

    const active =
        byId("biblical-game-active");

    const result =
        byId("biblical-game-result");

    if (start) start.hidden = true;
    if (active) active.hidden = false;
    if (result) result.hidden = true;

    renderBiblicalQuestion();
}


function renderBiblicalQuestion() {

    const game =
        state.biblicalGame;

    const question =
        game.questions[
            game.currentIndex
        ];

    if (!question) {

        finishBiblicalGame();

        return;
    }

    game.answered = false;

    const counter =
        byId("biblical-question-counter");

    const score =
        byId("biblical-score");

    const category =
        byId("biblical-question-category");

    const questionElement =
        byId("biblical-question");

    const options =
        byId("biblical-answer-options");

    const explanation =
        byId("biblical-answer-explanation");

    const next =
        byId("next-biblical-question-button");

    const help =
        byId("show-biblical-answer-button");

    const progress =
        byId("biblical-progress-fill");

    if (counter) {

        counter.textContent =
            `Kesyon ${game.currentIndex + 1}
             / ${game.questions.length}`;
    }

    if (score) {
        score.textContent =
            `⭐ ${game.score}`;
    }

    if (category) {
        category.textContent =
            question.storyTitle
                ? `📖 ${question.storyTitle}`
                : "📖 Istwa Biblik";
    }

    if (questionElement) {
        questionElement.textContent =
            question.question;
    }

    if (progress) {

        progress.style.width =
            `${(
                game.currentIndex /
                game.questions.length
            ) * 100}%`;
    }

    if (options) {

        options.innerHTML = "";

        question.options.forEach(
            (option, index) => {

                const button =
                    document.createElement("button");

                button.type = "button";

                button.className =
                    "answer-option";

                button.dataset.answer =
                    option;

                button.innerHTML = `
                    <span class="answer-letter">
                        ${String.fromCharCode(65 + index)}
                    </span>

                    <span>
                        ${escapeHTML(option)}
                    </span>
                `;

                button.addEventListener(
                    "click",
                    () => {

                        answerBiblicalQuestion(
                            option,
                            button
                        );
                    }
                );

                options.appendChild(button);
            }
        );
    }

    if (explanation) {
        explanation.hidden = true;
    }

    if (next) {
        next.hidden = true;
    }

    if (help) {
        help.hidden = false;
    }
}


function answerBiblicalQuestion(
    selected,
    clickedButton
) {

    const game =
        state.biblicalGame;

    if (game.answered) {
        return;
    }

    const question =
        game.questions[
            game.currentIndex
        ];

    if (!question) return;

    game.answered = true;

    const correct =
        selected === question.answer;

    if (correct) {
        game.score++;
    }

    $$(".answer-option")
        .forEach(button => {

            button.disabled = true;

            if (
                button.dataset.answer ===
                question.answer
            ) {

                button.classList.add(
                    "correct"
                );
            }

            if (
                button === clickedButton &&
                !correct
            ) {

                button.classList.add(
                    "wrong"
                );
            }
        });

    showBiblicalExplanation(
        question,
        correct
    );
}


function showBiblicalExplanation(
    question,
    correct = false
) {

    const explanation =
        byId("biblical-answer-explanation");

    const answer =
        byId("biblical-correct-answer");

    const explanationText =
        byId("biblical-explanation");

    const reference =
        byId("biblical-reference");

    const next =
        byId("next-biblical-question-button");

    const help =
        byId("show-biblical-answer-button");

    if (answer) {
        answer.textContent =
            question.answer;
    }

    if (explanationText) {
        explanationText.textContent =
            question.explanation;
    }

    if (reference) {
        reference.textContent =
            question.reference;
    }

    if (explanation) {
        explanation.hidden = false;
    }

    if (next) {
        next.hidden = false;
    }

    if (help) {
        help.hidden = true;
    }

    if (correct) {

        showToast(
            "Bon repons! 🎉"
        );

    } else {

        showToast(
            "Gade repons ak referans biblik la."
        );
    }
}


function revealBiblicalAnswer() {

    if (state.biblicalGame.answered) {
        return;
    }

    const question =
        state.biblicalGame.questions[
            state.biblicalGame.currentIndex
        ];

    if (!question) return;

    state.biblicalGame.answered = true;

    $$(".answer-option")
        .forEach(button => {

            button.disabled = true;

            if (
                button.dataset.answer ===
                question.answer
            ) {

                button.classList.add(
                    "correct"
                );
            }
        });

    showBiblicalExplanation(
        question,
        false
    );
}


function nextBiblicalQuestion() {

    state.biblicalGame.currentIndex++;

    if (
        state.biblicalGame.currentIndex >=
        state.biblicalGame.questions.length
    ) {

        finishBiblicalGame();

        return;
    }

    renderBiblicalQuestion();
}


function finishBiblicalGame() {

    const game =
        state.biblicalGame;

    const active =
        byId("biblical-game-active");

    const result =
        byId("biblical-game-result");

    const finalScore =
        byId("biblical-final-score");

    if (active) active.hidden = true;

    if (result) result.hidden = false;

    if (finalScore) {

        finalScore.textContent =
            `${game.score} / ${game.questions.length}`;
    }
}


/* ============================================================
   24. GENERAL KNOWLEDGE GAME
============================================================ */

function buildGeneralQuestions(story = null) {

    let questions = [];

    if (story && story.generalQuestions) {

        questions =
            [...story.generalQuestions];

    } else {

        getAvailableStories()
            .forEach(item => {

                if (Array.isArray(item.generalQuestions)) {

                    item.generalQuestions
                        .forEach(question => {

                            questions.push({
                                ...question,
                                storyTitle:
                                    item.title
                            });
                        });
                }
            });
    }

    return shuffle(questions)
        .slice(
            0,
            APP_CONFIG.gameQuestions
        );
}


function startGeneralGame(story = null) {

    state.generalGame = {

        questions:
            buildGeneralQuestions(story),

        currentIndex: 0,

        score: 0,

        answered: false
    };

    if (!state.generalGame.questions.length) {

        showToast(
            "Nou bezwen ajoute kesyon konesans jeneral."
        );

        return;
    }

    showView("general-knowledge");

    const start =
        byId("general-game-start");

    const active =
        byId("general-game-active");

    const result =
        byId("general-game-result");

    if (start) start.hidden = true;
    if (active) active.hidden = false;
    if (result) result.hidden = true;

    renderGeneralQuestion();
}


function renderGeneralQuestion() {

    const game =
        state.generalGame;

    const question =
        game.questions[
            game.currentIndex
        ];

    if (!question) {

        finishGeneralGame();

        return;
    }

    game.answered = false;

    const counter =
        byId("general-question-counter");

    const score =
        byId("general-score");

    const category =
        byId("general-question-category");

    const questionElement =
        byId("general-question");

    const options =
        byId("general-answer-options");

    const explanation =
        byId("general-answer-explanation");

    const next =
        byId("next-general-question-button");

    const help =
        byId("show-general-answer-button");

    const progress =
        byId("general-progress-fill");

    if (counter) {

        counter.textContent =
            `Kesyon ${game.currentIndex + 1}
             / ${game.questions.length}`;
    }

    if (score) {
        score.textContent =
            `⭐ ${game.score}`;
    }

    if (category) {

        category.textContent =
            question.storyTitle
                ? `📖 ${question.storyTitle}`
                : "🎯 Konesans Jeneral";
    }

    if (questionElement) {
        questionElement.textContent =
            question.question;
    }

    if (progress) {

        progress.style.width =
            `${(
                game.currentIndex /
                game.questions.length
            ) * 100}%`;
    }

    if (options) {

        options.innerHTML = "";

        question.options.forEach(
            (option, index) => {

                const button =
                    document.createElement("button");

                button.type = "button";

                button.className =
                    "answer-option";

                button.dataset.answer =
                    option;

                button.innerHTML = `
                    <span class="answer-letter">
                        ${String.fromCharCode(65 + index)}
                    </span>

                    <span>
                        ${escapeHTML(option)}
                    </span>
                `;

                button.addEventListener(
                    "click",
                    () => {

                        answerGeneralQuestion(
                            option,
                            button
                        );
                    }
                );

                options.appendChild(button);
            }
        );
    }

    if (explanation) {
        explanation.hidden = true;
    }

    if (next) {
        next.hidden = true;
    }

    if (help) {
        help.hidden = false;
    }
}


function answerGeneralQuestion(
    selected,
    clickedButton
) {

    const game =
        state.generalGame;

    if (game.answered) {
        return;
    }

    const question =
        game.questions[
            game.currentIndex
        ];

    if (!question) return;

    game.answered = true;

    const correct =
        selected === question.answer;

    if (correct) {
        game.score++;
    }

    $$("#general-answer-options .answer-option")
        .forEach(button => {

            button.disabled = true;

            if (
                button.dataset.answer ===
                question.answer
            ) {

                button.classList.add(
                    "correct"
                );
            }

            if (
                button === clickedButton &&
                !correct
            ) {

                button.classList.add(
                    "wrong"
                );
            }
        });

    showGeneralExplanation(
        question,
        correct
    );
}


function showGeneralExplanation(
    question,
    correct = false
) {

    const explanation =
        byId("general-answer-explanation");

    const answer =
        byId("general-correct-answer");

    const explanationText =
        byId("general-explanation");

    const source =
        byId("general-source-story");

    const next =
        byId("next-general-question-button");

    const help =
        byId("show-general-answer-button");

    if (answer) {
        answer.textContent =
            question.answer;
    }

    if (explanationText) {
        explanationText.textContent =
            question.explanation;
    }

    if (source) {

        source.textContent =
            question.source ||
            question.storyTitle ||
            "Istwa biblik la";
    }

    if (explanation) {
        explanation.hidden = false;
    }

    if (next) {
        next.hidden = false;
    }

    if (help) {
        help.hidden = true;
    }

    showToast(
        correct
            ? "Bon repons! 🎉"
            : "Men repons ki kòrèk la."
    );
}


function revealGeneralAnswer() {

    if (state.generalGame.answered) {
        return;
    }

    const question =
        state.generalGame.questions[
            state.generalGame.currentIndex
        ];

    if (!question) return;

    state.generalGame.answered = true;

    $$("#general-answer-options .answer-option")
        .forEach(button => {

            button.disabled = true;

            if (
                button.dataset.answer ===
                question.answer
            ) {

                button.classList.add(
                    "correct"
                );
            }
        });

    showGeneralExplanation(
        question,
        false
    );
}


function nextGeneralQuestion() {

    state.generalGame.currentIndex++;

    if (
        state.generalGame.currentIndex >=
        state.generalGame.questions.length
    ) {

        finishGeneralGame();

        return;
    }

    renderGeneralQuestion();
}


function finishGeneralGame() {

    const game =
        state.generalGame;

    const active =
        byId("general-game-active");

    const result =
        byId("general-game-result");

    const finalScore =
        byId("general-final-score");

    if (active) active.hidden = true;

    if (result) result.hidden = false;

    if (finalScore) {

        finalScore.textContent =
            `${game.score} / ${game.questions.length}`;
    }
}


/* ============================================================
   25. RANDOMIZE QUESTIONS
============================================================ */

function shuffle(array) {

    const result =
        [...array];

    for (
        let i = result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            result[i],
            result[j]
        ] = [
            result[j],
            result[i]
        ];
    }

    return result;
}


/* ============================================================
   26. SHARE STORY
============================================================ */

async function shareCurrentStory() {

    const story =
        getStoryById(
            state.currentStoryId
        );

    if (!story) return;

    const shareData = {

        title:
            story.title,

        text:
            `${story.title}\n\n` +
            `${story.reference}\n\n` +
            `50 Bèl Istwa nan Bib la`
    };

    try {

        if (
            navigator.share &&
            typeof navigator.share === "function"
        ) {

            await navigator.share(
                shareData
            );

            return;
        }

        await navigator.clipboard.writeText(
            `${shareData.title}\n` +
            `${shareData.reference}\n` +
            `${shareData.text}`
        );

        showToast(
            "Enfòmasyon an kopye."
        );

    } catch (error) {

        console.warn(
            "Pataje anile oswa pa disponib.",
            error
        );
    }
}


/* ============================================================
   27. MODAL SYSTEM
============================================================ */

function openModal(
    title,
    body,
    actions = ""
) {

    const modal =
        byId("app-modal");

    const modalTitle =
        byId("modal-title");

    const modalBody =
        byId("modal-body");

    const modalActions =
        byId("modal-actions");

    if (!modal) return;

    if (modalTitle) {
        modalTitle.textContent =
            title;
    }

    if (modalBody) {
        modalBody.innerHTML =
            body;
    }

    if (modalActions) {
        modalActions.innerHTML =
            actions;
    }

    modal.hidden = false;

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.classList.add(
        "modal-open"
    );
}


function closeModal() {

    const modal =
        byId("app-modal");

    if (!modal) return;

    modal.hidden = true;

    modal.setAttribute(
        "aria-hidden",
        "true"
    );

    document.body.classList.remove(
        "modal-open"
    );
}


/* ============================================================
   28. TOAST
============================================================ */

let toastTimer = null;

function showToast(message) {

    const toast =
        byId("toast");

    const text =
        byId("toast-message");

    if (!toast || !text) return;

    text.textContent =
        message;

    toast.hidden = false;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

                setTimeout(
                    () => {
                        toast.hidden = true;
                    },
                    250
                );

            },
            2500
        );
}


/* ============================================================
   29. ANDROID TOUCH + PINCH ZOOM
   ------------------------------------------------------------
   Nou pa dezaktive zoom navigatè a.
   Nou ajoute sipò pou pinch sou kontni istwa a.
============================================================ */

function setupTouchZoom() {

    const target =
        byId("story-content");

    if (!target) return;

    let initialDistance = null;

    let initialFontSize =
        parseFloat(
            getComputedStyle(target).fontSize
        );

    function distance(touches) {

        const dx =
            touches[0].clientX -
            touches[1].clientX;

        const dy =
            touches[0].clientY -
            touches[1].clientY;

        return Math.sqrt(
            dx * dx + dy * dy
        );
    }

    target.addEventListener(
        "touchstart",
        event => {

            if (
                event.touches.length === 2
            ) {

                initialDistance =
                    distance(
                        event.touches
                    );

                initialFontSize =
                    parseFloat(
                        getComputedStyle(
                            target
                        ).fontSize
                    );
            }
        },
        {
            passive: true
        }
    );

    target.addEventListener(
        "touchmove",
        event => {

            if (
                event.touches.length !== 2 ||
                !initialDistance
            ) {
                return;
            }

            const currentDistance =
                distance(
                    event.touches
                );

            const ratio =
                currentDistance /
                initialDistance;

            let newSize =
                initialFontSize *
                ratio;

            newSize =
                Math.min(
                    36,
                    Math.max(
                        14,
                        newSize
                    )
                );

            target.style.fontSize =
                `${newSize}px`;

        },
        {
            passive: true
        }
    );

    target.addEventListener(
        "touchend",
        event => {

            if (
                event.touches.length < 2
            ) {

                initialDistance = null;

                const currentSize =
                    parseFloat(
                        getComputedStyle(
                            target
                        ).fontSize
                    );

                state.textSize =
                    currentSize / 16;

                state.textSize =
                    Math.min(
                        1.5,
                        Math.max(
                            0.8,
                            state.textSize
                        )
                    );

                saveSettings();
            }
        },
        {
            passive: true
        }
    );
}


/* ============================================================
   30. DOUBLE TAP PROTECTION
============================================================ */

function preventAccidentalDoubleActions() {

    let lastTap = 0;

    document.addEventListener(
        "touchend",
        event => {

            const now =
                Date.now();

            if (
                now - lastTap < 250 &&
                event.target.closest(
                    "button"
                )
            ) {

                event.preventDefault();
            }

            lastTap = now;
        },
        {
            passive: false
        }
    );
}


/* ============================================================
   31. SETTINGS EVENTS
============================================================ */

function bindSettings() {

    const darkMode =
        byId("dark-mode-toggle");

    if (darkMode) {

        darkMode.addEventListener(
            "change",
            () => {

                state.darkMode =
                    darkMode.checked;

                applyDarkMode();
                saveSettings();
            }
        );
    }

    const decrease =
        byId("settings-text-decrease");

    const increase =
        byId("settings-text-increase");

    const reset =
        byId("settings-text-reset");

    if (decrease) {

        decrease.addEventListener(
            "click",
            () => changeTextSize(-0.1)
        );
    }

    if (increase) {

        increase.addEventListener(
            "click",
            () => changeTextSize(0.1)
        );
    }

    if (reset) {

        reset.addEventListener(
            "click",
            resetTextSize
        );
    }

    const about =
        byId("about-app-button");

    if (about) {

        about.addEventListener(
            "click",
            () => {

                openModal(
                    " Bèl Istwa nan Bib la",

                    `
                    <div class="about-app-content">

                        <div class="about-app-icon">
                            ${SVG_ICONS.bible}
                        </div>

                        <p>
                            Yon aplikasyon biblik pou li,
                            koute epi aprann nan istwa Bib la
                            an Kreyòl Ayisyen.
                        </p>

                        <p>
                            Vèsyon:
                            <strong>
                                ${APP_CONFIG.version}
                            </strong>
                        </p>

                    </div>
                    `,

                    `
                    <button
                        class="primary-button"
                        type="button"
                        data-modal-close>
                        Fèmen
                    </button>
                    `
                );

                const close =
                    $("[data-modal-close]");

                if (close) {
                    close.addEventListener(
                        "click",
                        closeModal
                    );
                }
            }
        );
    }
}


/* ============================================================
   32. BIND ALL BUTTONS
============================================================ */

function bindButtons() {

    const menu =
        byId("menu-button");

    const closeMenu =
        byId("close-menu-button");

    const overlay =
        byId("menu-overlay");

    if (menu) {
        menu.addEventListener(
            "click",
            openSideMenu
        );
    }

    if (closeMenu) {
        closeMenu.addEventListener(
            "click",
            closeSideMenu
        );
    }

    if (overlay) {
        overlay.addEventListener(
            "click",
            closeSideMenu
        );
    }

    const favorite =
        byId("story-favorite-button");

    if (favorite) {

        favorite.addEventListener(
            "click",
            () => {

                if (state.currentStoryId) {

                    toggleFavorite(
                        state.currentStoryId
                    );
                }
            }
        );
    }

    const back =
        byId("back-to-stories-button");

    if (back) {

        back.addEventListener(
            "click",
            () => showView("stories")
        );
    }

    const previous =
        byId("previous-story-button");

    if (previous) {

        previous.addEventListener(
            "click",
            openPreviousStory
        );
    }

    const next =
        byId("next-story-button");

    if (next) {

        next.addEventListener(
            "click",
            openNextStory
        );
    }

    const increase =
        byId("increase-text-button");

    const decrease =
        byId("decrease-text-button");

    if (increase) {

        increase.addEventListener(
            "click",
            () => changeTextSize(0.1)
        );
    }

    if (decrease) {

        decrease.addEventListener(
            "click",
            () => changeTextSize(-0.1)
        );
    }

    const share =
        byId("story-share-button");

    if (share) {
        share.addEventListener(
            "click",
            shareCurrentStory
        );
    }


    /* Jwèt biblik */

    const startBiblical =
        byId("start-biblical-game");

    if (startBiblical) {

        startBiblical.addEventListener(
            "click",
            () => startBiblicalGame()
        );
    }

    const storyBiblical =
        byId("start-biblical-game-button");

    if (storyBiblical) {

        storyBiblical.addEventListener(
            "click",
            () => {

                const story =
                    getStoryById(
                        state.currentStoryId
                    );

                startBiblicalGame(story);
            }
        );
    }

    const showBiblicalAnswer =
        byId("show-biblical-answer-button");

    if (showBiblicalAnswer) {

        showBiblicalAnswer.addEventListener(
            "click",
            revealBiblicalAnswer
        );
    }

    const nextBiblical =
        byId("next-biblical-question-button");

    if (nextBiblical) {

        nextBiblical.addEventListener(
            "click",
            nextBiblicalQuestion
        );
    }

    const restartBiblical =
        byId("restart-biblical-game");

    if (restartBiblical) {

        restartBiblical.addEventListener(
            "click",
            () => startBiblicalGame()
        );
    }

    const exitBiblical =
        byId("exit-biblical-game");

    if (exitBiblical) {

        exitBiblical.addEventListener(
            "click",
            () => showView("stories")
        );
    }


    /* Konesans jeneral */

    const startGeneral =
        byId("start-general-game");

    if (startGeneral) {

        startGeneral.addEventListener(
            "click",
            () => startGeneralGame()
        );
    }

    const storyGeneral =
        byId("start-general-game-button");

    if (storyGeneral) {

        storyGeneral.addEventListener(
            "click",
            () => {

                const story =
                    getStoryById(
                        state.currentStoryId
                    );

                startGeneralGame(story);
            }
        );
    }

    const showGeneralAnswer =
        byId("show-general-answer-button");

    if (showGeneralAnswer) {

        showGeneralAnswer.addEventListener(
            "click",
            revealGeneralAnswer
        );
    }

    const nextGeneral =
        byId("next-general-question-button");

    if (nextGeneral) {

        nextGeneral.addEventListener(
            "click",
            nextGeneralQuestion
        );
    }

    const restartGeneral =
        byId("restart-general-game");

    if (restartGeneral) {

        restartGeneral.addEventListener(
            "click",
            () => startGeneralGame()
        );
    }

    const exitGeneral =
        byId("exit-general-game");

    if (exitGeneral) {

        exitGeneral.addEventListener(
            "click",
            () => showView("stories")
        );
    }


    /* Modal */

    const closeModalButton =
        byId("close-modal-button");

    if (closeModalButton) {

        closeModalButton.addEventListener(
            "click",
            closeModal
        );
    }

    $$("[data-close-modal]")
        .forEach(element => {

            element.addEventListener(
                "click",
                closeModal
            );
        });


    /* Answer modal */

    const answerModal =
        byId("answer-modal");

    const closeAnswer =
        byId("close-answer-modal-button");

    if (closeAnswer) {

        closeAnswer.addEventListener(
            "click",
            () => {

                if (answerModal) {
                    answerModal.hidden = true;
                }
            }
        );
    }

    $$("[data-close-answer-modal]")
        .forEach(element => {

            element.addEventListener(
                "click",
                () => {

                    if (answerModal) {
                        answerModal.hidden = true;
                    }
                }
            );
        });
}


/* ============================================================
   33. KEYBOARD
============================================================ */

function setupKeyboard() {

    document.addEventListener(
        "keydown",
        event => {

            if (event.key === "Escape") {

                closeSideMenu();
                closeModal();

                const answerModal =
                    byId("answer-modal");

                if (answerModal) {
                    answerModal.hidden = true;
                }
            }

            if (
                event.key === "ArrowRight" &&
                state.currentView ===
                "story-detail"
            ) {

                openNextStory();
            }

            if (
                event.key === "ArrowLeft" &&
                state.currentView ===
                "story-detail"
            ) {

                openPreviousStory();
            }
        }
    );
}


/* ============================================================
   34. LOADING SCREEN
============================================================ */

function showLoading() {

    const loading =
        byId("loading-screen");

    if (loading) {
        loading.hidden = false;
    }
}


function hideLoading() {

    const loading =
        byId("loading-screen");

    if (loading) {
        loading.hidden = true;
    }
}


/* ============================================================
   35. HERO VISUAL
============================================================ */

function renderHeroVisual() {

    const hero =
        byId("hero-visual");

    if (!hero) return;

    hero.innerHTML = `
        <div class="hero-3d-illustration">

            <div class="hero-light"></div>

            <div class="hero-svg-book">
                ${SVG_ICONS.bible}
            </div>

            <div class="hero-floating-star star-one">
                ${SVG_ICONS.star}
            </div>

            <div class="hero-floating-star star-two">
                ${SVG_ICONS.star}
            </div>

            <div class="hero-floating-star star-three">
                ${SVG_ICONS.star}
            </div>

        </div>
    `;
}


/* ============================================================
   36. APP INITIALIZATION
============================================================ */

function initializeApp() {

    showLoading();

    loadStorage();

    applyDarkMode();

    bindNavigation();

    bindSearch();

    bindButtons();

    bindSettings();

    setupAudio();

    setupKeyboard();

    setupTouchZoom();

    preventAccidentalDoubleActions();

    renderHeroVisual();

    renderCategoryFilters();

    renderCategories();

    renderFeaturedStories();

    renderStories();

    renderFavorites();

    applyTextSize();

    injectSVGIcons();

    setTimeout(
        hideLoading,
        250
    );
}


/* ============================================================
   37. SERVICE / ERROR PROTECTION
============================================================ */

window.addEventListener(
    "error",
    event => {

        console.error(
            "Erreur aplikasyon:",
            event.error || event.message
        );
    }
);


window.addEventListener(
    "unhandledrejection",
    event => {

        console.error(
            "Promise error:",
            event.reason
        );
    }
);


/* ============================================================
   38. START APP
============================================================ */

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


/* ============================================================
   39. PUBLIC API
   Sa pèmèt ou ajoute istwa dinamikman pita.
============================================================ */

window.BiblikApp = {

    addStory(story) {

        if (!story || !story.id) {
            throw new Error(
                "Yon istwa dwe gen yon id."
            );
        }

        const exists =
            STORIES.some(
                item =>
                    Number(item.id) ===
                    Number(story.id)
            );

        if (exists) {

            console.warn(
                `Istwa ${story.id} deja egziste.`
            );

            return false;
        }

        STORIES.push(story);

        renderCategoryFilters();
        renderCategories();
        renderStories();
        renderFeaturedStories();

        return true;
    },

    addStories(stories) {

        if (!Array.isArray(stories)) {
            return false;
        }

        stories.forEach(
            story => this.addStory(story)
        );

        return true;
    },

    openStory,

    startBiblicalGame,

    startGeneralGame,

    getStories() {
        return [...STORIES];
    },

    getStory(id) {
        return getStoryById(id);
    }
};


/* ============================================================
   FIN
============================================================ */