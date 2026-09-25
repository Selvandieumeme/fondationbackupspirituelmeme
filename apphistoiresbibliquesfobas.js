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