/* ============================================================
   FOBAS FOOTBALL ULTIMATE 3D
   JavaScript principal — Version 1.0.0

   Moteur : PlayCanvas 2.23.2
   Stockage : IndexedDB + secours localStorage
   Interface : appfootballfobas.html
   Compatibilité : Android / navigateur moderne

   Fichier racine :
   appfootballfobas.js

   PRINCIPES :
   - Aucun écran bloquant au démarrage.
   - Import dynamique de PlayCanvas.
   - Aucun ID HTML inventé pour les éléments principaux.
   - Gestion défensive des erreurs.
   - Boutons reliés aux actions.
   - Sauvegarde locale.
============================================================ */

(() => {
    "use strict";

    /* ========================================================
       1. CONFIGURATION
    ======================================================== */

    const CONFIG = window.FOBAS_FOOTBALL_CONFIG || {};

    const APP_NAME =
        CONFIG.appName || "FOBAS FOOTBALL ULTIMATE 3D";

    const APP_VERSION =
        CONFIG.version || "1.0.0";

    const ENGINE_VERSION =
        CONFIG.engineVersion || "2.23.2";

    const DB_NAME =
        CONFIG.databaseName || "FOBAS_FOOTBALL_ULTIMATE_DB";

    const DB_VERSION =
        Number(CONFIG.databaseVersion) || 1;

    const ROSTER_SIZE =
        Number(CONFIG.playerRosterSize) || 18;

    const PLAYERS_ON_FIELD =
        Number(CONFIG.playersOnFieldPerTeam) || 11;

    const SUBSTITUTES =
        Number(CONFIG.substitutesPerTeam) || 7;

    const INITIAL_TEAM_COUNT =
        Number(CONFIG.initialTeamCount) || 100;

    const REFEREE_NAME =
        CONFIG.refereeName || "MEME Selvandieu";

    const REFEREE_ROLE =
        CONFIG.refereeRole || "IA EXPERT REFEREE 3D";

    const $ = (id) => document.getElementById(id);

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const random = (min, max) =>
        min + Math.random() * (max - min);

    const randomInt = (min, max) =>
        Math.floor(random(min, max + 1));

    const choose = (items) =>
        items[Math.floor(Math.random() * items.length)];

    const now = () => Date.now();

    const safeText = (value) =>
        String(value ?? "");

    const normalize = (value) =>
        safeText(value)
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

    const hasDOM = typeof document !== "undefined";

    if (!hasDOM) {
        return;
    }

    /* ========================================================
       2. ÉTAT CENTRAL DU JEU
    ======================================================== */

    const state = {
        initialized: false,
        starting: false,
        engineReady: false,
        engineFailed: false,

        app: null,
        pc: null,
        database: null,

        currentScreen: "mainMenu",
        previousScreen: "mainMenu",

        matchActive: false,
        matchPaused: false,
        matchFinished: false,

        soundEnabled: true,
        audioContext: null,

        lastSaveTime: 0,
        autosaveTimer: null,
        animationTimer: null,

        selectedEquipmentTab: "kits",
        selectedEquipment: {
            kits: "royal",
            balls: "classic",
            boots: "classic"
        },

        selectedTeamId: null,

        profile: {
            name: "Joueur FOBAS",
            favoriteTeam: "mare-rouge",
            matchesPlayed: 0,
            goalsScored: 0,
            trophies: 0
        },

        settings: {
            graphicsQuality: "medium",
            soundVolume: 70,
            cameraSensitivity: 50,
            matchDifficulty: "normal",
            vibration: true,
            commentary: true
        },

        tactics: {
            formation: "433",
            style: "balanced",
            pressure: "medium"
        },

        camera: {
            zoom: 1,
            minZoom: 0.65,
            maxZoom: 1.85,
            angle: 0,
            defaultZoom: 1
        },

        joystick: {
            active: false,
            pointerId: null,
            x: 0,
            y: 0
        },

        match: {
            homeTeamId: "mare-rouge",
            awayTeamId: "mole-saint-nicolas",
            competition: "local",
            stadium: "home",
            duration: "standard",

            homeScore: 0,
            awayScore: 0,

            elapsed: 0,
            matchLength: 180,
            period: 1,

            goals: [],
            events: [],
            lastEventTime: 0,

            playerIndex: 0,
            sprinting: false,
            defending: false
        },

        world: {
            entities: [],
            players: [],
            homePlayers: [],
            awayPlayers: [],
            ball: null,
            camera: null,
            pitch: null,
            homeGoal: null,
            awayGoal: null,

            cameraDistance: 39,
            cameraHeight: 29,

            lastFrameTime: 0,
            lastAISimulation: 0,
            lastPhysicsUpdate: 0,

            worldCreated: false
        },

        teams: [],
        competitions: [],
        tournaments: [],

        equipment: {
            kits: [
                {
                    id: "royal",
                    name: "Maillot royal",
                    description: "Tenue classique FOBAS",
                    color: "#1d55d8"
                },
                {
                    id: "ocean",
                    name: "Maillot océan",
                    description: "Tenue bleu océan",
                    color: "#06a7c7"
                },
                {
                    id: "fire",
                    name: "Maillot feu",
                    description: "Tenue rouge offensive",
                    color: "#e43a38"
                },
                {
                    id: "forest",
                    name: "Maillot forêt",
                    description: "Tenue verte",
                    color: "#208b4b"
                },
                {
                    id: "gold",
                    name: "Maillot champion",
                    description: "Tenue dorée",
                    color: "#e5b536"
                }
            ],

            balls: [
                {
                    id: "classic",
                    name: "Ballon classique",
                    description: "Ballon de match traditionnel",
                    color: "#ffffff"
                },
                {
                    id: "gold",
                    name: "Ballon doré",
                    description: "Ballon de championnat",
                    color: "#e6b93c"
                },
                {
                    id: "ocean",
                    name: "Ballon océan",
                    description: "Édition bleue",
                    color: "#0aadd2"
                },
                {
                    id: "fire",
                    name: "Ballon feu",
                    description: "Édition rouge",
                    color: "#ef483d"
                }
            ],

            boots: [
                {
                    id: "classic",
                    name: "Chaussures classiques",
                    description: "Chaussures de football",
                    color: "#eeeeee"
                },
                {
                    id: "gold",
                    name: "Chaussures champion",
                    description: "Édition dorée",
                    color: "#e5b536"
                },
                {
                    id: "fire",
                    name: "Chaussures rapides",
                    description: "Édition rouge",
                    color: "#ed453d"
                }
            ]
        }
    };

    /* ========================================================
       3. OUTILS D'INTERFACE
    ======================================================== */

    function setText(id, value) {
        const element = $(id);

        if (element) {
            element.textContent = safeText(value);
        }
    }

    function setValue(id, value) {
        const element = $(id);

        if (element) {
            element.value = value;
        }
    }

    function setHidden(id, hidden) {
        const element = $(id);

        if (!element) {
            return;
        }

        element.classList.toggle("hidden", Boolean(hidden));
    }

    function showElement(id) {
        setHidden(id, false);
    }

    function hideElement(id) {
        setHidden(id, true);
    }

    function updateLoading(percent, message) {
        const value = clamp(
            Math.round(Number(percent) || 0),
            0,
            100
        );

        const bar = $("loadingProgressBar");
        const track = $("loadingProgressTrack");

        if (bar) {
            bar.style.width = `${value}%`;
        }

        if (track) {
            track.setAttribute("aria-valuenow", String(value));
        }

        setText("loadingPercent", `${value} %`);

        if (message !== undefined) {
            setText("loadingMessage", message);
        }
    }

    function toast(message, duration = 2800) {
        const container = $("toastContainer");

        if (!container) {
            console.info(`[FOBAS] ${message}`);
            return;
        }

        const item = document.createElement("div");

        item.className = "toast-message";
        item.textContent = safeText(message);
        item.setAttribute("role", "status");

        container.appendChild(item);

        requestAnimationFrame(() => {
            item.classList.add("show");
        });

        window.setTimeout(() => {
            item.classList.remove("show");

            window.setTimeout(() => {
                item.remove();
            }, 250);
        }, duration);
    }

    function showDialog(title, content, actions = []) {
        const overlay = $("dialogOverlay");
        const titleElement = $("dialogTitle");
        const contentElement = $("dialogContent");
        const actionsElement = $("dialogActions");

        if (
            !overlay ||
            !titleElement ||
            !contentElement ||
            !actionsElement
        ) {
            toast(`${title} : ${content}`);
            return;
        }

        titleElement.textContent = safeText(title);

        /*
         * Le contenu HTML n'est utilisé ici que pour les chaînes
         * internes contrôlées par le jeu.
         */
        contentElement.replaceChildren();

        if (content instanceof Node) {
            contentElement.appendChild(content);
        } else {
            const paragraph = document.createElement("p");
            paragraph.textContent = safeText(content);
            contentElement.appendChild(paragraph);
        }

        actionsElement.replaceChildren();

        actions.forEach((action) => {
            const button = document.createElement("button");

            button.type = "button";
            button.className =
                action.className ||
                "ui-button button-primary";

            button.textContent = safeText(action.label);

            button.addEventListener("click", () => {
                if (typeof action.onClick === "function") {
                    action.onClick();
                }
            });

            actionsElement.appendChild(button);
        });

        overlay.classList.remove("hidden");
    }

    function closeDialog() {
        hideElement("dialogOverlay");
    }

    function showAnnouncement(title, message, duration = 3000) {
        const panel = $("matchAnnouncement");

        if (!panel) {
            toast(`${title} — ${message}`);
            return;
        }

        setText("announcementTitle", title);
        setText("announcementMessage", message);

        panel.classList.remove("hidden");

        window.clearTimeout(showAnnouncement.timer);

        showAnnouncement.timer = window.setTimeout(() => {
            panel.classList.add("hidden");
        }, duration);
    }

    function vibrate(pattern = 35) {
        if (
            state.settings.vibration &&
            navigator.vibrate
        ) {
            try {
                navigator.vibrate(pattern);
            } catch (_) {
                // Fonction facultative selon l'appareil.
            }
        }
    }

    /* ========================================================
       4. NAVIGATION
    ======================================================== */

    const SCREEN_IDS = [
        "mainMenu",
        "matchScreen",
        "matchSetupScreen",
        "championshipScreen",
        "tournamentScreen",
        "teamsScreen",
        "equipmentScreen",
        "profileScreen",
        "howToPlayScreen",
        "settingsScreen"
    ];

    function navigate(screenId) {
        const target = $(screenId);

        if (!target) {
            toast("Cet écran n'est pas disponible.");
            return;
        }

        if (
            state.currentScreen !== "matchScreen" &&
            screenId !== "matchScreen"
        ) {
            state.previousScreen = state.currentScreen;
        }

        SCREEN_IDS.forEach((id) => {
            const panel = $(id);

            if (panel) {
                panel.classList.toggle("hidden", id !== screenId);
            }
        });

        state.currentScreen = screenId;

        if (screenId === "teamsScreen") {
            renderTeams();
        }

        if (screenId === "championshipScreen") {
            renderCompetitions();
        }

        if (screenId === "tournamentScreen") {
            renderTournaments();
        }

        if (screenId === "equipmentScreen") {
            renderEquipment();
        }

        if (screenId === "profileScreen") {
            populateProfile();
        }

        if (screenId === "settingsScreen") {
            populateSettings();
        }

        if (screenId === "matchScreen") {
            requestAnimationFrame(resizeEngineCanvas);
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function backToMenu() {
        if (state.matchActive && !state.matchFinished) {
            showDialog(
                "Quitter le match ?",
                "Voulez-vous quitter le match en cours ?",
                [
                    {
                        label: "CONTINUER LE MATCH",
                        className: "ui-button button-secondary",
                        onClick: closeDialog
                    },
                    {
                        label: "SAUVEGARDER ET QUITTER",
                        className: "ui-button button-primary",
                        onClick: async () => {
                            await saveGame();
                            closeDialog();
                            finishAndReturnToMenu();
                        }
                    }
                ]
            );

            return;
        }

        navigate("mainMenu");
    }

    /* ========================================================
       5. DONNÉES DES ÉQUIPES
    ======================================================== */

    const LOCAL_TEAMS = [
        ["mare-rouge", "Mare-Rouge", "northwest"],
        ["mole-saint-nicolas", "Môle-Saint-Nicolas", "northwest"],
        ["jean-rabel", "Jean-Rabel", "northwest"],
        ["bombardopolis", "Bombardopolis", "northwest"],
        ["baie-de-henne", "Baie-de-Henne", "northwest"],
        ["port-de-paix", "Port-de-Paix", "northwest"],
        ["la-tortue", "La Tortue", "northwest"],
        ["bassin-bleu", "Bassin-Bleu", "northwest"],
        ["chansolme", "Chansolme", "northwest"],
        ["saint-louis-du-nord", "Saint-Louis-du-Nord", "northwest"],
        ["anse-a-foleur", "Anse-à-Foleur", "northwest"],

        ["cotes-de-fer", "Côtes-de-Fer", "northwest"],
        ["dame", "Damé", "northwest"],
        ["citerne-remy", "Citerne Rémy", "northwest"],
        ["dos-dane", "Dos d'Âne", "northwest"],
        ["ti-paradis", "Ti-Paradis", "northwest"],
        ["lestere-dere", "L'Estère-Déré", "northwest"],
        ["plate-forme", "Plate-Forme", "northwest"],
        ["les-forges", "Les Forges", "northwest"],
        ["plaine-orange", "Plaine d'Orange", "northwest"],
        ["lacoma", "Lacoma", "northwest"],
        ["guinaudee", "Guinaudée", "northwest"],
        ["vieille-hatte", "Vieille Hatte", "northwest"],
        ["la-montagne", "La Montagne", "northwest"],
        ["dessources", "Dessources", "northwest"],
        ["grande-source", "Grande Source", "northwest"],
        ["diondion", "Diondion", "northwest"],
        ["baudin", "Baudin", "northwest"],
        ["la-pointe", "La Pointe", "northwest"],
        ["aubert", "Aubert", "northwest"],
        ["mahotiere", "Mahotière", "northwest"],
        ["bas-des-moustiques", "Bas des Moustiques", "northwest"],
        ["la-corne", "La Corne", "northwest"],
        ["pointe-des-oiseaux", "Pointe des Oiseaux", "northwest"],
        ["la-plate", "La Plate", "northwest"],
        ["carreau-datty", "Carreau Datty", "northwest"],
        ["haut-des-moustiques", "Haut des Moustiques", "northwest"],
        ["source-beauvoir", "Source Beauvoir", "northwest"],
        ["riviere-des-negres", "Rivière des Nègres", "northwest"],
        ["derourvay", "Derourvay", "northwest"],
        ["des-granges", "Des Granges", "northwest"],
        ["riviere-de-barre", "Rivière de Barre", "northwest"],
        ["bonneau", "Bonneau", "northwest"],
        ["lafague", "Lafague", "northwest"],
        ["bas-sainte-anne", "Bas de Sainte-Anne", "northwest"],
        ["mayance", "Mayance", "northwest"]
    ];

    const HAITI_TEAMS = [
        "Cap-Haïtien",
        "Fort-Liberté",
        "Ouanaminthe",
        "Hinche",
        "Saint-Raphaël",
        "Gonaïves",
        "Saint-Marc",
        "Verrettes",
        "Artibonite",
        "Port-au-Prince",
        "Pétion-Ville",
        "Carrefour",
        "Delmas",
        "Léogâne",
        "Petit-Goâve",
        "Jacmel",
        "Les Cayes",
        "Jérémie",
        "Miragoâne",
        "Cayes-Jacmel",
        "Anse-à-Veau",
        "Port-Salut",
        "Aquin",
        "Cavaillon",
        "Limbé",
        "Trou-du-Nord",
        "Limonade",
        "Grande-Rivière-du-Nord"
    ];

    const CARIBBEAN_TEAMS = [
        "Kingston United",
        "Montego Bay FC",
        "Santo Domingo Stars",
        "Santiago Caribe",
        "San Juan Athletic",
        "Port of Spain FC",
        "Bridgetown United",
        "Castries Sporting",
        "Kingstown Rovers",
        "Nassau Athletic",
        "Havana Legends",
        "Curaçao United",
        "Aruba Stars",
        "Paramaribo FC",
        "Georgetown Warriors"
    ];

    const AMERICAS_TEAMS = [
        "New York City FC",
        "Miami United",
        "Los Angeles Athletic",
        "Toronto Stars",
        "Montréal FC",
        "Mexico City United",
        "São Paulo Legends",
        "Rio de Janeiro FC",
        "Buenos Aires Stars",
        "Bogotá Athletic",
        "Lima United",
        "Santiago FC"
    ];

    const EUROPE_TEAMS = [
        "Paris Legends",
        "London Athletic",
        "Madrid United",
        "Barcelona Stars",
        "Lisbon Sporting",
        "Rome FC",
        "Berlin Athletic",
        "Amsterdam United",
        "Brussels Stars",
        "Dublin FC",
        "Zurich United",
        "Athens Sporting"
    ];

    const AFRICA_TEAMS = [
        "Dakar United",
        "Abidjan Athletic",
        "Lagos Stars",
        "Accra United",
        "Casablanca FC",
        "Tunis Sporting",
        "Nairobi Legends",
        "Cairo Athletic",
        "Kigali United",
        "Johannesburg Stars"
    ];

    function slugify(value) {
        return normalize(value)
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
    }

    function createTeam(id, name, region, index) {
        const colors = [
            "#1555c0",
            "#e63a35",
            "#16a05a",
            "#e5b632",
            "#8c4bd8",
            "#0ca9c9",
            "#ed7a22",
            "#e8e8e8",
            "#272d39",
            "#db5ba2"
        ];

        return {
            id,
            name,
            region,
            color: colors[index % colors.length],
            rating: randomInt(60, 92),
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goalsFor: 0,
            goalsAgainst: 0,

            roster: Array.from(
                { length: ROSTER_SIZE },
                (_, playerIndex) => ({
                    id: `${id}-player-${playerIndex + 1}`,
                    name: getPlayerName(index + playerIndex),
                    number: playerIndex + 1,
                    position: playerIndex === 0
                        ? "GK"
                        : choose(["DEF", "MID", "ATT"]),
                    isSubstitute: playerIndex >= PLAYERS_ON_FIELD,
                    rating: randomInt(58, 92)
                })
            )
        };
    }

    function getPlayerName(index) {
        const names = Array.isArray(CONFIG.playerNames)
            ? CONFIG.playerNames
            : [];

        const fallback = [
            "Jean",
            "Paul",
            "Marie",
            "David",
            "Samuel",
            "Junior",
            "Nicolas",
            "Daniel",
            "Pierre",
            "Luc"
        ];

        const all = names.length ? names : fallback;

        return all[index % all.length];
    }

    function buildTeams() {
        const teams = [];
        const seen = new Set();

        const add = (id, name, region) => {
            if (seen.has(id)) {
                return;
            }

            seen.add(id);

            teams.push(
                createTeam(id, name, region, teams.length)
            );
        };

        LOCAL_TEAMS.forEach(([id, name, region]) => {
            add(id, name, region);
        });

        HAITI_TEAMS.forEach((name) => {
            add(slugify(name), name, "haiti");
        });

        CARIBBEAN_TEAMS.forEach((name) => {
            add(slugify(name), name, "caribbean");
        });

        AMERICAS_TEAMS.forEach((name) => {
            add(slugify(name), name, "americas");
        });

        EUROPE_TEAMS.forEach((name) => {
            add(slugify(name), name, "europe");
        });

        AFRICA_TEAMS.forEach((name) => {
            add(slugify(name), name, "africa");
        });

        /*
         * Génération complémentaire jusqu'au nombre initial demandé.
         * Ces équipes supplémentaires sont des équipes fictives.
         */
        const cityPool = [
            "Rivière",
            "Montagne",
            "Côte",
            "Étoile",
            "Union",
            "Avenir",
            "Jeunesse",
            "Espoir",
            "Horizon",
            "Victoire",
            "Flambeau",
            "Lumière"
        ];

        const suffixPool = [
            "FC",
            "Athletic",
            "United",
            "Sporting",
            "Stars",
            "Legends",
            "Rovers"
        ];

        let generatedIndex = 1;

        while (teams.length < INITIAL_TEAM_COUNT) {
            const name =
                `${choose(cityPool)} ${choose(suffixPool)} ${generatedIndex}`;

            add(
                `fobas-generated-${generatedIndex}`,
                name,
                "international"
            );

            generatedIndex += 1;
        }

        state.teams = teams;

        const homeExists = teams.some(
            (team) => team.id === state.match.homeTeamId
        );

        const awayExists = teams.some(
            (team) => team.id === state.match.awayTeamId
        );

        if (!homeExists) {
            state.match.homeTeamId = teams[0]?.id;
        }

        if (!awayExists) {
            state.match.awayTeamId = teams[1]?.id;
        }
    }

    function findTeam(teamId) {
        return state.teams.find(
            (team) => team.id === teamId
        ) || state.teams[0] || null;
    }

    function getTeamName(teamId) {
        return findTeam(teamId)?.name || "Équipe FOBAS";
    }

    /* ========================================================
       6. COMPÉTITIONS ET TOURNOIS
    ======================================================== */

    function buildCompetitions() {
        state.competitions = Array.isArray(CONFIG.competitionLevels)
            ? CONFIG.competitionLevels.map((item) => ({ ...item }))
            : [
                {
                    id: "local",
                    name: "Matchs locaux",
                    description: "Équipes des sections communales."
                },
                {
                    id: "communal",
                    name: "Championnats communaux",
                    description: "Compétitions communales."
                },
                {
                    id: "northwest",
                    name: "Championnat du Nord-Ouest",
                    description: "Compétition départementale."
                },
                {
                    id: "haiti-national",
                    name: "Championnat national d'Haïti",
                    description: "Compétition nationale."
                },
                {
                    id: "caribbean",
                    name: "Tournoi régional des Caraïbes",
                    description: "Compétition régionale."
                },
                {
                    id: "international",
                    name: "Championnats internationaux",
                    description: "Compétitions internationales."
                },
                {
                    id: "champions",
                    name: "Tournoi des champions",
                    description: "Finales des meilleures équipes."
                }
            ];

        state.tournaments = [
            {
                id: "caribbean-cup",
                name: "Caribbean Football Cup",
                description: "Tournoi régional des Caraïbes",
                level: "caribbean"
            },
            {
                id: "fobas-elite",
                name: "FOBAS Elite Championship",
                description: "Championnat des équipes d'élite",
                level: "international"
            },
            {
                id: "world-champions",
                name: "World Champions Tournament",
                description: "Tournoi international des champions",
                level: "champions"
            }
        ];
    }

    function renderCompetitions() {
        const list = $("competitionLevelsList");

        if (!list) {
            return;
        }

        list.replaceChildren();

        state.competitions.forEach((competition, index) => {
            const card = document.createElement("article");

            card.className = "competition-level-card";
            card.dataset.competitionId = competition.id;

            const heading = document.createElement("h3");
            heading.textContent =
                `${index + 1}. ${competition.name}`;

            const description = document.createElement("p");
            description.textContent = competition.description || "";

            const button = document.createElement("button");

            button.type = "button";
            button.className = "ui-button button-secondary";
            button.textContent = "CHOISIR CE NIVEAU";

            button.addEventListener("click", () => {
                setValue("competitionSelect", competition.id);
                navigate("matchSetupScreen");
                toast(`Niveau sélectionné : ${competition.name}`);
            });

            card.append(heading, description, button);
            list.appendChild(card);
        });
    }

    function renderTournaments() {
        const list = $("tournamentList");

        if (!list) {
            return;
        }

        list.replaceChildren();

        state.tournaments.forEach((tournament) => {
            const card = document.createElement("article");

            card.className = "tournament-card";

            const heading = document.createElement("h3");
            heading.textContent = tournament.name;

            const description = document.createElement("p");
            description.textContent = tournament.description;

            const button = document.createElement("button");

            button.type = "button";
            button.className = "ui-button button-secondary";
            button.textContent = "PARTICIPER";

            button.addEventListener("click", () => {
                setValue("competitionSelect", tournament.level);
                navigate("matchSetupScreen");
                toast(`Tournoi choisi : ${tournament.name}`);
            });

            card.append(heading, description, button);
            list.appendChild(card);
        });
    }

    /* ========================================================
       7. LISTE DES ÉQUIPES
    ======================================================== */

    function renderTeams() {
        const list = $("teamsList");

        if (!list) {
            return;
        }

        const query = normalize(
            $("teamSearchInput")?.value || ""
        );

        const region =
            $("teamRegionSelect")?.value || "all";

        const filtered = state.teams.filter((team) => {
            const matchesQuery =
                !query ||
                normalize(team.name).includes(query) ||
                normalize(team.region).includes(query);

            const matchesRegion =
                region === "all" ||
                team.region === region;

            return matchesQuery && matchesRegion;
        });

        list.replaceChildren();

        filtered.forEach((team) => {
            const card = document.createElement("article");

            card.className = "team-card";
            card.dataset.teamId = team.id;

            const emblem = document.createElement("div");

            emblem.className = "team-emblem";
            emblem.textContent = "⚽";
            emblem.style.backgroundColor = team.color;

            const info = document.createElement("div");

            info.className = "team-info";

            const name = document.createElement("h3");
            name.textContent = team.name;

            const detail = document.createElement("p");
            detail.textContent =
                `${team.roster.length} joueurs · Niveau ${team.rating}`;

            const regionLabel = document.createElement("small");
            regionLabel.textContent = getRegionLabel(team.region);

            info.append(name, detail, regionLabel);

            const button = document.createElement("button");

            button.type = "button";
            button.className = "ui-button button-secondary";
            button.textContent = "SÉLECTIONNER";

            button.addEventListener("click", () => {
                state.selectedTeamId = team.id;
                state.match.homeTeamId = team.id;

                navigate("matchSetupScreen");

                setValue("homeTeamSelect", team.id);

                toast(`Équipe sélectionnée : ${team.name}`);
            });

            card.append(emblem, info, button);
            list.appendChild(card);
        });

        setText(
            "teamCountLabel",
            `${filtered.length} équipe(s) affichée(s) sur ${state.teams.length}`
        );

        populateTeamSelects();
    }

    function getRegionLabel(region) {
        const labels = {
            northwest: "Nord-Ouest d'Haïti",
            haiti: "Autres départements d'Haïti",
            caribbean: "Caraïbes",
            americas: "Amériques",
            europe: "Europe",
            africa: "Afrique",
            international: "International"
        };

        return labels[region] || region;
    }

    function populateTeamSelects() {
        const ids = [
            "homeTeamSelect",
            "awayTeamSelect"
        ];

        ids.forEach((id) => {
            const select = $(id);

            if (!select) {
                return;
            }

            const currentValue = select.value;

            select.replaceChildren();

            state.teams.forEach((team) => {
                const option = document.createElement("option");

                option.value = team.id;
                option.textContent = `Équipe ${team.name}`;

                select.appendChild(option);
            });

            if (
                currentValue &&
                state.teams.some((team) => team.id === currentValue)
            ) {
                select.value = currentValue;
            }
        });

        const favorite = $("profileFavoriteTeam");

        if (favorite) {
            const previous = favorite.value;

            favorite.replaceChildren();

            state.teams.forEach((team) => {
                const option = document.createElement("option");

                option.value = team.id;
                option.textContent = team.name;

                favorite.appendChild(option);
            });

            if (state.teams.some((team) => team.id === previous)) {
                favorite.value = previous;
            } else {
                favorite.value = state.profile.favoriteTeam;
            }
        }
    }

    /* ========================================================
       8. ÉQUIPEMENT
    ======================================================== */

    function renderEquipment() {
        const list = $("equipmentItemsList");

        if (!list) {
            return;
        }

        const category = state.selectedEquipmentTab;
        const items = state.equipment[category] || [];

        list.replaceChildren();

        document.querySelectorAll("[data-equipment-tab]").forEach((button) => {
            const active =
                button.dataset.equipmentTab === category;

            button.classList.toggle("active", active);
            button.setAttribute("aria-selected", String(active));
        });

        items.forEach((item) => {
            const card = document.createElement("article");

            card.className = "equipment-card";
            card.dataset.itemId = item.id;

            const preview = document.createElement("div");

            preview.className = "equipment-preview";
            preview.style.backgroundColor = item.color;
            preview.textContent =
                category === "balls"
                    ? "⚽"
                    : category === "boots"
                        ? "👟"
                        : "👕";

            const heading = document.createElement("h3");
            heading.textContent = item.name;

            const description = document.createElement("p");
            description.textContent = item.description;

            const chooseButton = document.createElement("button");

            chooseButton.type = "button";
            chooseButton.className = "ui-button button-secondary";
            chooseButton.textContent =
                state.selectedEquipment[category] === item.id
                    ? "SÉLECTIONNÉ"
                    : "CHOISIR";

            chooseButton.addEventListener("click", () => {
                state.selectedEquipment[category] = item.id;

                renderEquipment();

                toast(`${item.name} sélectionné.`);
            });

            card.append(
                preview,
                heading,
                description,
                chooseButton
            );

            list.appendChild(card);
        });
    }

    /* ========================================================
       9. PROFIL ET PARAMÈTRES
    ======================================================== */

    function populateProfile() {
        setValue("profileNameInput", state.profile.name);
        setValue(
            "profileFavoriteTeam",
            state.profile.favoriteTeam
        );

        setText(
            "profileMatchesPlayed",
            state.profile.matchesPlayed
        );

        setText(
            "profileGoalsScored",
            state.profile.goalsScored
        );

        setText(
            "profileTrophies",
            state.profile.trophies
        );
    }

    function readProfile() {
        state.profile.name =
            $("profileNameInput")?.value.trim() ||
            "Joueur FOBAS";

        state.profile.favoriteTeam =
            $("profileFavoriteTeam")?.value ||
            state.profile.favoriteTeam;
    }

    function populateSettings() {
        setValue(
            "graphicsQualitySelect",
            state.settings.graphicsQuality
        );

        setValue(
            "soundVolumeInput",
            state.settings.soundVolume
        );

        setValue(
            "cameraSensitivityInput",
            state.settings.cameraSensitivity
        );

        setValue(
            "matchDifficultySelect",
            state.settings.matchDifficulty
        );

        if ($("vibrationToggle")) {
            $("vibrationToggle").checked =
                state.settings.vibration;
        }

        if ($("commentaryToggle")) {
            $("commentaryToggle").checked =
                state.settings.commentary;
        }
    }

    function readSettings() {
        state.settings.graphicsQuality =
            $("graphicsQualitySelect")?.value || "medium";

        state.settings.soundVolume = clamp(
            Number($("soundVolumeInput")?.value ?? 70),
            0,
            100
        );

        state.settings.cameraSensitivity = clamp(
            Number($("cameraSensitivityInput")?.value ?? 50),
            1,
            100
        );

        state.settings.matchDifficulty =
            $("matchDifficultySelect")?.value || "normal";

        state.settings.vibration =
            $("vibrationToggle")?.checked ?? true;

        state.settings.commentary =
            $("commentaryToggle")?.checked ?? true;

        if (
            state.app &&
            state.app.graphicsDevice
        ) {
            const scale =
                state.settings.graphicsQuality === "low"
                    ? 0.75
                    : state.settings.graphicsQuality === "high"
                        ? 1
                        : 0.9;

            state.app.graphicsDevice.maxPixelRatio =
                Math.min(window.devicePixelRatio || 1, 2) * scale;
        }
    }

    /* ========================================================
       10. INDEXEDDB — STOCKAGE ROBUSTE
    ======================================================== */

    const STORE_NAME = "gameData";

    function openDatabase() {
        return new Promise((resolve) => {
            if (!("indexedDB" in window)) {
                resolve(null);
                return;
            }

            let request;

            try {
                request = indexedDB.open(DB_NAME, DB_VERSION);
            } catch (error) {
                console.warn("IndexedDB indisponible :", error);
                resolve(null);
                return;
            }

            request.onupgradeneeded = () => {
                const db = request.result;

                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, {
                        keyPath: "key"
                    });
                }
            };

            request.onsuccess = () => {
                state.database = request.result;

                state.database.onversionchange = () => {
                    state.database.close();
                    state.database = null;
                };

                resolve(state.database);
            };

            request.onerror = () => {
                console.warn(
                    "Impossible d'ouvrir IndexedDB :",
                    request.error
                );

                resolve(null);
            };

            request.onblocked = () => {
                /*
                 * On ne bloque pas le démarrage.
                 * La sauvegarde locale reste disponible.
                 */
                console.warn(
                    "IndexedDB bloquée par un autre onglet."
                );

                resolve(null);
            };
        });
    }

    function localStorageKey(key) {
        return `FOBAS_FOOTBALL_${key}`;
    }

    function localSave(key, value) {
        try {
            localStorage.setItem(
                localStorageKey(key),
                JSON.stringify(value)
            );

            return true;
        } catch (error) {
            console.warn("Secours localStorage impossible :", error);
            return false;
        }
    }

    function localRead(key) {
        try {
            const raw = localStorage.getItem(
                localStorageKey(key)
            );

            return raw ? JSON.parse(raw) : null;
        } catch (_) {
            return null;
        }
    }

    async function dbPut(key, value) {
        const db = state.database;

        if (!db) {
            return localSave(key, value);
        }

        return new Promise((resolve) => {
            let transaction;

            try {
                transaction = db.transaction(
                    STORE_NAME,
                    "readwrite"
                );

                transaction.objectStore(STORE_NAME).put({
                    key,
                    value,
                    updatedAt: now()
                });

                transaction.oncomplete = () => resolve(true);

                transaction.onerror = () => {
                    localSave(key, value);
                    resolve(false);
                };

                transaction.onabort = () => {
                    localSave(key, value);
                    resolve(false);
                };
            } catch (error) {
                console.warn("Écriture IndexedDB impossible :", error);

                localSave(key, value);
                resolve(false);
            }
        });
    }

    async function dbGet(key) {
        const db = state.database;

        if (!db) {
            return localRead(key);
        }

        return new Promise((resolve) => {
            let request;

            try {
                request = db
                    .transaction(STORE_NAME, "readonly")
                    .objectStore(STORE_NAME)
                    .get(key);
            } catch (_) {
                resolve(localRead(key));
                return;
            }

            request.onsuccess = () => {
                if (request.result) {
                    resolve(request.result.value);
                } else {
                    resolve(localRead(key));
                }
            };

            request.onerror = () => {
                resolve(localRead(key));
            };
        });
    }

    async function saveGame(silent = false) {
        const payload = {
            version: APP_VERSION,
            savedAt: now(),

            profile: state.profile,
            settings: state.settings,
            tactics: state.tactics,

            selectedEquipment: state.selectedEquipment,
            selectedEquipmentTab: state.selectedEquipmentTab,

            match: {
                ...state.match,
                goals: state.match.goals,
                events: state.match.events
            },

            teams: state.teams.map((team) => ({
                id: team.id,
                played: team.played,
                wins: team.wins,
                draws: team.draws,
                losses: team.losses,
                goalsFor: team.goalsFor,
                goalsAgainst: team.goalsAgainst
            })),

            tournaments: state.tournaments
        };

        const ok = await dbPut("save", payload);

        state.lastSaveTime = now();

        setText(
            "saveStatusLabel",
            `Sauvegardé à ${new Date().toLocaleTimeString()}`
        );

        if (!silent) {
            toast(
                ok
                    ? "Partie sauvegardée."
                    : "Sauvegarde locale effectuée avec secours."
            );
        }

        return ok;
    }

    async function loadGame() {
        const payload = await dbGet("save");

        if (!payload || typeof payload !== "object") {
            return false;
        }

        try {
            if (payload.profile) {
                state.profile = {
                    ...state.profile,
                    ...payload.profile
                };
            }

            if (payload.settings) {
                state.settings = {
                    ...state.settings,
                    ...payload.settings
                };
            }

            if (payload.tactics) {
                state.tactics = {
                    ...state.tactics,
                    ...payload.tactics
                };
            }

            if (payload.selectedEquipment) {
                state.selectedEquipment = {
                    ...state.selectedEquipment,
                    ...payload.selectedEquipment
                };
            }

            if (payload.selectedEquipmentTab) {
                state.selectedEquipmentTab =
                    payload.selectedEquipmentTab;
            }

            if (payload.match) {
                state.match = {
                    ...state.match,
                    ...payload.match
                };

                if (!Array.isArray(state.match.goals)) {
                    state.match.goals = [];
                }

                if (!Array.isArray(state.match.events)) {
                    state.match.events = [];
                }
            }

            if (Array.isArray(payload.teams)) {
                payload.teams.forEach((savedTeam) => {
                    const team = findTeam(savedTeam.id);

                    if (team) {
                        Object.assign(team, savedTeam);
                    }
                });
            }

            if (Array.isArray(payload.tournaments)) {
                state.tournaments = payload.tournaments;
            }

            populateProfile();
            populateSettings();

            setText(
                "saveStatusLabel",
                "Sauvegarde locale restaurée"
            );

            return true;
        } catch (error) {
            console.warn("Lecture de sauvegarde incomplète :", error);
            return false;
        }
    }

    /* ========================================================
       11. MOTEUR PLAYCANVAS
    ======================================================== */

    async function loadPlayCanvas() {
        const urls = [
            `https://cdn.jsdelivr.net/npm/playcanvas@${ENGINE_VERSION}/build/playcanvas.mjs`,
            `https://unpkg.com/playcanvas@${ENGINE_VERSION}/build/playcanvas.mjs`
        ];

        let lastError = null;

        for (const url of urls) {
            try {
                updateLoading(18, "Chargement du moteur PlayCanvas...");

                const module = await import(url);

                if (
                    module &&
                    module.Application &&
                    module.Entity
                ) {
                    return module;
                }

                throw new Error(
                    "Le module téléchargé ne contient pas les composants attendus."
                );
            } catch (error) {
                lastError = error;

                console.warn(
                    "Échec du chargement PlayCanvas :",
                    url,
                    error
                );
            }
        }

        throw lastError || new Error(
            "Impossible de charger PlayCanvas."
        );
    }

    function createMaterial(colorHex, emissive = false) {
        const pc = state.pc;

        const material = new pc.StandardMaterial();

        const color = new pc.Color(
            parseInt(colorHex.slice(1, 3), 16) / 255,
            parseInt(colorHex.slice(3, 5), 16) / 255,
            parseInt(colorHex.slice(5, 7), 16) / 255
        );

        material.diffuse = color;

        if (emissive) {
            material.emissive = color;
            material.emissiveIntensity = 0.12;
        }

        material.metalness = 0.05;
        material.gloss = 0.25;
        material.update();

        return material;
    }

    function createPrimitive(
        name,
        type,
        position,
        scale,
        color,
        parent = null
    ) {
        const pc = state.pc;

        const entity = new pc.Entity(name);

        entity.addComponent("render", {
            type
        });

        entity.setLocalPosition(
            position[0],
            position[1],
            position[2]
        );

        entity.setLocalScale(
            scale[0],
            scale[1],
            scale[2]
        );

        if (color) {
            entity.render.material = createMaterial(color);
        }

        (parent || state.app.root).addChild(entity);

        state.world.entities.push(entity);

        return entity;
    }

    function createLine(name, x1, z1, x2, z2, color = "#ffffff") {
        const dx = x2 - x1;
        const dz = z2 - z1;

        const length = Math.sqrt(dx * dx + dz * dz);

        const entity = createPrimitive(
            name,
            "box",
            [
                (x1 + x2) / 2,
                0.035,
                (z1 + z2) / 2
            ],
            [
                length,
                0.045,
                0.055
            ],
            color
        );

        entity.setLocalEulerAngles(
            0,
            -Math.atan2(dz, dx) * 180 / Math.PI,
            0
        );

        return entity;
    }

    function createPitch() {
        const green = "#18753d";
        const stripe = "#1d8044";

        createPrimitive(
            "football-pitch-base",
            "box",
            [0, -0.3, 0],
            [62, 0.5, 96],
            green
        );

        for (let i = 0; i < 8; i++) {
            createPrimitive(
                `pitch-stripe-${i}`,
                "box",
                [
                    0,
                    -0.035,
                    -42 + i * 12
                ],
                [62, 0.035, 6],
                i % 2 === 0 ? stripe : green
            );
        }

        const white = "#f6f6ef";

        createLine("pitch-top-line", -30, -46, 30, -46, white);
        createLine("pitch-bottom-line", -30, 46, 30, 46, white);
        createLine("pitch-left-line", -30, -46, -30, 46, white);
        createLine("pitch-right-line", 30, -46, 30, 46, white);
        createLine("pitch-mid-line", -30, 0, 30, 0, white);

        /*
         * Cercle central approximé par une série de segments.
         */
        for (let i = 0; i < 36; i++) {
            const a1 = i / 36 * Math.PI * 2;
            const a2 = (i + 1) / 36 * Math.PI * 2;

            createLine(
                `center-circle-${i}`,
                Math.cos(a1) * 9,
                Math.sin(a1) * 9,
                Math.cos(a2) * 9,
                Math.sin(a2) * 9,
                white
            );
        }

        /*
         * Surfaces de réparation.
         */
        createLine("home-box-top", -18, -35, 18, -35, white);
        createLine("home-box-left", -18, -46, -18, -35, white);
        createLine("home-box-right", 18, -46, 18, -35, white);

        createLine("away-box-bottom", -18, 35, 18, 35, white);
        createLine("away-box-left", -18, 35, -18, 46, white);
        createLine("away-box-right", 18, 35, 18, 46, white);

        /*
         * Points centraux.
         */
        createPrimitive(
            "center-spot",
            "sphere",
            [0, 0.07, 0],
            [0.22, 0.1, 0.22],
            white
        );

        createGoal(-10, -46, "home");
        createGoal(-10, 46, "away");

        state.world.pitch = true;
    }

    function createGoal(x, z, side) {
        const postColor = "#f8f8f8";
        const goalWidth = 10;
        const goalHeight = 3.2;
        const direction = z < 0 ? -1 : 1;

        const left = createPrimitive(
            `${side}-goal-left-post`,
            "box",
            [x - goalWidth / 2, goalHeight / 2, z],
            [0.18, goalHeight, 0.18],
            postColor
        );

        const right = createPrimitive(
            `${side}-goal-right-post`,
            "box",
            [x + goalWidth / 2, goalHeight / 2, z],
            [0.18, goalHeight, 0.18],
            postColor
        );

        const crossbar = createPrimitive(
            `${side}-goal-crossbar`,
            "box",
            [x, goalHeight, z],
            [goalWidth, 0.18, 0.18],
            postColor
        );

        createPrimitive(
            `${side}-goal-net-back`,
            "box",
            [
                x,
                goalHeight / 2,
                z + direction * 1.3
            ],
            [goalWidth, goalHeight, 0.08],
            "#d4dce5"
        );

        if (side === "home") {
            state.world.homeGoal = {
                left,
                right,
                crossbar,
                x,
                z
            };
        } else {
            state.world.awayGoal = {
                left,
                right,
                crossbar,
                x,
                z
            };
        }
    }

    function createStadium() {
        createPrimitive(
            "stadium-ground",
            "box",
            [0, -0.8, 0],
            [110, 0.4, 145],
            "#26333d"
        );

        const standColors = [
            "#32485c",
            "#3c4b59",
            "#293d4e"
        ];

        for (let side = 0; side < 2; side++) {
            const x = side === 0 ? -39 : 39;

            createPrimitive(
                `stadium-stand-${side}`,
                "box",
                [x, 3.0, 0],
                [10, 6, 100],
                standColors[side]
            );

            for (let row = 0; row < 4; row++) {
                createPrimitive(
                    `stadium-row-${side}-${row}`,
                    "box",
                    [
                        x,
                        5 + row * 0.55,
                        0
                    ],
                    [10.2, 0.12, 100],
                    row % 2 === 0
                        ? "#627587"
                        : "#455b6d"
                );
            }
        }

        createPrimitive(
            "stadium-north-stand",
            "box",
            [0, 2.4, -55],
            [74, 4.8, 7],
            "#344c60"
        );

        createPrimitive(
            "stadium-south-stand",
            "box",
            [0, 2.4, 55],
            [74, 4.8, 7],
            "#344c60"
        );
    }

    function createLighting() {
        const pc = state.pc;
        const app = state.app;

        const light = new pc.Entity("stadium-directional-light");

        light.addComponent("light", {
            type: "directional",
            color: new pc.Color(1, 0.94, 0.82),
            intensity: 1.35,
            castShadows: false
        });

        light.setLocalEulerAngles(45, 35, 0);

        app.root.addChild(light);

        state.world.entities.push(light);

        const fillLight = new pc.Entity("stadium-fill-light");

        fillLight.addComponent("light", {
            type: "omni",
            color: new pc.Color(0.45, 0.62, 1),
            intensity: 0.35,
            range: 130
        });

        fillLight.setLocalPosition(0, 35, 0);

        app.root.addChild(fillLight);

        state.world.entities.push(fillLight);
    }

    function createCamera() {
        const pc = state.pc;
        const camera = new pc.Entity("football-camera");

        camera.addComponent("camera", {
            clearColor: new pc.Color(0.42, 0.62, 0.77),
            fov: 48,
            nearClip: 0.1,
            farClip: 300
        });

        camera.setLocalPosition(0, 29, 39);
        camera.lookAt(0, 0, 0);

        state.app.root.addChild(camera);

        state.world.camera = camera;
        state.world.entities.push(camera);

        state.camera.zoom = state.camera.defaultZoom;
    }

    function createPlayerModel(name, color, number, x, z, teamSide) {
        const pc = state.pc;

        const root = new pc.Entity(name);

        root.setLocalPosition(x, 0, z);

        state.app.root.addChild(root);

        const body = new pc.Entity(`${name}-body`);

        body.addComponent("render", {
            type: "capsule"
        });

        body.setLocalPosition(0, 1.0, 0);
        body.setLocalScale(0.62, 1.0, 0.62);
        body.render.material = createMaterial(color);

        root.addChild(body);

        const head = new pc.Entity(`${name}-head`);

        head.addComponent("render", {
            type: "sphere"
        });

        head.setLocalPosition(0, 1.95, 0);
        head.setLocalScale(0.48, 0.48, 0.48);
        head.render.material = createMaterial("#c99772");

        root.addChild(head);

        const legLeft = createPrimitive(
            `${name}-leg-left`,
            "box",
            [-0.18, 0.32, 0],
            [0.18, 0.68, 0.22],
            "#202632",
            root
        );

        const legRight = createPrimitive(
            `${name}-leg-right`,
            "box",
            [0.18, 0.32, 0],
            [0.18, 0.68, 0.22],
            "#202632",
            root
        );

        /*
         * Les modèles utilisent une géométrie simple pour rester
         * compatibles avec les téléphones Android modestes.
         */
        const player = {
            entity: root,
            body,
            head,
            legLeft,
            legRight,

            name,
            number,
            color,
            teamSide,

            x,
            z,
            vx: 0,
            vz: 0,

            baseX: x,
            baseZ: z,

            speed: 4.3,
            rating: randomInt(65, 94),

            isUserControlled: false,
            hasBall: false,

            animationOffset: random(0, Math.PI * 2)
        };

        root.name = name;

        state.world.entities.push(root);

        return player;
    }

    function getFormationPositions(teamSide) {
        const sign = teamSide === "home" ? -1 : 1;

        /*
         * Gardien, défense, milieu, attaque.
         * Les positions sont distribuées sur le terrain.
         */
        const positions = [
            [0, sign * 40],

            [-22, sign * 29],
            [-8, sign * 31],
            [8, sign * 31],
            [22, sign * 29],

            [-22, sign * 12],
            [-8, sign * 14],
            [8, sign * 14],
            [22, sign * 12],

            [-10, sign * 3],
            [10, sign * 3]
        ];

        return positions;
    }

    function createTeamPlayers(teamId, teamSide) {
        const team = findTeam(teamId);

        if (!team) {
            return [];
        }

        const formation = getFormationPositions(teamSide);

        const result = [];

        for (
            let i = 0;
            i < Math.min(PLAYERS_ON_FIELD, formation.length);
            i++
        ) {
            const [x, z] = formation[i];

            const playerData = team.roster[i];

            const player = createPlayerModel(
                `${team.name}-${playerData.number}`,
                team.color,
                playerData.number,
                x,
                z,
                teamSide
            );

            player.playerData = playerData;
            player.teamId = team.id;

            result.push(player);
        }

        return result;
    }

    function createBall() {
        const ball = createPrimitive(
            "football-match-ball",
            "sphere",
            [0, 0.45, 0],
            [0.72, 0.72, 0.72],
            state.equipment.balls.find(
                (item) =>
                    item.id === state.selectedEquipment.balls
            )?.color || "#ffffff"
        );

        state.world.ball = {
            entity: ball,
            x: 0,
            y: 0.45,
            z: 0,
            vx: 0,
            vz: 0,
            owner: null,
            lastTouchTeam: null,
            lastTouchPlayer: null,
            lastKickTime: 0
        };
    }

    function createWorld() {
        const pc = state.pc;

        if (!pc || !state.app) {
            throw new Error("Le moteur PlayCanvas n'est pas prêt.");
        }

        state.world.entities = [];
        state.world.players = [];
        state.world.homePlayers = [];
        state.world.awayPlayers = [];

        createLighting();
        createStadium();
        createPitch();
        createCamera();

        state.world.homePlayers = createTeamPlayers(
            state.match.homeTeamId,
            "home"
        );

        state.world.awayPlayers = createTeamPlayers(
            state.match.awayTeamId,
            "away"
        );

        state.world.players = [
            ...state.world.homePlayers,
            ...state.world.awayPlayers
        ];

        if (state.world.players.length) {
            state.world.players[0].isUserControlled = true;
        }

        createBall();

        /*
         * Le moteur n'est considéré prêt qu'après la construction
         * de la scène de base.
         */
        state.world.worldCreated = true;

        updateScoreboard();

        setText(
            "engineStatus",
            `${state.world.players.length} joueurs actifs · PlayCanvas 3D`
        );
    }

    async function initializeEngine() {
        if (state.engineReady || state.starting) {
            return state.engineReady;
        }

        state.starting = true;

        try {
            updateLoading(8, "Préparation de l'application...");

            const canvas = $("footballCanvas");

            if (!canvas) {
                throw new Error(
                    "Le canvas #footballCanvas est absent du HTML."
                );
            }

            state.pc = await loadPlayCanvas();

            updateLoading(40, "Création du moteur 3D...");

            const pc = state.pc;

            const graphicsOptions = {
                alpha: false,
                antialias: true,
                depth: true,
                stencil: false,
                powerPreference: "high-performance"
            };

            const app = new pc.Application(canvas, {
                graphicsDeviceOptions: graphicsOptions
            });

            state.app = app;

            if (typeof app.setCanvasFillMode === "function") {
                app.setCanvasFillMode(pc.FILLMODE_KEEP_ASPECT);
            }

            if (typeof app.setCanvasResolution === "function") {
                app.setCanvasResolution(pc.RESOLUTION_AUTO);
            }

            if (app.graphicsDevice) {
                const ratio =
                    state.settings.graphicsQuality === "low"
                        ? 1
                        : Math.min(window.devicePixelRatio || 1, 2);

                app.graphicsDevice.maxPixelRatio = ratio;
            }

            app.scene.ambientLight = new pc.Color(
                0.36,
                0.40,
                0.44
            );

            updateLoading(58, "Construction du stade...");

            createWorld();

            updateLoading(75, "Préparation des joueurs...");

            app.on("update", onEngineUpdate);

            app.start();

            state.engineReady = true;
            state.engineFailed = false;

            resizeEngineCanvas();

            updateLoading(100, "Le jeu est prêt.");

            window.setTimeout(() => {
                hideElement("loadingScreen");
            }, 350);

            setText(
                "engineStatus",
                "PlayCanvas prêt · Terrain actif"
            );

            toast("FOBAS FOOTBALL est prêt.");

            return true;
        } catch (error) {
            state.engineReady = false;
            state.engineFailed = true;

            console.error(
                "[FOBAS FOOTBALL] Erreur d'initialisation :",
                error
            );

            updateLoading(
                100,
                "Le moteur 3D n'a pas pu démarrer. Vérifiez Internet puis réessayez."
            );

            showElement("retryLoadingBtn");

            setText(
                "engineStatus",
                "Moteur 3D indisponible"
            );

            /*
             * Le menu reste accessible : l'échec du moteur ne doit
             * pas enfermer l'utilisateur sur l'écran de chargement.
             */
            window.setTimeout(() => {
                hideElement("loadingScreen");
                navigate("mainMenu");

                toast(
                    "Le moteur 3D n'est pas disponible. Le menu reste utilisable.",
                    5000
                );
            }, 700);

            return false;
        } finally {
            state.starting = false;
        }
    }

    function resizeEngineCanvas() {
        if (!state.app) {
            return;
        }

        try {
            if (typeof state.app.resizeCanvas === "function") {
                state.app.resizeCanvas();
            }
        } catch (error) {
            console.warn("Redimensionnement du canvas :", error);
        }
    }

    /* ========================================================
       12. CAMÉRA ET ZOOM
    ======================================================== */

    function updateCamera() {
        const camera = state.world.camera;

        if (!camera) {
            return;
        }

        const zoom = state.camera.zoom;

        const distance = state.world.cameraDistance / zoom;
        const height = state.world.cameraHeight / zoom;

        const targetX = 0;
        const targetY = 0;
        const targetZ = 0;

        const angle = state.camera.angle;

        const x = Math.sin(angle) * distance;
        const z = Math.cos(angle) * distance;

        camera.setLocalPosition(x, height, z);
        camera.lookAt(targetX, targetY, targetZ);
    }

    function setZoom(value) {
        state.camera.zoom = clamp(
            value,
            state.camera.minZoom,
            state.camera.maxZoom
        );

        updateCamera();
    }

    function zoomIn() {
        setZoom(state.camera.zoom + 0.12);
    }

    function zoomOut() {
        setZoom(state.camera.zoom - 0.12);
    }

    function resetCamera() {
        state.camera.zoom = state.camera.defaultZoom;
        state.camera.angle = 0;

        updateCamera();

        toast("Caméra réinitialisée.");
    }

    function changeCamera() {
        state.camera.angle += Math.PI / 3;

        if (state.camera.angle >= Math.PI * 2) {
            state.camera.angle = 0;
        }

        updateCamera();

        toast("Angle de caméra modifié.");
    }

    /* ========================================================
       13. JOYSTICK ET COMMANDES
    ======================================================== */

    function getJoystickCenter() {
        const base = $("joystickBase");

        if (!base) {
            return null;
        }

        const rect = base.getBoundingClientRect();

        return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2,
            radius: Math.min(rect.width, rect.height) * 0.35
        };
    }

    function updateJoystick(clientX, clientY) {
        const center = getJoystickCenter();

        if (!center) {
            return;
        }

        const dx = clientX - center.x;
        const dy = clientY - center.y;

        const length = Math.sqrt(dx * dx + dy * dy);
        const max = Math.max(1, center.radius);
        const ratio = Math.min(1, length / max);

        const nx = length > 0 ? dx / length * ratio : 0;
        const ny = length > 0 ? dy / length * ratio : 0;

        state.joystick.x = nx;
        state.joystick.y = ny;

        const knob = $("joystickKnob");

        if (knob) {
            const travel = center.radius;

            knob.style.transform =
                `translate(${nx * travel}px, ${ny * travel}px)`;
        }
    }

    function resetJoystick() {
        state.joystick.active = false;
        state.joystick.pointerId = null;
        state.joystick.x = 0;
        state.joystick.y = 0;

        const knob = $("joystickKnob");

        if (knob) {
            knob.style.transform = "translate(0, 0)";
        }
    }

    function getControlledPlayer() {
        return state.world.players.find(
            (player) => player.isUserControlled
        ) || state.world.homePlayers[0] || null;
    }

    function switchPlayer() {
        const players = state.world.homePlayers;

        if (!players.length) {
            toast("Aucun joueur n'est disponible.");
            return;
        }

        const current = players.findIndex(
            (player) => player.isUserControlled
        );

        players.forEach((player) => {
            player.isUserControlled = false;
        });

        const next = (current + 1) % players.length;

        players[next].isUserControlled = true;

        state.match.playerIndex = next;

        toast(`Joueur contrôlé : ${players[next].name}`);
        playSound("switch");
    }

    function setSprint(enabled) {
        state.match.sprinting = Boolean(enabled);

        const button = $("sprintBtn");

        if (button) {
            button.classList.toggle(
                "active",
                state.match.sprinting
            );
        }
    }

    function setDefend(enabled) {
        state.match.defending = Boolean(enabled);

        const button = $("defendBtn");

        if (button) {
            button.classList.toggle(
                "active",
                state.match.defending
            );
        }
    }

    /* ========================================================
       14. SON
    ======================================================== */

    function getAudioContext() {
        if (state.audioContext) {
            return state.audioContext;
        }

        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContextClass) {
            return null;
        }

        try {
            state.audioContext = new AudioContextClass();
        } catch (_) {
            return null;
        }

        return state.audioContext;
    }

    function playSound(type = "tap") {
        if (!state.soundEnabled) {
            return;
        }

        const context = getAudioContext();

        if (!context) {
            return;
        }

        if (context.state === "suspended") {
            context.resume().catch(() => {});
        }

        try {
            const oscillator = context.createOscillator();
            const gain = context.createGain();

            const frequencies = {
                tap: 440,
                pass: 560,
                shoot: 180,
                goal: 760,
                whistle: 920,
                switch: 350,
                save: 620
            };

            oscillator.type =
                type === "goal" ? "triangle" : "sine";

            oscillator.frequency.value =
                frequencies[type] || frequencies.tap;

            const volume =
                (state.settings.soundVolume / 100) * 0.06;

            gain.gain.setValueAtTime(
                volume,
                context.currentTime
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                context.currentTime + 0.18
            );

            oscillator.connect(gain);
            gain.connect(context.destination);

            oscillator.start();
            oscillator.stop(context.currentTime + 0.2);
        } catch (_) {
            // Son facultatif : aucune action de jeu ne doit échouer ici.
        }
    }

    function toggleSound() {
        state.soundEnabled = !state.soundEnabled;

        const button = $("soundToggleBtn");

        if (button) {
            button.textContent =
                state.soundEnabled ? "🔊" : "🔇";

            button.setAttribute(
                "aria-pressed",
                String(state.soundEnabled)
            );
        }

        if (state.soundEnabled) {
            playSound("tap");
        }

        toast(
            state.soundEnabled
                ? "Son activé."
                : "Son désactivé."
        );
    }

    /* ========================================================
       15. LOGIQUE DU MATCH
    ======================================================== */

    function updateScoreboard() {
        setText("homeTeamName", getTeamName(state.match.homeTeamId));
        setText("awayTeamName", getTeamName(state.match.awayTeamId));

        setText("homeScore", state.match.homeScore);
        setText("awayScore", state.match.awayScore);

        setText(
            "competitionLabel",
            getCompetitionName(state.match.competition).toUpperCase()
        );

        setText(
            "stadiumLabel",
            state.match.stadium === "neutral"
                ? "TERRAIN NEUTRE"
                : "STADE FOBAS"
        );

        const seconds = Math.floor(state.match.elapsed);
        const minutes = Math.floor(seconds / 60);
        const remainder = seconds % 60;

        setText(
            "matchClock",
            `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
        );

        setText(
            "matchPeriod",
            state.match.period === 1
                ? "1re MI-TEMPS"
                : "2e MI-TEMPS"
        );
    }

    function getCompetitionName(id) {
        return state.competitions.find(
            (item) => item.id === id
        )?.name || "Match local";
    }

    function recordEvent(type, message, extra = {}) {
        const event = {
            id: `${now()}-${Math.random().toString(36).slice(2, 8)}`,
            type,
            message,
            time: state.match.elapsed,
            createdAt: now(),
            ...extra
        };

        state.match.events.push(event);

        if (state.match.events.length > 250) {
            state.match.events.shift();
        }

        state.match.lastEventTime = now();

        if (state.settings.commentary) {
            setText("refereeDecisionLabel", message);
        }

        return event;
    }

    function startMatch() {
        if (!state.engineReady || !state.world.worldCreated) {
            showDialog(
                "Moteur 3D en préparation",
                "Le moteur 3D n'est pas encore disponible. Vérifiez la connexion Internet, puis réessayez.",
                [
                    {
                        label: "RÉESSAYER",
                        onClick: async () => {
                            closeDialog();

                            await initializeEngine();

                            if (state.engineReady) {
                                startMatch();
                            }
                        }
                    },
                    {
                        label: "RETOUR AU MENU",
                        className: "ui-button button-secondary",
                        onClick: () => {
                            closeDialog();
                            navigate("mainMenu");
                        }
                    }
                ]
            );

            return;
        }

        const homeId =
            $("homeTeamSelect")?.value ||
            state.match.homeTeamId;

        let awayId =
            $("awayTeamSelect")?.value ||
            state.match.awayTeamId;

        if (homeId === awayId) {
            const alternative = state.teams.find(
                (team) => team.id !== homeId
            );

            awayId = alternative?.id || state.match.awayTeamId;

            setValue("awayTeamSelect", awayId);
        }

        state.match.homeTeamId = homeId;
        state.match.awayTeamId = awayId;

        state.match.competition =
            $("competitionSelect")?.value || "local";

        state.match.stadium =
            $("stadiumSelect")?.value || "home";

        state.match.duration =
            $("matchDurationSelect")?.value || "standard";

        state.match.matchLength =
            state.match.duration === "short"
                ? 90
                : state.match.duration === "long"
                    ? 360
                    : 180;

        state.match.homeScore = 0;
        state.match.awayScore = 0;
        state.match.elapsed = 0;
        state.match.period = 1;
        state.match.goals = [];
        state.match.events = [];
        state.match.matchFinished = false;

        state.matchActive = true;
        state.matchPaused = false;
        state.matchFinished = false;

        /*
         * Si le moteur est déjà lancé, on reconstruit la scène
         * du match sans créer une deuxième application.
         */
        if (state.app && state.world.worldCreated) {
            rebuildMatchWorld();
        }

        navigate("matchScreen");

        setText(
            "refereeDecisionLabel",
            `${REFEREE_NAME} : match autorisé`
        );

        recordEvent(
            "kickoff",
            `Coup d'envoi : ${getTeamName(homeId)} contre ${getTeamName(awayId)}`
        );

        showAnnouncement(
            "COUP D'ENVOI",
            `${getTeamName(homeId)} contre ${getTeamName(awayId)}`,
            3200
        );

        updateScoreboard();
        playSound("whistle");

        toast("Le match a commencé.");
    }

    function rebuildMatchWorld() {
        /*
         * On retire les anciennes entités de match en conservant
         * l'application PlayCanvas elle-même.
         */
        const oldEntities = [...state.world.entities];

        oldEntities.forEach((entity) => {
            try {
                if (entity && entity.parent) {
                    entity.destroy();
                }
            } catch (_) {
                // Continuer même si une entité est déjà détruite.
            }
        });

        state.world.entities = [];
        state.world.players = [];
        state.world.homePlayers = [];
        state.world.awayPlayers = [];
        state.world.ball = null;
        state.world.camera = null;
        state.world.worldCreated = false;

        createWorld();
    }

    function finishAndReturnToMenu() {
        state.matchActive = false;
        state.matchPaused = false;

        hideElement("pauseOverlay");

        navigate("mainMenu");
    }

    function pauseMatch() {
        if (!state.matchActive || state.matchFinished) {
            toast("Aucun match actif.");
            return;
        }

        state.matchPaused = true;

        showElement("pauseOverlay");

        playSound("tap");
    }

    function resumeMatch() {
        state.matchPaused = false;

        hideElement("pauseOverlay");

        navigate("matchScreen");

        playSound("tap");
    }

    function finishMatch() {
        if (state.matchFinished) {
            return;
        }

        state.matchFinished = true;
        state.matchActive = false;
        state.matchPaused = false;

        const home = findTeam(state.match.homeTeamId);
        const away = findTeam(state.match.awayTeamId);

        if (home && away) {
            home.played += 1;
            away.played += 1;

            home.goalsFor += state.match.homeScore;
            home.goalsAgainst += state.match.awayScore;

            away.goalsFor += state.match.awayScore;
            away.goalsAgainst += state.match.homeScore;

            if (state.match.homeScore > state.match.awayScore) {
                home.wins += 1;
                away.losses += 1;
            } else if (
                state.match.homeScore < state.match.awayScore
            ) {
                away.wins += 1;
                home.losses += 1;
            } else {
                home.draws += 1;
                away.draws += 1;
            }
        }

        state.profile.matchesPlayed += 1;

        const result =
            state.match.homeScore > state.match.awayScore
                ? `Victoire de ${getTeamName(state.match.homeTeamId)}`
                : state.match.homeScore < state.match.awayScore
                    ? `Victoire de ${getTeamName(state.match.awayTeamId)}`
                    : "Match nul";

        recordEvent("full-time", `Fin du match : ${result}`);

        showDialog(
            "FIN DU MATCH",
            `${getTeamName(state.match.homeTeamId)} ${state.match.homeScore} — ${state.match.awayScore} ${getTeamName(state.match.awayTeamId)}. ${result}.`,
            [
                {
                    label: "REJOUER",
                    onClick: () => {
                        closeDialog();
                        startMatch();
                    }
                },
                {
                    label: "MENU PRINCIPAL",
                    className: "ui-button button-secondary",
                    onClick: async () => {
                        closeDialog();
                        await saveGame(true);
                        finishAndReturnToMenu();
                    }
                }
            ]
        );

        saveGame(true);
    }

    function getMatchClockFactor() {
        if (state.match.duration === "short") {
            return 1.3;
        }

        if (state.match.duration === "long") {
            return 0.8;
        }

        return 1;
    }

    function onEngineUpdate(dt) {
        if (!Number.isFinite(dt) || dt <= 0) {
            return;
        }

        dt = Math.min(dt, 0.05);

        if (state.matchActive && !state.matchPaused && !state.matchFinished) {
            updateMatch(dt);
        }

        updatePlayerAnimations(dt);
        updateCamera();
    }

    function updateMatch(dt) {
        const clockFactor = getMatchClockFactor();

        state.match.elapsed += dt * clockFactor;

        const totalLength = state.match.matchLength;

        if (
            state.match.period === 1 &&
            state.match.elapsed >= totalLength / 2
        ) {
            state.match.period = 2;

            recordEvent(
                "half-time",
                "Mi-temps. Les équipes changent de période."
            );

            showAnnouncement(
                "MI-TEMPS",
                "Les joueurs se préparent pour la deuxième période.",
                2600
            );
        }

        if (state.match.elapsed >= totalLength) {
            state.match.elapsed = totalLength;

            updateScoreboard();
            finishMatch();

            return;
        }

        updateControlledPlayer(dt);
        updateAIPlayers(dt);
        updateBallPhysics(dt);
        checkBallEvents();

        updateScoreboard();
    }

    function updateControlledPlayer(dt) {
        const player = getControlledPlayer();

        if (!player) {
            return;
        }

        const joystickX = state.joystick.x;
        const joystickY = state.joystick.y;

        let speed = player.speed;

        if (state.match.sprinting) {
            speed *= 1.7;
        }

        if (state.match.defending) {
            speed *= 0.78;
        }

        const moveX = joystickX * speed * dt;
        const moveZ = joystickY * speed * dt;

        player.x = clamp(player.x + moveX, -29, 29);
        player.z = clamp(player.z + moveZ, -45, 45);

        player.entity.setLocalPosition(
            player.x,
            0,
            player.z
        );

        if (Math.abs(moveX) + Math.abs(moveZ) > 0.001) {
            player.entity.setLocalEulerAngles(
                0,
                Math.atan2(moveX, moveZ) * 180 / Math.PI,
                0
            );
        }

        const ball = state.world.ball;

        if (ball) {
            const distance = Math.hypot(
                ball.x - player.x,
                ball.z - player.z
            );

            if (distance < 1.65) {
                ball.owner = player;
                ball.vx = 0;
                ball.vz = 0;
                player.hasBall = true;
            } else {
                player.hasBall = false;
            }
        }
    }

    function updateAIPlayers(dt) {
        const ball = state.world.ball;

        if (!ball) {
            return;
        }

        const allPlayers = state.world.players;

        for (const player of allPlayers) {
            if (player.isUserControlled) {
                continue;
            }

            let targetX = player.baseX;
            let targetZ = player.baseZ;

            const isHome = player.teamSide === "home";

            const attackDirection = isHome ? 1 : -1;

            const ballDistance = Math.hypot(
                ball.x - player.x,
                ball.z - player.z
            );

            /*
             * Un joueur proche du ballon peut tenter de s'en
             * approcher ; les autres conservent leur formation.
             */
            if (ballDistance < 13) {
                const shouldChase =
                    player === allPlayers.find(
                        (candidate) =>
                            candidate.teamSide === player.teamSide &&
                            Math.hypot(
                                ball.x - candidate.x,
                                ball.z - candidate.z
                            ) < 12
                    );

                if (shouldChase) {
                    targetX = ball.x;
                    targetZ = ball.z;
                } else {
                    targetZ += attackDirection * 1.4;
                }
            } else {
                targetZ += attackDirection * 0.6;
            }

            if (ball.owner === player) {
                targetX = player.x + random(-0.6, 0.6);
                targetZ = player.z + attackDirection * 4;
            }

            const dx = targetX - player.x;
            const dz = targetZ - player.z;

            const distance = Math.hypot(dx, dz);

            if (distance > 0.15) {
                const speed =
                    player.speed *
                    (state.settings.matchDifficulty === "expert"
                        ? 1.3
                        : state.settings.matchDifficulty === "hard"
                            ? 1.15
                            : state.settings.matchDifficulty === "easy"
                                ? 0.8
                                : 1);

                const step = Math.min(speed * dt, distance);

                player.x += dx / distance * step;
                player.z += dz / distance * step;

                player.x = clamp(player.x, -29, 29);
                player.z = clamp(player.z, -45, 45);

                player.entity.setLocalPosition(
                    player.x,
                    0,
                    player.z
                );
            }

            if (
                ballDistance < 1.3 &&
                !ball.owner &&
                Math.random() < 0.03
            ) {
                ball.owner = player;
            }

            if (
                ball.owner === player &&
                Math.random() < dt * 0.35
            ) {
                const goalDirection = isHome ? 1 : -1;

                if (Math.random() < 0.45) {
                    ball.vz = goalDirection * random(8, 16);
                    ball.vx = random(-3, 3);

                    ball.owner = null;
                    ball.lastTouchTeam = player.teamSide;
                    ball.lastTouchPlayer = player;
                    ball.lastKickTime = now();
                }
            }
        }
    }

    function updateBallPhysics(dt) {
        const ball = state.world.ball;

        if (!ball || !ball.entity) {
            return;
        }

        if (ball.owner) {
            const owner = ball.owner;

            ball.x = owner.x;
            ball.z = owner.z + (
                owner.teamSide === "home" ? 0.85 : -0.85
            );

            ball.y = 0.48;

            ball.entity.setLocalPosition(
                ball.x,
                ball.y,
                ball.z
            );

            return;
        }

        ball.x += ball.vx * dt;
        ball.z += ball.vz * dt;

        ball.vx *= Math.pow(0.35, dt);
        ball.vz *= Math.pow(0.35, dt);

        if (Math.abs(ball.vx) < 0.05) {
            ball.vx = 0;
        }

        if (Math.abs(ball.vz) < 0.05) {
            ball.vz = 0;
        }

        if (ball.x < -30 || ball.x > 30) {
            ball.vx *= -0.55;
            ball.x = clamp(ball.x, -30, 30);
        }

        ball.entity.setLocalPosition(
            ball.x,
            ball.y,
            ball.z
        );
    }

    function updatePlayerAnimations(dt) {
        const t = now() / 1000;

        state.world.players.forEach((player) => {
            if (!player.entity) {
                return;
            }

            const moving =
                Math.abs(player.vx) + Math.abs(player.vz) > 0.05 ||
                (
                    player.isUserControlled &&
                    (
                        Math.abs(state.joystick.x) +
                        Math.abs(state.joystick.y)
                    ) > 0.05
                );

            const wave = moving
                ? Math.sin(t * 9 + player.animationOffset) * 0.06
                : 0;

            if (player.body) {
                player.body.setLocalPosition(
                    0,
                    1.0 + Math.abs(wave) * 0.5,
                    0
                );
            }
        });
    }

    /* ========================================================
       16. ACTIONS : PASSE, TIR, DÉFENSE
    ======================================================== */

    function getBall() {
        return state.world.ball;
    }

    function passBall() {
        if (!state.matchActive || state.matchPaused) {
            toast("Lancez un match pour faire une passe.");
            return;
        }

        const player = getControlledPlayer();
        const ball = getBall();

        if (!player || !ball) {
            return;
        }

        const teammates = state.world.homePlayers
            .filter((item) => item !== player)
            .sort((a, b) => {
                const da = Math.hypot(
                    a.x - player.x,
                    a.z - player.z
                );

                const db = Math.hypot(
                    b.x - player.x,
                    b.z - player.z
                );

                return da - db;
            });

        const target = teammates[0];

        ball.owner = null;

        if (target) {
            const dx = target.x - ball.x;
            const dz = target.z - ball.z;

            const length = Math.max(
                0.1,
                Math.hypot(dx, dz)
            );

            ball.vx = dx / length * 10;
            ball.vz = dz / length * 10;
        } else {
            ball.vx = random(-3, 3);
            ball.vz = 8;
        }

        ball.lastTouchTeam = "home";
        ball.lastTouchPlayer = player;
        ball.lastKickTime = now();

        recordEvent(
            "pass",
            `${player.name} effectue une passe.`
        );

        playSound("pass");
        vibrate(20);
    }

    function shootBall() {
        if (!state.matchActive || state.matchPaused) {
            toast("Lancez un match pour tirer.");
            return;
        }

        const player = getControlledPlayer();
        const ball = getBall();

        if (!player || !ball) {
            return;
        }

        const goalDirection = player.teamSide === "home" ? 1 : -1;

        ball.owner = null;

        ball.vx = clamp(
            (player.x * -0.14) + random(-2.4, 2.4),
            -9,
            9
        );

        ball.vz = goalDirection * random(15, 23);
        ball.y = 0.55;

        ball.lastTouchTeam = player.teamSide;
        ball.lastTouchPlayer = player;
        ball.lastKickTime = now();

        recordEvent(
            "shot",
            `${player.name} tente un tir au but.`
        );

        playSound("shoot");
        vibrate(40);
    }

    function defendAction() {
        if (!state.matchActive || state.matchPaused) {
            toast("Lancez un match pour défendre.");
            return;
        }

        setDefend(!state.match.defending);

        const player = getControlledPlayer();

        if (player && state.match.defending) {
            const opponent = state.world.awayPlayers
                .slice()
                .sort((a, b) => {
                    const da = Math.hypot(
                        a.x - player.x,
                        a.z - player.z
                    );

                    const db = Math.hypot(
                        b.x - player.x,
                        b.z - player.z
                    );

                    return da - db;
                })[0];

            if (opponent) {
                const distance = Math.hypot(
                    opponent.x - player.x,
                    opponent.z - player.z
                );

                if (
                    distance < 2 &&
                    Math.random() < 0.5
                ) {
                    const ball = getBall();

                    if (ball) {
                        ball.owner = player;

                        recordEvent(
                            "tackle",
                            `${player.name} récupère le ballon.`
                        );

                        showAnnouncement(
                            "RÉCUPÉRATION",
                            `${player.name} reprend le ballon.`
                        );
                    }
                }
            }
        }

        playSound("tap");
    }

    function checkBallEvents() {
        const ball = getBall();

        if (!ball || !state.matchActive) {
            return;
        }

        /*
         * But du côté +Z.
         */
        if (
            ball.z >= 45 &&
            Math.abs(ball.x) < 5
        ) {
            if (ball.lastTouchTeam === "home") {
                registerGoal("home");
            } else if (ball.lastTouchTeam === "away") {
                registerGoal("away");
            } else {
                resetBall();
            }

            return;
        }

        /*
         * But du côté -Z.
         */
        if (
            ball.z <= -45 &&
            Math.abs(ball.x) < 5
        ) {
            if (ball.lastTouchTeam === "away") {
                registerGoal("away");
            } else if (ball.lastTouchTeam === "home") {
                registerGoal("home");
            } else {
                resetBall();
            }

            return;
        }

        /*
         * Sortie latérale : remise en jeu simplifiée.
         */
        if (Math.abs(ball.x) >= 30) {
            refereeDecision(
                "throw-in",
                "Remise en jeu après une sortie latérale."
            );

            resetBall();
        }

        /*
         * Sortie par la ligne de fond sans but.
         */
        if (Math.abs(ball.z) >= 47) {
            refereeDecision(
                "goal-kick",
                "Remise en jeu après une sortie par la ligne de fond."
            );

            resetBall();
        }
    }

    function registerGoal(teamSide) {
        if (state.matchFinished) {
            return;
        }

        const teamId =
            teamSide === "home"
                ? state.match.homeTeamId
                : state.match.awayTeamId;

        if (teamSide === "home") {
            state.match.homeScore += 1;
        } else {
            state.match.awayScore += 1;
        }

        const scorer = getBall()?.lastTouchPlayer;

        state.match.goals.push({
            teamId,
            scorer: scorer?.name || "Buteur",
            time: state.match.elapsed
        });

        if (teamSide === "home" && scorer) {
            state.profile.goalsScored += 1;
        }

        recordEvent(
            "goal",
            `BUT ! ${getTeamName(teamId)} marque.`,
            {
                teamId,
                scorer: scorer?.name || "Buteur"
            }
        );

        showAnnouncement(
            "⚽ BUT !",
            `${getTeamName(teamId)} marque !`,
            3200
        );

        playSound("goal");
        vibrate([60, 40, 100]);

        updateScoreboard();

        refereeDecision(
            "goal",
            `But accordé à ${getTeamName(teamId)}.`
        );

        resetBall();

        saveGame(true);
    }

    function resetBall() {
        const ball = getBall();

        if (!ball) {
            return;
        }

        ball.x = 0;
        ball.y = 0.48;
        ball.z = 0;

        ball.vx = 0;
        ball.vz = 0;

        ball.owner = null;
        ball.lastTouchTeam = null;
        ball.lastTouchPlayer = null;

        ball.entity.setLocalPosition(0, 0.48, 0);

        state.world.players.forEach((player) => {
            player.hasBall = false;
        });
    }

    /* ========================================================
       17. ARBITRE IA — MEME SELVANDIEU
    ======================================================== */

    function refereeDecision(type, message) {
        const decisionLabel = $("refereeDecisionLabel");

        if (decisionLabel) {
            decisionLabel.textContent = message;
        }

        recordEvent(
            `referee-${type}`,
            `${REFEREE_NAME} : ${message}`
        );

        if (type === "goal" || type === "foul") {
            playSound("whistle");
        }

        if (type === "foul") {
            showAnnouncement(
                "DÉCISION DE L'ARBITRE",
                message,
                3000
            );
        }
    }

    function reportFoul(playerName = "Joueur") {
        refereeDecision(
            "foul",
            `Faute signalée contre ${playerName}. Coup franc.`
        );

        toast(`${REFEREE_NAME} : coup franc.`);
    }

    /* ========================================================
       18. TACTIQUES
    ======================================================== */

    function openTactics() {
        if (!state.matchActive) {
            toast("Les tactiques sont disponibles pendant un match.");
        }

        setValue("formationSelect", state.tactics.formation);
        setValue("tacticalStyleSelect", state.tactics.style);
        setValue("pressureSelect", state.tactics.pressure);

        showElement("tacticsOverlay");
    }

    function applyTactics() {
        state.tactics.formation =
            $("formationSelect")?.value || "433";

        state.tactics.style =
            $("tacticalStyleSelect")?.value || "balanced";

        state.tactics.pressure =
            $("pressureSelect")?.value || "medium";

        hideElement("tacticsOverlay");

        recordEvent(
            "tactics",
            `Tactique appliquée : ${state.tactics.formation}, ${state.tactics.style}, pressing ${state.tactics.pressure}.`
        );

        toast("Tactiques appliquées.");

        saveGame(true);
    }

    /* ========================================================
       19. CRÉATION DE TOURNOIS
    ======================================================== */

    function createTournament() {
        const wrapper = document.createElement("div");

        const label = document.createElement("label");
        label.textContent = "Nom du tournoi";

        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 60;
        input.placeholder = "Ex. : FOBAS Champions Cup";

        const info = document.createElement("p");
        info.textContent =
            "Le tournoi sera enregistré dans la sauvegarde locale.";

        wrapper.append(label, input, info);

        showDialog(
            "Créer un tournoi",
            wrapper,
            [
                {
                    label: "ANNULER",
                    className: "ui-button button-secondary",
                    onClick: closeDialog
                },
                {
                    label: "CRÉER",
                    onClick: async () => {
                        const name = input.value.trim();

                        if (!name) {
                            toast("Entrez un nom pour le tournoi.");
                            input.focus();
                            return;
                        }

                        state.tournaments.push({
                            id: `custom-${now()}`,
                            name,
                            description: "Tournoi personnalisé FOBAS",
                            level: "champions",
                            createdAt: now()
                        });

                        closeDialog();

                        renderTournaments();

                        await saveGame(true);

                        toast(`Tournoi créé : ${name}`);
                    }
                }
            ]
        );
    }

    /* ========================================================
       20. INITIALISATION DES SÉLECTEURS
    ======================================================== */

    function initializeSelectors() {
        populateTeamSelects();

        const competitionSelect = $("competitionSelect");

        if (competitionSelect) {
            const existing = new Set(
                [...competitionSelect.options].map(
                    (option) => option.value
                )
            );

            state.competitions.forEach((competition) => {
                if (existing.has(competition.id)) {
                    return;
                }

                const option = document.createElement("option");

                option.value = competition.id;
                option.textContent = competition.name;

                competitionSelect.appendChild(option);
            });
        }

        if (
            $("homeTeamSelect") &&
            state.teams.some(
                (team) => team.id === state.match.homeTeamId
            )
        ) {
            setValue(
                "homeTeamSelect",
                state.match.homeTeamId
            );
        }

        if (
            $("awayTeamSelect") &&
            state.teams.some(
                (team) => team.id === state.match.awayTeamId
            )
        ) {
            setValue(
                "awayTeamSelect",
                state.match.awayTeamId
            );
        }
    }

    /* ========================================================
       21. LIAISON DES BOUTONS
    ======================================================== */

    function bindClick(id, handler) {
        const element = $(id);

        if (!element) {
            console.warn(
                `[FOBAS] Élément HTML absent : #${id}`
            );

            return;
        }

        element.addEventListener("click", (event) => {
            event.preventDefault();

            try {
                const result = handler(event);

                if (result && typeof result.catch === "function") {
                    result.catch((error) => {
                        console.error(
                            `[FOBAS] Action ${id} :`,
                            error
                        );

                        toast("Une erreur est survenue. Réessayez.");
                    });
                }
            } catch (error) {
                console.error(
                    `[FOBAS] Action ${id} :`,
                    error
                );

                toast("Une erreur est survenue. Réessayez.");
            }
        });
    }

    function bindNavigation() {
        const mapping = {
            playMatchBtn: () => navigate("matchSetupScreen"),
            continueCareerBtn: () => navigate("championshipScreen"),
            championshipsBtn: () => navigate("championshipScreen"),
            tournamentsBtn: () => navigate("tournamentScreen"),
            teamsBtn: () => navigate("teamsScreen"),
            equipmentBtn: () => navigate("equipmentScreen"),
            profileBtn: () => navigate("profileScreen"),
            howToPlayBtn: () => navigate("howToPlayScreen"),
            openSettingsBtn: () => navigate("settingsScreen")
        };

        Object.entries(mapping).forEach(([id, handler]) => {
            bindClick(id, handler);
        });

        document.querySelectorAll("[data-action]").forEach((button) => {
            button.addEventListener("click", () => {
                const action = button.dataset.action;

                if (action === "play-match") {
                    navigate("matchSetupScreen");
                } else if (action === "continue-career") {
                    navigate("championshipScreen");
                } else if (action === "championships") {
                    navigate("championshipScreen");
                } else if (action === "tournaments") {
                    navigate("tournamentScreen");
                } else if (action === "teams") {
                    navigate("teamsScreen");
                } else if (action === "equipment") {
                    navigate("equipmentScreen");
                } else if (action === "profile") {
                    navigate("profileScreen");
                } else if (action === "how-to-play") {
                    navigate("howToPlayScreen");
                } else if (action === "pass") {
                    passBall();
                } else if (action === "shoot") {
                    shootBall();
                } else if (action === "sprint") {
                    setSprint(!state.match.sprinting);
                } else if (action === "defend") {
                    defendAction();
                } else if (action === "switch-player") {
                    switchPlayer();
                }
            });
        });

        document.querySelectorAll("[data-back]").forEach((button) => {
            button.addEventListener("click", () => {
                const target = button.dataset.back;

                if (target === "mainMenu") {
                    backToMenu();
                } else {
                    navigate(target);
                }
            });
        });
    }

    function bindMatchControls() {
        bindClick("confirmMatchBtn", startMatch);

        bindClick("pauseGameBtn", pauseMatch);
        bindClick("resumeGameBtn", resumeMatch);

        bindClick("saveMatchBtn", () => saveGame());
        bindClick("savePausedMatchBtn", async () => {
            await saveGame();
        });

        bindClick("exitMatchBtn", backToMenu);
        bindClick("quitPausedMatchBtn", backToMenu);

        bindClick("soundToggleBtn", toggleSound);

        bindClick("cameraZoomInBtn", zoomIn);
        bindClick("cameraZoomOutBtn", zoomOut);
        bindClick("cameraResetBtn", resetCamera);
        bindClick("changeCameraBtn", changeCamera);

        bindClick("showTacticsBtn", openTactics);
        bindClick("applyTacticsBtn", applyTactics);

        bindClick("closeDialogBtn", closeDialog);
        bindClick("closeTacticsBtn", () => hideElement("tacticsOverlay"));

        bindClick("saveProfileBtn", async () => {
            readProfile();

            await saveGame(true);

            populateProfile();

            toast("Profil sauvegardé.");
        });

        bindClick("saveSettingsBtn", async () => {
            readSettings();

            await saveGame(true);

            toast("Paramètres sauvegardés.");
        });

        bindClick("applyEquipmentBtn", async () => {
            await applyEquipment();

            await saveGame(true);

            toast("Équipement appliqué.");
        });

        bindClick("startChampionshipBtn", () => {
            navigate("matchSetupScreen");
        });

        bindClick("createTournamentBtn", createTournament);

        bindClick("refreshTeamsBtn", () => {
            renderTeams();
            toast("Liste des équipes actualisée.");
        });

        bindClick("retryLoadingBtn", async () => {
            showElement("loadingScreen");
            hideElement("retryLoadingBtn");

            await initializeEngine();
        });
    }

    async function applyEquipment() {
        const ball = getBall();

        if (ball && ball.entity) {
            const item = state.equipment.balls.find(
                (entry) =>
                    entry.id === state.selectedEquipment.balls
            );

            if (item) {
                ball.entity.render.material = createMaterial(item.color);
            }
        }

        const homeTeam = findTeam(state.match.homeTeamId);

        const selectedKit = state.equipment.kits.find(
            (item) =>
                item.id === state.selectedEquipment.kits
        );

        if (homeTeam && selectedKit) {
            homeTeam.color = selectedKit.color;

            state.world.homePlayers.forEach((player) => {
                player.color = selectedKit.color;

                if (player.body) {
                    player.body.render.material =
                        createMaterial(selectedKit.color);
                }
            });
        }

        const boot = state.equipment.boots.find(
            (item) =>
                item.id === state.selectedEquipment.boots
        );

        if (boot) {
            state.world.homePlayers.forEach((player) => {
                if (player.legLeft) {
                    player.legLeft.render.material =
                        createMaterial(boot.color);
                }

                if (player.legRight) {
                    player.legRight.render.material =
                        createMaterial(boot.color);
                }
            });
        }
    }

    function bindSearchAndFilters() {
        const search = $("teamSearchInput");
        const region = $("teamRegionSelect");

        if (search) {
            search.addEventListener("input", renderTeams);
        }

        if (region) {
            region.addEventListener("change", renderTeams);
        }

        document.querySelectorAll("[data-equipment-tab]").forEach((button) => {
            button.addEventListener("click", () => {
                state.selectedEquipmentTab =
                    button.dataset.equipmentTab || "kits";

                renderEquipment();
            });
        });
    }

    function bindJoystick() {
        const joystick = $("movementJoystick");

        if (!joystick) {
            return;
        }

        joystick.addEventListener("pointerdown", (event) => {
            if (!state.matchActive || state.matchPaused) {
                return;
            }

            event.preventDefault();

            state.joystick.active = true;
            state.joystick.pointerId = event.pointerId;

            try {
                joystick.setPointerCapture(event.pointerId);
            } catch (_) {
                // Le navigateur peut refuser la capture.
            }

            updateJoystick(event.clientX, event.clientY);
        });

        joystick.addEventListener("pointermove", (event) => {
            if (
                !state.joystick.active ||
                event.pointerId !== state.joystick.pointerId
            ) {
                return;
            }

            event.preventDefault();

            updateJoystick(event.clientX, event.clientY);
        });

        const release = (event) => {
            if (
                state.joystick.pointerId !== null &&
                event.pointerId !== undefined &&
                event.pointerId !== state.joystick.pointerId
            ) {
                return;
            }

            resetJoystick();
        };

        joystick.addEventListener("pointerup", release);
        joystick.addEventListener("pointercancel", release);
        joystick.addEventListener("lostpointercapture", release);
    }

    function bindPinchZoom() {
        const viewport = $("pitchViewport");

        if (!viewport) {
            return;
        }

        const activePointers = new Map();

        let initialDistance = 0;
        let initialZoom = state.camera.zoom;

        const distanceBetween = (a, b) => {
            return Math.hypot(
                a.x - b.x,
                a.y - b.y
            );
        };

        viewport.addEventListener("pointerdown", (event) => {
            /*
             * Ne pas intercepter les boutons présents dans le viewport.
             */
            if (event.target.closest("button")) {
                return;
            }

            activePointers.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY
            });

            if (activePointers.size === 2) {
                const points = [...activePointers.values()];

                initialDistance = distanceBetween(
                    points[0],
                    points[1]
                );

                initialZoom = state.camera.zoom;
            }
        });

        viewport.addEventListener("pointermove", (event) => {
            if (!activePointers.has(event.pointerId)) {
                return;
            }

            activePointers.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY
            });

            if (activePointers.size !== 2) {
                return;
            }

            const points = [...activePointers.values()];

            const currentDistance = distanceBetween(
                points[0],
                points[1]
            );

            if (initialDistance > 0) {
                const ratio =
                    currentDistance / initialDistance;

                setZoom(initialZoom * ratio);
            }
        });

        const removePointer = (event) => {
            activePointers.delete(event.pointerId);

            if (activePointers.size < 2) {
                initialDistance = 0;
            }
        };

        viewport.addEventListener("pointerup", removePointer);
        viewport.addEventListener("pointercancel", removePointer);
        viewport.addEventListener("lostpointercapture", removePointer);
    }

    /* ========================================================
       22. CLAVIER — TESTS SUR ORDINATEUR
    ======================================================== */

    function bindKeyboard() {
        window.addEventListener("keydown", (event) => {
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLSelectElement ||
                event.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            if (event.code === "Escape") {
                if (!$("dialogOverlay")?.classList.contains("hidden")) {
                    closeDialog();
                } else if (state.matchActive) {
                    pauseMatch();
                } else {
                    navigate("mainMenu");
                }

                return;
            }

            if (!state.matchActive || state.matchPaused) {
                return;
            }

            const movementKeys = [
                "ArrowUp",
                "ArrowDown",
                "ArrowLeft",
                "ArrowRight",
                "KeyW",
                "KeyA",
                "KeyS",
                "KeyD"
            ];

            if (movementKeys.includes(event.code)) {
                event.preventDefault();
            }

            switch (event.code) {
                case "ArrowUp":
                case "KeyW":
                    state.joystick.y = -1;
                    break;

                case "ArrowDown":
                case "KeyS":
                    state.joystick.y = 1;
                    break;

                case "ArrowLeft":
                case "KeyA":
                    state.joystick.x = -1;
                    break;

                case "ArrowRight":
                case "KeyD":
                    state.joystick.x = 1;
                    break;

                case "Space":
                    shootBall();
                    break;

                case "KeyP":
                    passBall();
                    break;

                case "ShiftLeft":
                case "ShiftRight":
                    setSprint(true);
                    break;

                case "KeyC":
                    switchPlayer();
                    break;

                default:
                    break;
            }
        });

        window.addEventListener("keyup", (event) => {
            switch (event.code) {
                case "ArrowUp":
                case "KeyW":
                    if (state.joystick.y < 0) {
                        state.joystick.y = 0;
                    }
                    break;

                case "ArrowDown":
                case "KeyS":
                    if (state.joystick.y > 0) {
                        state.joystick.y = 0;
                    }
                    break;

                case "ArrowLeft":
                case "KeyA":
                    if (state.joystick.x < 0) {
                        state.joystick.x = 0;
                    }
                    break;

                case "ArrowRight":
                case "KeyD":
                    if (state.joystick.x > 0) {
                        state.joystick.x = 0;
                    }
                    break;

                case "ShiftLeft":
                case "ShiftRight":
                    setSprint(false);
                    break;

                default:
                    break;
            }
        });
    }

    /* ========================================================
       23. ÉVÉNEMENTS GÉNÉRAUX
    ======================================================== */

    function bindGlobalEvents() {
        window.addEventListener("resize", resizeEngineCanvas);

        window.addEventListener("orientationchange", () => {
            window.setTimeout(resizeEngineCanvas, 250);
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
                if (state.matchActive && !state.matchPaused) {
                    state.matchPaused = true;
                    showElement("pauseOverlay");
                }

                saveGame(true);
            }
        });

        window.addEventListener("beforeunload", () => {
            /*
             * beforeunload n'attend pas toujours IndexedDB.
             * La sauvegarde périodique reste donc nécessaire.
             */
            try {
                localSave("profile", state.profile);
                localSave("settings", state.settings);

                localSave("save", {
                    version: APP_VERSION,
                    savedAt: now(),
                    profile: state.profile,
                    settings: state.settings,
                    tactics: state.tactics,
                    match: state.match,
                    selectedEquipment: state.selectedEquipment,
                    tournaments: state.tournaments
                });
            } catch (_) {
                // Ne pas bloquer la fermeture de page.
            }
        });
    }

    /* ========================================================
       24. SAUVEGARDE AUTOMATIQUE
    ======================================================== */

    function startAutosave() {
        if (state.autosaveTimer) {
            clearInterval(state.autosaveTimer);
        }

        /*
         * Sauvegarde toutes les 10 minutes, conformément au
         * besoin de persistance du projet.
         */
        state.autosaveTimer = window.setInterval(() => {
            saveGame(true);
        }, 10 * 60 * 1000);
    }

    /* ========================================================
       25. RESTAURATION DES DONNÉES
    ======================================================== */

    async function restoreInitialData() {
        updateLoading(3, "Préparation des équipes...");

        buildTeams();
        buildCompetitions();

        initializeSelectors();

        renderCompetitions();
        renderTournaments();
        renderTeams();
        renderEquipment();

        updateLoading(7, "Ouverture de la sauvegarde locale...");

        await openDatabase();

        await loadGame();

        /*
         * Les listes HTML et les données chargées doivent rester
         * synchronisées après la restauration.
         */
        initializeSelectors();
        populateProfile();
        populateSettings();

        renderCompetitions();
        renderTournaments();
        renderTeams();
        renderEquipment();

        updateScoreboard();
    }

    /* ========================================================
       26. INITIALISATION PRINCIPALE
    ======================================================== */

    async function init() {
        if (state.initialized) {
            return;
        }

        state.initialized = true;

        try {
            updateLoading(0, "Démarrage de FOBAS FOOTBALL...");

            bindNavigation();
            bindMatchControls();
            bindSearchAndFilters();
            bindJoystick();
            bindPinchZoom();
            bindKeyboard();
            bindGlobalEvents();

            /*
             * Le menu reste visible pendant le chargement du moteur.
             * L'écran de chargement disparaît dès que le moteur est
             * prêt, ou après un délai en cas d'échec.
             */
            await restoreInitialData();

            startAutosave();

            /*
             * L'initialisation 3D est séparée des données locales :
             * un souci de base de données ne bloque pas la scène.
             */
            const enginePromise = initializeEngine();

            enginePromise.catch((error) => {
                console.error(
                    "Erreur moteur non récupérée :",
                    error
                );
            });

            /*
             * On n'attend pas indéfiniment le CDN pour afficher
             * l'interface de navigation.
             */
            window.setTimeout(() => {
                if (!state.engineReady) {
                    hideElement("loadingScreen");
                    navigate("mainMenu");
                }
            }, 8000);

            setText(
                "refereeDecisionLabel",
                `${REFEREE_NAME} prêt`
            );

            setText(
                "saveStatusLabel",
                "Sauvegarde locale prête"
            );

        } catch (error) {
            console.error(
                "[FOBAS FOOTBALL] Erreur d'initialisation générale :",
                error
            );

            /*
             * En cas d'erreur, on garde l'application navigable.
             */
            hideElement("loadingScreen");
            navigate("mainMenu");

            toast(
                "Le menu est disponible, mais certaines fonctions nécessitent une vérification."
            );
        }
    }

    /* ========================================================
       27. DÉMARRAGE SÛR
    ======================================================== */

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            init,
            { once: true }
        );
    } else {
        init();
    }

    /* ========================================================
       28. API PUBLIQUE DE DIAGNOSTIC
       Utilisable depuis la console du navigateur.
    ======================================================== */

    window.FOBASFootball = Object.freeze({
        version: APP_VERSION,

        getStatus() {
            return {
                initialized: state.initialized,
                engineReady: state.engineReady,
                engineFailed: state.engineFailed,
                matchActive: state.matchActive,
                matchPaused: state.matchPaused,
                teamCount: state.teams.length,
                playerCount: state.world.players.length,
                databaseReady: Boolean(state.database),
                screen: state.currentScreen
            };
        },

        save: () => saveGame(),

        startMatch,

        pauseMatch,

        resumeMatch,

        navigate,

        resetCamera,

        getTeams() {
            return state.teams.map((team) => ({
                id: team.id,
                name: team.name,
                region: team.region,
                rating: team.rating
            }));
        },

        getMatchState() {
            return {
                ...state.match,
                homeTeamName: getTeamName(state.match.homeTeamId),
                awayTeamName: getTeamName(state.match.awayTeamId)
            };
        }
    });

})();