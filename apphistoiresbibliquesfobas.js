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
    maxStories: 1000,

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
       ISTWA 6–20
       --------------------------------------------------------
       Fòma a toujou menm jan ak lòt objè yo.
    ======================================================== */

    ,

    {
        id: 6,
        title: "Jakòb ak Eskalye ki soti nan Syèl la",
        category: "Pèsonaj Biblik",
        reference: "Jenèz 28:10–22",
        image: "images/jakob-eskalye.jpg",
        audio: "audio/jakob-eskalye.mp3",

        content: `
            <p>
                Jakòb te kite Beercheba pou l ale Haran. Pandan li t ap
                vwayaje, li te rive yon kote kote li te deside pase nwit la.
                Li pran yon wòch, li mete l anba tèt li kòm zòrye epi li kouche
                pou l dòmi.
            </p>

            <p>
                Pandan Jakòb t ap dòmi, li fè yon rèv ekstraòdinè. Li wè yon
                eskalye ki te kanpe sou tè a epi tèt li te rive nan syèl la.
                Zanj Bondye yo t ap monte desann sou eskalye a.
            </p>

            <p>
                Bondye te parèt devan Jakòb epi li te raple l pwomès li te fè
                Abraram ak Izarak. Bondye te pwomèt li t ap avèk li, li t ap
                pwoteje l epi li t ap mennen l tounen nan peyi li.
            </p>

            <p>
                Lè Jakòb leve, li te sezi anpil. Li di kote sa a te yon kote
                ki apa pou Bondye. Li pran wòch li te itilize kòm zòrye a,
                li mete l kanpe kòm yon siy epi li rele kote a Betèl.
            </p>
        `,

        lesson:
            "Menm lè nou nan yon moman kote nou santi nou poukont nou, Bondye ka toujou avèk nou epi gide nou.",

        biblicalQuestions: [
            {
                question: "Kisa Jakòb te wè nan rèv li?",
                options: [
                    "Yon gwo bato",
                    "Yon eskalye ki rive nan syèl la",
                    "Yon vil ki boule",
                    "Yon wa sou yon twòn"
                ],
                answer: "Yon eskalye ki rive nan syèl la",
                explanation:
                    "Jenèz 28 rakonte Jakòb te wè yon eskalye ki te kanpe sou tè a epi tèt li te rive nan syèl la.",
                reference: "Jenèz 28:12"
            },

            {
                question: "Ki non Jakòb te bay kote li te fè rèv la?",
                options: [
                    "Betèl",
                    "Jeriko",
                    "Sinayi",
                    "Ebron"
                ],
                answer: "Betèl",
                explanation:
                    "Jakòb te rele kote li te fè rèv la Betèl, ki te vin yon kote enpòtan nan istwa pèp Bondye a.",
                reference: "Jenèz 28:19"
            }
        ],

        generalQuestions: [
            {
                question: "Ki sa yon rèv ye?",
                options: [
                    "Yon eksperyans moun ka genyen pandan l ap dòmi",
                    "Yon kalite manje",
                    "Yon kalite kay",
                    "Yon rivyè"
                ],
                answer: "Yon eksperyans moun ka genyen pandan l ap dòmi",
                explanation:
                    "Rèv se imaj, lide oswa eksperyans yon moun ka viv pandan dòmi.",
                source: "Istwa Jakòb ak Eskalye a"
            }
        ]
    },


    {
        id: 7,
        title: "Jozèf ak Rad ki gen Anpil Koulè",
        category: "Pèsonaj Biblik",
        reference: "Jenèz 37",
        image: "images/jozef-rad-koule.jpg",
        audio: "audio/jozef-rad-koule.mp3",

        content: `
            <p>
                Jozèf te youn nan pitit gason Jakòb yo. Jakòb te renmen Jozèf
                anpil, e li te fè yon bèl rad espesyal pou li. Frè Jozèf yo
                te wè jan papa yo te renmen l, epi sa te fè yo vin jalou.
            </p>

            <p>
                Jozèf te fè kèk rèv kote li te wè bagay ki te sanble montre
                yon jou frè li yo t ap bese devan li. Lè li rakonte rèv sa yo
                bay frè li yo, yo te vin pi fache toujou.
            </p>

            <p>
                Yon jou, frè Jozèf yo te wè l ap vini lwen. Yo fè yon plan
                kont li. Yo retire rad espesyal li a epi yo lage l nan yon
                pi ki te vid. Apre sa, yo vann li bay kèk machann ki t ap
                vwayaje al peyi Lejip.
            </p>

            <p>
                Frè yo pran rad Jozèf la, yo sal li ak san yon bèt epi yo pote
                l bay Jakòb. Jakòb te panse yon bèt sovaj te touye pitit li.
                Pandan tout bagay sa yo, Jozèf te ale byen lwen nan peyi Lejip,
                kote yon nouvo chapit nan lavi li te pral kòmanse.
            </p>
        `,

        lesson:
            "Jalouzi ka fè moun pran move desizyon, men difikilte yon moun ap pase pa oblije detèmine tout avni li.",

        biblicalQuestions: [
            {
                question: "Ki sa Jakòb te bay Jozèf kòm yon siy espesyal lanmou li?",
                options: [
                    "Yon nepe",
                    "Yon rad espesyal ki gen anpil koulè",
                    "Yon chwal",
                    "Yon kay"
                ],
                answer: "Yon rad espesyal ki gen anpil koulè",
                explanation:
                    "Jenèz 37 rakonte Jakòb te fè yon rad espesyal pou Jozèf.",
                reference: "Jenèz 37:3"
            },

            {
                question: "Kisa frè Jozèf yo te fè avè l?",
                options: [
                    "Yo te voye l lekòl",
                    "Yo te vann li bay machann",
                    "Yo te fè l wa",
                    "Yo te mennen l Jerizalèm"
                ],
                answer: "Yo te vann li bay machann",
                explanation:
                    "Frè Jozèf yo te vann li bay machann ki t ap vwayaje pou ale Lejip.",
                reference: "Jenèz 37:28"
            }
        ],

        generalQuestions: [
            {
                question: "Ki sa jalouzi vle di?",
                options: [
                    "Lè yon moun anvi sa yon lòt moun genyen",
                    "Lè yon moun ap dòmi",
                    "Lè yon moun ap naje",
                    "Lè yon moun ap li"
                ],
                answer: "Lè yon moun anvi sa yon lòt moun genyen",
                explanation:
                    "Jalouzi ka rive lè yon moun santi li vle menm bagay oswa menm atansyon yon lòt moun resevwa.",
                source: "Istwa Jozèf ak Rad ki gen Anpil Koulè"
            }
        ]
    },


    {
        id: 8,
        title: "Moyiz ak Ti Bwa ki t ap Boule a",
        category: "Gwo Evènman",
        reference: "Egzòd 3:1–22",
        image: "images/moyiz-bwa-boule.jpg",
        audio: "audio/moyiz-bwa-boule.mp3",

        content: `
            <p>
                Moyiz t ap pran swen mouton Jetwo, bòpè li, nan dezè a.
                Yon jou, li rive bò mòn Orèb, mòn Bondye a.
            </p>

            <p>
                La, Moyiz wè yon bagay etranj. Li wè yon touf bwa ki t ap
                boule nan dife, men dife a pa t ap boule touf bwa a nèt.
                Moyiz di li pral pwoche pou l wè sa k ap pase.
            </p>

            <p>
                Lè Bondye wè Moyiz ap pwoche, li rele l nan mitan touf bwa a.
                Bondye di Moyiz pou li pa pwoche pi pre epi pou li retire
                sapat li paske kote li kanpe a se yon tè ki apa pou Bondye.
            </p>

            <p>
                Bondye di Moyiz li te wè soufrans pèp Izrayèl la nan peyi
                Lejip. Li voye Moyiz al pale ak Farawon pou mande l kite
                pèp Izrayèl la soti anba esklavaj.
            </p>

            <p>
                Moyiz te santi li pa t ase kapab pou misyon sa a. Men Bondye
                te pwomèt li t ap avèk li. Bondye te montre Moyiz misyon an
                pa t ap fèt sèlman avèk pwòp fòs li.
            </p>
        `,

        lesson:
            "Lè Bondye bay yon moun yon misyon, li ka bay moun nan fòs ak direksyon li bezwen pou l fè sa.",

        biblicalQuestions: [
            {
                question: "Kisa Moyiz te wè sou mòn Orèb?",
                options: [
                    "Yon touf bwa ki t ap boule san li pa t boule nèt",
                    "Yon gwo palè",
                    "Yon lame",
                    "Yon rivyè"
                ],
                answer: "Yon touf bwa ki t ap boule san li pa t boule nèt",
                explanation:
                    "Bondye te sèvi avèk touf bwa ki t ap boule a pou atire atansyon Moyiz.",
                reference: "Egzòd 3:2"
            },

            {
                question: "Ki misyon Bondye te bay Moyiz?",
                options: [
                    "Bati yon tanp",
                    "Mennen pèp Izrayèl la soti Lejip",
                    "Fè yon bato",
                    "Vin wa peyi Lejip"
                ],
                answer: "Mennen pèp Izrayèl la soti Lejip",
                explanation:
                    "Bondye te voye Moyiz al jwenn Farawon pou mande l kite pèp Izrayèl la ale.",
                reference: "Egzòd 3:10"
            }
        ],

        generalQuestions: [
            {
                question: "Ki sa dife bezwen pou li kontinye boule?",
                options: [
                    "Yon sous enèji oswa gaz ki ka boule",
                    "Glas sèlman",
                    "Fènwa sèlman",
                    "Wòch sèlman"
                ],
                answer: "Yon sous enèji oswa gaz ki ka boule",
                explanation:
                    "Dife bezwen materyèl ki ka boule ansanm ak oksijèn ak kondisyon apwopriye pou kenbe konbisyon an.",
                source: "Istwa Moyiz ak Ti Bwa ki t ap Boule a"
            }
        ]
    },


    {
        id: 9,
        title: "Moyiz Travèse Lanmè Wouj la",
        category: "Mirak",
        reference: "Egzòd 14",
        image: "images/moyiz-lanmè-wouj.jpg",
        audio: "audio/moyiz-lanmè-wouj.mp3",

        content: `
            <p>
                Apre pèp Izrayèl la te soti nan peyi Lejip, yo te kòmanse
                vwayaj yo pou ale nan peyi Bondye te pwomèt la. Yo rive bò
                Lanmè Wouj la, epi yo wè lame Farawon an t ap vini dèyè yo.
            </p>

            <p>
                Pèp la te pè anpil paske lanmè a te devan yo epi lame a te
                dèyè yo. Yo te mande Moyiz sa yo t ap fè. Moyiz ankouraje
                yo pou yo rete fèm epi gade delivrans Bondye t ap pote.
            </p>

            <p>
                Bondye te mande Moyiz lonje baton li sou lanmè a. Dapre
                istwa biblik la, dlo yo te separe, epi pèp Izrayèl la te
                mache sou tè sèk nan mitan lanmè a.
            </p>

            <p>
                Lè Izrayelit yo fin pase, dlo yo tounen sou plas yo.
                Pèp la te wè pouvwa Bondye epi yo te gen gwo respè pou li.
                Yo te mete konfyans yo nan Bondye ak nan Moyiz, sèvitè li a.
            </p>
        `,

        lesson:
            "Lè yon sitiyasyon sanble pa gen okenn solisyon, lafwa ankouraje nou pou nou rete fèm epi chèche direksyon Bondye.",

        biblicalQuestions: [
            {
                question: "Ki gwo obstak pèp Izrayèl la te jwenn devan yo?",
                options: [
                    "Lanmè Wouj la",
                    "Mòn Sinayi a",
                    "Vil Jeriko",
                    "Jaden Eden an"
                ],
                answer: "Lanmè Wouj la",
                explanation:
                    "Lanmè Wouj la te devan pèp Izrayèl la pandan lame Farawon an t ap pouswiv yo.",
                reference: "Egzòd 14:2"
            },

            {
                question: "Ki sa Moyiz te lonje sou lanmè a?",
                options: [
                    "Yon baton",
                    "Yon liv",
                    "Yon drapo",
                    "Yon nepe"
                ],
                answer: "Yon baton",
                explanation:
                    "Bondye te mande Moyiz lonje baton li sou lanmè a.",
                reference: "Egzòd 14:16"
            }
        ],

        generalQuestions: [
            {
                question: "Ki sa yo rele tè ki pa kouvri ak dlo?",
                options: [
                    "Tè sèk",
                    "Lanmè",
                    "Nwaj",
                    "Rivyè"
                ],
                answer: "Tè sèk",
                explanation:
                    "Tè sèk se pati tè ki pa anba dlo tankou tè sou kontinan oswa zile.",
                source: "Istwa Moyiz Travèse Lanmè Wouj la"
            }
        ]
    },


    {
        id: 10,
        title: "Dis Kòmandman yo",
        category: "Lalwa ak Sajès",
        reference: "Egzòd 19–20",
        image: "images/dis-kòmandman.jpg",
        audio: "audio/dis-kòmandman.mp3",

        content: `
            <p>
                Apre pèp Izrayèl la te soti Lejip, yo rive bò mòn Sinayi.
                Bondye te rele Moyiz monte sou mòn nan pou resevwa enstriksyon
                pou pèp la.
            </p>

            <p>
                Bondye te bay pèp Izrayèl la kòmandman ki te montre yo fason
                pou yo viv nan relasyon avèk Bondye epi nan relasyon youn ak
                lòt.
            </p>

            <p>
                Pami enstriksyon sa yo te gen kòmandman sou adorasyon Bondye,
                respè pou paran, lavi moun, maryaj, vòl, fo temwayaj ak
                anvi bagay lòt moun genyen.
            </p>

            <p>
                Kòmandman yo te vin yon pati enpòtan nan alyans Bondye te fè
                avèk pèp Izrayèl la. Yo te sèvi kòm prensip pou gide lavi
                kominote a.
            </p>
        `,

        lesson:
            "Lwa Bondye yo montre enpòtans pou moun respekte Bondye epi trete lòt moun avèk jistis ak respè.",

        biblicalQuestions: [
            {
                question: "Sou ki mòn Bondye te bay Moyiz kòmandman yo?",
                options: [
                    "Mòn Sinayi",
                    "Mòn Olivye",
                    "Mòn Kamèl",
                    "Mòn Ararat"
                ],
                answer: "Mòn Sinayi",
                explanation:
                    "Egzòd rakonte Moyiz te resevwa kòmandman yo nan mòn Sinayi.",
                reference: "Egzòd 19:18–20"
            },

            {
                question: "Ki moun ki te resevwa kòmandman yo pou pèp la?",
                options: [
                    "Moyiz",
                    "David",
                    "Jozye",
                    "Samyèl"
                ],
                answer: "Moyiz",
                explanation:
                    "Bondye te rele Moyiz monte sou mòn nan epi li te resevwa enstriksyon Bondye pou pèp la.",
                reference: "Egzòd 20"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa règ enpòtan nan yon kominote?",
                options: [
                    "Pou ede moun viv ansanm avèk lòd ak respè",
                    "Pou fè tout moun rete an silans",
                    "Pou anpeche moun aprann",
                    "Pou retire tout libète"
                ],
                answer: "Pou ede moun viv ansanm avèk lòd ak respè",
                explanation:
                    "Bon règ ka ede etabli limit, responsablite ak fason moun dwe trete youn lòt.",
                source: "Istwa Dis Kòmandman yo"
            }
        ]
    },


    {
        id: 11,
        title: "Jozye ak Vil Jeriko",
        category: "Gwo Evènman",
        reference: "Jozye 6:1–27",
        image: "images/jozye-jeriko.jpg",
        audio: "audio/jozye-jeriko.mp3",

        content: `
            <p>
                Apre Moyiz te fin mouri, Jozye te vin dirije pèp Izrayèl la.
                Bondye te bay Jozye yon misyon pou mennen pèp la antre nan
                peyi li te pwomèt yo a.
            </p>

            <p>
                Vil Jeriko te gen gwo miray ki te fè vil la difisil pou
                antre ladan l. Bondye te bay Jozye enstriksyon espesyal sou
                fason pèp la te dwe mache toutotou vil la.
            </p>

            <p>
                Pandan sis jou, pèp la te mache toutotou vil la yon fwa chak
                jou. Prèt yo te pote twonpèt, epi sòlda yo te mache dèyè yo.
            </p>

            <p>
                Sou setyèm jou a, yo te mache toutotou vil la sèt fwa.
                Lè prèt yo sonnen twonpèt yo epi pèp la rele, miray Jeriko
                yo te tonbe dapre istwa biblik la.
            </p>

            <p>
                Istwa a montre Jozye ak pèp la te suiv enstriksyon Bondye
                te bay yo menm lè metòd la te diferan ak sa yo ta ka imajine.
            </p>
        `,

        lesson:
            "Obeyisans mande konfyans, sitou lè direksyon Bondye bay la pa sanble ak fason nou ta fè bagay yo poukont nou.",

        biblicalQuestions: [
            {
                question: "Ki vil Jozye ak pèp Izrayèl la te mache toutotou li?",
                options: [
                    "Jeriko",
                    "Betleyèm",
                    "Nazaret",
                    "Eri"
                ],
                answer: "Jeriko",
                explanation:
                    "Jozye 6 rakonte pèp Izrayèl la te mache toutotou vil Jeriko dapre enstriksyon Bondye.",
                reference: "Jozye 6:2–4"
            },

            {
                question: "Konbyen fwa pèp la te mache toutotou Jeriko sou setyèm jou a?",
                options: [
                    "Yon fwa",
                    "Twa fwa",
                    "Sèt fwa",
                    "Douz fwa"
                ],
                answer: "Sèt fwa",
                explanation:
                    "Sou setyèm jou a, pèp la te mache toutotou vil la sèt fwa.",
                reference: "Jozye 6:15"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa yon miray ye?",
                options: [
                    "Yon estrikti ki ka separe oswa pwoteje yon espas",
                    "Yon kalite plant",
                    "Yon bèt",
                    "Yon rivyè"
                ],
                answer: "Yon estrikti ki ka separe oswa pwoteje yon espas",
                explanation:
                    "Miray se estrikti moun bati pou separe, soutni oswa pwoteje yon zòn.",
                source: "Istwa Jozye ak Vil Jeriko"
            }
        ]
    },


    {
        id: 12,
        title: "Samson ak Gwo Fòs li",
        category: "Pèsonaj Biblik",
        reference: "Jij 13–16",
        image: "images/samson.jpg",
        audio: "audio/samson.mp3",

        content: `
            <p>
                Samson te yon jij nan pèp Izrayèl la. Anvan li te fèt,
                yon zanj Bondye te anonse nesans li epi li te bay paran li
                enstriksyon espesyal sou fason yo te dwe leve l.
            </p>

            <p>
                Samson te resevwa yon fòs ekstraòdinè nan men Bondye.
                Nan plizyè epizòd nan lavi li, li te sèvi ak fòs sa a
                kont lènmi pèp Izrayèl la.
            </p>

            <p>
                Samson te fè anpil erè nan desizyon li te pran. Relasyon li
                avèk Dalila te vin tounen yon gwo danje pou li. Apre anpil
                presyon, Samson te fè konnen se cheve li ki te asosye ak
                siy li te resevwa kòm Nazireyen an.
            </p>

            <p>
                Lè lènmi li yo te pran l, yo te koupe cheve li epi yo te
                retire libète li. Men pita, cheve li te kòmanse grandi ankò.
                Nan dènye moman li yo, Samson te priye Bondye pou Bondye
                ba li fòs ankò.
            </p>
        `,

        lesson:
            "Fòs ak kapasite se kado ki mande responsablite; desizyon nou pran kapab pote bon oswa move konsekans.",

        biblicalQuestions: [
            {
                question: "Ki sa ki te asosye ak siy espesyal Samson te resevwa kòm Nazireyen?",
                options: [
                    "Cheve li",
                    "Soulye li",
                    "Bag li",
                    "Rad li"
                ],
                answer: "Cheve li",
                explanation:
                    "Istwa Samson an mete cheve li an relasyon ak angajman Nazireyen li.",
                reference: "Jij 13:5; 16:17"
            },

            {
                question: "Ki moun ki te chèche konnen sekrè fòs Samson?",
                options: [
                    "Dalila",
                    "Rit",
                    "Estè",
                    "Debora"
                ],
                answer: "Dalila",
                explanation:
                    "Dalila te ensiste pou Samson di li sekrè fòs li.",
                reference: "Jij 16:6–17"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa yon moun ki gen gwo kapasite bezwen responsablite?",
                options: [
                    "Paske kapasite yo ka gen gwo konsekans sou lòt moun",
                    "Paske kapasite pa itil",
                    "Paske tout moun dwe fè menm bagay",
                    "Paske fòs pa janm bezwen kontwòl"
                ],
                answer: "Paske kapasite yo ka gen gwo konsekans sou lòt moun",
                explanation:
                    "Lè yon moun gen gwo kapasite, fason li sèvi avèk kapasite sa a ka afekte tèt li ak lòt moun.",
                source: "Istwa Samson"
            }
        ]
    },


    {
        id: 13,
        title: "Rit ak Fidelite li",
        category: "Pèsonaj Biblik",
        reference: "Rit 1–4",
        image: "images/rit.jpg",
        audio: "audio/rit.mp3",

        content: `
            <p>
                Rit te yon fanm ki soti nan peyi Moab. Li te marye ak yon
                gason ki soti nan fanmi Naomi. Apre mari Rit la te mouri,
                Naomi te deside retounen nan peyi li.
            </p>

            <p>
                Naomi te ankouraje Rit pou l rete nan peyi Moab epi chèche
                yon nouvo lavi. Men Rit te chwazi rete avèk Naomi. Li te
                deside ale avèk li nan Betleyèm.
            </p>

            <p>
                Lè yo rive Betleyèm, Rit te kòmanse ranmase grenn ki te rete
                dèyè moun k ap rekòlte yo. Se konsa li te rive nan jaden yon
                nonm ki te rele Bowaz.
            </p>

            <p>
                Bowaz te remake bon konpòtman Rit ak fason li te pran swen
                Naomi. Istwa a kontinye avèk yon relasyon fanmi ak yon
                maryaj ki te fè Rit antre nan liy fanmi wa David la.
            </p>
        `,

        lesson:
            "Fidelite, imilite ak lanmou pou fanmi kapab fè yon gwo diferans menm nan moman lavi a difisil.",

        biblicalQuestions: [
            {
                question: "Ki kote Rit te soti?",
                options: [
                    "Moab",
                    "Lejip",
                    "Masedwàn",
                    "Peyi Lejip"
                ],
                answer: "Moab",
                explanation:
                    "Rit te yon fanm Moabit ki te chwazi ale avèk Naomi nan Betleyèm.",
                reference: "Rit 1:4, 16"
            },

            {
                question: "Ki moun Rit te pran swen apre lanmò mari li?",
                options: [
                    "Naomi",
                    "Sara",
                    "Debora",
                    "Miryam"
                ],
                answer: "Naomi",
                explanation:
                    "Rit te chwazi rete avèk bèlmè li Naomi epi ale avè l Betleyèm.",
                reference: "Rit 1:16–17"
            }
        ],

        generalQuestions: [
            {
                question: "Ki sa rekòt vle di nan agrikilti?",
                options: [
                    "Pwodwi yo ranmase apre yo fin grandi",
                    "Lè yo plante grenn sèlman",
                    "Lè yo wouze kay",
                    "Lè yo bati yon miray"
                ],
                answer: "Pwodwi yo ranmase apre yo fin grandi",
                explanation:
                    "Rekòt se pwodwi agrikòl yo ranmase lè yo rive nan moman pou yo ranmase yo.",
                source: "Istwa Rit"
            }
        ]
    },


    {
        id: 14,
        title: "David ak Golyat",
        category: "Kouraj ak Lafwa",
        reference: "1 Samyèl 17",
        image: "images/david-golyat.jpg",
        audio: "audio/david-golyat.mp3",

        content: `
            <p>
                Pèp Izrayèl la t ap fè fas ak lame Filisten yo. Pami Filisten
                yo te gen yon gwo sòlda ki te rele Golyat. Li te soti chak jou
                devan lame a pou l defi Izrayelit yo.
            </p>

            <p>
                David te yon jèn gadyen mouton ki te vin pote manje pou frè li
                yo ki te nan lame a. Lè li tande defi Golyat yo, li pa t konprann
                poukisa pèp la te pè anpil.
            </p>

            <p>
                David te di wa Sayil li te pare pou al fè fas ak Golyat.
                Sayil te ba li zam, men David pa t abitye ak zam sa yo.
                Li chwazi pran baton li, senk wòch lis nan yon ti sak, epi
                fistibal li.
            </p>

            <p>
                David te pwoche bò Golyat avèk konfyans li nan Bondye. Li mete
                yon wòch nan fistibal li epi li voye l. Wòch la frape Golyat,
                epi jeyan an tonbe atè.
            </p>

            <p>
                Viktwa David la te fè pèp Izrayèl la pran kouraj. Istwa a
                montre David pa t konte sèlman sou aparans oswa fòs fizik,
                men sou konfyans li nan Bondye.
            </p>
        `,

        lesson:
            "Kouraj pa toujou vle di nou pa pè; li ka vle di nou fè sa ki dwat pandan nou mete konfyans nou nan Bondye.",

        biblicalQuestions: [
            {
                question: "Ki non sòlda Filisten ki te defi Izrayèl la?",
                options: [
                    "Golyat",
                    "Sayil",
                    "Abner",
                    "Natan"
                ],
                answer: "Golyat",
                explanation:
                    "1 Samyèl 17 rakonte Golyat te sòlda Filisten ki t ap defi lame Izrayèl la.",
                reference: "1 Samyèl 17:4"
            },

            {
                question: "Ki zouti David te itilize pou voye wòch la?",
                options: [
                    "Yon fistibal",
                    "Yon banza",
                    "Yon frenn",
                    "Yon nepe"
                ],
                answer: "Yon fistibal",
                explanation:
                    "David te pran fistibal li epi li te voye yon wòch kont Golyat.",
                reference: "1 Samyèl 17:40, 49"
            }
        ],

        generalQuestions: [
            {
                question: "Ki sa yon fistibal ye?",
                options: [
                    "Yon zouti ki sèvi pou voye yon ti wòch",
                    "Yon kalite soulye",
                    "Yon enstriman mizik",
                    "Yon kalite bato"
                ],
                answer: "Yon zouti ki sèvi pou voye yon ti wòch",
                explanation:
                    "Fistibal se yon zouti senp ki sèvi avèk yon ti moso materyèl fleksib pou voye yon objè.",
                source: "Istwa David ak Golyat"
            }
        ]
    },


    {
        id: 15,
        title: "Salomon Mande Sajès",
        category: "Lalwa ak Sajès",
        reference: "1 Wa 3:3–28",
        image: "images/salomon-sajes.jpg",
        audio: "audio/salomon-sajes.mp3",

        content: `
            <p>
                Apre David te fin mouri, Salomon, pitit gason li, te vin wa.
                Salomon te renmen Bondye epi li te vle dirije pèp la avèk
                bon konprann.
            </p>

            <p>
                Yon nuit, Bondye parèt devan Salomon nan yon rèv epi li di
                l pou l mande sa li vle. Salomon pa t mande richès, lavi long
                oswa viktwa sou lènmi li yo.
            </p>

            <p>
                Salomon mande Bondye yon kè ki gen bon konprann pou l kapab
                jije pèp la byen epi konnen diferans ant sa ki byen ak sa ki
                mal.
            </p>

            <p>
                Bondye te kontan ak demann Salomon an. Li te pwomèt li sajès
                epi li te ba li lòt benediksyon tou.
            </p>

            <p>
                Apre sa, de fanm te vin devan Salomon ak yon pwoblèm sou yon
                timoun. Chak fanm te di timoun nan se pitit li. Salomon te
                sèvi avèk sajès li pou revele kiyès ki te vrèman gen lanmou
                pou timoun nan.
            </p>
        `,

        lesson:
            "Vrè sajès se pa sèlman konnen anpil bagay; se konnen kijan pou sèvi ak konesans avèk jistis ak bon jijman.",

        biblicalQuestions: [
            {
                question: "Kisa Salomon te mande Bondye?",
                options: [
                    "Yon kè ki gen sajès",
                    "Anpil lò",
                    "Yon gwo lame",
                    "Yon palè"
                ],
                answer: "Yon kè ki gen sajès",
                explanation:
                    "Salomon te mande sajès pou l kapab jije pèp Bondye a byen.",
                reference: "1 Wa 3:9"
            },

            {
                question: "Ki kalite moun Salomon te vle vin kòm wa?",
                options: [
                    "Yon wa ki gen bon jijman",
                    "Yon wa ki rich sèlman",
                    "Yon wa ki toujou fè lagè",
                    "Yon wa ki pa koute pèsonn"
                ],
                answer: "Yon wa ki gen bon jijman",
                explanation:
                    "Demann Salomon montre li te vle sèvi pèp la avèk sajès ak bon jijman.",
                reference: "1 Wa 3:9–12"
            }
        ],

        generalQuestions: [
            {
                question: "Ki sa sajès vle di?",
                options: [
                    "Kapasite pou sèvi ak konesans avèk bon jijman",
                    "Kapasite pou pale fò",
                    "Kapasite pou kouri vit",
                    "Kapasite pou posede anpil bagay"
                ],
                answer: "Kapasite pou sèvi ak konesans avèk bon jijman",
                explanation:
                    "Sajès gen rapò ak kapasite pou konprann sitiyasyon epi pran bon desizyon.",
                source: "Istwa Salomon Mande Sajès"
            }
        ]
    },


    {
        id: 16,
        title: "Eliya ak Pwofèt Baal yo",
        category: "Pwofèt ak Mirak",
        reference: "1 Wa 18:17–39",
        image: "images/eliya-baal.jpg",
        audio: "audio/eliya-baal.mp3",

        content: `
            <p>
                Nan tan wa Akab la, anpil moun nan peyi Izrayèl te kòmanse
                adore Baal. Pwofèt Eliya te kanpe devan pèp la pou raple yo
                yo pa t dwe sèvi ak de lide ansanm.
            </p>

            <p>
                Eliya pwopoze yon demonstrasyon sou mòn Kamèl. Li mande
                pwofèt Baal yo prepare yon sakrifis epi rele bondye yo a.
                Yo rele depi maten jouk midi, men pa t gen repons.
            </p>

            <p>
                Apre sa, Eliya repare lotèl Bondye a. Li mete sakrifis la
                sou lotèl la epi li fè yo vide dlo sou li plizyè fwa, konsa
                tout bagay vin byen mouye.
            </p>

            <p>
                Eliya priye Bondye. Dapre istwa a, dife soti nan syèl la
                epi li boule sakrifis la, bwa a, wòch yo ak dlo ki te nan
                twou lotèl la.
            </p>

            <p>
                Lè pèp la wè sa, yo tonbe fas atè epi yo rekonèt Bondye kòm
                vrè Bondye a.
            </p>
        `,

        lesson:
            "Lafwa mande pou moun konnen kiyès yo chwazi sèvi epi rete fidèl ak Bondye menm lè anpil lòt moun pran yon lòt direksyon.",

        biblicalQuestions: [
            {
                question: "Sou ki mòn Eliya te fè fas ak pwofèt Baal yo?",
                options: [
                    "Mòn Kamèl",
                    "Mòn Sinayi",
                    "Mòn Olivye",
                    "Mòn Ararat"
                ],
                answer: "Mòn Kamèl",
                explanation:
                    "1 Wa 18 rakonte Eliya te fè demonstrasyon an sou mòn Kamèl.",
                reference: "1 Wa 18:19–20"
            },

            {
                question: "Kisa ki te desann sou sakrifis Eliya a dapre istwa a?",
                options: [
                    "Dife",
                    "Lapli",
                    "Nèj",
                    "Van sèlman"
                ],
                answer: "Dife",
                explanation:
                    "Apre lapriyè Eliya, dife te desann epi boule sakrifis la.",
                reference: "1 Wa 18:38"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa dlo ka fè yon dife difisil pou kontinye boule?",
                options: [
                    "Li retire chalè epi li mouye materyèl la",
                    "Li fè bwa vin pi sèk",
                    "Li ajoute gaz nan dife a",
                    "Li fè dife a vin pi klere"
                ],
                answer: "Li retire chalè epi li mouye materyèl la",
                explanation:
                    "Dlo ka refwadi materyèl k ap boule epi anpeche kondisyon ki nesesè pou konbisyon an kontinye.",
                source: "Istwa Eliya ak Pwofèt Baal yo"
            }
        ]
    },


    {
        id: 17,
        title: "Danyèl nan Twou Lyon yo",
        category: "Kouraj ak Lafwa",
        reference: "Danyèl 6",
        image: "images/danyel-tou-lyon.jpg",
        audio: "audio/danyel-tou-lyon.mp3",

        content: `
            <p>
                Danyèl te sèvi kòm yon gwo responsab nan wayòm peyi Babilòn
                lan ak nan tan wa Dariyis. Li te gen yon bon repitasyon paske
                li te travay avèk fidelite.
            </p>

            <p>
                Gen kèk responsab ki te vin jalou pou Danyèl. Yo t ap chèche
                jwenn yon fot nan travay li, men yo pa t jwenn okenn bagay
                yo te kapab sèvi kont li.
            </p>

            <p>
                Yo te konnen Danyèl te konn priye Bondye regilyèman. Se konsa
                yo fè wa a siyen yon lwa ki di pandan trant jou pèsonn pa
                dwe priye okenn lòt moun oswa okenn lòt bondye pase wa a.
            </p>

            <p>
                Danyèl te konnen lwa a te siyen, men li te kontinye priye
                Bondye jan li te konn fè anvan. Lè yo akize l, wa Dariyis
                te oblije bay lòd pou yo mete Danyèl nan twou lyon yo.
            </p>

            <p>
                Wa a te enkyete anpil pou Danyèl. Nan denmen maten, li kouri
                al wè si Danyèl te toujou vivan. Danyèl reponn li e li di
                Bondye li te sèvi a te voye zanj li pou fèmen bouch lyon yo.
            </p>
        `,

        lesson:
            "Fidelite vle di rete fidèl ak prensip nou menm lè sa mande kouraj nan yon sitiyasyon difisil.",

        biblicalQuestions: [
            {
                question: "Poukisa yo te mete Danyèl nan twou lyon yo?",
                options: [
                    "Paske li te kontinye priye Bondye",
                    "Paske li te vòlè",
                    "Paske li te kite peyi a",
                    "Paske li te refize travay"
                ],
                answer: "Paske li te kontinye priye Bondye",
                explanation:
                    "Lènmi Danyèl yo te sèvi ak fidelite li nan lapriyè kòm rezon pou yo akize l devan wa a.",
                reference: "Danyèl 6:10–16"
            },

            {
                question: "Ki sa Danyèl te di ki te rive lyon yo?",
                options: [
                    "Yon zanj te fèmen bouch yo",
                    "Yo te kite twou a",
                    "Yo te dòmi tout jounen",
                    "Yo te ale nan forè"
                ],
                answer: "Yon zanj te fèmen bouch yo",
                explanation:
                    "Danyèl te di Bondye te voye zanj li epi li te fèmen bouch lyon yo.",
                reference: "Danyèl 6:22"
            }
        ],

        generalQuestions: [
            {
                question: "Ki kalite bèt lyon ye?",
                options: [
                    "Yon mamifè",
                    "Yon pwason",
                    "Yon zwazo",
                    "Yon ensèk"
                ],
                answer: "Yon mamifè",
                explanation:
                    "Lyon se mamifè paske yo fèt vivan epi manman yo bay pitit yo lèt.",
                source: "Istwa Danyèl nan Twou Lyon yo"
            }
        ]
    },


    {
        id: 18,
        title: "Jonas ak Gwo Pwason an",
        category: "Pwofèt ak Mirak",
        reference: "Jonas 1–4",
        image: "images/jonas-gwo-pwason.jpg",
        audio: "audio/jonas-gwo-pwason.mp3",

        content: `
            <p>
                Bondye te voye pwofèt Jonas al lavil Niniv pou l anonse mesaj
                Bondye a. Men Jonas pa t vle ale. Li pran yon bato ki t ap ale
                nan direksyon Tasis pou l kouri lwen misyon Bondye te ba li a.
            </p>

            <p>
                Pandan bato a sou lanmè a, yon gwo tanpèt leve. Maren yo te
                pè anpil paske bato a te prèske kraze. Yo aprann Jonas t ap
                kouri lwen Bondye.
            </p>

            <p>
                Jonas di maren yo pou yo jete l nan lanmè. Apre yo fin fè sa,
                lanmè a vin kalm. Dapre istwa a, Bondye te prepare yon gwo
                pwason pou vale Jonas.
            </p>

            <p>
                Jonas pase twa jou ak twa nwit nan vant gwo pwason an. Li
                priye Bondye epi li rekonèt li bezwen retounen nan chemen
                Bondye te ba li a.
            </p>

            <p>
                Bondye fè gwo pwason an voye Jonas sou tè sèk. Apre sa,
                Jonas ale Niniv epi li anonse mesaj Bondye a. Moun Niniv yo
                tande mesaj la epi yo chanje fason yo t ap viv.
            </p>
        `,

        lesson:
            "Bondye ka bay moun yon lòt chans pou yo retounen sou bon chemen an epi akonpli responsablite yo.",

        biblicalQuestions: [
            {
                question: "Ki vil Bondye te voye Jonas al preche?",
                options: [
                    "Niniv",
                    "Jeriko",
                    "Betleyèm",
                    "Nazaret"
                ],
                answer: "Niniv",
                explanation:
                    "Bondye te voye Jonas al Niniv pou l anonse mesaj li.",
                reference: "Jonas 1:2"
            },

            {
                question: "Konbyen tan Jonas te pase nan vant gwo pwason an dapre istwa a?",
                options: [
                    "Yon jou",
                    "Twa jou ak twa nwit",
                    "Sèt jou",
                    "Douz jou"
                ],
                answer: "Twa jou ak twa nwit",
                explanation:
                    "Jonas 1:17 di Jonas te nan vant gwo pwason an pandan twa jou ak twa nwit.",
                reference: "Jonas 1:17"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa yon tanpèt ye?",
                options: [
                    "Yon move kondisyon metewolojik ki ka gen gwo van oswa gwo lapli",
                    "Yon kalite bato",
                    "Yon kalite pwason",
                    "Yon mòn"
                ],
                answer: "Yon move kondisyon metewolojik ki ka gen gwo van oswa gwo lapli",
                explanation:
                    "Tanpèt se yon evènman metewolojik ki ka gen van fò, lapli, loraj oswa lòt kondisyon difisil.",
                source: "Istwa Jonas ak Gwo Pwason an"
            }
        ]
    },


    {
        id: 19,
        title: "Estè Sove Pèp li",
        category: "Pèsonaj Biblik",
        reference: "Estè 1–10",
        image: "images/ester.jpg",
        audio: "audio/ester.mp3",

        content: `
            <p>
                Estè te yon jèn fi jwif ki t ap viv nan peyi Pès. Li te
                leve anba swen kouzen li Mòdekayi. Apre yon tan, wa Asyeris
                te chwazi Estè kòm larenn.
            </p>

            <p>
                Estè te kenbe orijin li sekrè pandan yon tan, jan Mòdekayi
                te konseye li. Men yon responsab ki te rele Aman te devlope
                yon plan kont pèp jwif la.
            </p>

            <p>
                Mòdekayi voye mesaj bay Estè pou l fè l konnen danje pèp la
                t ap fè fas. Li ankouraje Estè reflechi sou pozisyon li kòm
                larenn epi sèvi ak opòtinite li genyen pou ede pèp li.
            </p>

            <p>
                Estè te mande pèp la fè jèn pou li. Apre sa, li antre devan
                wa a menm si sa te kapab mete lavi li an danje. Li envite
                wa a ak Aman nan yon fèt espesyal epi li revele plan Aman an.
            </p>

            <p>
                Wa a aprann verite a epi plan Aman an echwe. Pèp jwif la
                jwenn pwoteksyon. Istwa Estè a vin tounen baz pou fèt
                jwif yo rele Purim.
            </p>
        `,

        lesson:
            "Kouraj ak sajès ka pèmèt yon moun sèvi lòt moun lè li jwenn yon pozisyon oswa yon opòtinite pou fè sa ki dwat.",

        biblicalQuestions: [
            {
                question: "Ki relasyon Mòdekayi te genyen ak Estè?",
                options: [
                    "Li te kouzen li epi li te pran swen li",
                    "Li te frè wa a",
                    "Li te pwofèt li",
                    "Li te sòlda li"
                ],
                answer: "Li te kouzen li epi li te pran swen li",
                explanation:
                    "Mòdekayi te fanmi Estè e li te pran swen li apre li te vin òfelen.",
                reference: "Estè 2:7"
            },

            {
                question: "Ki non moun ki te prepare plan kont pèp jwif la?",
                options: [
                    "Aman",
                    "Mòdekayi",
                    "Dariyis",
                    "Neyemya"
                ],
                answer: "Aman",
                explanation:
                    "Aman te devlope yon plan ki te mete lavi pèp jwif la an danje.",
                reference: "Estè 3:5–6"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa yon larenn ye?",
                options: [
                    "Yon fanm ki gen pozisyon larenn nan yon wayòm",
                    "Yon kalite sòlda",
                    "Yon machann",
                    "Yon pwofèt"
                ],
                answer: "Yon fanm ki gen pozisyon larenn nan yon wayòm",
                explanation:
                    "Larenn se tit yo bay yon fanm ki se monak oswa ki marye ak yon wa, selon sistèm wayòm nan.",
                source: "Istwa Estè Sove Pèp li"
            }
        ]
    },


    {
        id: 20,
        title: "Neyemya Rebati Miray Jerizalèm",
        category: "Gwo Evènman",
        reference: "Neyemya 1–6",
        image: "images/neymya-miray.jpg",
        audio: "audio/neymya-miray.mp3",

        content: `
            <p>
                Neyemya te yon nonm ki t ap sèvi kòm gadyen koup wa Pès la.
                Yon jou, li resevwa nouvèl sou Jerizalèm. Yo di li miray vil la
                te kraze epi pòtay li yo te boule.
            </p>

            <p>
                Lè Neyemya tande nouvèl sa a, li chita, li kriye epi li priye
                Bondye. Li mande Bondye padon pou pèp la epi li mande l ouvri
                yon pòt pou li kapab ede Jerizalèm.
            </p>

            <p>
                Neyemya jwenn pèmisyon wa a pou l ale Jerizalèm. Lè li rive,
                li enspekte miray yo an sekrè. Apre sa, li pale ak pèp la epi
                li ankouraje yo leve pou rebati miray vil la.
            </p>

            <p>
                Travay la pa t fasil. Gen moun ki t ap pase pèp la nan rizib
                epi ki t ap eseye dekouraje yo. Neyemya ak pèp la kontinye
                travay pandan yo rete vijilan.
            </p>

            <p>
                Malgre opozisyon ak difikilte, pèp la fini travay la nan yon
                tan ki kout. Miray Jerizalèm nan te rebati, epi pèp la te
                wè sa kòm yon gwo siy benediksyon ak èd Bondye.
            </p>
        `,

        lesson:
            "Lè yon gwo travay divize an ti responsablite epi moun yo travay ansanm avèk pèseverans, yo kapab fè anpil pwogrè malgre opozisyon.",

        biblicalQuestions: [
            {
                question: "Ki nouvèl Neyemya te resevwa sou Jerizalèm?",
                options: [
                    "Miray yo te kraze epi pòtay yo te boule",
                    "Vil la te vin pi gwo",
                    "Tanp lan te deplase",
                    "Wa a te kite vil la"
                ],
                answer: "Miray yo te kraze epi pòtay yo te boule",
                explanation:
                    "Neyemya te aprann sitiyasyon difisil Jerizalèm te ladan l apre destriksyon vil la.",
                reference: "Neyemya 1:3"
            },

            {
                question: "Kisa Neyemya te ankouraje pèp la fè?",
                options: [
                    "Rebati miray Jerizalèm",
                    "Kite Jerizalèm",
                    "Bati yon bato",
                    "Ale nan peyi Lejip"
                ],
                answer: "Rebati miray Jerizalèm",
                explanation:
                    "Neyemya te òganize pèp la pou yo rebati miray vil la.",
                reference: "Neyemya 2:17–18"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa yon miray ka itil pou yon vil?",
                options: [
                    "Li ka bay pwoteksyon ak defini limit vil la",
                    "Li fè lapli tonbe",
                    "Li fè plant grandi",
                    "Li fè rivyè koule"
                ],
                answer: "Li ka bay pwoteksyon ak defini limit vil la",
                explanation:
                    "Nan anpil sosyete istorik, miray vil yo te sèvi kòm pwoteksyon epi yo te defini limit zòn ki te andedan vil la.",
                source: "Istwa Neyemya Rebati Miray Jerizalèm"
            }
        ]
    },







{
        id: 21,
        title: "Nesans Moyiz",
        category: "Pèsonaj Biblik",
        reference: "Egzòd 2:1–10",
        image: "images/nesans-moyiz.jpg",
        audio: "audio/nesans-moyiz.mp3",

        content: `
            <p>
                Nan tan Moyiz la, pèp Izrayèl la t ap viv nan peyi Lejip.
                Farawon te bay lòd pou yo touye tibebe gason Izrayelit yo.
                Manman Moyiz te kache l pandan twa mwa pou pwoteje lavi li.
            </p>

            <p>
                Lè li pa t kapab kache l ankò, li pran yon panyen, li pase
                l ak goudwon pou dlo pa antre ladan l, epi li mete tibebe a
                nan mitan wozo bò larivyè Nil la.
            </p>

            <p>
                Sè Moyiz la te rete lwen pou l gade sa k t ap pase.
                Pitit fi Farawon an te desann bò larivyè a, li wè panyen an
                epi li dekouvri tibebe a ladan l.
            </p>

            <p>
                Pitit fi Farawon an te pran Moyiz kòm pwòp pitit li.
                Se konsa Moyiz te grandi nan fanmi wa peyi Lejip la.
            </p>
        `,

        lesson:
            "Bondye ka sèvi ak moun ak sitiyasyon difisil pou pwoteje yon lavi epi prepare yon moun pou yon misyon.",

        biblicalQuestions: [
            {
                question: "Ki kote manman Moyiz te mete l?",
                options: [
                    "Nan yon panyen bò larivyè Nil la",
                    "Nan yon kay",
                    "Nan yon tanp",
                    "Nan yon jaden"
                ],
                answer: "Nan yon panyen bò larivyè Nil la",
                explanation:
                    "Manman Moyiz te mete l nan yon panyen epi li te mete panyen an nan mitan wozo bò larivyè Nil la.",
                reference: "Egzòd 2:3"
            },

            {
                question: "Ki moun ki te jwenn Moyiz nan panyen an?",
                options: [
                    "Pitit fi Farawon an",
                    "Sara",
                    "Rit",
                    "Debora"
                ],
                answer: "Pitit fi Farawon an",
                explanation:
                    "Pitit fi Farawon an te jwenn panyen an pandan li t ap benyen nan larivyè a.",
                reference: "Egzòd 2:5–6"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa yon panyen ki byen fèt ka itil sou dlo?",
                options: [
                    "Li ka flote si li fèt pou sa",
                    "Li toujou koule",
                    "Li tounen yon bato otomatikman",
                    "Li fè dlo disparèt"
                ],
                answer: "Li ka flote si li fèt pou sa",
                explanation:
                    "Yon resipyan ki fèt pou flote ka rete sou sifas dlo a si li gen bon fòm ak materyèl apwopriye.",
                source: "Istwa Nesans Moyiz"
            }
        ]
    },


    {
        id: 22,
        title: "Moyiz ak Arawon Devan Farawon",
        category: "Gwo Evènman",
        reference: "Egzòd 5–7",
        image: "images/moyiz-arawon-farawon.jpg",
        audio: "audio/moyiz-arawon-farawon.mp3",

        content: `
            <p>
                Bondye te voye Moyiz ak Arawon al jwenn Farawon pou mande
                l kite pèp Izrayèl la ale. Yo te pote mesaj Bondye te ba yo a.
            </p>

            <p>
                Farawon te refize kite pèp la ale. Li te menm fè travay
                Izrayelit yo vin pi difisil.
            </p>

            <p>
                Moyiz te santi sitiyasyon an te vin pi difisil, men Bondye
                te kontinye ankouraje li pou l fè misyon an.
            </p>

            <p>
                Arawon te ede Moyiz pale devan Farawon. Yo te kontinye
                prezante mesaj Bondye a pandan Bondye t ap prepare pwochen
                etap liberasyon pèp Izrayèl la.
            </p>
        `,

        lesson:
            "Lè yon travay difisil vin pi konplike, pèseverans ak konfyans ka ede yon moun kontinye fè sa li gen pou fè.",

        biblicalQuestions: [
            {
                question: "Ki moun Moyiz ak Arawon te ale jwenn?",
                options: [
                    "Farawon",
                    "David",
                    "Sayil",
                    "Jozye"
                ],
                answer: "Farawon",
                explanation:
                    "Moyiz ak Arawon te ale devan Farawon pou mande l kite pèp Izrayèl la soti.",
                reference: "Egzòd 5:1"
            },

            {
                question: "Ki moun ki te ede Moyiz pale?",
                options: [
                    "Arawon",
                    "Jozye",
                    "Neyemya",
                    "Samyèl"
                ],
                answer: "Arawon",
                explanation:
                    "Arawon te sèvi kòm pòtpawòl Moyiz devan Farawon ak pèp la.",
                reference: "Egzòd 4:14–16"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa pèseverans vle di?",
                options: [
                    "Kontinye fè efò malgre difikilte",
                    "Abandone touswit",
                    "Pa janm aprann",
                    "Evite tout travay"
                ],
                answer: "Kontinye fè efò malgre difikilte",
                explanation:
                    "Pèseverans se kapasite pou kontinye fè efò menm lè gen obstak.",
                source: "Istwa Moyiz ak Arawon Devan Farawon"
            }
        ]
    },


    {
        id: 23,
        title: "Man Bondye Bay nan Dezè a",
        category: "Mirak",
        reference: "Egzòd 16:1–36",
        image: "images/man-deze.jpg",
        audio: "audio/man-deze.mp3",

        content: `
            <p>
                Apre pèp Izrayèl la te kite peyi Lejip, yo te vwayaje nan
                dezè a. Apre kèk tan, yo te kòmanse plenyen paske yo te
                bezwen manje.
            </p>

            <p>
                Bondye te di Moyiz li t ap bay pèp la manje. Nan maten,
                lè lawouze a te fin disparèt, pèp la te wè ti bagay sou tè a.
            </p>

            <p>
                Moyiz te eksplike yo se manje Bondye te bay yo. Pèp la
                rele manje sa a man.
            </p>

            <p>
                Chak jou, moun yo te ranmase kantite yo te bezwen. Bondye
                te sèvi ak sa pou pran swen pèp la pandan vwayaj yo nan dezè a.
            </p>
        `,

        lesson:
            "Bondye te montre pèp Izrayèl la li kapab pran swen bezwen yo pandan yon vwayaj ki te difisil.",

        biblicalQuestions: [
            {
                question: "Ki non manje Bondye te bay pèp Izrayèl la nan dezè a?",
                options: [
                    "Man",
                    "Lwil",
                    "Siwo myèl",
                    "Pen ble"
                ],
                answer: "Man",
                explanation:
                    "Pèp Izrayèl la te rele manje Bondye te bay yo nan dezè a man.",
                reference: "Egzòd 16:15"
            },

            {
                question: "Ki kote pèp la te ye lè Bondye te bay yo man?",
                options: [
                    "Nan dezè a",
                    "Nan Jerizalèm",
                    "Nan Betleyèm",
                    "Nan Jeriko"
                ],
                answer: "Nan dezè a",
                explanation:
                    "Man an te bay pèp Izrayèl la pandan yo t ap vwayaje nan dezè a.",
                reference: "Egzòd 16:1–4"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa manje enpòtan pou kò moun?",
                options: [
                    "Li bay kò a enèji ak eleman nitritif",
                    "Li fè moun pa bezwen dòmi",
                    "Li ranplase dlo nèt",
                    "Li fè moun pa bezwen respire"
                ],
                answer: "Li bay kò a enèji ak eleman nitritif",
                explanation:
                    "Kò moun bezwen manje pou jwenn enèji ak eleman nitritif ki nesesè pou fonksyone.",
                source: "Istwa Man Bondye Bay nan Dezè a"
            }
        ]
    },


    {
        id: 24,
        title: "Dlo Soti nan Wòch la",
        category: "Mirak",
        reference: "Egzòd 17:1–7",
        image: "images/dlo-woch.jpg",
        audio: "audio/dlo-wòch.mp3",

        content: `
            <p>
                Pèp Izrayèl la te kontinye vwayaj li nan dezè a. Lè yo rive
                Refidim, yo pa t jwenn dlo pou yo bwè.
            </p>

            <p>
                Pèp la te plenyen devan Moyiz paske yo te swaf. Moyiz te
                mande Bondye sa pou li fè.
            </p>

            <p>
                Bondye te mande Moyiz pran baton li te sèvi avè l la epi
                frape wòch ki te nan Orèb la.
            </p>

            <p>
                Dapre istwa a, lè Moyiz fè sa, dlo soti nan wòch la pou pèp
                la te kapab bwè. Yo te jwenn dlo pandan yo t ap vwayaje nan
                dezè a.
            </p>
        `,

        lesson:
            "Nan moman bezwen, moun ka chèche Bondye pou direksyon epi sonje li pa nesesè pou pèdi espwa.",

        biblicalQuestions: [
            {
                question: "Ki sa pèp Izrayèl la te bezwen nan Refidim?",
                options: [
                    "Dlo",
                    "Lò",
                    "Rad",
                    "Bato"
                ],
                answer: "Dlo",
                explanation:
                    "Pèp la te rive nan yon kote kote pa t gen dlo pou yo bwè.",
                reference: "Egzòd 17:1"
            },

            {
                question: "Ki sa Moyiz te frape dapre enstriksyon Bondye?",
                options: [
                    "Yon wòch",
                    "Yon pye bwa",
                    "Yon pòt",
                    "Yon miray"
                ],
                answer: "Yon wòch",
                explanation:
                    "Bondye te mande Moyiz frape wòch la, epi dlo soti ladan l dapre istwa a.",
                reference: "Egzòd 17:6"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa dlo enpòtan pou kò moun?",
                options: [
                    "Kò a bezwen dlo pou fonksyone",
                    "Dlo fè moun pa bezwen manje",
                    "Dlo ranplase lè",
                    "Dlo fè tout maladi disparèt"
                ],
                answer: "Kò a bezwen dlo pou fonksyone",
                explanation:
                    "Dlo patisipe nan anpil fonksyon enpòtan nan kò moun.",
                source: "Istwa Dlo Soti nan Wòch la"
            }
        ]
    },


    {
        id: 25,
        title: "Jozye Vin Asistan Moyiz",
        category: "Pèsonaj Biblik",
        reference: "Egzòd 17:8–16; Nonb 27:18–23",
        image: "images/jozye-asistan-moyiz.jpg",
        audio: "audio/jozye-asistan-moyiz.mp3",

        content: `
            <p>
                Jozye te youn nan moun ki te sèvi avèk Moyiz pandan pèp
                Izrayèl la t ap vwayaje. Li te vin yon moun Moyiz te kapab
                fè konfyans.
            </p>

            <p>
                Lè Amalekit yo te vin goumen kont pèp Izrayèl la, Moyiz te
                chwazi Jozye pou dirije mesye yo nan batay la.
            </p>

            <p>
                Jozye te obeyi enstriksyon Moyiz epi li te mennen pèp la
                nan batay pandan Moyiz te kanpe sou tèt yon ti mòn.
            </p>

            <p>
                Plizyè ane apre, Bondye te chwazi Jozye pou pran plas Moyiz
                kòm lidè pèp Izrayèl la. Eksperyans li te ede prepare l pou
                gwo responsablite sa a.
            </p>
        `,

        lesson:
            "Ti responsablite ak eksperyans nou resevwa jodi a kapab prepare nou pou pi gwo responsablite demen.",

        biblicalQuestions: [
            {
                question: "Ki moun Moyiz te chwazi pou dirije mesye yo kont Amalekit yo?",
                options: [
                    "Jozye",
                    "David",
                    "Arawon",
                    "Samyèl"
                ],
                answer: "Jozye",
                explanation:
                    "Moyiz te voye Jozye chwazi kèk mesye pou al goumen kont Amalekit yo.",
                reference: "Egzòd 17:9"
            },

            {
                question: "Ki moun ki te vin lidè pèp Izrayèl la apre Moyiz?",
                options: [
                    "Jozye",
                    "Salomon",
                    "Sayil",
                    "Eli"
                ],
                answer: "Jozye",
                explanation:
                    "Apre lanmò Moyiz, Jozye te pran responsablite pou dirije pèp Izrayèl la.",
                reference: "Jozye 1:1–2"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa eksperyans enpòtan lè yon moun resevwa yon nouvo responsablite?",
                options: [
                    "Li ka ede moun nan prepare pou nouvo travay la",
                    "Li anpeche moun aprann",
                    "Li fè tout travay fasil",
                    "Li retire bezwen pou konsèy"
                ],
                answer: "Li ka ede moun nan prepare pou nouvo travay la",
                explanation:
                    "Eksperyans ka ede yon moun devlope ladrès ak bon jijman pou nouvo responsablite.",
                source: "Istwa Jozye Vin Asistan Moyiz"
            }
        ]
    },


    {
        id: 26,
        title: "Jozye Antre nan Peyi Pwomès la",
        category: "Gwo Evènman",
        reference: "Jozye 1",
        image: "images/jozye-peyi-pwomes.jpg",
        audio: "audio/jozye-peyi-pwomes.mp3",

        content: `
            <p>
                Apre Moyiz te mouri, Bondye te pale ak Jozye. Bondye te
                bay Jozye responsablite pou dirije pèp Izrayèl la.
            </p>

            <p>
                Bondye te ankouraje Jozye pou li gen kouraj epi rete fidèl
                ak enstriksyon li te resevwa.
            </p>

            <p>
                Jozye te bay pèp la lòd pou yo prepare yo paske yo t ap
                travèse larivyè Jouden pou antre nan peyi Bondye te pwomèt yo a.
            </p>

            <p>
                Pèp la te dakò pou suiv Jozye. Yo te pare pou kòmanse yon
                nouvo etap nan vwayaj yo.
            </p>
        `,

        lesson:
            "Nouvo responsablite mande kouraj, preparasyon ak volonte pou suiv bon direksyon.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te vin lidè pèp Izrayèl la apre Moyiz?",
                options: [
                    "Jozye",
                    "Arawon",
                    "David",
                    "Eli"
                ],
                answer: "Jozye",
                explanation:
                    "Bondye te chwazi Jozye pou pran responsablite Moyiz te genyen an.",
                reference: "Jozye 1:1–2"
            },

            {
                question: "Ki rivyè pèp la te pare pou travèse?",
                options: [
                    "Larivyè Jouden",
                    "Nil",
                    "Efrat",
                    "Tigr"
                ],
                answer: "Larivyè Jouden",
                explanation:
                    "Jozye te prepare pèp la pou travèse larivyè Jouden.",
                reference: "Jozye 1:11"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa preparasyon vle di?",
                options: [
                    "Fè sa ki nesesè anvan yon travay oswa yon evènman",
                    "Abandone yon travay",
                    "Pa planifye anyen",
                    "Rete san fè anyen"
                ],
                answer: "Fè sa ki nesesè anvan yon travay oswa yon evènman",
                explanation:
                    "Preparasyon ede moun òganize sa yo bezwen anvan yo kòmanse yon aktivite.",
                source: "Istwa Jozye Antre nan Peyi Pwomès la"
            }
        ]
    },


    {
        id: 27,
        title: "Debora ak Barak",
        category: "Pèsonaj Biblik",
        reference: "Jij 4",
        image: "images/debora-barak.jpg",
        audio: "audio/debora-barak.mp3",

        content: `
            <p>
                Debora te yon pwofètès ak jij nan pèp Izrayèl la. Moun yo
                te konn vin jwenn li pou jwenn konsèy ak jijman.
            </p>

            <p>
                Nan epòk sa a, pèp Izrayèl la te anba presyon lame Jabin,
                wa peyi Kanaran an. Kòmandan lame a te rele Sisera.
            </p>

            <p>
                Debora te rele Barak epi li te transmèt mesaj Bondye ba li.
                Li te mande Barak rasanble sòlda pou al fè fas ak lame Sisera.
            </p>

            <p>
                Barak te dakò ale, epi Debora te ale avèk li. Batay la te
                fini ak defèt lame Sisera a, dapre istwa biblik la.
            </p>
        `,

        lesson:
            "Lidèchip ka pran diferan fòm, epi sajès ak kouraj ka ede moun pran bon desizyon nan moman difisil.",

        biblicalQuestions: [
            {
                question: "Ki wòl Debora te genyen nan pèp Izrayèl la?",
                options: [
                    "Pwofètès ak jij",
                    "Rèn peyi Lejip",
                    "Sòlda Filisten",
                    "Machann"
                ],
                answer: "Pwofètès ak jij",
                explanation:
                    "Debora te sèvi kòm pwofètès ak jij nan pèp Izrayèl la.",
                reference: "Jij 4:4–5"
            },

            {
                question: "Ki moun Debora te rele pou dirije sòlda yo?",
                options: [
                    "Barak",
                    "Gideyon",
                    "Samson",
                    "Jefte"
                ],
                answer: "Barak",
                explanation:
                    "Debora te rele Barak epi li te ba li mesaj pou rasanble sòlda yo.",
                reference: "Jij 4:6"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa yon jij fè nan yon kominote?",
                options: [
                    "Li ede pran desizyon sou kesyon legal oswa konfli",
                    "Li plante tout rekòt yo",
                    "Li bati tout kay yo",
                    "Li kondi tout bato yo"
                ],
                answer: "Li ede pran desizyon sou kesyon legal oswa konfli",
                explanation:
                    "Nan yon sistèm jistis, jij yo ede aplike lalwa epi pran desizyon sou ka yo.",
                source: "Istwa Debora ak Barak"
            }
        ]
    },


    {
        id: 28,
        title: "Gideyon ak Ti Lame li",
        category: "Gwo Evènman",
        reference: "Jij 6–7",
        image: "images/gideyon.jpg",
        audio: "audio/gideyon.mp3",

        content: `
            <p>
                Gideyon te viv nan yon epòk kote pèp Izrayèl la te sibi
                atak moun Madyan yo. Bondye te rele Gideyon pou ede pèp la.
            </p>

            <p>
                Gideyon te rasanble yon gwo kantite moun pou batay la.
                Men Bondye te montre li lame a te twò gwo pou objektif la.
            </p>

            <p>
                Apre plizyè etap, kantite sòlda yo te vin piti anpil.
                Gideyon te rete ak sèlman twasan gason.
            </p>

            <p>
                Yo te itilize twonpèt, krich ak flanbo pandan lannwit.
                Lame Madyan an te pran panik, epi Izrayelit yo te genyen batay la.
            </p>
        `,

        lesson:
            "Kantite moun pa toujou sèl bagay ki detèmine sa yon gwoup kapab reyalize; disiplin ak estrateji enpòtan tou.",

        biblicalQuestions: [
            {
                question: "Konbyen gason ki te rete avèk Gideyon pou batay la?",
                options: [
                    "300",
                    "1,000",
                    "10,000",
                    "30,000"
                ],
                answer: "300",
                explanation:
                    "Dapre Jij 7, Gideyon te rete ak twasan gason.",
                reference: "Jij 7:7"
            },

            {
                question: "Ki bagay yo te itilize pou fè bri nan plan an?",
                options: [
                    "Twonpèt",
                    "Tanbou sèlman",
                    "Klòch",
                    "Gita"
                ],
                answer: "Twonpèt",
                explanation:
                    "Gason Gideyon yo te pote twonpèt ansanm ak krich ak flanbo.",
                reference: "Jij 7:16"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa yon estrateji ye?",
                options: [
                    "Yon plan pou rive jwenn yon objektif",
                    "Yon kalite manje",
                    "Yon kalite rad",
                    "Yon bèt"
                ],
                answer: "Yon plan pou rive jwenn yon objektif",
                explanation:
                    "Estrateji se fason yon moun oswa yon gwoup planifye aksyon pou rive jwenn yon objektif.",
                source: "Istwa Gideyon ak Ti Lame li"
            }
        ]
    },


    {
        id: 29,
        title: "Samyèl Tande Vwa Bondye",
        category: "Pwofèt ak Mirak",
        reference: "1 Samyèl 3:1–21",
        image: "images/samyel-tande-vwa.jpg",
        audio: "audio/samyel-tande-vwa.mp3",

        content: `
            <p>
                Samyèl te yon jèn gason ki t ap sèvi Bondye anba direksyon
                Eli. Nan epòk sa a, Samyèl te konn sèvi nan kay Bondye a.
            </p>

            <p>
                Yon nuit, Samyèl tande yon vwa ki rele non li. Li leve epi
                li ale jwenn Eli paske li te panse Eli te rele l.
            </p>

            <p>
                Sa rive plizyè fwa. Finalman, Eli konprann se Bondye ki t ap
                rele Samyèl. Li konseye Samyèl reponn si li tande vwa a ankò.
            </p>

            <p>
                Samyèl retounen kouche. Lè Bondye rele l ankò, Samyèl reponn.
                Apre sa, Samyèl te kòmanse resevwa mesaj Bondye pou pèp la.
            </p>
        `,

        lesson:
            "Aprann koute avèk atansyon epi chèche bon konsèy ka ede yon moun konprann responsablite li pi byen.",

        biblicalQuestions: [
            {
                question: "Ki moun ki t ap pran swen Samyèl nan sèvis li?",
                options: [
                    "Eli",
                    "David",
                    "Moyiz",
                    "Jozye"
                ],
                answer: "Eli",
                explanation:
                    "Samyèl te sèvi anba direksyon Eli nan kay Bondye a.",
                reference: "1 Samyèl 3:1"
            },

            {
                question: "Ki moun Samyèl te panse ki t ap rele l?",
                options: [
                    "Eli",
                    "Sayil",
                    "David",
                    "Jonatan"
                ],
                answer: "Eli",
                explanation:
                    "Samyèl te panse se Eli ki t ap rele l paske li pa t ankò konprann se Bondye ki t ap rele l.",
                reference: "1 Samyèl 3:4–6"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa li enpòtan pou koute avèk atansyon?",
                options: [
                    "Pou konprann mesaj la byen",
                    "Pou evite aprann",
                    "Pou pale san rete",
                    "Pou inyore lòt moun"
                ],
                answer: "Pou konprann mesaj la byen",
                explanation:
                    "Koute avèk atansyon ede moun konprann enfòmasyon ak enstriksyon yo.",
                source: "Istwa Samyèl Tande Vwa Bondye"
            }
        ]
    },


    {
        id: 30,
        title: "Sayil Vin Premye Wa Izrayèl",
        category: "Pèsonaj Biblik",
        reference: "1 Samyèl 9–10",
        image: "images/sayil-wa.jpg",
        audio: "audio/sayil-wa.mp3",

        content: `
            <p>
                Pèp Izrayèl la te mande yon wa pou dirije yo menm jan ak
                lòt nasyon yo. Bondye te bay Samyèl enstriksyon sou moun
                ki t ap vin premye wa yo.
            </p>

            <p>
                Nonm sa a te rele Sayil. Li te soti nan branch fanmi Benjamen.
                Li te rankontre Samyèl pandan li t ap chèche bourik papa li yo.
            </p>

            <p>
                Samyèl te vide lwil sou tèt Sayil kòm yon siy li te chwazi
                pou vin wa. Apre sa, Sayil te prezante devan pèp la.
            </p>

            <p>
                Sayil te kòmanse dirije pèp Izrayèl la kòm premye wa yo.
                Istwa li montre responsablite yon lidè mande obeyisans ak sajès.
            </p>
        `,

        lesson:
            "Yon pozisyon lidè pote gwo responsablite, epi moun ki resevwa li bezwen sèvi ak pouvwa li avèk sajès.",

        biblicalQuestions: [
            {
                question: "Ki non premye wa pèp Izrayèl la?",
                options: [
                    "Sayil",
                    "David",
                    "Salomon",
                    "Jozye"
                ],
                answer: "Sayil",
                explanation:
                    "Sayil te premye wa pèp Izrayèl la dapre istwa 1 Samyèl la.",
                reference: "1 Samyèl 10:1, 24"
            },

            {
                question: "Ki branch fanmi Sayil te soti?",
                options: [
                    "Benjamen",
                    "Jida",
                    "Levi",
                    "Efrayim"
                ],
                answer: "Benjamen",
                explanation:
                    "Sayil te soti nan branch fanmi Benjamen.",
                reference: "1 Samyèl 9:1–2"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa yon lidè ye?",
                options: [
                    "Yon moun ki gide oswa dirije lòt moun",
                    "Yon moun ki toujou travay pou kont li",
                    "Yon kalite bèt",
                    "Yon kalite manje"
                ],
                answer: "Yon moun ki gide oswa dirije lòt moun",
                explanation:
                    "Yon lidè se yon moun ki gen responsablite pou gide oswa dirije yon gwoup.",
                source: "Istwa Sayil Vin Premye Wa Izrayèl"
            }
        ]
    },


    {
        id: 31,
        title: "David Chwazi kòm Wa",
        category: "Pèsonaj Biblik",
        reference: "1 Samyèl 16:1–13",
        image: "images/david-chwazi-wa.jpg",
        audio: "audio/david-chwazi-wa.mp3",

        content: `
            <p>
                Bondye te voye Samyèl lakay Izayi nan Betleyèm paske li te
                chwazi youn nan pitit Izayi yo pou yon nouvo responsablite.
            </p>

            <p>
                Samyèl te wè plizyè pitit Izayi. Li te panse kèk nan yo
                ta ka moun Bondye te chwazi a, men Bondye te montre li aparans
                deyò pa t pi enpòtan.
            </p>

            <p>
                Yo rele David, pi piti pitit Izayi a, ki te okipe mouton yo.
                Lè David rive, Bondye te di Samyèl se li menm.
            </p>

            <p>
                Samyèl vide lwil sou tèt David devan fanmi an. Apati moman sa,
                David te resevwa yon siy espesyal sou wòl li t ap gen nan lavni.
            </p>
        `,

        lesson:
            "Valè yon moun pa mezire sèlman selon aparans li; karaktè ak kè moun nan gen anpil enpòtans.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te vide lwil sou David?",
                options: [
                    "Samyèl",
                    "Sayil",
                    "Natan",
                    "Eli"
                ],
                answer: "Samyèl",
                explanation:
                    "Samyèl te vide lwil sou David apre Bondye te chwazi li.",
                reference: "1 Samyèl 16:13"
            },

            {
                question: "Ki travay David t ap fè lè yo te rele l?",
                options: [
                    "Li t ap pran swen mouton",
                    "Li t ap bati yon kay",
                    "Li t ap peche",
                    "Li t ap travay nan palè"
                ],
                answer: "Li t ap pran swen mouton",
                explanation:
                    "David te pi piti pitit Izayi a epi li te konn pran swen mouton papa li.",
                reference: "1 Samyèl 16:11"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa karaktè yon moun vle di?",
                options: [
                    "Kalite ak prensip ki montre fason moun nan konpòte li",
                    "Koulè rad li",
                    "Wotè li sèlman",
                    "Kote li dòmi"
                ],
                answer: "Kalite ak prensip ki montre fason moun nan konpòte li",
                explanation:
                    "Karaktè gen rapò ak kalite, prensip ak fason yon moun aji.",
                source: "Istwa David Chwazi kòm Wa"
            }
        ]
    },


    {
        id: 32,
        title: "David ak Jonatan",
        category: "Zanmitay ak Fidelite",
        reference: "1 Samyèl 18–20",
        image: "images/david-jonatan.jpg",
        audio: "audio/david-jonatan.mp3",

        content: `
            <p>
                Apre David te vin sèvi nan lame Sayil la, li te vin zanmi
                Jonatan, pitit wa Sayil la. Jonatan te wè kalite David te genyen
                epi li te fè yon alyans amitye avè l.
            </p>

            <p>
                David ak Jonatan te pataje yon relasyon ki te chita sou
                fidelite ak konfyans. Jonatan te bay David kèk bagay pèsonèl
                kòm siy amitye yo.
            </p>

            <p>
                Lè Sayil te vin vle fè David mal, Jonatan te eseye pwoteje
                zanmi li. Li te chèche konnen entansyon papa li epi li te
                avèti David sou danje a.
            </p>

            <p>
                Menm lè David te oblije ale lwen, amitye li avèk Jonatan
                te rete enpòtan. Yo te kontinye montre youn lòt fidelite.
            </p>
        `,

        lesson:
            "Vrè amitye chita sou konfyans, fidelite ak volonte pou ede lòt moun nan moman difisil.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te vin bon zanmi David?",
                options: [
                    "Jonatan",
                    "Farawon",
                    "Golyat",
                    "Aman"
                ],
                answer: "Jonatan",
                explanation:
                    "Jonatan, pitit Sayil, te vin yon bon zanmi David.",
                reference: "1 Samyèl 18:1–3"
            },

            {
                question: "Ki jan Jonatan te ede David?",
                options: [
                    "Li te avèti l sou danje",
                    "Li te fè l wa touswit",
                    "Li te voye l Lejip",
                    "Li te bati yon kay pou li"
                ],
                answer: "Li te avèti l sou danje",
                explanation:
                    "Jonatan te avèti David lè li te konnen Sayil te gen move entansyon kont li.",
                reference: "1 Samyèl 20:35–42"
            }
        ],

        generalQuestions: [
            {
                question: "Ki sa fidelite vle di nan yon amitye?",
                options: [
                    "Rete serye ak yon moun epi pa abandone li fasil",
                    "Chanje zanmi chak jou",
                    "Pa janm ede lòt moun",
                    "Toujou chèche avantaj pou tèt ou"
                ],
                answer: "Rete serye ak yon moun epi pa abandone li fasil",
                explanation:
                    "Fidelite nan yon amitye gen rapò ak konfyans, respè ak sipò.",
                source: "Istwa David ak Jonatan"
            }
        ]
    },


    {
        id: 33,
        title: "David Vin Wa",
        category: "Pèsonaj Biblik",
        reference: "2 Samyèl 5:1–10",
        image: "images/david-wa.jpg",
        audio: "audio/david-wa.mp3",

        content: `
            <p>
                Apre lanmò Sayil, David te kontinye grandi nan enfliyans li
                nan mitan pèp Izrayèl la. Apre yon tan, branch fanmi Izrayèl
                yo te vin jwenn li pou yo rekonèt li kòm wa.
            </p>

            <p>
                David te vin wa sou tout pèp Izrayèl la. Li te chwazi Jerizalèm
                kòm yon vil enpòtan pou wayòm li an.
            </p>

            <p>
                David te vin youn nan wa ki pi enpòtan nan istwa pèp Izrayèl la.
                Li te dirije pandan plizyè ane epi li te etabli Jerizalèm kòm
                yon sant enpòtan pou wayòm nan.
            </p>
        `,

        lesson:
            "Lidèchip mande responsablite, epi desizyon yon lidè ka gen efè sou yon kominote pandan anpil ane.",

        biblicalQuestions: [
            {
                question: "Sou kiyès David te vin wa?",
                options: [
                    "Tout pèp Izrayèl la",
                    "Peyi Lejip sèlman",
                    "Peyi Moab sèlman",
                    "Filisten yo sèlman"
                ],
                answer: "Tout pèp Izrayèl la",
                explanation:
                    "Branch fanmi Izrayèl yo te vin jwenn David epi yo te rekonèt li kòm wa sou tout Izrayèl.",
                reference: "2 Samyèl 5:3"
            },

            {
                question: "Ki vil David te pran kòm sant wayòm li?",
                options: [
                    "Jerizalèm",
                    "Niniv",
                    "Lejip",
                    "Moab"
                ],
                answer: "Jerizalèm",
                explanation:
                    "David te pran fòtrès Siyon an nan Jerizalèm epi li te fè vil la vin yon sant enpòtan.",
                reference: "2 Samyèl 5:6–9"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa yon vil ka vin yon sant enpòtan pou yon wayòm?",
                options: [
                    "Li ka sèvi kòm yon kote pou administrasyon ak aktivite enpòtan",
                    "Li toujou pi pre lanmè",
                    "Li pa janm bezwen moun",
                    "Li pa gen okenn bilding"
                ],
                answer: "Li ka sèvi kòm yon kote pou administrasyon ak aktivite enpòtan",
                explanation:
                    "Kapital oswa sant wayòm yo souvan gen enstitisyon ak aktivite politik oswa administratif.",
                source: "Istwa David Vin Wa"
            }
        ]
    },


    {
        id: 34,
        title: "Salomon Bati Tanp lan",
        category: "Lalwa ak Sajès",
        reference: "1 Wa 5–8",
        image: "images/salomon-tanp.jpg",
        audio: "audio/salomon-tanp.mp3",

        content: `
            <p>
                Apre Salomon te vin wa, li te prepare pou konstwi yon tanp
                pou Bondye nan Jerizalèm. David, papa li, te deja prepare anpil
                bagay pou pwojè a.
            </p>

            <p>
                Salomon te òganize travayè yo epi li te jwenn materyèl ki
                nesesè pou konstriksyon an. Travay la te pran plizyè ane.
            </p>

            <p>
                Lè tanp lan te fini, Salomon te rasanble pèp la pou yon gwo
                seremoni. Yo te pote Bwat Kontra a antre nan tanp lan.
            </p>

            <p>
                Salomon te priye Bondye epi li te mande Bondye tande lapriyè
                pèp la lè yo t ap vin chèche li nan tanp lan.
            </p>
        `,

        lesson:
            "Gwo pwojè mande planifikasyon, òganizasyon, travay ansanm ak pasyans pou yo rive fini.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te bati tanp lan nan Jerizalèm?",
                options: [
                    "Salomon",
                    "David",
                    "Moyiz",
                    "Jozye"
                ],
                answer: "Salomon",
                explanation:
                    "Salomon te dirije konstriksyon tanp lan nan Jerizalèm.",
                reference: "1 Wa 6:1"
            },

            {
                question: "Ki bagay espesyal yo te pote antre nan tanp lan?",
                options: [
                    "Bwat Kontra a",
                    "Baton Moyiz la",
                    "Kouwòn David la",
                    "Fistibal David la"
                ],
                answer: "Bwat Kontra a",
                explanation:
                    "Apre tanp lan te fini, yo te pote Bwat Kontra a antre ladan l.",
                reference: "1 Wa 8:6"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa planifikasyon enpòtan nan yon gwo pwojè?",
                options: [
                    "Li ede òganize travay ak resous yo",
                    "Li fè travay la pa bezwen moun",
                    "Li anpeche moun kolabore",
                    "Li fè materyèl pa nesesè"
                ],
                answer: "Li ede òganize travay ak resous yo",
                explanation:
                    "Planifikasyon ede yon gwoup konnen sa li bezwen fè, ki resous ki nesesè ak ki etap pou swiv.",
                source: "Istwa Salomon Bati Tanp lan"
            }
        ]
    },


    {
        id: 35,
        title: "Eliya ak Vwa Dou a",
        category: "Pwofèt ak Mirak",
        reference: "1 Wa 19:1–18",
        image: "images/eliya-mòn.jpg",
        audio: "audio/eliya-voix-dou.mp3",

        content: `
            <p>
                Apre evènman ki te pase sou mòn Kamèl la, Eliya te ale nan
                dezè a. Li te fatige anpil e li te chèche yon kote pou l repoze.
            </p>

            <p>
                Apre li fin manje epi repoze, Eliya te vwayaje pandan plizyè
                jou jouk li rive sou mòn Orèb.
            </p>

            <p>
                Pandan li te la, te gen yon gwo van, yon tranbleman tè ak yon
                dife. Men istwa a di Eliya pa t rekonèt prezans Bondye nan
                evènman sa yo.
            </p>

            <p>
                Apre dife a, Eliya tande yon son ki te dous e trankil.
                Se nan moman sa a li resevwa mesaj Bondye ak nouvo enstriksyon
                pou kontinye misyon li.
            </p>
        `,

        lesson:
            "Gen moman kote direksyon ak ankourajman pa vini nan bri, men nan yon fason ki mande atansyon ak kalm pou nou koute.",

        biblicalQuestions: [
            {
                question: "Sou ki mòn Eliya te ale apre li te vwayaje nan dezè a?",
                options: [
                    "Mòn Orèb",
                    "Mòn Kamèl",
                    "Mòn Sinayi",
                    "Mòn Olivye"
                ],
                answer: "Mòn Orèb",
                explanation:
                    "Eliya te rive sou mòn Orèb, mòn Bondye a.",
                reference: "1 Wa 19:8"
            },

            {
                question: "Ki kalite son Eliya te tande apre gwo evènman yo?",
                options: [
                    "Yon son dous e trankil",
                    "Yon gwo tanbou",
                    "Yon gwo kri",
                    "Yon chante foul moun"
                ],
                answer: "Yon son dous e trankil",
                explanation:
                    "Apre van, tranbleman tè ak dife a, Eliya te tande yon son dous e trankil.",
                reference: "1 Wa 19:12"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa yon moun ka bezwen kalm pou koute byen?",
                options: [
                    "Paske bri ka fè li difisil pou konsantre",
                    "Paske kalm fè moun pa aprann",
                    "Paske bri toujou nesesè",
                    "Paske koute pa mande atansyon"
                ],
                answer: "Paske bri ka fè li difisil pou konsantre",
                explanation:
                    "Yon anviwònman ki pi kalm ka ede yon moun konsantre sou sa li ap tande.",
                source: "Istwa Eliya ak Vwa Dou a"
            }
        ]
    },


    {
        id: 36,
        title: "Eliya Monte nan Syèl la",
        category: "Pwofèt ak Mirak",
        reference: "2 Wa 2:1–14",
        image: "images/eliya-monte-syel.jpg",
        audio: "audio/eliya-monte-syel.mp3",

        content: `
            <p>
                Eliya te konnen moman li pou l kite lavi li te prè. Li te
                vwayaje ansanm ak Elize, yon pwofèt ki te sèvi bò kote li.
            </p>

            <p>
                Eliya ak Elize te travèse plizyè kote pandan yo t ap kontinye
                vwayaj la. Elize te refize kite Eliya pou kont li.
            </p>

            <p>
                Lè yo rive bò larivyè Jouden an, Eliya te pran manto li,
                li woule l epi li frape dlo a. Dapre istwa a, dlo a te separe
                pou de mesye yo te kapab travèse.
            </p>

            <p>
                Apre yo fin pale, yon bagay ekstraòdinè te rive. Eliya te
                separe ak Elize, epi Elize te wè li monte nan syèl la nan yon
                gwo van.
            </p>
        `,

        lesson:
            "Fidelite ak pèseverans ka ede yon moun rete bò kote yon bon konseye pandan yon peryòd aprantisaj.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te ak Eliya pandan dènye vwayaj li?",
                options: [
                    "Elize",
                    "David",
                    "Samyèl",
                    "Natan"
                ],
                answer: "Elize",
                explanation:
                    "Elize te akonpaye Eliya epi li te sèvi kòm pwofèt ki t ap aprann nan men li.",
                reference: "2 Wa 2:2"
            },

            {
                question: "Ki sa Eliya te itilize pou frape dlo larivyè Jouden an?",
                options: [
                    "Manto li",
                    "Yon nepe",
                    "Yon baton an lò",
                    "Yon wòch"
                ],
                answer: "Manto li",
                explanation:
                    "Eliya te pran manto li, li woule l epi li frape dlo a.",
                reference: "2 Wa 2:8"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa yon konseye ka fè?",
                options: [
                    "Bay yon moun direksyon ak konsèy",
                    "Anpeche moun aprann",
                    "Fè tout desizyon pou tout moun",
                    "Toujou travay pou kont li"
                ],
                answer: "Bay yon moun direksyon ak konsèy",
                explanation:
                    "Yon konseye ka pataje eksperyans li epi ede yon lòt moun pran pi bon direksyon.",
                source: "Istwa Eliya Monte nan Syèl la"
            }
        ]
    },


    {
        id: 37,
        title: "Eli Akòz Kè li",
        category: "Pwofèt ak Mirak",
        reference: "1 Wa 21",
        image: "images/eli-akab-nabot.jpg",
        audio: "audio/eli-akab-nabot.mp3",

        content: `
            <p>
                Wa Akab te wè yon jaden rezen ki te toupre palè li. Jaden an
                te pou yon nonm ki te rele Nabòt.
            </p>

            <p>
                Akab te vle achte jaden an, men Nabòt pa t vle vann li paske
                jaden an te yon eritaj fanmi li.
            </p>

            <p>
                Akab te tris paske li pa t jwenn sa li te vle. Rèn Jezabèl
                te wè sa epi li te prepare yon plan ki te lakòz Nabòt pèdi lavi
                li epi jaden an pase nan men Akab.
            </p>

            <p>
                Pwofèt Eli te konfwonte Akab sou sa ki te pase a. Istwa a
                montre danje ki genyen lè yon moun kite dezi pou byen lòt moun
                mennen li nan enjistis.
            </p>
        `,

        lesson:
            "Anvi posede sa lòt moun genyen ka mennen nan move desizyon; respè pou dwa lòt moun enpòtan.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te posede jaden rezen Akab te vle a?",
                options: [
                    "Nabòt",
                    "Eli",
                    "David",
                    "Elize"
                ],
                answer: "Nabòt",
                explanation:
                    "Jaden rezen an te pou Nabòt, e li te refize vann eritaj fanmi li.",
                reference: "1 Wa 21:1–3"
            },

            {
                question: "Ki pwofèt ki te konfwonte Akab?",
                options: [
                    "Eli",
                    "Samyèl",
                    "Natan",
                    "Jonas"
                ],
                answer: "Eli",
                explanation:
                    "Eli te ale jwenn Akab pou pale avè l sou sa ki te rive Nabòt.",
                reference: "1 Wa 21:17–19"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa enjistis vle di?",
                options: [
                    "Trete yon moun yon fason ki pa jis",
                    "Ede yon moun aprann",
                    "Pataje yon bagay",
                    "Travay ansanm"
                ],
                answer: "Trete yon moun yon fason ki pa jis",
                explanation:
                    "Enjistis rive lè yon moun oswa yon gwoup pa jwenn tretman ki jis oswa ekitab.",
                source: "Istwa Eli ak Jaden Nabòt"
            }
        ]
    },


    {
        id: 38,
        title: "Jozèf Entèprete Rèv nan Prizon",
        category: "Pèsonaj Biblik",
        reference: "Jenèz 40",
        image: "images/jozef-prizon.jpg",
        audio: "audio/jozef-prizon.mp3",

        content: `
            <p>
                Apre Jozèf te rive nan peyi Lejip, li te fini nan prizon malgre
                li pa t fè sa yo te akize l la.
            </p>

            <p>
                Pandan li te nan prizon, de sèvitè Farawon te vin nan menm
                kote a. Chak moun te fè yon rèv pandan yon nuit.
            </p>

            <p>
                Nan maten, Jozèf remake yo te tris. Yo rakonte l rèv yo,
                epi Jozèf eksplike rèv yo dapre sa Bondye te pèmèt li konprann.
            </p>

            <p>
                Youn nan mesye yo te retounen nan sèvis Farawon jan Jozèf
                te esplike a. Jozèf te mande li sonje l lè li retounen nan palè a.
            </p>
        `,

        lesson:
            "Menm nan yon sitiyasyon difisil, yon moun ka sèvi ak kapasite li pou ede lòt moun epi kontinye espere.",

        biblicalQuestions: [
            {
                question: "Ki kote Jozèf te ye lè li te entèprete rèv mesye yo?",
                options: [
                    "Nan prizon",
                    "Nan palè",
                    "Nan tanp",
                    "Nan jaden"
                ],
                answer: "Nan prizon",
                explanation:
                    "Jozèf te nan prizon lè de sèvitè Farawon yo te rakonte l rèv yo.",
                reference: "Jenèz 40:1–4"
            },

            {
                question: "Konbyen sèvitè Farawon ki te fè rèv nan istwa sa a?",
                options: [
                    "De",
                    "Twa",
                    "Senk",
                    "Douz"
                ],
                answer: "De",
                explanation:
                    "Se te chèf kanbiz Farawon ak chèf boulanje li a.",
                reference: "Jenèz 40:2–5"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa yon entèpretasyon ye?",
                options: [
                    "Eksplikasyon sou sans yon bagay",
                    "Yon kalite manje",
                    "Yon vwayaj",
                    "Yon bilding"
                ],
                answer: "Eksplikasyon sou sans yon bagay",
                explanation:
                    "Entèpretasyon se fason yo eksplike oswa konprann sans yon bagay.",
                source: "Istwa Jozèf Entèprete Rèv nan Prizon"
            }
        ]
    },


    {
        id: 39,
        title: "Jozèf Devni Gwo Responsab nan Lejip",
        category: "Pèsonaj Biblik",
        reference: "Jenèz 41",
        image: "images/jozef-lejip.jpg",
        audio: "audio/jozef-lejip.mp3",

        content: `
            <p>
                Farawon te fè de rèv ki te boulvèse l. Li te chèche moun ki
                te kapab esplike yo, men pèsonn pa t kapab bay li yon repons.
            </p>

            <p>
                Chèf kanbiz la te sonje Jozèf, li rakonte Farawon kijan Jozèf
                te entèprete rèv li pandan li te nan prizon.
            </p>

            <p>
                Yo rele Jozèf devan Farawon. Jozèf eksplike rèv yo te anonse
                sèt ane kote peyi a t ap gen anpil manje epi apre sa sèt ane
                grangou.
            </p>

            <p>
                Farawon te wè Jozèf kòm yon moun ki gen bon konprann pou
                òganize peyi a. Li mete Jozèf nan yon gwo pozisyon pou dirije
                travay preparasyon manje a.
            </p>
        `,

        lesson:
            "Sajès pa sèlman vle di konprann yon pwoblèm; li vle di tou konnen kijan pou prepare pou sa k ap vini.",

        biblicalQuestions: [
            {
                question: "Konbyen ane abondans Jozèf te anonse nan entèpretasyon rèv Farawon an?",
                options: [
                    "Sèt ane",
                    "De ane",
                    "Twa ane",
                    "Douz ane"
                ],
                answer: "Sèt ane",
                explanation:
                    "Jozèf te esplike sèt ane abondans t ap vini anvan sèt ane grangou.",
                reference: "Jenèz 41:29–30"
            },

            {
                question: "Ki moun ki te rele Jozèf pou entèprete rèv li yo?",
                options: [
                    "Farawon",
                    "Sayil",
                    "David",
                    "Neyemya"
                ],
                answer: "Farawon",
                explanation:
                    "Farawon te rele Jozèf apre li te tande Jozèf te kapab esplike rèv.",
                reference: "Jenèz 41:14–16"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa abondans vle di?",
                options: [
                    "Lè gen anpil nan yon bagay",
                    "Lè pa gen anyen",
                    "Lè tout bagay disparèt",
                    "Lè yon moun dòmi"
                ],
                answer: "Lè gen anpil nan yon bagay",
                explanation:
                    "Abondans vle di gen yon kantite ki anpil oswa ki plis pase sa ki nesesè.",
                source: "Istwa Jozèf Devni Gwo Responsab nan Lejip"
            }
        ]
    },


    {
        id: 40,
        title: "Jozèf Padonnen Frè li yo",
        category: "Padon ak Fanmi",
        reference: "Jenèz 45:1–15; 50:15–21",
        image: "images/jozef-padonnen.jpg",
        audio: "audio/jozef-padonnen.mp3",

        content: `
            <p>
                Apre anpil ane, frè Jozèf yo te vin nan peyi Lejip pou achte
                manje paske te gen grangou nan peyi yo. Yo pa t rekonèt Jozèf,
                ki te vin yon gwo responsab nan peyi Lejip.
            </p>

            <p>
                Jozèf te finalman revele idantite li. Frè li yo te pè paske
                yo te sonje sa yo te fè l lè yo te vann li kòm esklav.
            </p>

            <p>
                Men Jozèf pa t chèche fè yo mal. Li te eksplike yo Bondye te
                sèvi ak tout sa ki te rive pou prezève lavi anpil moun.
            </p>

            <p>
                Jozèf te mande yo fè papa yo konnen li toujou vivan epi pote
                tout fanmi an desann nan peyi Lejip.
            </p>

            <p>
                Plizyè ane apre, lè Jakòb te mouri, frè yo te toujou pè Jozèf.
                Jozèf te ankouraje yo pou yo pa pè epi li te chwazi padonnen yo.
            </p>
        `,

        lesson:
            "Padon ka ede yon fanmi soti nan sik konfli ak laperèz pou jwenn yon chemen pou viv nan lapè.",

        biblicalQuestions: [
            {
                question: "Ki moun frè Jozèf yo pa t rekonèt lè yo te rive nan peyi Lejip?",
                options: [
                    "Jozèf",
                    "Farawon",
                    "Moyiz",
                    "Jozye"
                ],
                answer: "Jozèf",
                explanation:
                    "Frè Jozèf yo pa t rekonèt li paske anpil ane te pase depi yo te vann li.",
                reference: "Jenèz 42:8"
            },

            {
                question: "Ki sa Jozèf te chwazi fè ak frè li yo?",
                options: [
                    "Padonnen yo",
                    "Vann yo",
                    "Mete yo nan prizon pou toutan",
                    "Kouri lwen yo"
                ],
                answer: "Padonnen yo",
                explanation:
                    "Jozèf te di frè li yo pou yo pa pè epi li te chwazi padonnen yo.",
                reference: "Jenèz 50:19–21"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa padon vle di?",
                options: [
                    "Lage yon moun anba dèt oswa fot li epi chwazi pa kenbe rankin",
                    "Fè yon lòt moun mal",
                    "Kouri kite fanmi an",
                    "Pa janm pale ankò"
                ],
                answer: "Lage yon moun anba dèt oswa fot li epi chwazi pa kenbe rankin",
                explanation:
                    "Padon se desizyon pou pa kontinye kenbe yon moun nan fot li epi chèche yon fason pou avanse.",
                source: "Istwa Jozèf Padonnen Frè li yo"
            }
        ]
    },


    {
        id: 41,
        title: "Moyiz ak Dis Kòmandman yo",
        category: "Lalwa ak Sajès",
        reference: "Egzòd 19–20",
        image: "images/dis-komandman.jpg",
        audio: "audio/dis-komandman.mp3",

        content: `
            <p>
                Apre pèp Izrayèl la te soti nan peyi Lejip, yo te rive bò
                mòn Sinayi. Moyiz te monte sou mòn nan pou l rankontre Bondye.
            </p>

            <p>
                Bondye te bay Moyiz enstriksyon pou pèp la sou fason yo
                te dwe viv avèk respè pou Bondye ak pou lòt moun.
            </p>

            <p>
                Bondye te bay Moyiz Dis Kòmandman yo. Kòmandman sa yo te
                pale sou adorasyon Bondye, respè pou paran, lavi moun,
                maryaj, byen lòt moun ak verite.
            </p>

            <p>
                Moyiz te desann soti sou mòn nan epi li te pote mesaj Bondye
                a bay pèp Izrayèl la.
            </p>
        `,

        lesson:
            "Bon prensip ak règ ka ede yon kominote viv avèk respè, lòd ak responsablite.",

        biblicalQuestions: [
            {
                question: "Sou ki mòn Moyiz te resevwa Dis Kòmandman yo?",
                options: [
                    "Mòn Sinayi",
                    "Mòn Kamèl",
                    "Mòn Olivye",
                    "Mòn Siyon"
                ],
                answer: "Mòn Sinayi",
                explanation:
                    "Dapre istwa Egzòd la, Bondye te bay Moyiz Dis Kòmandman yo sou mòn Sinayi.",
                reference: "Egzòd 19:20; 20:1–17"
            },

            {
                question: "Konbyen kòmandman Bondye te bay Moyiz nan pasaj sa a?",
                options: [
                    "Dis",
                    "Senk",
                    "Douz",
                    "Ven"
                ],
                answer: "Dis",
                explanation:
                    "Egzòd 20 prezante Dis Kòmandman yo.",
                reference: "Egzòd 20:1–17"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa règ enpòtan nan yon kominote?",
                options: [
                    "Yo ede moun konnen limit ak responsablite yo",
                    "Yo fè moun pa bezwen respekte lòt moun",
                    "Yo anpeche tout moun kolabore",
                    "Yo retire tout responsablite"
                ],
                answer: "Yo ede moun konnen limit ak responsablite yo",
                explanation:
                    "Règ ki klè ka ede moun viv ansanm avèk plis lòd ak respè.",
                source: "Istwa Moyiz ak Dis Kòmandman yo"
            }
        ]
    },


    {
        id: 42,
        title: "Ti towo bèf an lò a",
        category: "Gwo Evènman",
        reference: "Egzòd 32:1–35",
        image: "images/towo-bef-an-lo.jpg",
        audio: "audio/towo-bef-an-lo.mp3",

        content: `
            <p>
                Pandan Moyiz te sou mòn nan ap pale ak Bondye, pèp la te
                tann lontan. Yo te vin mande Arawon fè yon bagay yo te kapab
                wè pou dirije yo.
            </p>

            <p>
                Arawon te ranmase bijou an lò nan men pèp la epi li te fè
                yon estati ti towo bèf an lò.
            </p>

            <p>
                Pèp la te kòmanse selebre devan estati a. Lè Moyiz desann
                sou mòn nan epi li wè sa k te pase a, li te fache anpil.
            </p>

            <p>
                Moyiz te pale ak pèp la sou gravite aksyon yo. Apre sa,
                li te retounen bò kote Bondye pou l chèche direksyon pou pèp la.
            </p>
        `,

        lesson:
            "Lè moun kite enpasyans ak presyon gwoup mennen yo, yo ka pran desizyon yo pral regrèt pita.",

        biblicalQuestions: [
            {
                question: "Ki sa pèp la te mande Arawon fè?",
                options: [
                    "Yon estati pou yo adore",
                    "Yon bato",
                    "Yon kay",
                    "Yon pon"
                ],
                answer: "Yon estati pou yo adore",
                explanation:
                    "Pèp la te mande Arawon fè yon bondye pou mache devan yo.",
                reference: "Egzòd 32:1"
            },

            {
                question: "Ki materyèl yo te itilize pou fè estati a?",
                options: [
                    "Lò",
                    "Wòch",
                    "Bwa",
                    "Fè"
                ],
                answer: "Lò",
                explanation:
                    "Arawon te pran lò pèp la te pote epi li te fòme yon ti towo bèf an lò.",
                reference: "Egzòd 32:2–4"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa li enpòtan pou reflechi anvan nou suiv yon foul moun?",
                options: [
                    "Paske gwoup la ka pran yon move desizyon",
                    "Paske tout gwoup toujou gen rezon",
                    "Paske reflechi pa itil",
                    "Paske moun pa bezwen pran desizyon"
                ],
                answer: "Paske gwoup la ka pran yon move desizyon",
                explanation:
                    "Yon moun dwe reflechi sou konsekans yon aksyon menm lè anpil lòt moun ap fè menm bagay la.",
                source: "Istwa Ti towo bèf an lò a"
            }
        ]
    },


    {
        id: 43,
        title: "Rahab Ede Espyon yo",
        category: "Kouraj ak Lafwa",
        reference: "Jozye 2",
        image: "images/rahab-espyon.jpg",
        audio: "audio/rahab-espyon.mp3",

        content: `
            <p>
                Anvan pèp Izrayèl la antre nan Jeriko, Jozye te voye de
                espyon pou al obsève peyi a.
            </p>

            <p>
                Espyon yo te rive lakay yon fanm ki te rele Rahab. Wa Jeriko
                te aprann gen moun ki te antre nan vil la epi li te voye moun
                al chèche yo.
            </p>

            <p>
                Rahab te kache espyon yo epi li te di moun wa a yo te deja
                pati. Li te ede espyon yo jwenn yon fason pou yo soti san danje.
            </p>

            <p>
                Rahab te mande yo pwoteje li ak fanmi li lè Izrayelit yo
                ta pran vil la. Espyon yo te dakò ak demann li.
            </p>
        `,

        lesson:
            "Kouraj ka mande pou yon moun pran bon desizyon menm lè gen presyon oswa danje bò kote li.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te kache de espyon Jozye te voye yo?",
                options: [
                    "Rahab",
                    "Debora",
                    "Rit",
                    "Estè"
                ],
                answer: "Rahab",
                explanation:
                    "Rahab te kache espyon yo epi li te ede yo soti nan Jeriko.",
                reference: "Jozye 2:1–6"
            },

            {
                question: "Nan ki vil Rahab te rete?",
                options: [
                    "Jeriko",
                    "Betleyèm",
                    "Jerizalèm",
                    "Niniv"
                ],
                answer: "Jeriko",
                explanation:
                    "Rahab te rete nan vil Jeriko kote espyon yo te antre.",
                reference: "Jozye 2:1"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa kouraj vle di?",
                options: [
                    "Fè sa ki nesesè malgre laperèz oswa difikilte",
                    "Pa janm reflechi",
                    "Toujou pran risk san rezon",
                    "Kouri devan tout pwoblèm"
                ],
                answer: "Fè sa ki nesesè malgre laperèz oswa difikilte",
                explanation:
                    "Kouraj se kapasite pou aji avèk detèminasyon menm lè yon sitiyasyon difisil.",
                source: "Istwa Rahab Ede Espyon yo"
            }
        ]
    },


    {
        id: 44,
        title: "Miray Jeriko yo Tonbe",
        category: "Mirak",
        reference: "Jozye 6:1–27",
        image: "images/miray-jeriko.jpg",
        audio: "audio/miray-jeriko.mp3",

        content: `
            <p>
                Vil Jeriko te fèmen pòtay li yo paske pèp Izrayèl la te
                pare pou antre nan peyi a.
            </p>

            <p>
                Bondye te bay Jozye enstriksyon sou fason pèp la te dwe
                mache toutotou vil la pandan plizyè jou.
            </p>

            <p>
                Prèt yo te mache devan pèp la ak twonpèt yo. Sou setyèm jou a,
                yo te mache toutotou vil la plizyè fwa.
            </p>

            <p>
                Lè pèp la te rele epi prèt yo te sonnen twonpèt yo, miray
                Jeriko a te tonbe dapre istwa biblik la.
            </p>
        `,

        lesson:
            "Obeyisans, disiplin ak pèseverans ka mande pou moun suiv yon plan menm lè li pa sanble fasil pou konprann.",

        biblicalQuestions: [
            {
                question: "Ki vil Izrayelit yo te mache toutotou a?",
                options: [
                    "Jeriko",
                    "Niniv",
                    "Betleyèm",
                    "Sikèm"
                ],
                answer: "Jeriko",
                explanation:
                    "Jozye 6 rakonte kijan Izrayelit yo te mache toutotou Jeriko.",
                reference: "Jozye 6:1–4"
            },

            {
                question: "Ki sa prèt yo te pote pou fè son?",
                options: [
                    "Twonpèt",
                    "Gita",
                    "Tanbou",
                    "Klòch"
                ],
                answer: "Twonpèt",
                explanation:
                    "Prèt yo te pote twonpèt epi yo te sonnen yo pandan pèp la t ap mache.",
                reference: "Jozye 6:4–5"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa disiplin vle di?",
                options: [
                    "Respekte yon plan oswa règ avèk regilarite",
                    "Fè sèlman sa ki fasil",
                    "Chanje plan chak minit",
                    "Refize suiv okenn enstriksyon"
                ],
                answer: "Respekte yon plan oswa règ avèk regilarite",
                explanation:
                    "Disiplin ede yon moun kontinye fè sa li dwe fè menm lè li pa fasil.",
                source: "Istwa Miray Jeriko yo Tonbe"
            }
        ]
    },


    {
        id: 45,
        title: "Rit ak Nawomi",
        category: "Zanmitay ak Fidelite",
        reference: "Rit 1:1–22",
        image: "images/rit-nawomi.jpg",
        audio: "audio/rit-nawomi.mp3",

        content: `
            <p>
                Nawomi te viv nan peyi Moab ansanm ak mari li ak de pitit
                gason li yo. Apre mari li ak pitit gason li yo te mouri,
                Nawomi te deside retounen nan Betleyèm.
            </p>

            <p>
                Bèlfi li Rit te chwazi ale avèk li. Nawomi te eseye ankouraje
                Rit rete nan peyi Moab pou l ka kòmanse yon nouvo lavi.
            </p>

            <p>
                Men Rit te deside rete bò kote Nawomi epi ale avèk li nan
                peyi Izrayèl.
            </p>

            <p>
                De fanm yo te rive Betleyèm ansanm epi yo te kòmanse yon
                nouvo etap nan lavi yo.
            </p>
        `,

        lesson:
            "Fidelite vle di rete bò kote yon moun nan moman difisil epi chèche ede li kòmanse ankò.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te chwazi ale avèk Nawomi?",
                options: [
                    "Rit",
                    "Debora",
                    "Estè",
                    "Mari"
                ],
                answer: "Rit",
                explanation:
                    "Rit te chwazi kite Moab epi ale ansanm ak Nawomi nan Betleyèm.",
                reference: "Rit 1:16–19"
            },

            {
                question: "Ki vil Nawomi ak Rit te rive?",
                options: [
                    "Betleyèm",
                    "Jeriko",
                    "Niniv",
                    "Siklag"
                ],
                answer: "Betleyèm",
                explanation:
                    "Nawomi ak Rit te retounen nan Betleyèm, vil kote Nawomi te soti.",
                reference: "Rit 1:19"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa sipò yon zanmi enpòtan nan yon moman difisil?",
                options: [
                    "Li ka ede moun nan santi li pa poukont li",
                    "Li fè pwoblèm yo toujou disparèt",
                    "Li fè moun nan pa bezwen pran okenn desizyon",
                    "Li anpeche moun aprann"
                ],
                answer: "Li ka ede moun nan santi li pa poukont li",
                explanation:
                    "Sipò sosyal ka ede yon moun travèse yon peryòd difisil avèk plis ankourajman.",
                source: "Istwa Rit ak Nawomi"
            }
        ]
    },


    {
        id: 46,
        title: "Rit Rankontre Boaz",
        category: "Fanmi ak Fidelite",
        reference: "Rit 2–4",
        image: "images/rit-boaz.jpg",
        audio: "audio/rit-boaz.mp3",

        content: `
            <p>
                Lè Rit ak Nawomi te rive Betleyèm, Rit te kòmanse ranmase
                grenn ki te rete dèyè moun k ap rekòlte yo pou ede yo jwenn manje.
            </p>

            <p>
                Rit te rive nan jaden yon nonm ki te rele Boaz. Boaz te remake
                travay di Rit ak fason li te pran swen Nawomi.
            </p>

            <p>
                Boaz te bay Rit pèmisyon pou l rete nan jaden li epi li te
                mande travayè li yo pa fè l mal.
            </p>

            <p>
                Apre yon tan, Boaz te marye ak Rit. Yo te vin gen yon pitit
                gason ki te rele Obèd, ki te vin granpapa David.
            </p>
        `,

        lesson:
            "Jantiyès, respè ak fidelite ka kreye relasyon ki pote bon bagay pou yon fanmi ak yon kominote.",

        biblicalQuestions: [
            {
                question: "Ki nonm Rit te rankontre nan jaden an?",
                options: [
                    "Boaz",
                    "Jesse",
                    "Elimelek",
                    "Obèd"
                ],
                answer: "Boaz",
                explanation:
                    "Rit te rive nan jaden Boaz epi li te jwenn favè devan li.",
                reference: "Rit 2:1–8"
            },

            {
                question: "Ki non pitit Boaz ak Rit te genyen?",
                options: [
                    "Obèd",
                    "David",
                    "Izayi",
                    "Sayil"
                ],
                answer: "Obèd",
                explanation:
                    "Boaz ak Rit te gen yon pitit gason ki te rele Obèd.",
                reference: "Rit 4:13–17"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa jantiyès vle di?",
                options: [
                    "Trete lòt moun avèk respè ak bonte",
                    "Toujou chèche avantaj pou tèt ou",
                    "Refize ede moun",
                    "Pale mal de lòt moun"
                ],
                answer: "Trete lòt moun avèk respè ak bonte",
                explanation:
                    "Jantiyès gen ladan l respè, konsiderasyon ak aksyon ki ede lòt moun.",
                source: "Istwa Rit Rankontre Boaz"
            }
        ]
    },


    {
        id: 47,
        title: "Estè Vin Rèn",
        category: "Pèsonaj Biblik",
        reference: "Estè 2:1–18",
        image: "images/ester-ren.jpg",
        audio: "audio/ester-ren.mp3",

        content: `
            <p>
                Nan peyi Pès la, wa a te kòmanse chèche yon nouvo rèn.
                Pami jèn fi yo te chwazi yo te gen yon jèn fi jwif ki te rele Estè.
            </p>

            <p>
                Estè te leve anba swen kouzen li Madòkay. Li te suiv konsèy
                li epi li pa t di tout moun ki pèp li soti.
            </p>

            <p>
                Wa a te apresye Estè plis pase lòt jèn fi yo. Li te chwazi
                Estè kòm rèn peyi Pès la.
            </p>

            <p>
                Estè te vin gen yon pozisyon enpòtan ki t ap pèmèt li sèvi
                ak enfliyans li nan yon moman ki t ap vini.
            </p>
        `,

        lesson:
            "Yon pozisyon enpòtan ka vin yon opòtinite pou sèvi lòt moun avèk sajès ak responsablite.",

        biblicalQuestions: [
            {
                question: "Ki non jèn fi ki te vin rèn peyi Pès la?",
                options: [
                    "Estè",
                    "Rit",
                    "Debora",
                    "Nawomi"
                ],
                answer: "Estè",
                explanation:
                    "Wa a te chwazi Estè kòm rèn apre li te apresye li plis pase lòt jèn fi yo.",
                reference: "Estè 2:17"
            },

            {
                question: "Ki moun ki te pran swen Estè lè li te piti?",
                options: [
                    "Madòkay",
                    "Boaz",
                    "Samyèl",
                    "Neyemya"
                ],
                answer: "Madòkay",
                explanation:
                    "Madòkay te pran Estè kòm pitit fi li apre paran li yo te mouri.",
                reference: "Estè 2:7"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa responsablite vle di?",
                options: [
                    "Devwa pou pran swen yon travay oswa yon sitiyasyon",
                    "Fè sèlman sa ki amizan",
                    "Evite tout desizyon",
                    "Bay lòt moun tout travay"
                ],
                answer: "Devwa pou pran swen yon travay oswa yon sitiyasyon",
                explanation:
                    "Responsablite se yon devwa moun dwe pran oserye epi akonpli avèk swen.",
                source: "Istwa Estè Vin Rèn"
            }
        ]
    },


    {
        id: 48,
        title: "Estè Pwoteje Pèp li",
        category: "Kouraj ak Lafwa",
        reference: "Estè 4–7",
        image: "images/ester-pwoteje-pep.jpg",
        audio: "audio/ester-pwoteje-pep.mp3",

        content: `
            <p>
                Aman, yon gwo responsab nan peyi Pès la, te prepare yon plan
                kont pèp jwif la. Madòkay te aprann sa epi li te mande Estè
                sèvi ak pozisyon li pou ede pèp la.
            </p>

            <p>
                Estè te konnen ale devan wa a san yo pa rele li te kapab
                mete li nan yon sitiyasyon difisil. Men li te deside pran
                responsabilite pou pale pou pèp li.
            </p>

            <p>
                Estè te envite wa a ak Aman nan yon fèt. Apre sa, li te
                esplike wa a danje pèp li t ap fè fas ak li.
            </p>

            <p>
                Wa a te pran mezi kont plan Aman an, epi pèp jwif la te
                jwenn yon fason pou defann tèt li.
            </p>
        `,

        lesson:
            "Kouraj ak bon jijman ka ede yon moun sèvi ak pozisyon li pou pale lè lòt moun bezwen èd.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te mande Estè ede pèp jwif la?",
                options: [
                    "Madòkay",
                    "Boaz",
                    "Samyèl",
                    "Neyemya"
                ],
                answer: "Madòkay",
                explanation:
                    "Madòkay te fè Estè konnen danje a epi li te mande l sèvi ak pozisyon li pou ede pèp la.",
                reference: "Estè 4:13–14"
            },

            {
                question: "Ki moun ki te prepare plan kont pèp jwif la?",
                options: [
                    "Aman",
                    "Madòkay",
                    "Boaz",
                    "Neyemya"
                ],
                answer: "Aman",
                explanation:
                    "Aman te prepare yon plan pou detwi pèp jwif la.",
                reference: "Estè 3:5–6"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa pale pou yon moun ki bezwen èd ka mande kouraj?",
                options: [
                    "Paske sitiyasyon an ka mande pou moun nan pran risk oswa fè fas ak presyon",
                    "Paske pale pa janm gen konsekans",
                    "Paske tout moun ap toujou dakò",
                    "Paske sa pa mande refleksyon"
                ],
                answer: "Paske sitiyasyon an ka mande pou moun nan pran risk oswa fè fas ak presyon",
                explanation:
                    "Defann yon moun ka mande detèminasyon, bon jijman ak kouraj.",
                source: "Istwa Estè Pwoteje Pèp li"
            }
        ]
    },


    {
        id: 49,
        title: "Neyemya Rebati Miray Jerizalèm",
        category: "Gwo Evènman",
        reference: "Neyemya 1–6",
        image: "images/neyemya-miray.jpg",
        audio: "audio/neyemya-miray.mp3",

        content: `
            <p>
                Neyemya te aprann miray Jerizalèm yo te kraze epi pòtay vil la
                te boule. Li te tris anpil epi li te priye Bondye.
            </p>

            <p>
                Neyemya te jwenn pèmisyon nan men wa peyi Pès la pou ale
                Jerizalèm epi ede rebati miray la.
            </p>

            <p>
                Lè li rive, Neyemya te òganize pèp la pou travay sou diferan
                pati miray la. Moun yo te travay ansanm malgre opozisyon kèk
                moun.
            </p>

            <p>
                Apre anpil travay ak pèseverans, miray la te fini nan yon
                tan kout. Pèp la te selebre paske vil la te vin pi pwoteje.
            </p>
        `,

        lesson:
            "Yon gwo travay ka vin posib lè moun òganize tèt yo, travay ansanm epi pa abandone devan opozisyon.",

        biblicalQuestions: [
            {
                question: "Ki sa Neyemya te ale rebati?",
                options: [
                    "Miray Jerizalèm",
                    "Tanp peyi Lejip",
                    "Palè wa a",
                    "Bato yo"
                ],
                answer: "Miray Jerizalèm",
                explanation:
                    "Neyemya te ale Jerizalèm pou rebati miray vil la.",
                reference: "Neyemya 2:17"
            },

            {
                question: "Ki jan pèp la te patisipe nan travay la?",
                options: [
                    "Yo te travay sou diferan pati miray la",
                    "Yo te kite Neyemya fè tout bagay",
                    "Yo te kraze plis miray",
                    "Yo te abandone vil la"
                ],
                answer: "Yo te travay sou diferan pati miray la",
                explanation:
                    "Diferan fanmi ak gwoup te pran responsablite pou rebati divès pati miray la.",
                reference: "Neyemya 3"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa kolaborasyon vle di?",
                options: [
                    "Plizyè moun travay ansanm pou yon objektif",
                    "Yon moun travay san èd",
                    "Moun yo refize kominike",
                    "Chak moun fè yon bagay san plan"
                ],
                answer: "Plizyè moun travay ansanm pou yon objektif",
                explanation:
                    "Kolaborasyon se lè moun mete efò yo ansanm pou rive jwenn yon objektif komen.",
                source: "Istwa Neyemya Rebati Miray Jerizalèm"
            }
        ]
    },


    {
        id: 50,
        title: "Jonas ak Vil Niniv",
        category: "Pwofèt ak Mirak",
        reference: "Jonas 1–4",
        image: "images/jonas-niniv.jpg",
        audio: "audio/jonas-niniv.mp3",

        content: `
            <p>
                Bondye te voye Jonas al Niniv pou anonse yon mesaj bay moun
                vil la. Men Jonas te pran yon bato nan direksyon opoze.
            </p>

            <p>
                Pandan vwayaj la, yon gwo tanpèt te leve sou lanmè a.
                Jonas te rekonèt li te kouri lwen misyon Bondye te ba li a.
            </p>

            <p>
                Apre evènman ki te rive sou lanmè a, Jonas te rive Niniv.
                Li te anonse mesaj Bondye a bay moun vil la.
            </p>

            <p>
                Moun Niniv yo te tande mesaj la, yo te chanje fason yo t ap
                viv epi yo te chèche padon. Istwa a montre enpòtans pou pran
                misyon ak responsablite oserye.
            </p>
        `,

        lesson:
            "Lè yon moun resevwa yon responsablite, li enpòtan pou li fè fas ak li olye li kouri lwen li.",

        biblicalQuestions: [
            {
                question: "Ki vil Bondye te voye Jonas al preche?",
                options: [
                    "Niniv",
                    "Jeriko",
                    "Betleyèm",
                    "Jerizalèm"
                ],
                answer: "Niniv",
                explanation:
                    "Bondye te voye Jonas al Niniv pou anonse mesaj li.",
                reference: "Jonas 1:2"
            },

            {
                question: "Ki sa Jonas te fè anvan li ale Niniv?",
                options: [
                    "Li te pran yon bato nan direksyon opoze",
                    "Li te bati yon kay",
                    "Li te vin wa",
                    "Li te ale Jerizalèm"
                ],
                answer: "Li te pran yon bato nan direksyon opoze",
                explanation:
                    "Jonas te eseye kouri lwen misyon Bondye te ba li a.",
                reference: "Jonas 1:3"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa yon responsablite mande?",
                options: [
                    "Pran travay la oserye epi fè sa ki nesesè",
                    "Kouri lwen tout difikilte",
                    "Kite lòt moun fè tout bagay",
                    "Pa janm suiv yon plan"
                ],
                answer: "Pran travay la oserye epi fè sa ki nesesè",
                explanation:
                    "Yon responsablite mande seryezman, òganizasyon ak volonte pou aji.",
                source: "Istwa Jonas ak Vil Niniv"
            }
        ]
    },


    {
        id: 51,
        title: "Daniel nan Twou Lyon yo",
        category: "Kouraj ak Lafwa",
        reference: "Danyèl 6",
        image: "images/daniel-tou-lyon.jpg",
        audio: "audio/daniel-tou-lyon.mp3",

        content: `
            <p>
                Danyèl te sèvi kòm yon gwo responsab nan peyi Babilòn ak
                nan peyi Pès. Li te gen yon bon repitasyon epi li te fidèl
                nan travay li.
            </p>

            <p>
                Kèk moun ki te jalou de Danyèl te chèche yon fason pou yo
                mete l nan pwoblèm. Yo te fè wa a siyen yon lwa ki te entèdi
                moun priye nenpòt lòt moun pase wa a pandan yon peryòd.
            </p>

            <p>
                Danyèl te kontinye priye Bondye jan li te konn fè a.
                Yo te akize l devan wa a, epi wa a te oblije voye Danyèl
                nan twou lyon yo.
            </p>

            <p>
                Nan demen, wa a te jwenn Danyèl vivan. Dapre istwa a,
                Bondye te pwoteje Danyèl nan twou lyon yo.
            </p>
        `,

        lesson:
            "Rete fidèl ak prensip ou yo ka mande kouraj lè gen presyon pou fè lòt bagay.",

        biblicalQuestions: [
            {
                question: "Ki kote yo te mete Danyèl?",
                options: [
                    "Nan twou lyon yo",
                    "Nan yon prizon nan peyi Lejip",
                    "Nan yon bato",
                    "Nan yon tanp"
                ],
                answer: "Nan twou lyon yo",
                explanation:
                    "Danyèl te voye nan twou lyon yo paske li te kontinye priye Bondye.",
                reference: "Danyèl 6:16"
            },

            {
                question: "Poukisa yo te akize Danyèl?",
                options: [
                    "Paske li te kontinye priye Bondye",
                    "Paske li te vòlè manje",
                    "Paske li te kite peyi a",
                    "Paske li te refize travay"
                ],
                answer: "Paske li te kontinye priye Bondye",
                explanation:
                    "Danyèl te kontinye priye Bondye malgre lwa wa a.",
                reference: "Danyèl 6:10–13"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa entegrite vle di?",
                options: [
                    "Rete fidèl ak bon prensip menm lè pèsonn pa gade",
                    "Fè nenpòt bagay pou jwenn avantaj",
                    "Chanje prensip chak jou",
                    "Kache tout erè"
                ],
                answer: "Rete fidèl ak bon prensip menm lè pèsonn pa gade",
                explanation:
                    "Entegrite gen rapò ak onètete ak fidelite ak prensip yon moun.",
                source: "Istwa Danyèl nan Twou Lyon yo"
            }
        ]
    },


    {
        id: 52,
        title: "Twa Jèn Gason nan Fou Dife a",
        category: "Mirak",
        reference: "Danyèl 3",
        image: "images/twa-jenn-fou-dife.jpg",
        audio: "audio/twa-jenn-fou-dife.mp3",

        content: `
            <p>
                Wa Nebikadneza te fè yon gwo estati an lò epi li te bay lòd
                pou tout moun bese devan li lè mizik la t ap jwe.
            </p>

            <p>
                Chadrak, Mechak ak Abèdnego te refize adore estati a paske
                yo te vle rete fidèl ak Bondye yo.
            </p>

            <p>
                Wa a te fache anpil epi li te bay lòd pou yo mete twa jèn
                gason yo nan yon fou ki te chofe anpil.
            </p>

            <p>
                Dapre istwa a, yo te wè twa mesye yo ap mache nan dife a san
                danje, epi yo te wè yon lòt figi avèk yo.
            </p>
        `,

        lesson:
            "Kwayans ak prensip ka ede yon moun rete fèm lè li jwenn gwo presyon.",

        biblicalQuestions: [
            {
                question: "Ki twa jèn gason ki te refize adore estati a?",
                options: [
                    "Chadrak, Mechak ak Abèdnego",
                    "Danyèl, Jozye ak Samyèl",
                    "David, Jonatan ak Sayil",
                    "Pyè, Jan ak Jak"
                ],
                answer: "Chadrak, Mechak ak Abèdnego",
                explanation:
                    "Chadrak, Mechak ak Abèdnego te refize bese devan estati wa a.",
                reference: "Danyèl 3:12"
            },

            {
                question: "Ki kote wa a te mete yo?",
                options: [
                    "Nan yon fou ki te chofe anpil",
                    "Nan yon twou dlo",
                    "Nan yon bato",
                    "Nan yon jaden"
                ],
                answer: "Nan yon fou ki te chofe anpil",
                explanation:
                    "Wa a te bay lòd pou yo jete twa jèn gason yo nan yon fou dife.",
                reference: "Danyèl 3:19–23"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa prensip vle di?",
                options: [
                    "Yon règ oswa valè yon moun chwazi suiv",
                    "Yon kalite manje",
                    "Yon jwèt",
                    "Yon kote pou rete"
                ],
                answer: "Yon règ oswa valè yon moun chwazi suiv",
                explanation:
                    "Prensip se valè oswa règ ki gide fason yon moun pran desizyon.",
                source: "Istwa Twa Jèn Gason nan Fou Dife a"
            }
        ]
    },


    {
        id: 53,
        title: "Danyèl Eksplike Ekriti sou Miray la",
        category: "Pèsonaj Biblik",
        reference: "Danyèl 5",
        image: "images/daniel-ekriti-miray.jpg",
        audio: "audio/daniel-ekriti-miray.mp3",

        content: `
            <p>
                Wa Bèlchaza t ap fè yon gwo fèt nan palè li. Pandan fèt la,
                yon bagay ekstraòdinè te parèt sou miray la.
            </p>

            <p>
                Wa a te pè anpil paske li pa t konprann mesaj ki te ekri a.
                Li te rele moun ki te konn esplike bagay konsa, men yo pa t
                kapab bay li sans mesaj la.
            </p>

            <p>
                Yo te rele Danyèl. Danyèl te vini devan wa a epi li te esplike
                mesaj ki te ekri sou miray la.
            </p>

            <p>
                Danyèl te pale avèk wa a sou fyète li ak fason li te aji.
                Mesaj la te anonse yon chanjman enpòtan pou wayòm nan.
            </p>
        `,

        lesson:
            "Sajès mande pou moun sèvi ak kapasite yo avèk onètete epi pale laverite menm devan moun ki gen pouvwa.",

        biblicalQuestions: [
            {
                question: "Ki moun yo te rele pou esplike ekriti sou miray la?",
                options: [
                    "Danyèl",
                    "Neyemya",
                    "Jozye",
                    "Eli"
                ],
                answer: "Danyèl",
                explanation:
                    "Danyèl te rele pou esplike mesaj ki te parèt sou miray la.",
                reference: "Danyèl 5:13–17"
            },

            {
                question: "Ki kote ekriti a te parèt?",
                options: [
                    "Sou yon miray",
                    "Sou yon liv",
                    "Sou yon pòt",
                    "Sou yon bato"
                ],
                answer: "Sou yon miray",
                explanation:
                    "Ekriti a te parèt sou miray palè a pandan fèt wa Bèlchaza a.",
                reference: "Danyèl 5:5"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa li enpòtan pou sèvi ak konesans avèk onètete?",
                options: [
                    "Pou bay enfòmasyon ki serye epi ede moun pran bon desizyon",
                    "Pou twonpe lòt moun",
                    "Pou kache laverite",
                    "Pou fè moun pè"
                ],
                answer: "Pou bay enfòmasyon ki serye epi ede moun pran bon desizyon",
                explanation:
                    "Konesans sèvi pi byen lè yo itilize li avèk onètete ak responsablite.",
                source: "Istwa Danyèl Eksplike Ekriti sou Miray la"
            }
        ]
    },


    {
        id: 54,
        title: "Ezra Li Lalwa Devan Pèp la",
        category: "Lalwa ak Sajès",
        reference: "Neyemya 8",
        image: "images/ezra-lalwa.jpg",
        audio: "audio/ezra-lalwa.mp3",

        content: `
            <p>
                Apre miray Jerizalèm nan te fini, pèp la te rasanble ansanm
                nan yon plas devan pòtay Dlo a.
            </p>

            <p>
                Ezra, prèt ak eskrib la, te pote liv Lalwa Moyiz la devan
                pèp la. Li te li ladan l depi maten jouk nan mitan jounen.
            </p>

            <p>
                Levit yo te ede pèp la konprann sa yo t ap li a. Moun yo
                te koute avèk anpil atansyon.
            </p>

            <p>
                Lidè yo te ankouraje pèp la pou selebre epi pataje manje ak
                moun ki pa t gen anyen prepare, paske jou a te yon jou espesyal.
            </p>
        `,

        lesson:
            "Aprann ansanm epi eksplike sa nou konprann ka ede yon kominote grandi nan konesans ak inite.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te li liv Lalwa a devan pèp la?",
                options: [
                    "Ezra",
                    "Neyemya",
                    "David",
                    "Danyèl"
                ],
                answer: "Ezra",
                explanation:
                    "Ezra te pote liv Lalwa Moyiz la epi li te li li devan pèp la.",
                reference: "Neyemya 8:1–3"
            },

            {
                question: "Ki moun ki te ede pèp la konprann sa yo t ap li a?",
                options: [
                    "Levit yo",
                    "Sòlda yo",
                    "Machann yo",
                    "Wa a"
                ],
                answer: "Levit yo",
                explanation:
                    "Levit yo te ede pèp la konprann Lalwa a.",
                reference: "Neyemya 8:7–8"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa eksplike yon bagay apre li fin li enpòtan?",
                options: [
                    "Li ede moun konprann sans enfòmasyon an",
                    "Li fè enfòmasyon an disparèt",
                    "Li anpeche moun poze kesyon",
                    "Li fè aprantisaj pa nesesè"
                ],
                answer: "Li ede moun konprann sans enfòmasyon an",
                explanation:
                    "Eksplikasyon ede moun konprann mo, lide ak enfòmasyon yo pi byen.",
                source: "Istwa Ezra Li Lalwa Devan Pèp la"
            }
        ]
    },


    {
        id: 55,
        title: "Mari Resevwa Mesaj Zanj lan",
        category: "Pèsonaj Biblik",
        reference: "Lik 1:26–38",
        image: "images/mari-zanj.jpg",
        audio: "audio/mari-zanj.mp3",

        content: `
            <p>
                Bondye te voye zanj Gabriyèl nan vil Nazarèt pou ale jwenn
                yon jèn fi ki te rele Mari.
            </p>

            <p>
                Zanj lan te anonse Mari li t ap vin manman yon pitit gason
                ki t ap rele Jezi. Mesaj la te eksplike gwo wòl pitit la t ap
                genyen.
            </p>

            <p>
                Mari te sezi epi li te poze kesyon sou fason bagay la t ap rive.
                Zanj lan te ba li plis eksplikasyon.
            </p>

            <p>
                Mari te aksepte mesaj la avèk imilite epi li te di li pare
                pou sèvi selon volonte Bondye.
            </p>
        `,

        lesson:
            "Lè yon moun resevwa yon gwo responsablite, li ka poze kesyon, chèche konprann epi toujou aji avèk imilite.",

        biblicalQuestions: [
            {
                question: "Ki non zanj ki te ale jwenn Mari a?",
                options: [
                    "Gabriyèl",
                    "Mikaèl",
                    "Rafaèl",
                    "Uriyèl"
                ],
                answer: "Gabriyèl",
                explanation:
                    "Zanj Gabriyèl te pote mesaj la bay Mari nan Nazarèt.",
                reference: "Lik 1:26–27"
            },

            {
                question: "Ki non pitit Mari te anonse li t ap genyen?",
                options: [
                    "Jezi",
                    "Jan",
                    "Pyè",
                    "Jak"
                ],
                answer: "Jezi",
                explanation:
                    "Zanj lan te di Mari pou l rele pitit la Jezi.",
                reference: "Lik 1:31"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa imilite vle di?",
                options: [
                    "Rekonèt valè lòt moun epi pa mete tèt ou anlè tout moun",
                    "Panse ou toujou gen rezon",
                    "Refize aprann",
                    "Meprize lòt moun"
                ],
                answer: "Rekonèt valè lòt moun epi pa mete tèt ou anlè tout moun",
                explanation:
                    "Imilite gen rapò ak rekonèt limit ou epi trete lòt moun avèk respè.",
                source: "Istwa Mari Resevwa Mesaj Zanj lan"
            }
        ]
    },


    {
        id: 56,
        title: "Nesans Jezi",
        category: "Lavi Jezi",
        reference: "Lik 2:1–20",
        image: "images/nesans-jezi.jpg",
        audio: "audio/nesans-jezi.mp3",

        content: `
            <p>
                Nan epòk Anperè Ogis, yo te bay lòd pou moun yo al enskri
                nan vil fanmi yo. Jozèf te soti Nazarèt pou ale Betleyèm avèk Mari.
            </p>

            <p>
                Pandan yo te Betleyèm, Mari te fè pitit li. Li te vlope tibebe
                a epi li te mete li nan yon manje bèt paske pa t gen plas
                pou yo nan kay kote moun yo te rete.
            </p>

            <p>
                Nan menm zòn nan, te gen bèje ki t ap veye mouton yo lannuit.
                Yon zanj te parèt devan yo epi li te anonse nesans yon Sovè.
            </p>

            <p>
                Bèje yo te ale Betleyèm epi yo te jwenn Mari, Jozèf ak tibebe a.
                Apre sa, yo te rakonte lòt moun sa yo te tande ak sa yo te wè.
            </p>
        `,

        lesson:
            "Yon bon nouvèl ka pote espwa epi ankouraje moun pataje sa yo aprann ak lòt moun.",

        biblicalQuestions: [
            {
                question: "Nan ki vil Jezi te fèt?",
                options: [
                    "Betleyèm",
                    "Nazarèt",
                    "Jerizalèm",
                    "Jeriko"
                ],
                answer: "Betleyèm",
                explanation:
                    "Mari ak Jozèf te ale Betleyèm, kote Jezi te fèt.",
                reference: "Lik 2:4–7"
            },

            {
                question: "Ki moun ki te resevwa nouvèl nesans Jezi nan jaden yo?",
                options: [
                    "Bèje yo",
                    "Wa yo",
                    "Sòlda yo",
                    "Machann yo"
                ],
                answer: "Bèje yo",
                explanation:
                    "Zanj lan te anonse nesans Jezi bay bèje ki t ap veye mouton yo.",
                reference: "Lik 2:8–11"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa yon bèje fè?",
                options: [
                    "Li pran swen mouton",
                    "Li bati bato",
                    "Li dirije yon vil",
                    "Li fè zouti"
                ],
                answer: "Li pran swen mouton",
                explanation:
                    "Yon bèje se yon moun ki pran swen ak pwoteje yon bann mouton.",
                source: "Istwa Nesans Jezi"
            }
        ]
    },


    {
        id: 57,
        title: "Jezi Batize",
        category: "Lavi Jezi",
        reference: "Matye 3:13–17",
        image: "images/jezi-batize.jpg",
        audio: "audio/jezi-batize.mp3",

        content: `
            <p>
                Jan Batis t ap preche bò larivyè Jouden an epi li t ap batize
                moun ki te vin chanje fason yo t ap viv.
            </p>

            <p>
                Jezi te vini bò larivyè Jouden an pou Jan batize li. Jan te
                sezi paske li te santi Jezi pa t bezwen batèm nan menm fason an.
            </p>

            <p>
                Jezi te mande Jan fè sa paske li te vle akonpli sa ki dwat.
                Jan te dakò epi li te batize Jezi.
            </p>

            <p>
                Apre batèm nan, syèl la te louvri epi Lespri Bondye te desann
                tankou yon pijon. Yon vwa soti nan syèl la te pale sou Jezi.
            </p>
        `,

        lesson:
            "Imilite ak obeyisans ka montre volonte yon moun pou suiv yon bon chemen epi akonpli responsablite li.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te batize Jezi?",
                options: [
                    "Jan Batis",
                    "Pyè",
                    "Jak",
                    "Andre"
                ],
                answer: "Jan Batis",
                explanation:
                    "Jan Batis te batize Jezi nan larivyè Jouden.",
                reference: "Matye 3:13–16"
            },

            {
                question: "Ki fòm Lespri Bondye te pran lè li te desann?",
                options: [
                    "Tankou yon pijon",
                    "Tankou yon lyon",
                    "Tankou yon malfini",
                    "Tankou yon ti mouton"
                ],
                answer: "Tankou yon pijon",
                explanation:
                    "Levanjil Matye a di Lespri Bondye te desann tankou yon pijon.",
                reference: "Matye 3:16"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa obeyisans vle di?",
                options: [
                    "Fè sa yon règ oswa yon otorite mande lè li dwat pou suiv li",
                    "Refize tout konsèy",
                    "Fè sa ou vle sèlman",
                    "Pa janm koute lòt moun"
                ],
                answer: "Fè sa yon règ oswa yon otorite mande lè li dwat pou suiv li",
                explanation:
                    "Obeyisans se suiv yon enstriksyon oswa yon prensip ki dwe respekte.",
                source: "Istwa Jezi Batize"
            }
        ]
    },


    {
        id: 58,
        title: "Jezi Chwazi Douz Apot yo",
        category: "Lavi Jezi",
        reference: "Lik 6:12–16",
        image: "images/jezi-douz-apot.jpg",
        audio: "audio/jezi-douz-apot.mp3",

        content: `
            <p>
                Jezi te pase yon nuit ap priye anvan li te chwazi douz
                disip espesyal pou travay ansanm avè l.
            </p>

            <p>
                Li te rele douz nan disip li yo epi li te rele yo apot.
                Yo te gen diferan non, diferan orijin ak diferan pèsonalite.
            </p>

            <p>
                Pami yo te gen Simon, Jezi te rele Pyè, Andre, Jak, Jan,
                Filip, Batèlmi, Matye, Toma, Jak pitit Alfe, Simon ki te rele
                Zélòt, ak Jida pitit Jak.
            </p>

            <p>
                Apot yo te vin sèvi kòm moun ki te akonpaye Jezi epi aprann
                nan men li pandan ministè li.
            </p>
        `,

        lesson:
            "Travay ansanm mande pou moun ki diferan aprann kolabore epi sèvi yon objektif komen.",

        biblicalQuestions: [
            {
                question: "Konbyen apot Jezi te chwazi?",
                options: [
                    "Douz",
                    "Dis",
                    "Sèt",
                    "Ven"
                ],
                answer: "Douz",
                explanation:
                    "Jezi te chwazi douz nan disip li yo epi li te rele yo apot.",
                reference: "Lik 6:13"
            },

            {
                question: "Ki non Jezi te bay Simon?",
                options: [
                    "Pyè",
                    "Jan",
                    "Jak",
                    "Matye"
                ],
                answer: "Pyè",
                explanation:
                    "Jezi te rele Simon non Pyè.",
                reference: "Lik 6:14"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa yon ekip bezwen moun ki gen diferan kapasite?",
                options: [
                    "Diferan kapasite ka ede ekip la ranpli plizyè kalite travay",
                    "Pou pèsonn pa kolabore",
                    "Pou yon sèl moun fè tout bagay",
                    "Pou travay la pa gen objektif"
                ],
                answer: "Diferan kapasite ka ede ekip la ranpli plizyè kalite travay",
                explanation:
                    "Nan yon ekip, moun ki gen diferan kapasite ka konplete youn lòt.",
                source: "Istwa Jezi Chwazi Douz Apot yo"
            }
        ]
    },


    {
        id: 59,
        title: "Jezi Kalme Tanpèt la",
        category: "Mirak",
        reference: "Mak 4:35–41",
        image: "images/jezi-kalme-tanpet.jpg",
        audio: "audio/jezi-kalme-tanpet.mp3",

        content: `
            <p>
                Yon jou, Jezi te di disip li yo pou yo travèse lòt bò lak la.
                Yo te monte nan yon bato epi yo te kòmanse vwayaj la.
            </p>

            <p>
                Pandan yo te sou dlo a, yon gwo tanpèt leve. Vag yo te antre
                nan bato a epi disip yo te pè anpil.
            </p>

            <p>
                Jezi te nan bato a ap dòmi. Disip yo te reveye li epi yo te
                mande l si li pa t pran swen sa ki t ap rive yo.
            </p>

            <p>
                Jezi leve, li pale ak van an ak lanmè a. Dapre istwa a,
                van an sispann epi te gen yon gwo kalm.
            </p>
        `,

        lesson:
            "Nan moman laperèz, chèche kalm ak bon direksyon ka ede moun fè fas ak yon sitiyasyon difisil.",

        biblicalQuestions: [
            {
                question: "Ki sa ki te leve pandan disip yo te sou lak la?",
                options: [
                    "Yon gwo tanpèt",
                    "Yon dife",
                    "Yon tranbleman tè",
                    "Yon gwo sab"
                ],
                answer: "Yon gwo tanpèt",
                explanation:
                    "Yon gwo tanpèt te leve pandan Jezi ak disip li yo te sou dlo a.",
                reference: "Mak 4:37"
            },

            {
                question: "Ki sa Jezi te fè apre disip yo te reveye li?",
                options: [
                    "Li te pale ak van an ak lanmè a",
                    "Li te kite bato a",
                    "Li te naje ale",
                    "Li te bati yon lòt bato"
                ],
                answer: "Li te pale ak van an ak lanmè a",
                explanation:
                    "Jezi te bay van an ak lanmè a lòd, epi tanpèt la te sispann dapre istwa a.",
                reference: "Mak 4:39"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa li enpòtan pou rete kalm nan yon ijans?",
                options: [
                    "Sa ka ede moun reflechi epi pran desizyon pi klè",
                    "Sa fè danje disparèt otomatikman",
                    "Sa fè moun pa bezwen èd",
                    "Sa anpeche tout aksyon"
                ],
                answer: "Sa ka ede moun reflechi epi pran desizyon pi klè",
                explanation:
                    "Rete kalm ka ede yon moun konsantre sou sa li dwe fè nan yon sitiyasyon difisil.",
                source: "Istwa Jezi Kalme Tanpèt la"
            }
        ]
    },


    {
        id: 60,
        title: "Jezi Lave Pye Disip li yo",
        category: "Sèvis ak Imilite",
        reference: "Jan 13:1–17",
        image: "images/jezi-lave-pye.jpg",
        audio: "audio/jezi-lave-pye.mp3",

        content: `
            <p>
                Anvan fèt Pak la, Jezi te ansanm ak disip li yo. Pandan
                repa a, li te leve, li mete rad li sou kote epi li pran yon
                sèvyèt.
            </p>

            <p>
                Jezi te mete dlo nan yon basen epi li te kòmanse lave pye
                disip yo. Pyè te sezi epi li te mande Jezi poukisa li t ap
                fè yon travay konsa.
            </p>

            <p>
                Jezi te eksplike disip li yo li t ap sèvi yo pou ba yo yon
                egzanp sou fason yo dwe sèvi youn lòt.
            </p>

            <p>
                Apre li fin lave pye yo, Jezi te ankouraje disip yo suiv
                egzanp li epi sèvi youn lòt avèk imilite.
            </p>
        `,

        lesson:
            "Vrè lidèchip pa sèlman vle di dirije; li ka vle di sèvi lòt moun avèk imilite ak respè.",

        biblicalQuestions: [
            {
                question: "Ki sa Jezi te itilize pou lave pye disip yo?",
                options: [
                    "Dlo nan yon basen",
                    "Lwil",
                    "Sab",
                    "Diven"
                ],
                answer: "Dlo nan yon basen",
                explanation:
                    "Jezi te mete dlo nan yon basen epi li te lave pye disip yo.",
                reference: "Jan 13:4–5"
            },

            {
                question: "Ki leson Jezi te vle bay disip yo?",
                options: [
                    "Yo dwe sèvi youn lòt avèk imilite",
                    "Yo dwe chèche pouvwa",
                    "Yo pa dwe ede pèsonn",
                    "Yo dwe evite travay"
                ],
                answer: "Yo dwe sèvi youn lòt avèk imilite",
                explanation:
                    "Jezi te sèvi disip li yo kòm yon egzanp pou montre yo enpòtans sèvis ak imilite.",
                reference: "Jan 13:12–15"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa sèvis vle di?",
                options: [
                    "Ede lòt moun oswa fè yon travay ki itil",
                    "Toujou chèche avantaj pou tèt ou",
                    "Refize ede moun",
                    "Bay lòt moun tout responsablite"
                ],
                answer: "Ede lòt moun oswa fè yon travay ki itil",
                explanation:
                    "Sèvis se lè yon moun sèvi ak tan, kapasite oswa efò li pou ede lòt moun.",
                source: "Istwa Jezi Lave Pye Disip li yo"
            }
        ]
    },



    {
        id: 61,
        title: "Noe Bati Bwat la",
        category: "Obeyisans ak Lafwa",
        reference: "Jenèz 6:9–22",
        image: "images/noe-bati-bwat.jpg",
        audio: "audio/noe-bati-bwat.mp3",

        content: `
            <p>
                Nan tan Noe a, Bondye te wè anpil mechanste sou tè a. Men Noe
                te yon moun ki t ap mache avèk Bondye.
            </p>

            <p>
                Bondye te di Noe li t ap voye yon gwo inondasyon sou tè a.
                Li te bay Noe enstriksyon pou konstwi yon gwo bwat ki ta kapab
                pwoteje li, fanmi li ak bèt yo.
            </p>

            <p>
                Noe te fè tout sa Bondye te mande l fè. Li te konstwi bwat la
                dapre enstriksyon li te resevwa yo.
            </p>

            <p>
                Travay la te mande anpil tan ak efò, men Noe te kontinye
                obeyi. Istwa a montre enpòtans obeyisans menm lè yon travay
                mande anpil pasyans.
            </p>
        `,

        lesson:
            "Obeyisans ak pasyans ka ede yon moun rete fidèl ak yon bon misyon menm lè travay la difisil.",

        biblicalQuestions: [
            {
                question: "Ki moun Bondye te mande pou konstwi bwat la?",
                options: [
                    "Noe",
                    "Abraram",
                    "Izarak",
                    "Jakòb"
                ],
                answer: "Noe",
                explanation:
                    "Bondye te bay Noe enstriksyon pou konstwi yon gwo bwat pou pwoteje lavi pandan inondasyon an.",
                reference: "Jenèz 6:14"
            },

            {
                question: "Poukisa Noe te konstwi bwat la?",
                options: [
                    "Pou pwoteje lavi pandan inondasyon an",
                    "Pou fè yon palè",
                    "Pou vann li",
                    "Pou fè yon mache"
                ],
                answer: "Pou pwoteje lavi pandan inondasyon an",
                explanation:
                    "Bwat la te sèvi kòm mwayen pwoteksyon pou Noe, fanmi li ak bèt yo.",
                reference: "Jenèz 6:17–20"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa li enpòtan pou suiv enstriksyon lè yon travay gen plizyè etap?",
                options: [
                    "Pou ede travay la fèt byen",
                    "Pou fè travay la pi konfizyon",
                    "Pou evite aprann",
                    "Pou pa fini travay la"
                ],
                answer: "Pou ede travay la fèt byen",
                explanation:
                    "Bon enstriksyon ede moun konprann etap yo epi redui erè pandan travay la.",
                source: "Istwa Noe Bati Bwat la"
            }
        ]
    },


    {
        id: 62,
        title: "Lakay Noe Apre Inondasyon an",
        category: "Pwomès Bondye",
        reference: "Jenèz 8–9",
        image: "images/noe-apre-inondasyon.jpg",
        audio: "audio/noe-apre-inondasyon.mp3",

        content: `
            <p>
                Apre dlo inondasyon an te kòmanse bese, Noe ak tout moun ak
                bèt ki te nan bwat la te tann Bondye bay yo moman pou yo soti.
            </p>

            <p>
                Lè yo te kapab soti, Noe te bati yon lotèl epi li te adore
                Bondye. Fanmi li te kòmanse yon nouvo etap sou tè a.
            </p>

            <p>
                Bondye te fè yon alyans avèk Noe. Li te bay siy lakansyèl la
                kòm rapèl pwomès li pou l pa detwi tout tè a ankò ak yon
                inondasyon konsa.
            </p>

            <p>
                Lakansyèl la te vin yon siy vizib ki raple pwomès Bondye a
                nan istwa Noe a.
            </p>
        `,

        lesson:
            "Pwomès ak siy ka sèvi kòm rapèl sou angajman ak espwa pou yon nouvo kòmansman.",

        biblicalQuestions: [
            {
                question: "Ki siy Bondye te bay kòm rapèl alyans li avèk Noe?",
                options: [
                    "Lakansyèl",
                    "Zetwal",
                    "Lalin",
                    "Yon mòn"
                ],
                answer: "Lakansyèl",
                explanation:
                    "Bondye te mete lakansyèl la nan nyaj yo kòm siy alyans li avèk Noe.",
                reference: "Jenèz 9:12–13"
            },

            {
                question: "Ki sa Noe te bati apre li te soti nan bwat la?",
                options: [
                    "Yon lotèl",
                    "Yon palè",
                    "Yon gwo kay",
                    "Yon gwo bato"
                ],
                answer: "Yon lotèl",
                explanation:
                    "Noe te bati yon lotèl epi li te adore Bondye apre li te soti nan bwat la.",
                reference: "Jenèz 8:20"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa yon senbòl ye?",
                options: [
                    "Yon bagay ki reprezante yon lide oswa yon siy",
                    "Yon kalite manje",
                    "Yon machin",
                    "Yon bèt"
                ],
                answer: "Yon bagay ki reprezante yon lide oswa yon siy",
                explanation:
                    "Yon senbòl ka sèvi pou reprezante yon lide, yon pwomès oswa yon mesaj.",
                source: "Istwa Lakay Noe Apre Inondasyon an"
            }
        ]
    },


    {
        id: 63,
        title: "Abraram Resevwa Apèl Bondye",
        category: "Pèsonaj Biblik",
        reference: "Jenèz 12:1–9",
        image: "images/abram-apel-bondye.jpg",
        audio: "audio/abram-apel-bondye.mp3",

        content: `
            <p>
                Bondye te pale ak Abram epi li te mande l kite peyi li, fanmi
                li ak kay papa li pou ale nan yon peyi Bondye t ap montre li.
            </p>

            <p>
                Abram te pran madanm li Sarayi ansanm ak Lot, neve li, epi
                li te kòmanse vwayaj la.
            </p>

            <p>
                Abram pa t konnen tout detay sou kote vwayaj la t ap mennen l,
                men li te fè konfyans ak direksyon Bondye te ba li.
            </p>

            <p>
                Lè li rive nan peyi Kanaran, Abram te kontinye deplase epi
                li te bati lotèl pou adore Bondye.
            </p>
        `,

        lesson:
            "Lafwa ka mande pou yon moun avanse avèk konfyans menm lè li poko konnen tout detay sou pwochen etap la.",

        biblicalQuestions: [
            {
                question: "Ki moun Bondye te rele pou kite peyi li?",
                options: [
                    "Abram",
                    "Noe",
                    "Izarak",
                    "Jozèf"
                ],
                answer: "Abram",
                explanation:
                    "Bondye te rele Abram pou kite peyi li epi ale nan peyi li t ap montre li.",
                reference: "Jenèz 12:1"
            },

            {
                question: "Ki moun Abram te pran avèk li nan vwayaj la?",
                options: [
                    "Sarayi ak Lot",
                    "Rit ak Naomi",
                    "Moyiz ak Arawon",
                    "David ak Jonatan"
                ],
                answer: "Sarayi ak Lot",
                explanation:
                    "Abram te pran Sarayi, madanm li, ansanm ak Lot, neve li.",
                reference: "Jenèz 12:4–5"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa konfyans vle di?",
                options: [
                    "Kwè yon moun oswa yon bagay merite konfyans",
                    "Pa janm koute",
                    "Toujou pè",
                    "Refize aprann"
                ],
                answer: "Kwè yon moun oswa yon bagay merite konfyans",
                explanation:
                    "Konfyans se lè yon moun kwè nan yon lòt moun oswa nan yon bagay li konsidere serye.",
                source: "Istwa Abraram Resevwa Apèl Bondye"
            }
        ]
    },


    {
        id: 64,
        title: "Twa Vizitè Rive Lakay Abraram",
        category: "Lafwa ak Ospitalite",
        reference: "Jenèz 18:1–15",
        image: "images/abram-twa-vizite.jpg",
        audio: "audio/abram-twa-vizite.mp3",

        content: `
            <p>
                Yon jou, Abraram te chita bò pòt tant li lè li wè twa vizitè
                k ap vini. Li kouri al rankontre yo epi li envite yo repoze.
            </p>

            <p>
                Abraram te mande Sara prepare manje pandan li menm li te
                prepare pou resevwa vizitè yo.
            </p>

            <p>
                Pandan yo t ap pale, vizitè yo te anonse Sara t ap gen yon
                pitit. Sara te sezi paske li te deja granmoun.
            </p>

            <p>
                Istwa a mete aksan sou ospitalite Abraram ak sou pwomès Bondye
                pou li ak Sara.
            </p>
        `,

        lesson:
            "Resevwa moun avèk respè ak jenewozite se yon fason pou montre bonte ak ospitalite.",

        biblicalQuestions: [
            {
                question: "Konbyen vizitè Abraram te wè devan tant li?",
                options: [
                    "Twa",
                    "De",
                    "Senk",
                    "Douz"
                ],
                answer: "Twa",
                explanation:
                    "Jenèz 18 rakonte Abraram te wè twa mesye devan li.",
                reference: "Jenèz 18:2"
            },

            {
                question: "Ki moun ki te prepare manje pou vizitè yo?",
                options: [
                    "Abraram ak Sara",
                    "David ak Jonatan",
                    "Moyiz ak Arawon",
                    "Jakòb ak Jozèf"
                ],
                answer: "Abraram ak Sara",
                explanation:
                    "Abraram te òganize resepsyon an epi Sara te prepare manje dapre enstriksyon li.",
                reference: "Jenèz 18:6–8"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa ospitalite vle di?",
                options: [
                    "Resevwa moun avèk akey ak jantiyès",
                    "Evite tout moun",
                    "Refize ede moun",
                    "Pale mal de vizitè"
                ],
                answer: "Resevwa moun avèk akey ak jantiyès",
                explanation:
                    "Ospitalite se fason yon moun resevwa epi trete envite avèk respè ak jantiyès.",
                source: "Istwa Twa Vizitè Rive Lakay Abraram"
            }
        ]
    },


    {
        id: 65,
        title: "Nesans Izarak",
        category: "Pwomès Bondye",
        reference: "Jenèz 21:1–7",
        image: "images/nesans-izarak.jpg",
        audio: "audio/nesans-izarak.mp3",

        content: `
            <p>
                Bondye te sonje pwomès li te fè Abraram ak Sara. Sara te vin
                ansent epi li te fè yon pitit gason nan moman Bondye te anonse a.
            </p>

            <p>
                Abraram te rele pitit la Izarak, jan Bondye te mande li.
                Nesans Izarak te pote anpil lajwa pou fanmi an.
            </p>

            <p>
                Sara te di Bondye te ba li yon gwo rezon pou li kontan.
                Li te sezi wè pwomès li te tann lan vin reyalite.
            </p>

            <p>
                Fanmi an te suiv enstriksyon Bondye yo epi yo te pran swen
                Izarak kòm pitit pwomès la.
            </p>
        `,

        lesson:
            "Pasyans ka difisil, men yon pwomès ak yon objektif ka ede moun rete fèm pandan y ap tann.",

        biblicalQuestions: [
            {
                question: "Ki non pitit Abraram ak Sara te genyen?",
                options: [
                    "Izarak",
                    "Jakòb",
                    "Jozèf",
                    "Ezayi"
                ],
                answer: "Izarak",
                explanation:
                    "Sara te fè yon pitit gason epi Abraram te rele li Izarak.",
                reference: "Jenèz 21:3"
            },

            {
                question: "Ki jan Sara te santi lè Izarak te fèt?",
                options: [
                    "Li te kontan anpil",
                    "Li te fache",
                    "Li te pè kite kay la",
                    "Li te vle kouri ale"
                ],
                answer: "Li te kontan anpil",
                explanation:
                    "Nesans Izarak te pote lajwa pou Sara ak fanmi an.",
                reference: "Jenèz 21:6"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa pasyans enpòtan lè yon moun ap tann yon bagay?",
                options: [
                    "Li ede moun rete kalm epi kontinye avanse",
                    "Li fè tan sispann",
                    "Li fè tout bagay rive touswit",
                    "Li anpeche moun reflechi"
                ],
                answer: "Li ede moun rete kalm epi kontinye avanse",
                explanation:
                    "Pasyans ede moun jere tan ak difikilte pandan y ap tann yon rezilta.",
                source: "Istwa Nesans Izarak"
            }
        ]
    },


    {
        id: 66,
        title: "Jakòb Resevwa Benediksyon Izarak",
        category: "Fanmi Biblik",
        reference: "Jenèz 27:1–40",
        image: "images/jakob-benediksyon.jpg",
        audio: "audio/jakob-benediksyon.mp3",

        content: `
            <p>
                Izarak te vin granmoun epi li te vle bay pitit li Ezayi yon
                benediksyon espesyal. Men Rebeka te tande sa epi li te prepare
                Jakòb pou resevwa benediksyon an.
            </p>

            <p>
                Jakòb te prezante tèt li devan papa li kòm si li te Ezayi.
                Izarak pa t wè byen e li te vin kwè se Ezayi ki te devan li.
            </p>

            <p>
                Izarak te bay Jakòb benediksyon li te prepare pou pi gran pitit
                la. Lè Ezayi retounen, li te konprann sa ki te rive.
            </p>

            <p>
                Istwa a montre kijan desizyon fanmi yo ak fason moun aji ka
                pote konsekans ki dire lontan.
            </p>
        `,

        lesson:
            "Desizyon ki fèt san onètete ka kreye gwo pwoblèm nan relasyon fanmi epi pote konsekans alontèm.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te resevwa benediksyon Izarak la?",
                options: [
                    "Jakòb",
                    "Ezayi",
                    "Jozèf",
                    "Benjamen"
                ],
                answer: "Jakòb",
                explanation:
                    "Jakòb te prezante tèt li kòm Ezayi epi li te resevwa benediksyon Izarak la.",
                reference: "Jenèz 27:27–29"
            },

            {
                question: "Ki moun ki te manman Jakòb?",
                options: [
                    "Rebeka",
                    "Sara",
                    "Rachèl",
                    "Leya"
                ],
                answer: "Rebeka",
                explanation:
                    "Rebeka te manman Jakòb ak Ezayi.",
                reference: "Jenèz 25:21–26"
            }
        ],

        generalQuestions: [
            {
                question: "Ki konsekans yon manti ka genyen nan yon fanmi?",
                options: [
                    "Li ka kraze konfyans epi kreye konfli",
                    "Li toujou rezoud tout pwoblèm",
                    "Li fè moun vin pi pre otomatikman",
                    "Li pa janm gen okenn efè"
                ],
                answer: "Li ka kraze konfyans epi kreye konfli",
                explanation:
                    "Manti ka fè moun pèdi konfyans youn nan lòt epi li ka kreye gwo konfli.",
                source: "Istwa Jakòb Resevwa Benediksyon Izarak"
            }
        ]
    },


    {
        id: 67,
        title: "Jakòb Rèv Eskalye a",
        category: "Rèv ak Revelasyon",
        reference: "Jenèz 28:10–22",
        image: "images/jakob-eskalye.jpg",
        audio: "audio/jakob-eskalye.mp3",

        content: `
            <p>
                Jakòb te kite lakay li epi li te kòmanse vwayaje pou ale
                lakay fanmi manman li. Lè l rive yon kote, li te pase nwit la
                deyò epi li te sèvi ak yon wòch kòm zòrye.
            </p>

            <p>
                Pandan li t ap dòmi, Jakòb te fè yon rèv. Li te wè yon bagay
                ki sanble ak yon eskalye ki soti sou tè a rive nan syèl la.
            </p>

            <p>
                Nan rèv la, Bondye te pale avè l epi li te raple Jakòb pwomès
                li te fè Abraram ak Izarak.
            </p>

            <p>
                Lè Jakòb leve, li te sezi anpil. Li te pran wòch li te itilize
                kòm zòrye a epi li te mete l kòm yon siy pou sonje moman an.
            </p>
        `,

        lesson:
            "Nan moman chanjman ak ensètitid, moun ka jwenn ankourajman nan pwomès ak espwa ki gide yo.",

        biblicalQuestions: [
            {
                question: "Ki sa Jakòb te wè nan rèv li?",
                options: [
                    "Yon eskalye ki soti sou tè a rive nan syèl la",
                    "Yon gwo bato",
                    "Yon palè an lò",
                    "Yon lame"
                ],
                answer: "Yon eskalye ki soti sou tè a rive nan syèl la",
                explanation:
                    "Jakòb te wè yon eskalye oswa yon nechèl ki te konekte tè a ak syèl la.",
                reference: "Jenèz 28:12"
            },

            {
                question: "Ki sa Jakòb te itilize kòm zòrye?",
                options: [
                    "Yon wòch",
                    "Yon dra",
                    "Yon sak",
                    "Yon bwa"
                ],
                answer: "Yon wòch",
                explanation:
                    "Jakòb te pran youn nan wòch ki te nan plas la epi li te mete l anba tèt li.",
                reference: "Jenèz 28:11"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa moun konn sèvi ak siy pou sonje yon evènman?",
                options: [
                    "Pou raple yo sa ki te pase",
                    "Pou efase memwa",
                    "Pou kache enfòmasyon",
                    "Pou evite reflechi"
                ],
                answer: "Pou raple yo sa ki te pase",
                explanation:
                    "Yon siy oswa yon objè ka sèvi kòm yon rapèl sou yon evènman enpòtan.",
                source: "Istwa Jakòb Rèv Eskalye a"
            }
        ]
    },


    {
        id: 68,
        title: "Jakòb Travay Pou Rachèl",
        category: "Fanmi ak Travay",
        reference: "Jenèz 29:1–30",
        image: "images/jakob-rachel.jpg",
        audio: "audio/jakob-rachel.mp3",

        content: `
            <p>
                Jakòb te rive nan peyi fanmi manman li epi li te rankontre
                Rachèl bò yon pi. Li te mennen l lakay Laban, papa Rachèl.
            </p>

            <p>
                Jakòb te renmen Rachèl epi li te dakò travay pandan plizyè ane
                pou Laban pou l te ka marye avèk li.
            </p>

            <p>
                Lè tan travay la fini, Laban te bay Jakòb Leya olye de Rachèl.
                Jakòb te sezi anpil lè li dekouvri sa.
            </p>

            <p>
                Apre sa, Jakòb te dakò travay ankò pou li te ka marye ak
                Rachèl. Istwa a montre anpil difikilte ki te genyen nan
                relasyon Jakòb ak Laban.
            </p>
        `,

        lesson:
            "Travay ak relasyon mande klète, onètete ak pasyans, paske desizyon moun pran ka gen gwo konsekans.",

        biblicalQuestions: [
            {
                question: "Ki moun Jakòb te renmen?",
                options: [
                    "Rachèl",
                    "Leya",
                    "Rebeka",
                    "Sara"
                ],
                answer: "Rachèl",
                explanation:
                    "Jakòb te renmen Rachèl e li te travay pou Laban pou li te ka marye avèk li.",
                reference: "Jenèz 29:18"
            },

            {
                question: "Ki moun Laban te bay Jakòb an premye?",
                options: [
                    "Leya",
                    "Rachèl",
                    "Sara",
                    "Debora"
                ],
                answer: "Leya",
                explanation:
                    "Laban te bay Jakòb Leya an premye olye de Rachèl.",
                reference: "Jenèz 29:23–25"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa yon akò travay ta dwe klè?",
                options: [
                    "Pou tout moun konnen sa yo dakò fè",
                    "Pou evite nenpòt kominikasyon",
                    "Pou chanje règ yo chak jou",
                    "Pou kache enfòmasyon"
                ],
                answer: "Pou tout moun konnen sa yo dakò fè",
                explanation:
                    "Yon akò klè ede moun konprann responsablite ak kondisyon yo.",
                source: "Istwa Jakòb Travay Pou Rachèl"
            }
        ]
    },


    {
        id: 69,
        title: "Jakòb Chanje Non li pou Izrayèl",
        category: "Chanjman ak Lafwa",
        reference: "Jenèz 32:22–32",
        image: "images/jakob-izrayel.jpg",
        audio: "audio/jakob-izrayel.mp3",

        content: `
            <p>
                Pandan Jakòb t ap retounen lakay li, li te prepare pou l
                rankontre Ezayi, frè li. Li te pase yon nuit pou kont li bò
                larivyè Jabòk.
            </p>

            <p>
                Pandan nuit la, Jakòb te lite ak yon moun jiskaske jou te prèt
                pou leve. Apre eksperyans sa a, li te resevwa yon nouvo non.
            </p>

            <p>
                Yo te rele l Izrayèl. Istwa a prezante chanjman non sa a kòm
                yon etap enpòtan nan lavi Jakòb.
            </p>

            <p>
                Apre sa, Jakòb te kontinye vwayaj li pou l rankontre frè li
                Ezayi.
            </p>
        `,

        lesson:
            "Lavi ka gen moman ki chanje fason yon moun wè tèt li ak responsablite li.",

        biblicalQuestions: [
            {
                question: "Ki nouvo non Jakòb te resevwa?",
                options: [
                    "Izrayèl",
                    "Abraram",
                    "Edom",
                    "Benjamen"
                ],
                answer: "Izrayèl",
                explanation:
                    "Apre eksperyans li bò larivyè Jabòk la, yo te rele Jakòb Izrayèl.",
                reference: "Jenèz 32:28"
            },

            {
                question: "Ki frè Jakòb te prepare pou l rankontre?",
                options: [
                    "Ezayi",
                    "Jozèf",
                    "Benjamen",
                    "Laban"
                ],
                answer: "Ezayi",
                explanation:
                    "Jakòb te prepare pou l rankontre Ezayi, frè li, pandan li t ap retounen lakay li.",
                reference: "Jenèz 32:6–8"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa yon nouvo non oswa yon nouvo tit ka reprezante?",
                options: [
                    "Yon nouvo etap oswa yon nouvo responsablite",
                    "Yon fason pou efase tout souvni",
                    "Yon kalite manje",
                    "Yon jwèt"
                ],
                answer: "Yon nouvo etap oswa yon nouvo responsablite",
                explanation:
                    "Nan anpil sitiyasyon, yon nouvo non oswa tit ka sèvi kòm siy yon chanjman nan lavi yon moun.",
                source: "Istwa Jakòb Chanje Non li pou Izrayèl"
            }
        ]
    },


    {
        id: 70,
        title: "Pitit Izrayèl yo Rive nan Dezè Sinayi",
        category: "Vwayaj Biblik",
        reference: "Egzòd 19:1–25",
        image: "images/sinayi.jpg",
        audio: "audio/sinayi.mp3",

        content: `
            <p>
                Apre pèp Izrayèl la te kite peyi Lejip, yo te rive nan dezè
                Sinayi. Yo te mete kan yo devan mòn nan.
            </p>

            <p>
                Moyiz te monte sou mòn nan pou rankontre Bondye. Bondye te
                pale avè l sou alyans li t ap fè avèk pèp la.
            </p>

            <p>
                Pèp la te prepare tèt li pou rankontre moman espesyal sa a.
                Yo te resevwa enstriksyon sou fason pou yo pwoche bò mòn nan.
            </p>

            <p>
                Istwa a montre Sinayi kòm yon kote enpòtan kote Bondye te
                bay pèp Izrayèl la direksyon ak lwa.
            </p>
        `,

        lesson:
            "Bon preparasyon ak respè enpòtan lè yon moun oswa yon kominote ap antre nan yon moman ki gen gwo responsablite.",

        biblicalQuestions: [
            {
                question: "Ki kote pèp Izrayèl la te mete kan apre yo te kite Lejip?",
                options: [
                    "Devan mòn Sinayi",
                    "Nan Jeriko",
                    "Nan Jerizalèm",
                    "Nan Betleyèm"
                ],
                answer: "Devan mòn Sinayi",
                explanation:
                    "Pèp la te rive nan dezè Sinayi epi yo te mete kan yo devan mòn nan.",
                reference: "Egzòd 19:1–2"
            },

            {
                question: "Ki moun ki te monte sou mòn nan?",
                options: [
                    "Moyiz",
                    "Jozye",
                    "David",
                    "Arawon sèlman"
                ],
                answer: "Moyiz",
                explanation:
                    "Moyiz te monte sou mòn nan pou rankontre Bondye epi resevwa mesaj pou pèp la.",
                reference: "Egzòd 19:3"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa preparasyon enpòtan anvan yon gwo evènman?",
                options: [
                    "Li ede moun konnen sa yo dwe fè",
                    "Li fè moun bliye objektif la",
                    "Li retire tout responsablite",
                    "Li fè okenn plan pa nesesè"
                ],
                answer: "Li ede moun konnen sa yo dwe fè",
                explanation:
                    "Preparasyon ede moun konprann règ, etap ak responsablite ki nesesè yo.",
                source: "Istwa Pitit Izrayèl yo Rive nan Dezè Sinayi"
            }
        ]
    },


    {
        id: 71,
        title: "Onè Rut Pou Naomi",
        category: "Fidelite ak Fanmi",
        reference: "Rut 1:1–18",
        image: "images/rut-naomi.jpg",
        audio: "audio/rut-naomi.mp3",

        content: `
            <p>
                Naomi te pèdi mari li ak pitit gason li yo pandan li te rete
                nan peyi Moab. Li te deside retounen nan peyi Jida.
            </p>

            <p>
                Bèlfi Naomi yo te rele Rit ak Òpa. Naomi te ankouraje yo
                retounen lakay yo.
            </p>

            <p>
                Òpa te retounen, men Rit te chwazi rete avèk Naomi. Li te
                deside ale ansanm avè l nan peyi Jida.
            </p>

            <p>
                Rit te kite peyi li ak moun li te konnen pou l akonpaye Naomi.
                Desizyon sa a te montre gwo fidelite li anvè bèlmè li.
            </p>
        `,

        lesson:
            "Fidelite vle di rete bò kote yon moun epi soutni li menm lè sitiyasyon an mande sakrifis.",

        biblicalQuestions: [
            {
                question: "Ki bèlfi Naomi ki te chwazi rete avèk li?",
                options: [
                    "Rit",
                    "Òpa",
                    "Rachèl",
                    "Miryam"
                ],
                answer: "Rit",
                explanation:
                    "Rit te chwazi akonpaye Naomi lè Naomi t ap retounen nan peyi Jida.",
                reference: "Rut 1:16–17"
            },

            {
                question: "Ki peyi Naomi te deside retounen ladan l?",
                options: [
                    "Peyi Jida",
                    "Peyi Lejip",
                    "Peyi Moab",
                    "Peyi Babilòn"
                ],
                answer: "Peyi Jida",
                explanation:
                    "Naomi te retounen nan peyi Jida apre li te pase yon peryòd nan Moab.",
                reference: "Rut 1:7"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa fidelite vle di?",
                options: [
                    "Rete serye ak yon moun oswa yon angajman",
                    "Abandone tout moun",
                    "Chanje desizyon chak jou",
                    "Pa janm ede lòt moun"
                ],
                answer: "Rete serye ak yon moun oswa yon angajman",
                explanation:
                    "Fidelite vle di rete serye, fidèl ak angajman oswa relasyon yon moun genyen.",
                source: "Istwa Onè Rut Pou Naomi"
            }
        ]
    },


    {
        id: 72,
        title: "Rut Ranmase Ble nan Jaden an",
        category: "Travay ak Jenewozite",
        reference: "Rut 2:1–23",
        image: "images/rut-jaden.jpg",
        audio: "audio/rut-jaden.mp3",

        content: `
            <p>
                Apre Rit ak Naomi te rive Betleyèm, Rit te bezwen jwenn manje
                pou yo. Li te ale nan yon jaden pou ranmase grenn ki te rete
                dèyè moun k ap rekòlte yo.
            </p>

            <p>
                Jaden an te pou yon nonm ki te rele Boaz, yon fanmi Elimelèk,
                mari Naomi ki te mouri.
            </p>

            <p>
                Boaz te remake Rit epi li te aprann jan li te pran swen Naomi.
                Li te bay sèvitè li yo enstriksyon pou yo pa anpeche Rit ranmase
                manje.
            </p>

            <p>
                Rit te retounen lakay Naomi ak manje li te ranmase. Naomi te
                kontan aprann Boaz te trete Rit avèk jantiyès.
            </p>
        `,

        lesson:
            "Travay onèt ak jenewozite ka ede moun ki nan bezwen jwenn sipò ak diyite.",

        biblicalQuestions: [
            {
                question: "Ki travay Rit te fè nan jaden an?",
                options: [
                    "Li te ranmase grenn ki te rete dèyè",
                    "Li te plante pye rezen",
                    "Li te bati yon kay",
                    "Li te gade bèt"
                ],
                answer: "Li te ranmase grenn ki te rete dèyè",
                explanation:
                    "Rit te ale dèyè moun k ap rekòlte yo pou ranmase grenn ki te rete nan jaden an.",
                reference: "Rut 2:2–3"
            },

            {
                question: "Ki moun ki te posede jaden an?",
                options: [
                    "Boaz",
                    "Elimelèk",
                    "Eli",
                    "Jozèf"
                ],
                answer: "Boaz",
                explanation:
                    "Jaden kote Rit t ap ranmase a te pou Boaz.",
                reference: "Rut 2:3"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa travay enpòtan pou yon moun ki bezwen sipòte tèt li?",
                options: [
                    "Li ka ede moun jwenn manje ak lòt bezwen",
                    "Li fè moun pa bezwen repo",
                    "Li retire tout responsablite",
                    "Li fè moun pa bezwen aprann"
                ],
                answer: "Li ka ede moun jwenn manje ak lòt bezwen",
                explanation:
                    "Travay ka ede yon moun jwenn resous li bezwen pou viv epi pran swen fanmi li.",
                source: "Istwa Rut Ranmase Ble nan Jaden an"
            }
        ]
    },


    {
        id: 73,
        title: "Estè Vin Rèn",
        category: "Pèsonaj Biblik",
        reference: "Estè 2:1–18",
        image: "images/ester-ren.jpg",
        audio: "audio/ester-ren.jpg",

        content: `
            <p>
                Apre wa Asyeris te bezwen chwazi yon nouvo rèn, yo te mennen
                anpil jèn fi nan palè a. Pami yo te gen Estè, yon jèn fi jwif
                ki te grandi anba swen Mòdekayi.
            </p>

            <p>
                Estè te jwenn favè devan moun ki t ap pran swen jèn fi yo.
                Li te respekte konsèy Mòdekayi te ba li.
            </p>

            <p>
                Wa a te renmen Estè plis pase lòt jèn fi yo epi li te chwazi
                li kòm rèn.
            </p>

            <p>
                Estè te antre nan yon pozisyon enpòtan san anpil moun nan palè
                a pa t konnen orijin jwif li.
            </p>
        `,

        lesson:
            "Yon moun ka rive nan yon pozisyon enpòtan epi sèvi ak opòtinite sa a avèk sajès ak responsablite.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te vin rèn?",
                options: [
                    "Estè",
                    "Rit",
                    "Debora",
                    "Sara"
                ],
                answer: "Estè",
                explanation:
                    "Wa Asyeris te chwazi Estè kòm rèn.",
                reference: "Estè 2:17"
            },

            {
                question: "Ki moun ki te pran swen Estè lè li te piti?",
                options: [
                    "Mòdekayi",
                    "Boaz",
                    "Eli",
                    "Samyèl"
                ],
                answer: "Mòdekayi",
                explanation:
                    "Mòdekayi te pran Estè kòm pitit fi pa li epi li te pran swen li.",
                reference: "Estè 2:7"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa responsablite vle di?",
                options: [
                    "Devwa yon moun dwe pran swen oswa akonpli",
                    "Yon jwèt",
                    "Yon kalite manje",
                    "Yon vwayaj"
                ],
                answer: "Devwa yon moun dwe pran swen oswa akonpli",
                explanation:
                    "Responsablite se yon travay oswa yon devwa yon moun dwe pran swen avèk serye.",
                source: "Istwa Estè Vin Rèn"
            }
        ]
    },


    {
        id: 74,
        title: "Estè Pale Pou Pèp li",
        category: "Kouraj ak Jistis",
        reference: "Estè 4–7",
        image: "images/ester-pale.jpg",
        audio: "audio/ester-pale.mp3",

        content: `
            <p>
                Mòdekayi te aprann yon plan ki te mete lavi anpil jwif an danje.
                Li te voye mesaj bay Estè pou mande li pale ak wa a.
            </p>

            <p>
                Estè te konnen li pa t kapab antre devan wa a san envitasyon
                san li pa riske lavi li. Malgre sa, li te deside aji.
            </p>

            <p>
                Li te envite wa a ak Aman nan yon fèt. Pandan evènman yo,
                Estè te pale ak wa a sou danje ki te menase pèp li.
            </p>

            <p>
                Wa a te pran aksyon kont plan Aman an epi yo te bay jwif yo
                yon fason pou defann tèt yo.
            </p>
        `,

        lesson:
            "Kouraj ka vle di pale avèk sajès pou defann moun ki nan danje oswa ki bezwen èd.",

        biblicalQuestions: [
            {
                question: "Pou kiyès Estè te pale devan wa a?",
                options: [
                    "Pou pèp jwif la",
                    "Pou lame Filisten an",
                    "Pou wa peyi Lejip la",
                    "Pou moun Moab yo"
                ],
                answer: "Pou pèp jwif la",
                explanation:
                    "Estè te pale avèk wa a pou revele danje ki te menase pèp li.",
                reference: "Estè 7:3–4"
            },

            {
                question: "Ki moun ki te prepare plan ki te mete jwif yo an danje?",
                options: [
                    "Aman",
                    "Boaz",
                    "Mòdekayi",
                    "Neemi"
                ],
                answer: "Aman",
                explanation:
                    "Aman te prepare yon plan kont jwif yo, men plan li a te finalman echwe.",
                reference: "Estè 3:5–6"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa kouraj vle di?",
                options: [
                    "Fè sa ki nesesè malgre laperèz oswa difikilte",
                    "Pa janm reflechi",
                    "Toujou kouri lwen pwoblèm",
                    "Pa janm ede moun"
                ],
                answer: "Fè sa ki nesesè malgre laperèz oswa difikilte",
                explanation:
                    "Kouraj se kapasite pou aji avèk detèminasyon menm lè gen laperèz oswa difikilte.",
                source: "Istwa Estè Pale Pou Pèp li"
            }
        ]
    },


    {
        id: 75,
        title: "Neemi Tande Sou Miray Jerizalèm",
        category: "Lidèchip ak Lapriyè",
        reference: "Neemi 1:1–11",
        image: "images/neemi-miray.jpg",
        audio: "audio/neemi-miray.mp3",

        content: `
            <p>
                Neemi t ap sèvi kòm sèvitè wa peyi Pès la lè li te resevwa
                nouvèl sou Jerizalèm. Li te aprann miray vil la te kraze epi
                pòtay yo te boule.
            </p>

            <p>
                Lè Neemi tande nouvèl la, li te tris anpil. Li te chita,
                li te kriye epi li te priye Bondye.
            </p>

            <p>
                Neemi te sonje pwomès Bondye yo epi li te mande Bondye ede li
                jwenn favè devan wa a.
            </p>

            <p>
                Priyè Neemi a te vin prepare l pou yon pwojè li t ap mande
                pèmisyon pou antreprann.
            </p>
        `,

        lesson:
            "Lè yon moun dekouvri yon gwo pwoblèm, li ka pran tan pou reflechi, priye epi prepare yon plan pou ede.",

        biblicalQuestions: [
            {
                question: "Ki nouvèl Neemi te resevwa sou Jerizalèm?",
                options: [
                    "Miray yo te kraze",
                    "Tanp lan te vin pi gwo",
                    "Wa a te deplase la",
                    "Vil la te vid nèt"
                ],
                answer: "Miray yo te kraze",
                explanation:
                    "Neemi te aprann miray Jerizalèm yo te kraze epi pòtay yo te boule.",
                reference: "Neemi 1:3"
            },

            {
                question: "Kisa Neemi te fè lè li te tande nouvèl la?",
                options: [
                    "Li te kriye epi priye",
                    "Li te ri",
                    "Li te kite travay li touswit",
                    "Li te fè yon fèt"
                ],
                answer: "Li te kriye epi priye",
                explanation:
                    "Neemi te chita, li te kriye, li te fè jèn epi li te priye Bondye.",
                reference: "Neemi 1:4"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa li itil pou konprann yon pwoblèm anvan chèche yon solisyon?",
                options: [
                    "Pou konnen ki aksyon ki nesesè",
                    "Pou fè pwoblèm nan pi gwo",
                    "Pou evite tout plan",
                    "Pou pa pale ak pèsonn"
                ],
                answer: "Pou konnen ki aksyon ki nesesè",
                explanation:
                    "Konprann pwoblèm nan ede yon moun chwazi etap ki pi apwopriye pou reponn.",
                source: "Istwa Neemi Tande Sou Miray Jerizalèm"
            }
        ]
    },


    {
        id: 76,
        title: "Neemi Rebati Miray Jerizalèm",
        category: "Lidèchip ak Travay",
        reference: "Neemi 2–6",
        image: "images/neemi-rebati-miray.jpg",
        audio: "audio/neemi-rebati-miray.mp3",

        content: `
            <p>
                Apre Neemi te jwenn pèmisyon wa a, li te ale Jerizalèm pou
                verifye eta miray vil la.
            </p>

            <p>
                Li te pale ak moun nan vil la epi li te ankouraje yo pou yo
                rebati miray la. Plizyè fanmi ak gwoup moun te pran yon pati
                nan travay la.
            </p>

            <p>
                Pandan travay la, kèk moun te eseye dekouraje Neemi ak
                travayè yo. Men Neemi te òganize pèp la pou yo kontinye travay
                pandan yo te rete vijilan.
            </p>

            <p>
                Travay la te fini malgre opozisyon ak difikilte. Miray
                Jerizalèm nan te rebati.
            </p>
        `,

        lesson:
            "Yon gwo travay ka vin pi fasil lè moun divize responsablite yo, kolabore epi rete konsantre sou objektif la.",

        biblicalQuestions: [
            {
                question: "Ki sa Neemi te ede pèp la rebati?",
                options: [
                    "Miray Jerizalèm",
                    "Palè Farawon",
                    "Bwat Noe",
                    "Tanp Samari"
                ],
                answer: "Miray Jerizalèm",
                explanation:
                    "Neemi te òganize travay la pou rebati miray ki te kraze yo.",
                reference: "Neemi 2:17–18"
            },

            {
                question: "Ki sa pèp la te fè pandan yo t ap rebati miray la?",
                options: [
                    "Yo te travay ansanm",
                    "Yo te abandone vil la",
                    "Yo te kraze lòt miray",
                    "Yo te sispann tout travay"
                ],
                answer: "Yo te travay ansanm",
                explanation:
                    "Plizyè gwoup moun te pran diferan pati nan travay konstriksyon an.",
                reference: "Neemi 3:1–32"
            }
        ],

        generalQuestions: [
            {
                question: "Ki avantaj travay an ekip ka genyen?",
                options: [
                    "Li pèmèt moun pataje travay ak kapasite yo",
                    "Li fè okenn moun pa travay",
                    "Li toujou kreye dezòd",
                    "Li anpeche planifikasyon"
                ],
                answer: "Li pèmèt moun pataje travay ak kapasite yo",
                explanation:
                    "Travay an ekip pèmèt moun pataje responsablite epi sèvi ak diferan kapasite.",
                source: "Istwa Neemi Rebati Miray Jerizalèm"
            }
        ]
    },


    {
        id: 77,
        title: "Jonas Ale Niniv",
        category: "Pwofèt ak Obeyisans",
        reference: "Jonas 1–3",
        image: "images/jonas-niniv.jpg",
        audio: "audio/jonas-niniv.mp3",

        content: `
            <p>
                Bondye te voye Jonas al Niniv pou anonse yon mesaj. Men Jonas
                te eseye ale nan yon lòt direksyon olye li suiv lòd la.
            </p>

            <p>
                Apre plizyè evènman pandan vwayaj li, Jonas te finalman rive
                Niniv. Li te antre nan vil la epi li te anonse mesaj Bondye a.
            </p>

            <p>
                Moun Niniv yo te tande mesaj la epi yo te reyaji avèk repantans.
                Wa a te bay lòd pou pèp la fè jèn epi vire do bay move aksyon.
            </p>

            <p>
                Istwa a montre yon vil antye te reponn ak yon mesaj pwofèt la
                te pote ba yo.
            </p>
        `,

        lesson:
            "Yon mesaj ki ankouraje moun chanje move konpòtman ka bay yon kominote opòtinite pou korije direksyon li.",

        biblicalQuestions: [
            {
                question: "Nan ki vil Bondye te voye Jonas?",
                options: [
                    "Niniv",
                    "Betleyèm",
                    "Jeriko",
                    "Jerizalèm"
                ],
                answer: "Niniv",
                explanation:
                    "Bondye te voye Jonas al Niniv pou anonse mesaj li.",
                reference: "Jonas 1:2"
            },

            {
                question: "Ki jan moun Niniv yo te reyaji ak mesaj la?",
                options: [
                    "Yo te repanti",
                    "Yo te kite vil la touswit",
                    "Yo te bati yon palè",
                    "Yo te fè lagè"
                ],
                answer: "Yo te repanti",
                explanation:
                    "Moun Niniv yo te kwè mesaj la epi yo te vire do bay move konpòtman yo.",
                reference: "Jonas 3:5–10"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa repantans vle di?",
                options: [
                    "Rekonèt yon move fason epi chanje direksyon",
                    "Refize aprann",
                    "Kache yon erè",
                    "Fè menm bagay la ankò"
                ],
                answer: "Rekonèt yon move fason epi chanje direksyon",
                explanation:
                    "Repantans gen ladan rekonèt sa ki mal epi pran desizyon pou chanje.",
                source: "Istwa Jonas Ale Niniv"
            }
        ]
    },


    {
        id: 78,
        title: "Lik Ekri Sou Jezi",
        category: "Nouvo Testaman",
        reference: "Lik 1:1–4",
        image: "images/lik-ekri.jpg",
        audio: "audio/lik-ekri.mp3",

        content: `
            <p>
                Lik te ekri yon liv sou lavi ak ministè Jezi. Li te vle bay
                yon rapò ki te byen òganize sou evènman moun te rakonte sou Jezi.
            </p>

            <p>
                Li te eksplike li te egzamine enfòmasyon yo ak anpil atansyon
                pou moun ki t ap li liv la te kapab konnen baz ansèyman yo.
            </p>

            <p>
                Travay Lik la te vin youn nan kat Levanjil ki prezante lavi
                Jezi nan Nouvo Testaman an.
            </p>

            <p>
                Istwa sa a montre enpòtans rechèch, òganizasyon ak ekriti
                lè yon moun ap transmèt enfòmasyon bay lòt moun.
            </p>
        `,

        lesson:
            "Lè n ap transmèt enfòmasyon, li enpòtan pou nou chèche konnen reyalite yo epi prezante yo avèk lòd.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te ekri Levanjil Lik la?",
                options: [
                    "Lik",
                    "Pyè",
                    "Jak",
                    "Jan"
                ],
                answer: "Lik",
                explanation:
                    "Levanjil Lik la pote non Lik epi li kòmanse ak yon eksplikasyon sou fason li te rasanble enfòmasyon yo.",
                reference: "Lik 1:1–4"
            },

            {
                question: "Poukisa Lik te ekri rapò li a?",
                options: [
                    "Pou bay yon istwa ki byen òganize sou evènman yo",
                    "Pou ekri yon liv sou lagè",
                    "Pou dekri yon vil",
                    "Pou ekri yon chante"
                ],
                answer: "Pou bay yon istwa ki byen òganize sou evènman yo",
                explanation:
                    "Lik te eksplike li te vle bay yon rapò byen òdone sou bagay yo te anseye.",
                reference: "Lik 1:3–4"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa verifye enfòmasyon enpòtan lè w ap ekri yon rapò?",
                options: [
                    "Pou ede prezante enfòmasyon ki pi egzak",
                    "Pou fè istwa a konfizyon",
                    "Pou retire tout detay",
                    "Pou evite òganizasyon"
                ],
                answer: "Pou ede prezante enfòmasyon ki pi egzak",
                explanation:
                    "Verifye enfòmasyon ede redwi erè epi pèmèt moun konprann sa yo ap li.",
                source: "Istwa Lik Ekri Sou Jezi"
            }
        ]
    },


    {
        id: 79,
        title: "Jezi Li Liv Ezayi a",
        category: "Jezi ak Ansèyman",
        reference: "Lik 4:16–30",
        image: "images/jezi-sinagòg.jpg",
        audio: "audio/jezi-sinagog.mp3",

        content: `
            <p>
                Jezi te ale nan sinagòg Nazarèt la, kote li te konn ale.
                Yo te ba li yon woulo pwofèt Ezayi a pou li li.
            </p>

            <p>
                Jezi te li yon pasaj ki pale sou misyon pou anonse bon nouvèl,
                libète ak espwa pou moun ki nan bezwen.
            </p>

            <p>
                Apre li fin li pasaj la, Jezi te fèmen woulo a epi li te chita.
                Moun ki te nan sinagòg la t ap gade l avèk anpil atansyon.
            </p>

            <p>
                Jezi te eksplike pasaj la t ap jwenn akonplisman devan yo.
                Pawòl li yo te lakòz divès reyaksyon nan mitan moun yo.
            </p>
        `,

        lesson:
            "Lekti ak bon konpreyansyon ede moun konprann mesaj yon tèks epi reflechi sou aplikasyon li.",

        biblicalQuestions: [
            {
                question: "Ki liv Jezi te li nan sinagòg la?",
                options: [
                    "Liv pwofèt Ezayi",
                    "Liv Jenèz",
                    "Liv Sòm",
                    "Liv Neemi"
                ],
                answer: "Liv pwofèt Ezayi",
                explanation:
                    "Yo te bay Jezi woulo pwofèt Ezayi a pou li li devan moun yo.",
                reference: "Lik 4:17"
            },

            {
                question: "Ki kote Jezi te li pasaj la?",
                options: [
                    "Nan sinagòg Nazarèt",
                    "Nan tanp Jerizalèm",
                    "Nan yon kay",
                    "Sou yon bato"
                ],
                answer: "Nan sinagòg Nazarèt",
                explanation:
                    "Jezi te antre nan sinagòg Nazarèt la dapre abitid li.",
                reference: "Lik 4:16"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa li enpòtan pou konprann yon tèks anvan eksplike li?",
                options: [
                    "Pou transmèt mesaj la pi byen",
                    "Pou chanje tout sans li",
                    "Pou retire tout lide yo",
                    "Pou fè moun konfonn"
                ],
                answer: "Pou transmèt mesaj la pi byen",
                explanation:
                    "Konpreyansyon ede yon moun eksplike lide prensipal yon tèks avèk plis presizyon.",
                source: "Istwa Jezi Li Liv Ezayi a"
            }
        ]
    },


    {
        id: 80,
        title: "Jezi Chwazi Douz Apot yo",
        category: "Jezi ak Disip li yo",
        reference: "Lik 6:12–16",
        image: "images/jezi-douz-apot.jpg",
        audio: "audio/jezi-douz-apot.mp3",

        content: `
            <p>
                Anvan Jezi te chwazi douz apot yo, li te pase yon nwit ap priye
                Bondye sou yon mòn.
            </p>

            <p>
                Nan maten, li te rele disip li yo epi li te chwazi douz ladan
                yo pou yo sèvi kòm apot.
            </p>

            <p>
                Pami moun li te chwazi yo te gen Pyè, Andre, Jak, Jan,
                Matye, Filip, Batèlmi, Toma, Jak pitit Alfè, Simon, Jid pitit
                Jak ak Jida Iskariòt.
            </p>

            <p>
                Douz apot yo te vin jwe yon wòl enpòtan nan travay Jezi ak nan
                mesaj yo t ap kontinye pataje apre li.
            </p>
        `,

        lesson:
            "Bon responsablite mande chwa reflechi, preparasyon ak angajman pou sèvi lòt moun.",

        biblicalQuestions: [
            {
                question: "Konbyen apot Jezi te chwazi?",
                options: [
                    "Douz",
                    "Dis",
                    "Sèt",
                    "Vennkat"
                ],
                answer: "Douz",
                explanation:
                    "Jezi te chwazi douz disip pou sèvi kòm apot.",
                reference: "Lik 6:13"
            },

            {
                question: "Kisa Jezi te fè anvan li chwazi apot yo?",
                options: [
                    "Li te pase lannwit lan ap priye",
                    "Li te ale nan peyi Lejip",
                    "Li te bati yon kay",
                    "Li te fè yon fèt"
                ],
                answer: "Li te pase lannwit lan ap priye",
                explanation:
                    "Jezi te pase nwit la ap priye Bondye anvan li te chwazi douz apot yo.",
                reference: "Lik 6:12"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa li bon pou reflechi anvan pran yon desizyon enpòtan?",
                options: [
                    "Sa ka ede moun konsidere konsekans ak responsablite yo",
                    "Sa fè desizyon pa janm fèt",
                    "Sa retire bezwen pou enfòmasyon",
                    "Sa toujou fè travay la pi difisil"
                ],
                answer: "Sa ka ede moun konsidere konsekans ak responsablite yo",
                explanation:
                    "Reflechi anvan yon desizyon ede moun konsidere enfòmasyon, konsekans ak responsablite.",
                source: "Istwa Jezi Chwazi Douz Apot yo"
            }
        ]
    },


    {
        id: 81,
        title: "Jezi Kalme Tanpèt la",
        category: "Mirak Jezi",
        reference: "Mak 4:35–41",
        image: "images/jezi-tanpet.jpg",
        audio: "audio/jezi-tanpet.mp3",

        content: `
            <p>
                Yon jou, Jezi ak disip li yo te monte nan yon bato pou travèse
                yon pati nan lak la. Pandan yo te sou dlo a, yon gwo tanpèt leve.
            </p>

            <p>
                Vag yo te frape bato a pandan Jezi te nan dèyè bato a ap dòmi.
                Disip yo te vin pè anpil akoz fòs tanpèt la.
            </p>

            <p>
                Yo leve Jezi epi yo mande l si li pa t enkyete pou yo.
                Jezi leve, li bay van an ak lanmè a lòd pou yo kalme.
            </p>

            <p>
                Van an te sispann epi yon gwo kalm te vini. Disip yo te sezi
                anpil devan sa yo te wè.
            </p>
        `,

        lesson:
            "Nan moman laperèz, moun ka chèche direksyon ak èd olye yo kite panik kontwole yo.",

        biblicalQuestions: [
            {
                question: "Ki kote Jezi te ye pandan tanpèt la?",
                options: [
                    "Nan yon bato",
                    "Nan yon kay",
                    "Sou yon mòn",
                    "Nan yon jaden"
                ],
                answer: "Nan yon bato",
                explanation:
                    "Jezi ak disip li yo te nan yon bato lè gwo tanpèt la leve.",
                reference: "Mak 4:36–37"
            },

            {
                question: "Kisa Jezi te fè ak tanpèt la?",
                options: [
                    "Li te bay van an ak lanmè a lòd pou yo kalme",
                    "Li te kite bato a",
                    "Li te naje ale",
                    "Li te rele lòt bato"
                ],
                answer: "Li te bay van an ak lanmè a lòd pou yo kalme",
                explanation:
                    "Jezi te pale ak van an ak lanmè a epi tanpèt la te sispann.",
                reference: "Mak 4:39"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa kalm vle di nan yon sitiyasyon?",
                options: [
                    "Yon eta kote pa gen gwo dezòd oswa ajitasyon",
                    "Yon gwo bri",
                    "Yon batay",
                    "Yon kouri prese"
                ],
                answer: "Yon eta kote pa gen gwo dezòd oswa ajitasyon",
                explanation:
                    "Kalm se yon eta ki pa gen gwo mouvman, bri oswa ajitasyon.",
                source: "Istwa Jezi Kalme Tanpèt la"
            }
        ]
    },


    {
        id: 82,
        title: "Jezi Mache Sou Dlo",
        category: "Mirak Jezi",
        reference: "Matye 14:22–33",
        image: "images/jezi-mache-sou-dlo.jpg",
        audio: "audio/jezi-mache-sou-dlo.mp3",

        content: `
            <p>
                Apre Jezi te voye disip li yo devan nan yon bato, li te monte
                sou yon mòn pou kont li pou priye.
            </p>

            <p>
                Pandan lannwit, bato a te lwen rivaj la epi van an te fò.
                Disip yo te wè Jezi ap vini sou dlo a epi yo te pè.
            </p>

            <p>
                Jezi te pale avèk yo pou ankouraje yo. Pyè te mande si li
                kapab vin jwenn Jezi sou dlo a.
            </p>

            <p>
                Pyè te soti nan bato a, men lè li te wè fòs van an li te pè.
                Jezi te ede l epi yo te monte nan bato a.
            </p>
        `,

        lesson:
            "Laperèz ka fè yon moun pèdi konsantrasyon; konfyans ak bon direksyon ka ede moun rete fèm.",

        biblicalQuestions: [
            {
                question: "Ki disip ki te mande pou li ale jwenn Jezi sou dlo a?",
                options: [
                    "Pyè",
                    "Jan",
                    "Toma",
                    "Matye"
                ],
                answer: "Pyè",
                explanation:
                    "Pyè te mande Jezi pou li pèmèt li vini jwenn li sou dlo a.",
                reference: "Matye 14:28"
            },

            {
                question: "Ki sa ki te fè Pyè pè?",
                options: [
                    "Li te wè van an fò",
                    "Li te wè yon vil",
                    "Li te wè yon bato vid",
                    "Li te tande mizik"
                ],
                answer: "Li te wè van an fò",
                explanation:
                    "Pyè te kòmanse pè lè li te wè jan van an te fò.",
                reference: "Matye 14:30"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa konsantrasyon enpòtan lè yon moun ap fè yon travay difisil?",
                options: [
                    "Li ede moun rete konsantre sou objektif la",
                    "Li fè tout bagay otomatik",
                    "Li retire tout bezwen pou pratike",
                    "Li anpeche moun aprann"
                ],
                answer: "Li ede moun rete konsantre sou objektif la",
                explanation:
                    "Konsantrasyon ede moun rete sou sa yo bezwen fè olye yo kite distraksyon pran kontwòl.",
                source: "Istwa Jezi Mache Sou Dlo"
            }
        ]
    },


    {
        id: 83,
        title: "Jezi Aksepte Timoun yo",
        category: "Ansèyman Jezi",
        reference: "Mak 10:13–16",
        image: "images/jezi-timoun.jpg",
        audio: "audio/jezi-timoun.mp3",

        content: `
            <p>
                Gen moun ki te pote timoun yo bay Jezi pou li beni yo. Disip
                yo te eseye anpeche moun yo pote timoun yo.
            </p>

            <p>
                Lè Jezi wè sa, li te di disip yo kite timoun yo vin jwenn li.
                Li te montre timoun yo te gen plas bò kote li.
            </p>

            <p>
                Jezi te pran timoun yo nan bra li epi li te beni yo.
                Li te sèvi ak okazyon an pou anseye disip yo sou fason pou
                resevwa wayòm Bondye a avèk konfyans.
            </p>

            <p>
                Istwa a montre Jezi te bay timoun yo valè ak respè.
            </p>
        `,

        lesson:
            "Timoun yo merite respè, swen ak konsiderasyon, epi yon kominote dwe bay yo yon plas ki an sekirite.",

        biblicalQuestions: [
            {
                question: "Ki moun yo te pote bay Jezi?",
                options: [
                    "Timoun yo",
                    "Sòlda yo",
                    "Wa yo",
                    "Machann yo"
                ],
                answer: "Timoun yo",
                explanation:
                    "Moun yo te pote timoun yo bay Jezi pou li beni yo.",
                reference: "Mak 10:13"
            },

            {
                question: "Ki sa Jezi te fè ak timoun yo?",
                options: [
                    "Li te beni yo",
                    "Li te voye yo deyò",
                    "Li te kache yo",
                    "Li te voye yo nan yon lòt vil"
                ],
                answer: "Li te beni yo",
                explanation:
                    "Jezi te pran timoun yo nan bra li epi li te beni yo.",
                reference: "Mak 10:16"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa timoun bezwen pwoteksyon ak respè nan yon kominote?",
                options: [
                    "Paske yo bezwen sipò pou grandi an sekirite",
                    "Paske yo pa bezwen aprann",
                    "Paske yo dwe toujou poukont yo",
                    "Paske yo pa gen okenn dwa"
                ],
                answer: "Paske yo bezwen sipò pou grandi an sekirite",
                explanation:
                    "Timoun bezwen granmoun ak kominote yo bay yo swen, pwoteksyon, edikasyon ak respè.",
                source: "Istwa Jezi Aksepte Timoun yo"
            }
        ]
    },


    {
        id: 84,
        title: "Bon Samariten an",
        category: "Lanmou ak Konpasyon",
        reference: "Lik 10:25–37",
        image: "images/bon-samariten.jpg",
        audio: "audio/bon-samariten.mp3",

        content: `
            <p>
                Jezi te rakonte istwa yon nonm ki t ap vwayaje soti Jerizalèm
                pou ale Jeriko. Li te tonbe nan men bandi ki te blese li epi
                kite li sou wout la.
            </p>

            <p>
                Yon prèt te pase bò kote li, men li pa t ede l. Apre sa,
                yon Levit te pase tou, men li pa t pran swen nonm nan.
            </p>

            <p>
                Finalman, yon Samariten te rive. Li te wè nonm nan, li te gen
                konpasyon pou li epi li te pran swen blesi li.
            </p>

            <p>
                Samariten an te mennen nonm nan nan yon lotèl epi li te bay
                lajan pou yo pran swen li. Jezi te sèvi ak istwa sa a pou
                montre enpòtans pou aji avèk konpasyon anvè moun ki bezwen èd.
            </p>
        `,

        lesson:
            "Konpasyon pa sèlman vle di santi pitye; li mande pou nou pran aksyon pou ede moun ki nan bezwen.",

        biblicalQuestions: [
            {
                question: "Ki moun ki te ede nonm ki te blese a?",
                options: [
                    "Yon Samariten",
                    "Yon prèt",
                    "Yon wa",
                    "Yon sòlda"
                ],
                answer: "Yon Samariten",
                explanation:
                    "Se Samariten an ki te kanpe pou pran swen nonm ki te blese a.",
                reference: "Lik 10:33–35"
            },

            {
                question: "Ki sa Samariten an te fè?",
                options: [
                    "Li te pran swen nonm nan",
                    "Li te kite l sou wout la",
                    "Li te rele bandi yo",
                    "Li te pran tout bagay li yo"
                ],
                answer: "Li te pran swen nonm nan",
                explanation:
                    "Samariten an te netwaye blesi li, li te mete l sou bèt li epi li te mennen l nan yon lotèl.",
                reference: "Lik 10:34"
            }
        ],

        generalQuestions: [
            {
                question: "Kisa konpasyon vle di?",
                options: [
                    "Pran swen soufrans yon lòt moun epi chèche ede li",
                    "Ignore moun ki nan bezwen",
                    "Fè moun pè",
                    "Refize ede nenpòt moun"
                ],
                answer: "Pran swen soufrans yon lòt moun epi chèche ede li",
                explanation:
                    "Konpasyon se lè yon moun remake soufrans lòt moun epi li dispoze aji pou ede.",
                source: "Istwa Bon Samariten an"
            }
        ]
    },


    {
        id: 85,
        title: "Lik Disip Emayis yo",
        category: "Jezi Apre Rezirèksyon",
        reference: "Lik 24:13–35",
        image: "images/emayis.jpg",
        audio: "audio/emayis.mp3",

        content: `
            <p>
                De disip Jezi t ap mache sou wout pou ale nan yon vil ki rele
                Emayis. Yo t ap pale sou tout bagay ki te rive nan Jerizalèm.
            </p>

            <p>
                Jezi te pwoche bò kote yo epi li te kòmanse mache avèk yo,
                men yo pa t rekonèt li touswit.
            </p>

            <p>
                Pandan yo t ap mache, Jezi te esplike yo sa Ekriti yo te di
                sou evènman ki te gen pou rive.
            </p>

            <p>
                Lè yo rive Emayis, disip yo te envite li rete avèk yo. Pandan
                repa a, yo rekonèt Jezi. Apre sa, li disparèt devan je yo.
            </p>

            <p>
                De disip yo te retounen Jerizalèm pou rakonte lòt disip yo sa
                yo te wè ak sa yo te viv.
            </p>
        `,

        lesson:
            "Pale, koute ak reflechi sou sa nou aprann ka ede nou konprann eksperyans ki te difisil pou nou konprann okòmansman.",

        biblicalQuestions: [
            {
                question: "Ki kote de disip yo t ap ale?",
                options: [
                    "Emayis",
                    "Betleyèm",
                    "Niniv",
                    "Jeriko"
                ],
                answer: "Emayis",
                explanation:
                    "De disip yo t ap mache sou wout pou ale nan yon vil ki rele Emayis.",
                reference: "Lik 24:13"
            },

            {
                question: "Ki lè disip yo te rekonèt Jezi?",
                options: [
                    "Pandan repa a",
                    "Lè yo te kite Jerizalèm",
                    "Nan mitan lannwit lan",
                    "Anvan yo te kòmanse mache"
                ],
                answer: "Pandan repa a",
                explanation:
                    "Disip yo te rekonèt Jezi lè li te pran pen an, beni li epi bay yo li.",
                reference: "Lik 24:30–31"
            }
        ],

        generalQuestions: [
            {
                question: "Poukisa konvèsasyon ka ede moun konprann yon eksperyans?",
                options: [
                    "Li pèmèt moun pataje lide epi reflechi ansanm",
                    "Li anpeche moun koute",
                    "Li toujou kreye konfizyon",
                    "Li retire tout enfòmasyon"
                ],
                answer: "Li pèmèt moun pataje lide epi reflechi ansanm",
                explanation:
                    "Konvèsasyon ka ede moun konpare lide, poze kesyon epi jwenn yon pi bon konpreyansyon.",
                source: "Istwa Disip Emayis yo"
            }
        ]
    }


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
                            an Kreyòl Ayisyen. Ingenieur Informatique : MEME Selvandieu Whatsapp: +50943706706.
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