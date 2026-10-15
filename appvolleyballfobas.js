
/* ============================================================
   FOBAS VOLLEYBALL CHAMPIONS 3D
   JavaScript principal — Version 1.0.0
   Moteur : PlayCanvas 2.23.2 via import()
   Android First — Standalone Browser — IndexedDB
============================================================ */

(() => {
    "use strict";

    /* ========================================================
       1. CONFIGURATION
    ======================================================== */

    const CONFIG = window.FOBAS_VOLLEYBALL_CONFIG || {
        version: "1.0.0",
        engine: "PlayCanvas",
        enginePackage: "playcanvas",
        database: "FOBAS_VOLLEYBALL_CHAMPIONS_DB",
        databaseVersion: 1,
        missionCount: 40,
        playersPerTeam: 11,
        playerNames: [
            "Ranise", "MEME", "Kerlande", "Nina",
            "Dieuben", "Junior", "Monise", "Lise",
            "Selvandieu", "Natacha", "Sabine", "Ricardo",
            "Raoul", "Toutin", "Ydeja", "Lannda"
        ]
    };

    const $ = id => document.getElementById(id);

    const $$ = selector =>
        Array.from(document.querySelectorAll(selector));

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const random = (min, max) =>
        min + Math.random() * (max - min);

    const escapeHTML = value =>
        String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);

    const wait = milliseconds =>
        new Promise(resolve => setTimeout(resolve, milliseconds));

    const TEAM_NAMES = [
        "FOBAS LEGENDS",
        "MASTER STARS",
        "ROYAL VOLLEY",
        "CARIBBEAN ELITE",
        "RISING CHAMPIONS",
        "HAITI TITANS",
        "OCEAN WARRIORS",
        "GOLDEN SPIKERS"
    ];

    const MISSIONS = Array.from({ length: 40 }, (_, index) => {
        const number = index + 1;

        const phases = [
            "Premiers pas",
            "Technique et précision",
            "Puissance offensive",
            "Défense de fer",
            "Défi des champions",
            "Élite internationale",
            "Légendes des Caraïbes",
            "Finale mondiale"
        ];

        const objectives = [
            "Apprenez à servir et gagnez votre match.",
            "Réussissez vos passes et contrôlez le terrain.",
            "Utilisez le smash pour prendre l'avantage.",
            "Combinez les passes et les attaques.",
            "Battez une équipe de niveau supérieur."
        ];

        return {
            id: number,
            title: `Mission ${String(number).padStart(2, "0")}`,
            phase: phases[Math.min(7, Math.floor(index / 5))],
            objective: objectives[index % objectives.length],
            target: Math.min(15, 7 + Math.floor(index / 5)),
            difficulty: Math.min(10, 1 + Math.floor(index / 4)),
            opponent: TEAM_NAMES[(index + 1) % TEAM_NAMES.length]
        };
    });

    const BALL_STYLES = {
        classic: { main: [0.96, 0.95, 0.82], accent: [0.13, 0.45, 0.86] },
        gold:    { main: [1.00, 0.72, 0.08], accent: [1.00, 0.93, 0.52] },
        ocean:   { main: [0.05, 0.68, 0.90], accent: [0.90, 0.98, 1.00] },
        fire:    { main: [0.96, 0.18, 0.07], accent: [1.00, 0.68, 0.05] }
    };

    const KIT_STYLES = {
        royal: {
            home: [0.06, 0.22, 0.85],
            away: [0.88, 0.12, 0.18]
        },
        ocean: {
            home: [0.02, 0.67, 0.75],
            away: [0.10, 0.20, 0.60]
        },
        fire: {
            home: [0.94, 0.25, 0.04],
            away: [0.98, 0.72, 0.06]
        }
    };

    /* ========================================================
       2. ÉTAT GLOBAL
    ======================================================== */

    const state = {
        pc: null,
        app: null,
        camera: null,
        cameraEntity: null,
        sceneReady: false,
        initializing: false,
        initError: null,

        paused: false,
        matchActive: false,
        matchFinished: false,
        matchStarting: false,

        mission: 1,
        competition: null,
        tournamentRound: 0,

        homeTeam: "FOBAS LEGENDS",
        awayTeam: "MASTER STARS",

        homeScore: 0,
        awayScore: 0,
        homeSets: 0,
        awaySets: 0,
        setNumber: 1,

        matchStartTime: 0,
        elapsed: 0,
        rallyTimer: 0,
        rallyTimeout: 0,
        rallyNumber: 0,

        ballMode: "waiting",
        ballVelocity: { x: 0, y: 0, z: 0 },
        ballTargetSide: "away",
        ballPosition: { x: 0, y: 2.5, z: 0 },
        lastHitSide: "home",

        activePlayerIndex: 0,
        joystick: { x: 0, y: 0, active: false },
        zoom: 1,

        homePlayers: [],
        awayPlayers: [],
        ballEntity: null,
        ballSeams: [],
        courtEntities: [],
        environmentEntities: [],
        sceneMaterials: {},
        netEntities: [],

        currentBallStyle: "classic",
        currentKitStyle: "royal",

        musicEnabled: true,
        audioContext: null,
        musicGain: null,
        effectsGain: null,
        musicTimer: null,

        db: null,
        storageAvailable: false,
        lastSave: 0,

        stats: {
            wins: 0,
            matches: 0,
            missionsCompleted: [],
            trophies: [],
            completedCompetitions: [],
            totalPoints: 0
        },

        profile: {
            name: "Champion FOBAS",
            team: "FOBAS LEGENDS"
        },

        settings: {
            musicVolume: 55,
            effectsVolume: 75,
            graphicsQuality: "high",
            crowdSound: true
        },

        lastResult: null,
        notificationTimer: null,
        dialogResolve: null,
        actionLocked: false
    };

    /* ========================================================
       3. INTERFACE UTILITAIRE
    ======================================================== */

    function notify(message, duration = 2600) {
        const element = $("notification");

        if (!element) {
            console.info("[FOBAS]", message);
            return;
        }

        element.textContent = message;
        element.classList.add("show");

        clearTimeout(state.notificationTimer);

        state.notificationTimer = setTimeout(() => {
            element.classList.remove("show");
        }, duration);
    }

    function setMessage(message) {
        const element = $("gameMessage");
        if (element) element.textContent = message;
    }

    function setStatus(message) {
        const element = $("saveStatus");
        if (element) element.textContent = message;
    }

    function setHidden(id, hidden) {
        const element = $(id);
        if (element) element.hidden = hidden;
    }

    function openPanel(id) {
        const panelIds = [
            "profilePanel",
            "careerPanel",
            "championshipPanel",
            "teamsPanel",
            "equipmentPanel",
            "howToPlayPanel",
            "settingsPanel",
            "matchResultPanel"
        ];

        panelIds.forEach(panelId => {
            if (panelId !== id) setHidden(panelId, true);
        });

        setHidden("mainMenu", true);
        setHidden(id, false);

        if (id === "careerPanel") renderCareer();
        if (id === "profilePanel") renderProfile();
        if (id === "teamsPanel") renderTeams();
    }

    function returnToMenu() {
        if (state.matchActive) {
            notify("Le match est encore en cours.");
            return;
        }

        [
            "profilePanel",
            "careerPanel",
            "championshipPanel",
            "teamsPanel",
            "equipmentPanel",
            "howToPlayPanel",
            "settingsPanel",
            "matchResultPanel",
            "matchControls"
        ].forEach(id => setHidden(id, true));

        setHidden("mainMenu", false);
        setHidden("stadiumSection", true);
        setHidden("bottomNavigation", false);

        state.paused = false;

        renderProfile();
        renderCareer();
        updateNavigation("navHomeButton");
    }

    function updateNavigation(activeId) {
        $$(".nav-button").forEach(button => {
            button.classList.toggle("active", button.id === activeId);
        });
    }





/* ========================================================
   4. CONFIRMATION DIALOG
   Fermé au démarrage.
   S'ouvre uniquement lors d'une action qui le demande.
======================================================== */

function closeConfirmationDialog() {
    const dialog = $("confirmationDialog");

    if (!dialog) return;

    // Fèmen fenèt la san aktive okenn aksyon.
    if (dialog.open && typeof dialog.close === "function") {
        dialog.close();
    }

    dialog.removeAttribute("open");
    dialog.style.removeProperty("display");
    dialog.hidden = true;

    // Si yon konfimasyon t ap tann, anile l san danje.
    if (state.dialogResolve) {
        const callback = state.dialogResolve;
        state.dialogResolve = null;
        callback(false);
    }
}

function askConfirmation(
    title,
    message,
    confirmText = "CONFIRMER"
) {
    return new Promise(resolve => {
        const dialog = $("confirmationDialog");

        // Si pa gen fenèt nan HTML la, itilize konfimasyon navigatè a.
        if (!dialog) {
            resolve(window.confirm(`${title}\n\n${message}`));
            return;
        }

        // Evite kite yon ansyen konfimasyon an plas.
        if (state.dialogResolve) {
            const previousCallback = state.dialogResolve;
            state.dialogResolve = null;
            previousCallback(false);
        }

        const titleElement = $("dialogTitle");
        const messageElement = $("dialogMessage");
        const confirmButton = $("dialogConfirmButton");
        const cancelButton = $("dialogCancelButton");

        if (titleElement) {
            titleElement.textContent = title;
        }

        if (messageElement) {
            messageElement.textContent = message;
        }

        if (confirmButton) {
            confirmButton.textContent = confirmText;
        }

        // Prepare fenèt la pou aksyon itilizatè a mande a.
        dialog.hidden = false;
        dialog.style.removeProperty("display");

        let completed = false;

        const finish = value => {
            if (completed) return;
            completed = true;

            if (dialog.open && typeof dialog.close === "function") {
                dialog.close();
            }

            dialog.removeAttribute("open");
            dialog.style.removeProperty("display");
            dialog.hidden = true;

            dialog.oncancel = null;

            if (state.dialogResolve) {
                const callback = state.dialogResolve;
                state.dialogResolve = null;
                callback(value);
            } else {
                resolve(value);
            }
        };

        // Anile ansyen evènman yo anvan konekte nouvo yo.
        if (confirmButton) {
            confirmButton.onclick = event => {
                event.preventDefault();
                finish(true);
            };
        }

        if (cancelButton) {
            cancelButton.onclick = event => {
                event.preventDefault();
                finish(false);
            };
        }

        dialog.oncancel = event => {
            event.preventDefault();
            finish(false);
        };

        state.dialogResolve = resolve;

        // Louvri fenèt la sèlman paske yon aksyon mande sa.
        try {
            if (typeof dialog.showModal === "function") {
                if (!dialog.open) {
                    dialog.showModal();
                }
            } else {
                dialog.hidden = false;
                dialog.setAttribute("open", "");
                dialog.style.display = "block";
            }
        } catch (error) {
            console.error(
                "Erreur lors de l'ouverture du dialogue :",
                error
            );

            dialog.hidden = false;
            dialog.setAttribute("open", "");
            dialog.style.display = "block";
        }
    });
}



    /* ========================================================
       5. INDEXEDDB
    ======================================================== */

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!("indexedDB" in window)) {
                reject(new Error("IndexedDB non disponible."));
                return;
            }

            let request;

            try {
                request = indexedDB.open(
                    CONFIG.database,
                    CONFIG.databaseVersion
                );
            } catch (error) {
                reject(error);
                return;
            }

            request.onupgradeneeded = event => {
                const database = event.target.result;

                if (!database.objectStoreNames.contains("gameData")) {
                    database.createObjectStore("gameData", {
                        keyPath: "id"
                    });
                }
            };

            request.onsuccess = () => {
                state.db = request.result;
                state.storageAvailable = true;

                state.db.onversionchange = () => {
                    state.db.close();
                    state.db = null;
                };

                resolve(state.db);
            };

            request.onerror = () => {
                reject(request.error || new Error("Ouverture IndexedDB impossible."));
            };

            request.onblocked = () => {
                console.warn("IndexedDB bloqué par un autre onglet.");
            };
        });
    }

    function serializeGame() {
        return {
            id: "main",
            version: CONFIG.version,
            savedAt: Date.now(),

            mission: state.mission,
            competition: state.competition,
            tournamentRound: state.tournamentRound,

            homeTeam: state.homeTeam,
            awayTeam: state.awayTeam,

            currentBallStyle: state.currentBallStyle,
            currentKitStyle: state.currentKitStyle,

            profile: { ...state.profile },
            stats: {
                ...state.stats,
                missionsCompleted: [...state.stats.missionsCompleted],
                trophies: [...state.stats.trophies],
                completedCompetitions: [...state.stats.completedCompetitions]
            },
            settings: { ...state.settings }
        };
    }

    function saveToLocalFallback(data) {
        try {
            localStorage.setItem(
                "FOBAS_VOLLEYBALL_CHAMPIONS_BACKUP",
                JSON.stringify(data)
            );
            return true;
        } catch (error) {
            console.warn("Sauvegarde locale indisponible.", error);
            return false;
        }
    }

    function readLocalFallback() {
        try {
            const raw = localStorage.getItem(
                "FOBAS_VOLLEYBALL_CHAMPIONS_BACKUP"
            );

            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    async function saveGame(silent = false) {
        const data = serializeGame();

        let saved = false;

        if (state.db) {
            try {
                await new Promise((resolve, reject) => {
                    const transaction = state.db.transaction(
                        ["gameData"],
                        "readwrite"
                    );

                    transaction.objectStore("gameData").put(data);

                    transaction.oncomplete = resolve;
                    transaction.onerror = () => reject(transaction.error);
                    transaction.onabort = () => reject(transaction.error);
                });

                saved = true;
            } catch (error) {
                console.warn("Échec IndexedDB, essai localStorage.", error);
            }
        }

        if (!saved) saved = saveToLocalFallback(data);

        if (saved) {
            state.lastSave = Date.now();

            if (!silent) {
                setStatus("Sauvegarde réussie.");
                notify("Progression sauvegardée !");
            } else {
                setStatus("Sauvegarde automatique effectuée.");
            }
        } else if (!silent) {
            setStatus("Sauvegarde impossible sur cet appareil.");
            notify("Impossible de sauvegarder les données.");
        }

        return saved;
    }

    async function loadGame(silent = false) {
        let data = null;

        if (state.db) {
            try {
                data = await new Promise((resolve, reject) => {
                    const transaction = state.db.transaction(
                        ["gameData"],
                        "readonly"
                    );

                    const request = transaction
                        .objectStore("gameData")
                        .get("main");

                    request.onsuccess = () => resolve(request.result || null);
                    request.onerror = () => reject(request.error);
                });
            } catch (error) {
                console.warn("Lecture IndexedDB impossible.", error);
            }
        }

        if (!data) data = readLocalFallback();

        if (!data) {
            if (!silent) {
                notify("Aucune sauvegarde trouvée. Une nouvelle carrière est prête.");
            }
            return false;
        }

        state.mission = clamp(Number(data.mission) || 1, 1, 40);
        state.competition = data.competition || null;
        state.tournamentRound = Number(data.tournamentRound) || 0;

        state.homeTeam = data.homeTeam || "FOBAS LEGENDS";
        state.awayTeam = data.awayTeam || "MASTER STARS";

        state.currentBallStyle = BALL_STYLES[data.currentBallStyle]
            ? data.currentBallStyle : "classic";

        state.currentKitStyle = KIT_STYLES[data.currentKitStyle]
            ? data.currentKitStyle : "royal";

        if (data.profile) {
            state.profile.name = String(data.profile.name || "Champion FOBAS").slice(0, 30);
            state.profile.team = data.profile.team || "FOBAS LEGENDS";
        }

        if (data.stats) {
            state.stats.wins = Number(data.stats.wins) || 0;
            state.stats.matches = Number(data.stats.matches) || 0;
            state.stats.totalPoints = Number(data.stats.totalPoints) || 0;

            state.stats.missionsCompleted = Array.isArray(data.stats.missionsCompleted)
                ? data.stats.missionsCompleted.filter(n => Number(n) >= 1 && Number(n) <= 40)
                : [];

            state.stats.trophies = Array.isArray(data.stats.trophies)
                ? data.stats.trophies
                : [];

            state.stats.completedCompetitions = Array.isArray(data.stats.completedCompetitions)
                ? data.stats.completedCompetitions
                : [];
        }

        if (data.settings) {
            state.settings = {
                ...state.settings,
                ...data.settings
            };
        }

        syncSettingsUI();
        syncEquipmentUI();
        renderProfile();
        renderCareer();
        renderTeams();

        if (state.sceneReady) {
            updateBallAppearance();
            updatePlayerAppearances();
        }

        if (!silent) {
            notify("Sauvegarde chargée avec succès !");
        }

        return true;
    }

    async function resetGame() {
        const accepted = await askConfirmation(
            "Réinitialiser la progression ?",
            "Cette action effacera la progression enregistrée. Voulez-vous continuer ?",
            "RÉINITIALISER"
        );

        if (!accepted) return;

        state.mission = 1;
        state.competition = null;
        state.tournamentRound = 0;

        state.stats = {
            wins: 0,
            matches: 0,
            missionsCompleted: [],
            trophies: [],
            completedCompetitions: [],
            totalPoints: 0
        };

        state.profile = {
            name: "Champion FOBAS",
            team: "FOBAS LEGENDS"
        };

        state.homeTeam = "FOBAS LEGENDS";
        state.awayTeam = "MASTER STARS";
        state.currentBallStyle = "classic";
        state.currentKitStyle = "royal";

        state.lastResult = null;

        if (state.db) {
            try {
                await new Promise((resolve, reject) => {
                    const transaction = state.db.transaction(
                        ["gameData"],
                        "readwrite"
                    );

                    transaction.objectStore("gameData").delete("main");

                    transaction.oncomplete = resolve;
                    transaction.onerror = () => reject(transaction.error);
                });
            } catch (error) {
                console.warn("Effacement IndexedDB impossible.", error);
            }
        }

        try {
            localStorage.removeItem("FOBAS_VOLLEYBALL_CHAMPIONS_BACKUP");
        } catch {}

        syncSettingsUI();
        syncEquipmentUI();
        renderProfile();
        renderCareer();
        renderTeams();

        await saveGame(true);

        returnToMenu();
        notify("Nouvelle carrière initialisée.");
    }

    /* ========================================================
       6. PROFIL ET PROGRESSION
    ======================================================== */

    function renderProfile() {
        if ($("profileName")) $("profileName").value = state.profile.name;
        if ($("profileTeam")) $("profileTeam").value = state.profile.team;

        if ($("profileWins")) $("profileWins").textContent = state.stats.wins;
        if ($("profileMatches")) $("profileMatches").textContent = state.stats.matches;

        if ($("profileMissions")) {
            $("profileMissions").textContent =
                `${state.stats.missionsCompleted.length} / ${CONFIG.missionCount}`;
        }

        if ($("profileTrophies")) {
            $("profileTrophies").textContent = state.stats.trophies.length;
        }

        if ($("profileAvatar")) {
            $("profileAvatar").textContent =
                state.stats.wins >= 10 ? "🏆" : "🏐";
        }
    }

    function saveProfile() {
        const name = $("profileName")?.value.trim() || "Champion FOBAS";
        const team = $("profileTeam")?.value || "FOBAS LEGENDS";

        state.profile.name = name.slice(0, 30);
        state.profile.team = team;

        renderProfile();
        saveGame(true);
        notify("Profil enregistré.");
    }

    function renderCareer() {
        const list = $("missionList");
        const completed = state.stats.missionsCompleted;

        const percentage = Math.round(
            completed.length / CONFIG.missionCount * 100
        );

        if ($("careerProgressText")) {
            $("careerProgressText").textContent = `${percentage} %`;
        }

        if ($("careerProgressBar")) {
            $("careerProgressBar").style.width = `${percentage}%`;
        }

        if (!list) return;

        list.innerHTML = MISSIONS.map(mission => {
            const done = completed.includes(mission.id);
            const unlocked = mission.id <= Math.min(
                CONFIG.missionCount,
                Math.max(1, completed.length + 1)
            );

            const status = done
                ? "✓ TERMINÉE"
                : unlocked
                    ? "JOUER"
                    : "VERROUILLÉE";

            return `
                <article class="mission-card ${done ? "completed" : ""}">
                    <div>
                        <strong>${escapeHTML(mission.title)} · ${escapeHTML(mission.phase)}</strong>
                        <p>${escapeHTML(mission.objective)}</p>
                        <small>Difficulté ${mission.difficulty}/10 · Adversaire : ${escapeHTML(mission.opponent)}</small>
                    </div>
                    <button type="button"
                            data-mission="${mission.id}"
                            ${unlocked ? "" : "disabled"}>
                        ${status}
                    </button>
                </article>
            `;
        }).join("");

        list.querySelectorAll("[data-mission]").forEach(button => {
            button.addEventListener("click", () => {
                const id = Number(button.dataset.mission);
                if (!id || button.disabled) return;

                state.mission = id;
                state.competition = null;
                startMatch();
            });
        });
    }

    /* ========================================================
       7. ÉQUIPES ET EFFECTIFS
    ======================================================== */

    function createRoster(teamName, side) {
        const configuredNames = [...(CONFIG.playerNames || [])];

        const names = [];

        if (side === "home") {
            names.push("Selvandieu", "Ranise", "Kerlande", "Nina", "Dieuben", "Junior");
        } else {
            names.push("MEME", "Monise", "Lise", "Natacha", "Sabine", "Ricardo");
        }

        for (const name of configuredNames) {
            if (names.length >= 11) break;
            if (!names.includes(name)) names.push(name);
        }

        let counter = 1;

        while (names.length < 11) {
            names.push(`${teamName.split(" ")[0]} ${counter++}`);
        }

        return names.slice(0, 11);
    }

    function renderTeams() {
        const homeSelect = $("homeTeamSelect");
        const awaySelect = $("awayTeamSelect");

        if (homeSelect) homeSelect.value = state.homeTeam;
        if (awaySelect) awaySelect.value = state.awayTeam;

        const roster = $("teamRoster");
        if (!roster) return;

        const homeNames = createRoster(state.homeTeam, "home");
        const awayNames = createRoster(state.awayTeam, "away");

        roster.innerHTML = `
            <div class="roster-column">
                <h3>${escapeHTML(state.homeTeam)} · 11 joueurs</h3>
                <ol>${homeNames.map(name => `<li>${escapeHTML(name)}</li>`).join("")}</ol>
            </div>
            <div class="roster-column">
                <h3>${escapeHTML(state.awayTeam)} · 11 joueurs</h3>
                <ol>${awayNames.map(name => `<li>${escapeHTML(name)}</li>`).join("")}</ol>
            </div>
        `;
    }

    function confirmTeams() {
        const home = $("homeTeamSelect")?.value || "FOBAS LEGENDS";
        const away = $("awayTeamSelect")?.value || "MASTER STARS";

        if (home === away) {
            notify("Choisissez deux équipes différentes.");
            return;
        }

        state.homeTeam = home;
        state.awayTeam = away;
        state.profile.team = home;

        renderTeams();
        renderProfile();

        if (state.sceneReady) {
            updateScoreboard();
            updatePlayerAppearances();
        }

        saveGame(true);
        notify("Compositions des équipes mises à jour.");
    }

    /* ========================================================
       8. ÉQUIPEMENTS
    ======================================================== */

    function syncEquipmentUI() {
        $$("[data-ball]").forEach(button => {
            button.classList.toggle(
                "selected",
                button.dataset.ball === state.currentBallStyle
            );
        });

        $$("[data-kit]").forEach(button => {
            button.classList.toggle(
                "selected",
                button.dataset.kit === state.currentKitStyle
            );
        });
    }

    function chooseBall(style) {
        if (!BALL_STYLES[style]) return;

        state.currentBallStyle = style;

        syncEquipmentUI();
        updateBallAppearance();

        const labels = {
            classic: "Ballon classique",
            gold: "Ballon Champion doré",
            ocean: "Ballon Océan",
            fire: "Ballon Flamme"
        };

        if ($("equipmentStatus")) {
            $("equipmentStatus").textContent = `${labels[style]} sélectionné.`;
        }

        saveGame(true);
        notify(`${labels[style]} équipé.`);
    }

    function chooseKit(style) {
        if (!KIT_STYLES[style]) return;

        state.currentKitStyle = style;

        syncEquipmentUI();
        updatePlayerAppearances();

        if ($("equipmentStatus")) {
            $("equipmentStatus").textContent = `Tenues ${style} sélectionnées.`;
        }

        saveGame(true);
        notify("Tenues des équipes mises à jour.");
    }

    /* ========================================================
       9. PARAMÈTRES
    ======================================================== */

    function syncSettingsUI() {
        const settings = state.settings;

        if ($("musicVolume")) $("musicVolume").value = settings.musicVolume;
        if ($("effectsVolume")) $("effectsVolume").value = settings.effectsVolume;

        if ($("musicVolumeValue")) {
            $("musicVolumeValue").textContent = `${settings.musicVolume} %`;
        }

        if ($("effectsVolumeValue")) {
            $("effectsVolumeValue").textContent = `${settings.effectsVolume} %`;
        }

        if ($("graphicsQuality")) {
            $("graphicsQuality").value = settings.graphicsQuality;
        }

        if ($("crowdSound")) $("crowdSound").checked = settings.crowdSound;

        if (state.musicGain) {
            state.musicGain.gain.value = settings.musicVolume / 100 * 0.08;
        }

        if (state.effectsGain) {
            state.effectsGain.gain.value = settings.effectsVolume / 100 * 0.3;
        }
    }

    function readSettingsUI() {
        state.settings.musicVolume = Number($("musicVolume")?.value ?? 55);
        state.settings.effectsVolume = Number($("effectsVolume")?.value ?? 75);
        state.settings.graphicsQuality = $("graphicsQuality")?.value || "high";
        state.settings.crowdSound = Boolean($("crowdSound")?.checked);

        syncSettingsUI();
    }

    function saveSettings() {
        readSettingsUI();

        if (state.app) {
            const resolutionScale = {
                high: 1,
                medium: 0.85,
                low: 0.65
            }[state.settings.graphicsQuality] || 1;

            try {
                const device = state.app.graphicsDevice;

                if (device && typeof device.maxPixelRatio === "number") {
                    device.maxPixelRatio = resolutionScale;
                }
            } catch (error) {
                console.warn("Réglage graphique partiel.", error);
            }
        }

        saveGame(true);
        notify("Paramètres enregistrés.");
    }

    /* ========================================================
       10. AUDIO WEB
    ======================================================== */

    function initializeAudio() {
        if (state.audioContext) {
            if (state.audioContext.state === "suspended") {
                state.audioContext.resume().catch(() => {});
            }
            return;
        }

        const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) return;

        try {
            state.audioContext = new AudioContextClass();

            state.musicGain = state.audioContext.createGain();
            state.effectsGain = state.audioContext.createGain();

            state.musicGain.gain.value =
                state.settings.musicVolume / 100 * 0.08;

            state.effectsGain.gain.value =
                state.settings.effectsVolume / 100 * 0.3;

            state.musicGain.connect(state.audioContext.destination);
            state.effectsGain.connect(state.audioContext.destination);

            if (state.musicEnabled) startBackgroundMusic();
        } catch (error) {
            console.warn("Audio indisponible.", error);
        }
    }

    function playTone(frequency = 440, duration = 0.12, type = "sine") {
        if (!state.audioContext || !state.effectsGain) return;
        if (state.settings.effectsVolume <= 0) return;

        try {
            const oscillator = state.audioContext.createOscillator();
            const gain = state.audioContext.createGain();

            oscillator.type = type;
            oscillator.frequency.value = frequency;

            gain.gain.setValueAtTime(0.001, state.audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(
                Math.max(0.001, state.settings.effectsVolume / 100 * 0.16),
                state.audioContext.currentTime + 0.02
            );

            gain.gain.exponentialRampToValueAtTime(
                0.001,
                state.audioContext.currentTime + duration
            );

            oscillator.connect(gain);
            gain.connect(state.effectsGain);

            oscillator.start();
            oscillator.stop(state.audioContext.currentTime + duration + 0.02);
        } catch {}
    }

    function startBackgroundMusic() {
        if (!state.audioContext || !state.musicGain || state.musicTimer) return;

        const notes = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];
        let index = 0;

        state.musicTimer = setInterval(() => {
            if (!state.musicEnabled || state.paused) return;
            if (state.settings.musicVolume <= 0) return;

            const oscillator = state.audioContext.createOscillator();
            const gain = state.audioContext.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = notes[index++ % notes.length];

            gain.gain.setValueAtTime(0.001, state.audioContext.currentTime);
            gain.gain.linearRampToValueAtTime(
                state.settings.musicVolume / 100 * 0.025,
                state.audioContext.currentTime + 0.06
            );
            gain.gain.linearRampToValueAtTime(
                0.001,
                state.audioContext.currentTime + 0.36
            );

            oscillator.connect(gain);
            gain.connect(state.musicGain);

            oscillator.start();
            oscillator.stop(state.audioContext.currentTime + 0.38);
        }, 460);
    }

    function stopBackgroundMusic() {
        if (state.musicTimer) {
            clearInterval(state.musicTimer);
            state.musicTimer = null;
        }
    }

    function toggleSound() {
        state.musicEnabled = !state.musicEnabled;

        const button = $("soundButton");

        if (button) {
            button.textContent = state.musicEnabled ? "🔊" : "🔇";
            button.setAttribute(
                "aria-label",
                state.musicEnabled ? "Désactiver le son" : "Activer le son"
            );
        }

        if (state.musicEnabled) {
            initializeAudio();
            startBackgroundMusic();
        } else {
            stopBackgroundMusic();
        }

        notify(state.musicEnabled ? "Son activé." : "Son désactivé.");
    }

    /* ========================================================
       11. PLAYCANVAS — IMPORT DIRECT
    ======================================================== */

    async function initializeEngine() {
        if (state.sceneReady) return true;
        if (state.initializing) return false;

        state.initializing = true;

        const loadingScreen = $("loadingScreen");
        const loadingMessage = $("loadingMessage");
        const loadingProgress = $("loadingProgress");

        try {
            if (loadingMessage) {
                loadingMessage.textContent = "Chargement du moteur PlayCanvas...";
            }

            if (loadingProgress) loadingProgress.style.width = "15%";

            const canvas = $("volleyballCanvas");

            if (!canvas) {
                throw new Error("Le canvas #volleyballCanvas est introuvable.");
            }

            canvas.style.touchAction = "none";

            /*
             * Le moteur est chargé par import() comme demandé.
             * Aucun import bare specifier et aucun backend requis.
             */
            const pc = await import("https://esm.sh/playcanvas@2.23.2");

            state.pc = pc;

            if (loadingProgress) loadingProgress.style.width = "35%";

            const app = new pc.Application(canvas, {
                graphicsDeviceOptions: {
                    antialias: true,
                    alpha: false,
                    powerPreference: "high-performance"
                }
            });

            state.app = app;

            app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
            app.setCanvasResolution(pc.RESOLUTION_AUTO);

            if (loadingMessage) {
                loadingMessage.textContent = "Construction du stade 3D...";
            }

            if (loadingProgress) loadingProgress.style.width = "55%";

            buildScene();

            app.on("update", updateGame);

            app.start();

            state.sceneReady = true;

            window.FOBAS_PLAYCANVAS = pc;
            window.FOBAS_VOLLEYBALL_APP = app;

            if (loadingProgress) loadingProgress.style.width = "100%";

            const engineStatus = $("engineStatus");

            if (engineStatus) {
                engineStatus.textContent = "PLAYCANVAS 3D · PRÊT";
            }

            setHidden("stadiumLoader", true);

            if (loadingMessage) {
                loadingMessage.textContent = "Stade prêt !";
            }

            await wait(250);

            if (loadingScreen) loadingScreen.classList.add("loaded");

            setTimeout(() => {
                if (loadingScreen) loadingScreen.hidden = true;
            }, 500);

            renderProfile();
            renderCareer();
            renderTeams();

            return true;

        } catch (error) {
            state.initError = error;

            console.error("[FOBAS] Erreur d'initialisation PlayCanvas :", error);

            if (loadingMessage) {
                loadingMessage.textContent =
                    "Impossible de charger le moteur 3D. Vérifiez la connexion Internet puis rechargez la page.";
            }

            if (loadingProgress) loadingProgress.style.width = "100%";

            const engineStatus = $("engineStatus");

            if (engineStatus) {
                engineStatus.textContent = "ERREUR DE CHARGEMENT";
            }

            setHidden("stadiumLoader", false);

            const loader = $("stadiumLoader");

            if (loader) {
                loader.innerHTML = `
                    <strong>Le moteur PlayCanvas n'a pas pu démarrer.</strong>
                    <p>${escapeHTML(error?.message || "Erreur inconnue")}</p>
                    <button type="button" id="retryEngineButton">
                        RÉESSAYER
                    </button>
                `;

                $("retryEngineButton")?.addEventListener("click", async () => {
                    state.initializing = false;
                    state.initError = null;

                    if (loader) {
                        loader.innerHTML = `
                            <span class="stadium-loader-ball">🏐</span>
                            <span>Chargement du stade 3D...</span>
                        `;
                    }

                    if (loadingScreen) {
                        loadingScreen.hidden = false;
                        loadingScreen.classList.remove("loaded");
                    }

                    await initializeEngine();
                });
            }

            return false;

        } finally {
            state.initializing = false;
        }
    }

    /* ========================================================
       12. MATÉRIAUX ET ENTITÉS 3D
    ======================================================== */

    function material(color, options = {}) {
        const pc = state.pc;

        const result = new pc.StandardMaterial();

        result.diffuse = new pc.Color(color[0], color[1], color[2]);
        result.useLighting = options.lit !== false;

        if (options.emissive) {
            result.emissive = new pc.Color(
                options.emissive[0],
                options.emissive[1],
                options.emissive[2]
            );
        }

        if (typeof options.metalness === "number") {
            result.metalness = options.metalness;
        }

        if (typeof options.gloss === "number") {
            result.gloss = options.gloss;
        }

        result.update();

        return result;
    }

    function createPrimitive(name, type, position, scale, mat, parent = null) {
        const entity = new state.pc.Entity(name);

        entity.addComponent("render", {
            type,
            material: mat
        });

        (parent || state.app.root).addChild(entity);

        entity.setLocalPosition(position[0], position[1], position[2]);
        entity.setLocalScale(scale[0], scale[1], scale[2]);

        return entity;
    }

    function createLight(name, type, position, color, intensity, angles = [0, 0, 0]) {
        const entity = new state.pc.Entity(name);

        entity.addComponent("light", {
            type,
            color: new state.pc.Color(color[0], color[1], color[2]),
            intensity
        });

        state.app.root.addChild(entity);
        entity.setPosition(position[0], position[1], position[2]);
        entity.setEulerAngles(angles[0], angles[1], angles[2]);

        return entity;
    }

    function createLine(name, x1, z1, x2, z2, thickness, height, mat) {
        const dx = x2 - x1;
        const dz = z2 - z1;

        const length = Math.sqrt(dx * dx + dz * dz);

        const line = createPrimitive(
            name,
            "box",
            [(x1 + x2) / 2, height, (z1 + z2) / 2],
            [length, 0.025, thickness],
            mat
        );

        const angle = Math.atan2(dz, dx) * 180 / Math.PI;
        line.setEulerAngles(0, -angle, 0);

        state.courtEntities.push(line);

        return line;
    }

    /* ========================================================
       13. CONSTRUCTION DU STADE
    ======================================================== */

    function buildScene() {
        const pc = state.pc;
        const app = state.app;

        const materials = state.sceneMaterials;

        materials.grass = material([0.10, 0.38, 0.21], { gloss: 18 });
        materials.court = material([0.78, 0.59, 0.34], { gloss: 30 });
        materials.homeCourt = material([0.08, 0.38, 0.68], { gloss: 25 });
        materials.awayCourt = material([0.78, 0.20, 0.20], { gloss: 25 });
        materials.white = material([0.96, 0.97, 0.95], { gloss: 55 });
        materials.net = material([0.12, 0.15, 0.18], { gloss: 10 });
        materials.pole = material([0.75, 0.79, 0.83], { metalness: 0.55, gloss: 65 });
        materials.sand = material([0.87, 0.72, 0.49], { gloss: 10 });
        materials.seat = material([0.13, 0.16, 0.22], { gloss: 20 });
        materials.palm = material([0.19, 0.38, 0.17], { gloss: 8 });
        materials.wood = material([0.39, 0.22, 0.12], { gloss: 15 });

        const sky = new pc.Entity("FOBAS Stadium Camera");

        sky.addComponent("camera", {
            clearColor: new pc.Color(0.52, 0.75, 0.91),
            fov: 48,
            nearClip: 0.1,
            farClip: 250
        });

        app.root.addChild(sky);

        sky.setPosition(0, 19, 29);
        sky.lookAt(0, 0, 0);

        state.cameraEntity = sky;
        state.camera = sky.camera;

        createLight(
            "Sunlight",
            "directional",
            [10, 18, 7],
            [1.0, 0.89, 0.74],
            1.7,
            [42, 28, 0]
        );

        createLight(
            "Stadium Fill Light",
            "omni",
            [0, 12, 0],
            [0.64, 0.79, 1.0],
            1.0
        );

        createPrimitive(
            "Ground",
            "box",
            [0, -0.65, 0],
            [100, 1, 100],
            materials.grass
        );

        createPrimitive(
            "Sand Court",
            "box",
            [0, -0.1, 0],
            [22, 0.2, 34],
            materials.sand
        );

        createPrimitive(
            "Home Half",
            "box",
            [0, 0.02, 8.5],
            [18, 0.08, 16],
            materials.homeCourt
        );

        createPrimitive(
            "Away Half",
            "box",
            [0, 0.02, -8.5],
            [18, 0.08, 16],
            materials.awayCourt
        );

        const courtLine = materials.white;

        createLine("Left Boundary", -9, -16, -9, 16, 0.12, 0.11, courtLine);
        createLine("Right Boundary", 9, -16, 9, 16, 0.12, 0.11, courtLine);
        createLine("Back Boundary", -9, -16, 9, -16, 0.12, 0.11, courtLine);
        createLine("Front Boundary", -9, 16, 9, 16, 0.12, 0.11, courtLine);
        createLine("Center Court", -9, 0, 9, 0, 0.12, 0.11, courtLine);

        createLine("Home Attack Line", -9, 5, 9, 5, 0.08, 0.11, courtLine);
        createLine("Away Attack Line", -9, -5, 9, -5, 0.08, 0.11, courtLine);

        // Filet central
        createPrimitive(
            "Net",
            "box",
            [0, 2.5, 0],
            [18.2, 1.0, 0.10],
            materials.net
        );

        createPrimitive(
            "Net Top Tape",
            "box",
            [0, 3.02, 0],
            [18.5, 0.12, 0.16],
            materials.white
        );

        for (let x = -8.5; x <= 8.5; x += 0.5) {
            createPrimitive(
                `Net Vertical ${x}`,
                "box",
                [x, 2.5, 0],
                [0.025, 1.0, 0.11],
                materials.white
            );
        }

        for (let y = 2.05; y <= 2.95; y += 0.18) {
            createPrimitive(
                `Net Horizontal ${y}`,
                "box",
                [0, y, 0],
                [18.2, 0.018, 0.12],
                materials.white
            );
        }

        // Poteaux
        for (const x of [-9.2, 9.2]) {
            createPrimitive(
                "Net Pole",
                "cylinder",
                [x, 2.4, 0],
                [0.13, 2.6, 0.13],
                materials.pole
            );

            createPrimitive(
                "Pole Base",
                "cylinder",
                [x, 0.25, 0],
                [0.45, 0.45, 0.45],
                materials.pole
            );
        }

        // Tribunes
        for (let row = 0; row < 5; row++) {
            const zNorth = -19 - row * 1.1;
            const zSouth = 19 + row * 1.1;

            createPrimitive(
                "North Stadium Stand",
                "box",
                [0, 0.5 + row * 0.45, zNorth],
                [31, 0.5, 1.3],
                materials.seat
            );

            createPrimitive(
                "South Stadium Stand",
                "box",
                [0, 0.5 + row * 0.45, zSouth],
                [31, 0.5, 1.3],
                materials.seat
            );
        }

        // Spectateurs procéduraux
        const crowdMaterials = [
            material([0.88, 0.15, 0.20]),
            material([0.98, 0.79, 0.14]),
            material([0.10, 0.45, 0.90]),
            material([0.90, 0.90, 0.91]),
            material([0.08, 0.65, 0.42])
        ];

        for (let i = 0; i < 100; i++) {
            const x = random(-14, 14);
            const side = Math.random() > 0.5 ? 1 : -1;
            const z = side * random(20, 25);

            createPrimitive(
                `Spectator ${i}`,
                "capsule",
                [x, random(1.2, 3.4), z],
                [0.22, 0.45, 0.22],
                crowdMaterials[i % crowdMaterials.length]
            );
        }

        // Palmiers décoratifs
        for (const x of [-17, -12, 12, 17]) {
            for (const z of [-21, 21]) {
                createPrimitive(
                    "Palm Trunk",
                    "cylinder",
                    [x, 2.2, z],
                    [0.32, 4.5, 0.32],
                    materials.wood
                );

                for (let i = 0; i < 5; i++) {
                    const leaf = createPrimitive(
                        "Palm Leaf",
                        "cone",
                        [
                            x + Math.cos(i * Math.PI * 2 / 5) * 1.4,
                            4.5,
                            z + Math.sin(i * Math.PI * 2 / 5) * 1.4
                        ],
                        [0.55, 2.0, 0.55],
                        materials.palm
                    );

                    leaf.setEulerAngles(
                        0,
                        i * 72,
                        35 + i * 3
                    );
                }
            }
        }

        // Éclairage du stade
        for (const x of [-16, 16]) {
            for (const z of [-15, 15]) {
                createPrimitive(
                    "Floodlight Pole",
                    "cylinder",
                    [x, 7, z],
                    [0.22, 14, 0.22],
                    materials.pole
                );

                createPrimitive(
                    "Floodlight Head",
                    "box",
                    [x, 14, z],
                    [2.4, 0.45, 0.7],
                    materials.white
                );
            }
        }

        createPlayers();
        createBall();
        updateScoreboard();
    }

    /* ========================================================
       14. MODÈLES 3D DES JOUEURS
    ======================================================== */

    function createHumanoid(name, side, index, position, uniformMaterial) {
        const pc = state.pc;
        const root = new pc.Entity(`${side}-${name}`);

        state.app.root.addChild(root);
        root.setPosition(position[0], position[1], position[2]);

        const skin = material([0.66, 0.43, 0.30], { gloss: 20 });
        const shorts = material([0.08, 0.10, 0.16], { gloss: 18 });
        const shoes = material([0.92, 0.92, 0.90], { gloss: 30 });

        const body = createPrimitive(
            `${name} Torso`,
            "capsule",
            [0, 1.45, 0],
            [0.60, 0.75, 0.38],
            uniformMaterial,
            root
        );

        const head = createPrimitive(
            `${name} Head`,
            "sphere",
            [0, 2.23, 0],
            [0.42, 0.43, 0.40],
            skin,
            root
        );

        const leftArm = createPrimitive(
            `${name} Left Arm`,
            "capsule",
            [-0.48, 1.48, 0],
            [0.20, 0.62, 0.20],
            skin,
            root
        );

        const rightArm = createPrimitive(
            `${name} Right Arm`,
            "capsule",
            [0.48, 1.48, 0],
            [0.20, 0.62, 0.20],
            skin,
            root
        );

        const leftLeg = createPrimitive(
            `${name} Left Leg`,
            "capsule",
            [-0.18, 0.58, 0],
            [0.23, 0.72, 0.23],
            shorts,
            root
        );

        const rightLeg = createPrimitive(
            `${name} Right Leg`,
            "capsule",
            [0.18, 0.58, 0],
            [0.23, 0.72, 0.23],
            shorts,
            root
        );

        createPrimitive(
            `${name} Left Shoe`,
            "box",
            [-0.18, 0.13, 0.10],
            [0.32, 0.16, 0.48],
            shoes,
            root
        );

        createPrimitive(
            `${name} Right Shoe`,
            "box",
            [0.18, 0.13, 0.10],
            [0.32, 0.16, 0.48],
            shoes,
            root
        );

        return {
            name,
            side,
            index,
            root,
            body,
            head,
            leftArm,
            rightArm,
            leftLeg,
            rightLeg,
            homeX: position[0],
            homeY: position[1],
            homeZ: position[2],
            targetX: position[0],
            targetZ: position[2],
            animation: 0,
            jump: 0,
            uniformMaterial,
            isMaster: name === "Ranise" || name === "MEME"
        };
    }

    function createPlayers() {
        state.homePlayers = [];
        state.awayPlayers = [];

        const style = KIT_STYLES[state.currentKitStyle];

        const homeMat = material(style.home, { gloss: 32 });
        const awayMat = material(style.away, { gloss: 32 });

        const homeNames = createRoster(state.homeTeam, "home");
        const awayNames = createRoster(state.awayTeam, "away");

        /*
         * Six joueurs sur le terrain, cinq sur le banc.
         * Chaque équipe conserve son effectif de 11 joueurs.
         */
        for (let i = 0; i < 11; i++) {
            let homeX;
            let homeZ;
            let awayX;
            let awayZ;

            if (i < 6) {
                const lane = i % 3;
                const row = Math.floor(i / 3);

                homeX = -5 + lane * 5;
                homeZ = row === 0 ? 9 : 14;

                awayX = -5 + lane * 5;
                awayZ = row === 0 ? -9 : -14;
            } else {
                homeX = -10 + ((i - 6) % 6) * 4;
                homeZ = 19 + Math.floor((i - 6) / 6) * 2;

                awayX = -10 + ((i - 6) % 6) * 4;
                awayZ = -19 - Math.floor((i - 6) / 6) * 2;
            }

            const homePlayer = createHumanoid(
                homeNames[i],
                "home",
                i,
                [homeX, 0, homeZ],
                homeMat
            );

            const awayPlayer = createHumanoid(
                awayNames[i],
                "away",
                i,
                [awayX, 0, awayZ],
                awayMat
            );

            state.homePlayers.push(homePlayer);
            state.awayPlayers.push(awayPlayer);
        }
    }

    function updatePlayerAppearances() {
        if (!state.sceneReady && !state.homePlayers.length) return;

        const style = KIT_STYLES[state.currentKitStyle];

        const homeMat = material(style.home, { gloss: 32 });
        const awayMat = material(style.away, { gloss: 32 });

        for (const player of state.homePlayers) {
            player.uniformMaterial = homeMat;

            if (player.body?.render) {
                player.body.render.material = homeMat;
            }
        }

        for (const player of state.awayPlayers) {
            player.uniformMaterial = awayMat;

            if (player.body?.render) {
                player.body.render.material = awayMat;
            }
        }
    }

    /* ========================================================
       15. BALLON
    ======================================================== */

    function createBall() {
        const ballMat = material(
            BALL_STYLES[state.currentBallStyle].main,
            { gloss: 80 }
        );

        state.ballEntity = createPrimitive(
            "Volleyball",
            "sphere",
            [0, 2.5, 0],
            [0.72, 0.72, 0.72],
            ballMat
        );

        const accentMat = material(
            BALL_STYLES[state.currentBallStyle].accent,
            { gloss: 70 }
        );

        for (let i = 0; i < 3; i++) {
            const seam = createPrimitive(
                `Ball Seam ${i}`,
                "box",
                [0, 2.5, 0],
                [0.04, 0.72, 0.72],
                accentMat,
                state.ballEntity
            );

            seam.setEulerAngles(0, i * 60, i * 35);
            state.ballSeams.push(seam);
        }
    }

    function updateBallAppearance() {
        if (!state.ballEntity) return;

        const style = BALL_STYLES[state.currentBallStyle];

        if (state.ballEntity.render) {
            state.ballEntity.render.material = material(style.main, { gloss: 80 });
        }

        state.ballSeams.forEach(seam => {
            if (seam.render) {
                seam.render.material = material(style.accent, { gloss: 70 });
            }
        });
    }

    function setBallPosition(x, y, z) {
        state.ballPosition = { x, y, z };

        if (state.ballEntity) {
            state.ballEntity.setPosition(x, y, z);
        }
    }

    /* ========================================================
       16. TABLEAU ET SCORE
    ======================================================== */

    function updateScoreboard() {
        if ($("homeTeamName")) {
            $("homeTeamName").textContent = state.homeTeam;
        }

        if ($("awayTeamName")) {
            $("awayTeamName").textContent = state.awayTeam;
        }

        if ($("homeScore")) $("homeScore").textContent = state.homeScore;
        if ($("awayScore")) $("awayScore").textContent = state.awayScore;

        if ($("setLabel")) {
            $("setLabel").textContent =
                `SET ${state.setNumber} · ${state.homeSets}-${state.awaySets}`;
        }

        if ($("missionLabel")) {
            $("missionLabel").textContent =
                `MISSION ${String(state.mission).padStart(2, "0")} / ${CONFIG.missionCount}`;
        }

        if ($("matchObjective")) {
            const target = MISSIONS[state.mission - 1]?.target || 11;
            $("matchObjective").textContent =
                `Objectif : atteindre ${target} points et gagner le match`;
        }
    }

    function updateMatchClock() {
        if (!$("matchClock")) return;

        const totalSeconds = Math.floor(state.elapsed);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        $("matchClock").textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    /* ========================================================
       17. LANCEMENT D'UN MATCH
    ======================================================== */

    async function startMatch() {
        if (state.matchStarting) return;

        state.matchStarting = true;

        try {
            initializeAudio();

            const ready = state.sceneReady || await initializeEngine();

            if (!ready) {
                notify("Le moteur 3D n'est pas prêt. Vérifiez votre connexion.");
                return;
            }

            state.homeScore = 0;
            state.awayScore = 0;
            state.homeSets = 0;
            state.awaySets = 0;
            state.setNumber = 1;

            state.elapsed = 0;
            state.rallyTimer = 0;
            state.rallyTimeout = 0;
            state.rallyNumber = 0;

            state.matchActive = true;
            state.matchFinished = false;
            state.paused = false;
            state.matchStartTime = performance.now();

            state.ballMode = "waiting";
            state.lastHitSide = "home";
            state.activePlayerIndex = 0;

            const homeNames = createRoster(state.homeTeam, "home");
            const awayNames = createRoster(state.awayTeam, "away");

            // Mettre à jour les noms visuels selon les équipes sélectionnées.
            state.homePlayers.forEach((player, index) => {
                player.name = homeNames[index];
            });

            state.awayPlayers.forEach((player, index) => {
                player.name = awayNames[index];
            });

            positionPlayersForServe();

            setBallPosition(-4, 2.5, 13.5);

            updateScoreboard();
            updateMatchClock();

            setHidden("mainMenu", true);
            setHidden("profilePanel", true);
            setHidden("careerPanel", true);
            setHidden("championshipPanel", true);
            setHidden("teamsPanel", true);
            setHidden("equipmentPanel", true);
            setHidden("howToPlayPanel", true);
            setHidden("settingsPanel", true);
            setHidden("matchResultPanel", true);

            setHidden("stadiumSection", false);
            setHidden("matchControls", false);
            setHidden("bottomNavigation", false);

            setHidden("stadiumLoader", true);

            setMessage("Match prêt ! Appuyez sur SERVICE pour commencer.");

            if ($("ballState")) {
                $("ballState").textContent = "Ballon en attente du service";
            }

            if ($("activePlayerName")) {
                $("activePlayerName").textContent = state.homePlayers[0].name;
            }

            if ($("activePlayerPosition")) {
                $("activePlayerPosition").textContent = "Joueur actif · Service";
            }

            updateNavigation("navHomeButton");

            await saveGame(true);

        } finally {
            state.matchStarting = false;
        }
    }

    function positionPlayersForServe() {
        state.homePlayers.forEach((player, index) => {
            if (index < 6) {
                const lane = index % 3;
                const row = Math.floor(index / 3);

                player.root.setPosition(
                    -5 + lane * 5,
                    0,
                    row === 0 ? 9 : 14
                );
            }
        });

        state.awayPlayers.forEach((player, index) => {
            if (index < 6) {
                const lane = index % 3;
                const row = Math.floor(index / 3);

                player.root.setPosition(
                    -5 + lane * 5,
                    0,
                    row === 0 ? -9 : -14
                );
            }
        });
    }

    /* ========================================================
       18. COMMANDES VOLLEYBALL
    ======================================================== */

    function getActivePlayer() {
        return state.homePlayers[state.activePlayerIndex] || state.homePlayers[0];
    }

    function updateActivePlayerUI() {
        const player = getActivePlayer();

        if ($("activePlayerName")) {
            $("activePlayerName").textContent = player?.name || "Selvandieu";
        }

        if ($("activePlayerPosition")) {
            $("activePlayerPosition").textContent =
                player?.isMaster ? "Joueur maître" : "Joueur actif";
        }
    }

    function setBallFlight(targetSide, power = 1, lift = 1) {
        const current = state.ballPosition;

        state.ballMode = "flight";
        state.ballTargetSide = targetSide;
        state.rallyTimer = 0;
        state.rallyTimeout = 0;

        const targetZ = targetSide === "away" ? -11 : 11;

        const targetX = clamp(random(-6, 6), -8, 8);

        const dx = targetX - current.x;
        const dz = targetZ - current.z;
        const distance = Math.sqrt(dx * dx + dz * dz);

        const duration = clamp(distance / (10 * power), 0.55, 1.6);

        state.ballVelocity = {
            x: dx / duration,
            y: (lift * 5.2) / duration,
            z: dz / duration
        };

        state.ballVelocity.gravity = 10.5;
        state.ballVelocity.elapsed = 0;
        state.ballVelocity.duration = duration;
        state.ballVelocity.startY = current.y;
        state.ballVelocity.startX = current.x;
        state.ballVelocity.startZ = current.z;
        state.ballVelocity.targetX = targetX;
        state.ballVelocity.targetZ = targetZ;

        if ($("ballState")) {
            $("ballState").textContent =
                targetSide === "away" ? "Ballon vers l'équipe adverse" : "Ballon vers votre équipe";
        }
    }

    function serveBall() {
        if (!state.matchActive || state.matchFinished || state.paused) return;

        initializeAudio();

        if (state.ballMode !== "waiting") {
            notify("Attendez que le ballon revienne avant de servir.");
            return;
        }

        state.rallyNumber++;
        state.lastHitSide = "home";

        setBallFlight("away", 1.1, 1.05);

        setMessage("Service effectué ! Préparez-vous à défendre.");

        playTone(520, 0.14, "triangle");
    }

    function playerHitBall(type) {
        if (!state.matchActive || state.matchFinished || state.paused) return;

        initializeAudio();

        if (state.ballMode === "waiting") {
            if (type === "pass") {
                notify("Commencez par effectuer le service.");
                return;
            }

            if (type === "smash" || type === "block") {
                notify("Le ballon n'est pas encore en jeu.");
                return;
            }
        }

        const ball = state.ballPosition;

        if (type === "block") {
            if (Math.abs(ball.z) > 6) {
                notify("Approchez-vous du filet pour bloquer.");
                return;
            }
        }

        if (type === "pass") {
            setBallFlight("away", 0.9, 0.95);
            setMessage("Belle passe ! Le ballon repart vers l'adversaire.");
            playTone(440, 0.10, "sine");
        } else if (type === "smash") {
            setBallFlight("away", 1.55, 0.85);
            setMessage("SMASH ! Attaque puissante !");
            playTone(180, 0.18, "sawtooth");
        } else if (type === "block") {
            setBallFlight("away", 1.1, 0.8);
            setMessage("Blocage réussi ! Renvoyez le ballon !");
            playTone(620, 0.12, "triangle");
        }
    }

    function switchPlayer() {
        if (!state.matchActive) return;

        state.activePlayerIndex =
            (state.activePlayerIndex + 1) % 6;

        updateActivePlayerUI();

        const player = getActivePlayer();

        setMessage(`${player.name} est maintenant le joueur actif.`);

        playTone(360, 0.08, "sine");
    }

    /* ========================================================
       19. PHYSIQUE DU BALLON ET IA
    ======================================================== */

    function updateBallPhysics(dt) {
        if (!state.matchActive || state.paused || state.matchFinished) return;

        if (state.ballMode === "waiting") return;

        if (state.ballMode === "flight") {
            const ball = state.ballVelocity;

            ball.elapsed += dt;

            const t = clamp(ball.elapsed / ball.duration, 0, 1);

            const x = ball.startX + (ball.targetX - ball.startX) * t;
            const z = ball.startZ + (ball.targetZ - ball.startZ) * t;

            const arc = Math.sin(t * Math.PI) * 4.5;

            const y = Math.max(
                0.38,
                ball.startY + arc - 0.4 * t
            );

            setBallPosition(x, y, z);

            if (state.ballEntity) {
                state.ballEntity.rotate(180 * dt, 240 * dt, 140 * dt);
            }

            if (t >= 1) {
                setBallPosition(ball.targetX, 0.38, ball.targetZ);

                state.ballMode = "landed";
                state.rallyTimer = 0;

                if ($("ballState")) {
                    $("ballState").textContent =
                        state.ballTargetSide === "away"
                            ? "Ballon chez l'adversaire"
                            : "Ballon dans votre camp";
                }
            }

            return;
        }

        if (state.ballMode === "landed") {
            state.rallyTimer += dt;

            if (state.ballTargetSide === "away") {
                if (state.rallyTimer > 1.25) {
                    state.lastHitSide = "away";
                    setBallFlight("home", 1.0, 1.05);
                    setMessage("L'équipe adverse renvoie le ballon !");
                    playTone(390, 0.09, "triangle");
                }
            } else {
                /*
                 * L'utilisateur a environ 2,8 secondes pour agir.
                 * Ensuite l'IA alliée renvoie le ballon automatiquement.
                 */
                if (state.rallyTimer > 2.8) {
                    state.lastHitSide = "home";

                    const player = getActivePlayer();

                    if (player) {
                        player.jump = 0.35;
                    }

                    setBallFlight("away", 1.0, 0.95);
                    setMessage("Votre équipe renvoie automatiquement le ballon.");
                    playTone(430, 0.08, "sine");
                }
            }
        }
    }

    function scorePoint(side) {
        if (!state.matchActive || state.matchFinished) return;

        if (side === "home") {
            state.homeScore++;
            state.stats.totalPoints++;
            setMessage("POINT POUR FOBAS LEGENDS !");
        } else {
            state.awayScore++;
            setMessage("Point pour l'équipe adverse.");
        }

        playTone(side === "home" ? 720 : 250, 0.22, "triangle");

        updateScoreboard();

        state.ballMode = "waiting";
        state.rallyTimer = 0;

        setBallPosition(
            random(-4, 4),
            2.5,
            side === "home" ? 13.5 : -13.5
        );

        if ($("ballState")) {
            $("ballState").textContent = "Point terminé · prochain service";
        }

        const mission = MISSIONS[state.mission - 1] || MISSIONS[0];
        const target = mission.target;

        if (state.homeScore >= target && state.homeScore - state.awayScore >= 2) {
            state.homeSets++;
            finishSet("home");
            return;
        }

        if (state.awayScore >= target && state.awayScore - state.homeScore >= 2) {
            state.awaySets++;
            finishSet("away");
            return;
        }

        /*
         * Limite de sécurité pour garantir que le set ne reste pas
         * bloqué indéfiniment si les scores sont très serrés.
         */
        if (state.homeScore >= 20 || state.awayScore >= 20) {
            if (state.homeScore > state.awayScore) {
                state.homeSets++;
                finishSet("home");
            } else {
                state.awaySets++;
                finishSet("away");
            }
        }
    }

    function finishSet(winner) {
        if (winner === "home") {
            setMessage(`Set remporté par ${state.homeTeam} !`);
        } else {
            setMessage(`Set remporté par ${state.awayTeam}.`);
        }

        updateScoreboard();

        if (state.homeSets >= 2 || state.awaySets >= 2) {
            finishMatch(state.homeSets > state.awaySets ? "home" : "away");
            return;
        }

        state.setNumber++;

        state.homeScore = 0;
        state.awayScore = 0;
        state.ballMode = "waiting";

        updateScoreboard();

        setBallPosition(-4, 2.5, 13.5);

        setMessage(`Set ${state.setNumber} : appuyez sur SERVICE pour continuer.`);
    }

    function finishMatch(winner) {
        state.matchActive = false;
        state.matchFinished = true;
        state.ballMode = "waiting";

        state.stats.matches++;

        const won = winner === "home";

        if (won) {
            state.stats.wins++;

            if (!state.stats.missionsCompleted.includes(state.mission)) {
                state.stats.missionsCompleted.push(state.mission);
                state.stats.missionsCompleted.sort((a, b) => a - b);
            }

            if (state.competition) {
                if (!state.stats.completedCompetitions.includes(state.competition)) {
                    state.stats.completedCompetitions.push(state.competition);
                }

                const trophy = {
                    competition: state.competition,
                    date: Date.now(),
                    team: state.homeTeam
                };

                state.stats.trophies.push(trophy);
            }
        }

        state.lastResult = {
            won,
            homeScore: state.homeScore,
            awayScore: state.awayScore,
            homeSets: state.homeSets,
            awaySets: state.awaySets,
            mission: state.mission
        };

        if ($("resultIcon")) $("resultIcon").textContent = won ? "🏆" : "🏐";

        if ($("resultTitle")) {
            $("resultTitle").textContent = won ? "VICTOIRE !" : "MATCH TERMINÉ";
        }

        if ($("resultDescription")) {
            $("resultDescription").textContent = won
                ? "Bravo ! Votre équipe a remporté le match."
                : "L'adversaire a remporté ce match. Réessayez pour progresser.";
        }

        if ($("resultHomeScore")) $("resultHomeScore").textContent = state.homeScore;
        if ($("resultAwayScore")) $("resultAwayScore").textContent = state.awayScore;

        const nextButton = $("nextMissionButton");

        if (nextButton) {
            nextButton.textContent =
                state.mission >= CONFIG.missionCount
                    ? "REJOUER LA DERNIÈRE MISSION"
                    : "MISSION SUIVANTE";

            nextButton.disabled = !won;
        }

        setHidden("matchResultPanel", false);
        setHidden("matchControls", true);

        renderProfile();
        renderCareer();

        saveGame(true);

        if (won) {
            setMessage("Victoire ! Votre progression a été enregistrée.");
            notify("Victoire ! Mission réussie.");
        } else {
            setMessage("Match terminé. Vous pouvez réessayer.");
            notify("Match terminé.");
        }
    }

    /* ========================================================
       20. MOUVEMENTS DES JOUEURS
    ======================================================== */

    function updatePlayers(dt) {
        if (!state.sceneReady) return;

        const players = [
            ...state.homePlayers,
            ...state.awayPlayers
        ];

        const joystick = state.joystick;

        for (const player of players) {
            const isHome = player.side === "home";
            const active = isHome && player.index === state.activePlayerIndex;

            if (active && state.matchActive && !state.paused) {
                player.targetX = clamp(
                    player.targetX + joystick.x * dt * 6.0,
                    -8,
                    8
                );

                player.targetZ = clamp(
                    player.targetZ + joystick.y * dt * 6.0,
                    2,
                    15
                );
            } else if (player.index < 6 && state.matchActive) {
                const ball = state.ballPosition;

                if (isHome && ball.z > 0 && state.ballMode !== "waiting") {
                    player.targetX = clamp(ball.x * 0.65, -7, 7);
                    player.targetZ = clamp(ball.z + 2.2, 3, 15);
                } else if (!isHome && ball.z < 0 && state.ballMode !== "waiting") {
                    player.targetX = clamp(ball.x * 0.65, -7, 7);
                    player.targetZ = clamp(ball.z - 2.2, -15, -3);
                } else {
                    player.targetX = player.homeX;
                    player.targetZ = player.homeZ;
                }
            }

            const current = player.root.getPosition();

            const speed = Math.min(1, dt * 3.5);

            const nextX = current.x + (player.targetX - current.x) * speed;
            const nextZ = current.z + (player.targetZ - current.z) * speed;

            player.animation += dt;

            const jumpY = player.jump > 0 ? Math.sin(player.animation * 12) * player.jump : 0;

            player.root.setPosition(nextX, Math.max(0, jumpY), nextZ);

            if (player.jump > 0) {
                player.jump = Math.max(0, player.jump - dt);
            }

            if (player.leftArm) {
                player.leftArm.setLocalEulerAngles(
                    Math.sin(player.animation * 3) * 12,
                    0,
                    active ? joystick.x * 20 : 0
                );
            }

            if (player.rightArm) {
                player.rightArm.setLocalEulerAngles(
                    Math.sin(player.animation * 3 + 1) * 12,
                    0,
                    active ? -joystick.x * 20 : 0
                );
            }
        }
    }

    /* ========================================================
       21. BOUCLE DE JEU
    ======================================================== */

    function updateGame(dt) {
        if (!Number.isFinite(dt) || dt <= 0) return;

        if (state.matchActive && !state.paused && !state.matchFinished) {
            state.elapsed += dt;
            updateMatchClock();
            updateBallPhysics(dt);
            updatePlayers(dt);

            if (state.ballEntity && state.ballMode === "waiting") {
                state.ballEntity.rotate(20 * dt, 30 * dt, 10 * dt);
            }
        }
    }

    /* ========================================================
       22. JOYSTICK TACTILE ET SOURIS
    ======================================================== */

    function initializeJoystick() {
        const base = $("joystickBase");
        const stick = $("joystickStick");

        if (!base || !stick) return;

        let pointerId = null;

        const updateStick = event => {
            const rect = base.getBoundingClientRect();

            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            let dx = event.clientX - centerX;
            let dy = event.clientY - centerY;

            const maxDistance = rect.width * 0.31;
            const length = Math.hypot(dx, dy);

            if (length > maxDistance) {
                dx = dx / length * maxDistance;
                dy = dy / length * maxDistance;
            }

            state.joystick.x = clamp(dx / maxDistance, -1, 1);
            state.joystick.y = clamp(dy / maxDistance, -1, 1);
            state.joystick.active = true;

            stick.style.transform = `translate(${dx}px, ${dy}px)`;
        };

        const stopJoystick = event => {
            if (pointerId !== null && event.pointerId !== pointerId) return;

            pointerId = null;

            state.joystick.x = 0;
            state.joystick.y = 0;
            state.joystick.active = false;

            stick.style.transform = "translate(0, 0)";
        };

        base.addEventListener("pointerdown", event => {
            event.preventDefault();

            pointerId = event.pointerId;

            try {
                base.setPointerCapture(pointerId);
            } catch {}

            updateStick(event);
        });

        base.addEventListener("pointermove", event => {
            if (event.pointerId !== pointerId) return;
            updateStick(event);
        });

        base.addEventListener("pointerup", stopJoystick);
        base.addEventListener("pointercancel", stopJoystick);
        base.addEventListener("lostpointercapture", stopJoystick);
    }

    /* ========================================================
       23. CAMÉRA ET PINCH ZOOM
    ======================================================== */

    function updateCamera() {
        if (!state.cameraEntity) return;

        const zoom = state.zoom;

        state.cameraEntity.setPosition(
            0,
            19 / zoom,
            29 / zoom
        );

        state.cameraEntity.lookAt(0, 0, 0);

        if ($("zoomLevel")) {
            $("zoomLevel").textContent = `${Math.round(zoom * 100)}%`;
        }
    }

    function zoomCamera(direction) {
        state.zoom = clamp(state.zoom + direction * 0.12, 0.65, 1.65);
        updateCamera();
    }

    function resetCamera() {
        state.zoom = 1;
        updateCamera();
        notify("Caméra réinitialisée.");
    }

    function initializePinchZoom() {
        const canvas = $("volleyballCanvas");
        if (!canvas) return;

        const pointers = new Map();

        let initialDistance = 0;
        let initialZoom = 1;

        canvas.addEventListener("pointerdown", event => {
            pointers.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY
            });

            if (pointers.size === 2) {
                const values = [...pointers.values()];

                initialDistance = Math.hypot(
                    values[0].x - values[1].x,
                    values[0].y - values[1].y
                );

                initialZoom = state.zoom;
            }
        });

        canvas.addEventListener("pointermove", event => {
            if (!pointers.has(event.pointerId)) return;

            pointers.set(event.pointerId, {
                x: event.clientX,
                y: event.clientY
            });

            if (pointers.size < 2 || initialDistance <= 0) return;

            const values = [...pointers.values()];

            const distance = Math.hypot(
                values[0].x - values[1].x,
                values[0].y - values[1].y
            );

            state.zoom = clamp(
                initialZoom * distance / initialDistance,
                0.65,
                1.65
            );

            updateCamera();
        });

        const clearPointer = event => {
            pointers.delete(event.pointerId);

            if (pointers.size < 2) {
                initialDistance = 0;
            }
        };

        canvas.addEventListener("pointerup", clearPointer);
        canvas.addEventListener("pointercancel", clearPointer);
        canvas.addEventListener("lostpointercapture", clearPointer);
    }

    /* ========================================================
       24. PAUSE ET REPRISE
    ======================================================== */

    function togglePause() {
        if (!state.sceneReady) return;

        if (!state.matchActive) {
            notify("Commencez un match avant de mettre en pause.");
            return;
        }

        state.paused = !state.paused;

        const button = $("pauseButton");

        if (button) {
            button.textContent = state.paused ? "▶️" : "⏸️";
        }

        setMessage(
            state.paused
                ? "Match en pause. Appuyez sur reprendre pour continuer."
                : "Le match reprend !"
        );

        notify(state.paused ? "Match en pause." : "Match repris.");
    }

    async function leaveMatch() {
        if (!state.matchActive) {
            returnToMenu();
            return;
        }

        const accepted = await askConfirmation(
            "Quitter le match ?",
            "Votre progression déjà enregistrée sera conservée. Voulez-vous quitter le match ?",
            "QUITTER"
        );

        if (!accepted) return;

        state.matchActive = false;
        state.matchFinished = false;
        state.paused = false;

        await saveGame(true);
        returnToMenu();
    }

    /* ========================================================
       25. CHAMPIONNATS ET TOURNOIS
    ======================================================== */

    function startCompetition(competition) {
        const competitions = {
            caribbean: "Caribbean Volleyball Cup",
            elite: "FOBAS Elite Championship",
            world: "World Champions Tournament"
        };

        if (!competitions[competition]) return;

        state.competition = competition;
        state.tournamentRound = 1;

        state.mission = competition === "caribbean"
            ? 10
            : competition === "elite"
                ? 20
                : 35;

        state.awayTeam = competition === "caribbean"
            ? "CARIBBEAN ELITE"
            : competition === "elite"
                ? "MASTER STARS"
                : "WORLD CHAMPIONS";

        renderTeams();
        startMatch();
    }

    function startTournament() {
        state.competition = "tournament";
        state.tournamentRound++;

        state.mission = clamp(
            Math.max(1, state.tournamentRound),
            1,
            CONFIG.missionCount
        );

        state.awayTeam = TEAM_NAMES[
            state.tournamentRound % TEAM_NAMES.length
        ];

        renderTeams();
        notify(`Tournoi · Manche ${state.tournamentRound}`);
        startMatch();
    }

    function nextMission() {
        if (!state.lastResult?.won) {
            notify("Gagnez le match avant de passer à la mission suivante.");
            return;
        }

        state.mission = state.mission >= CONFIG.missionCount
            ? CONFIG.missionCount
            : state.mission + 1;

        state.competition = null;

        startMatch();
    }

    /* ========================================================
       26. BRANCHEMENT DE TOUS LES BOUTONS
    ======================================================== */

    function bindButton(id, callback) {
        const element = $(id);

        if (!element) {
            console.warn(`[FOBAS] Élément HTML manquant : #${id}`);
            return;
        }

        element.addEventListener("click", event => {
            event.preventDefault();

            try {
                const result = callback(event);

                if (result && typeof result.catch === "function") {
                    result.catch(error => {
                        console.error(`[FOBAS] Action ${id} :`, error);
                        notify("Une erreur est survenue. Réessayez.");
                    });
                }
            } catch (error) {
                console.error(`[FOBAS] Action ${id} :`, error);
                notify("Une erreur est survenue. Réessayez.");
            }
        });
    }

    function initializeButtons() {
        // Menu principal
        bindButton("playButton", startMatch);

        bindButton("careerButton", () => {
            openPanel("careerPanel");
        });

        bindButton("championshipButton", () => {
            openPanel("championshipPanel");
        });

        bindButton("tournamentButton", startTournament);

        bindButton("teamsButton", () => {
            openPanel("teamsPanel");
        });

        bindButton("equipmentButton", () => {
            openPanel("equipmentPanel");
        });

        bindButton("howToPlayButton", () => {
            openPanel("howToPlayPanel");
        });

        bindButton("settingsButton", () => {
            openPanel("settingsPanel");
        });

        // Sauvegarde manuelle : uniquement sur clic explicite.
        bindButton("saveButton", () => saveGame(false));

        // Charger : aucune confirmation de sauvegarde.
        bindButton("loadButton", async () => {
            const loaded = await loadGame(false);

            if (loaded) {
                setStatus("Sauvegarde chargée.");
            }
        });

        // Réinitialiser : confirmation seulement ici.
        bindButton("resetButton", resetGame);

        // Fermeture des panneaux
        const closeButtons = [
            "closeProfileButton",
            "closeCareerButton",
            "closeChampionshipButton",
            "closeTeamsButton",
            "closeEquipmentButton",
            "closeHowToPlayButton",
            "closeSettingsButton"
        ];

        closeButtons.forEach(id => {
            bindButton(id, returnToMenu);
        });

        // Profil
        bindButton("saveProfileButton", saveProfile);

        // Équipes
        bindButton("confirmTeamsButton", confirmTeams);

        // Compétitions
        $$("[data-competition]").forEach(button => {
            button.addEventListener("click", () => {
                startCompetition(button.dataset.competition);
            });
        });

        // Ballons
        $$("[data-ball]").forEach(button => {
            button.addEventListener("click", () => {
                chooseBall(button.dataset.ball);
            });
        });

        // Tenues
        $$("[data-kit]").forEach(button => {
            button.addEventListener("click", () => {
                chooseKit(button.dataset.kit);
            });
        });

        // Paramètres
        ["musicVolume", "effectsVolume", "graphicsQuality", "crowdSound"]
            .forEach(id => {
                $(id)?.addEventListener("input", readSettingsUI);
                $(id)?.addEventListener("change", readSettingsUI);
            });

        bindButton("saveSettingsButton", saveSettings);

        // Commandes de jeu
        bindButton("serveButton", serveBall);
        bindButton("passButton", () => playerHitBall("pass"));
        bindButton("smashButton", () => playerHitBall("smash"));
        bindButton("blockButton", () => playerHitBall("block"));
        bindButton("switchPlayerButton", switchPlayer);

        bindButton("leaveMatchButton", leaveMatch);

        // Caméra
        bindButton("zoomInButton", () => zoomCamera(1));
        bindButton("zoomOutButton", () => zoomCamera(-1));
        bindButton("cameraResetButton", resetCamera);

        // Pause et son
        bindButton("pauseButton", togglePause);
        bindButton("soundButton", toggleSound);

        // Résultats
        bindButton("nextMissionButton", nextMission);
        bindButton("returnMenuButton", returnToMenu);

        // Navigation inférieure
        bindButton("navHomeButton", returnToMenu);

        bindButton("navCareerButton", () => {
            openPanel("careerPanel");
            updateNavigation("navCareerButton");
        });

        bindButton("navTeamsButton", () => {
            openPanel("teamsPanel");
            updateNavigation("navTeamsButton");
        });

        bindButton("navProfileButton", () => {
            openPanel("profilePanel");
            updateNavigation("navProfileButton");
        });

        bindButton("profileButton", () => {
            openPanel("profilePanel");
        });

        initializeJoystick();
        initializePinchZoom();
    }



/* ========================================================
   27. AUTOSAVE ET INITIALISATION
   FOBAS VOLLEYBALL CHAMPIONS 3D
======================================================== */

async function initializeStorage() {
    try {
        await openDatabase();
        await loadGame(true);

        setStatus("IndexedDB prêt. Votre progression est conservée.");
    } catch (error) {
        console.warn(
            "[FOBAS] IndexedDB indisponible ; localStorage sera utilisé si possible.",
            error
        );

        state.storageAvailable = false;

        await loadGame(true);

        setStatus("Mode de sauvegarde locale activé.");
    }

    // Sauvegarde automatique silencieuse toutes les 10 minutes.
    setInterval(() => {
        if (state.matchActive) return;

        saveGame(true);
    }, 10 * 60 * 1000);
}


/* ========================================================
   INITIALISATION DE L'INTERFACE
======================================================== */

function initializeUI() {
    // 1. Fèmen fenèt konfimasyon an depi jwèt la demare.
    if (typeof closeConfirmationDialog === "function") {
        closeConfirmationDialog();
    } else {
        const dialog = $("confirmationDialog");

        if (dialog) {
            if (dialog.open && typeof dialog.close === "function") {
                dialog.close();
            }

            dialog.removeAttribute("open");
            dialog.hidden = true;
            dialog.style.removeProperty("display");
        }
    }

    // 2. Montre meni prensipal la.
    setHidden("mainMenu", false);

    // 3. Kache tout lòt panèl ki pa dwe parèt nan demaraj la.
    [
        "profilePanel",
        "careerPanel",
        "championshipPanel",
        "teamsPanel",
        "equipmentPanel",
        "howToPlayPanel",
        "settingsPanel",
        "matchResultPanel",
        "matchControls"
    ].forEach(id => setHidden(id, true));

    // 4. Kache seksyon estad la jiskaske yon match kòmanse.
    setHidden("stadiumSection", true);

    // 5. Mete mesaj demaraj la.
    const engineStatus = $("engineStatus");

    if (engineStatus) {
        engineStatus.textContent = "PRÊT À JOUER";
    }

    // 6. Kòmanse sou premye misyon an.
    const missionLabel = $("missionLabel");

    if (missionLabel) {
        missionLabel.textContent = "MISSION 01 / 40";
    }

    // 7. Mete non ekip yo sou tablo a.
    const homeTeamName = $("homeTeamName");
    const awayTeamName = $("awayTeamName");

    if (homeTeamName) {
        homeTeamName.textContent = state.homeTeam;
    }

    if (awayTeamName) {
        awayTeamName.textContent = state.awayTeam;
    }

    // 8. Mete paramèt yo ajou.
    syncSettingsUI();
    syncEquipmentUI();

    // 9. Montre pwofil, misyon ak ekip yo.
    renderProfile();
    renderCareer();
    renderTeams();
}


/* ========================================================
   DÉMARRAGE PRINCIPAL
======================================================== */

async function boot() {
    // Evite demaraj miltip.
    if (state.appBooted) return;

    state.appBooted = true;

    try {
        // Prepare entèfas la san okenn konfimasyon.
        initializeUI();

        // Konekte bouton yo.
        initializeButtons();

        // Louvri IndexedDB an aryè-plan.
        initializeStorage().catch(error => {
            console.warn(
                "[FOBAS] Erreur d'initialisation du stockage.",
                error
            );
        });

        // Inisyalize motè 3D a.
        const ready = await initializeEngine();

        if (ready) {
            updateCamera();
            updateScoreboard();
        }
    } catch (error) {
        console.error(
            "[FOBAS] Erreur pendant le démarrage du jeu :",
            error
        );

        const engineStatus = $("engineStatus");

        if (engineStatus) {
            engineStatus.textContent =
                "Le jeu est chargé, mais une fonction nécessite une vérification.";
        }
    }
}


/* ========================================================
   LANCEMENT APRÈS CHARGEMENT DU DOCUMENT
======================================================== */

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, {
        once: true
    });
} else {
    boot();
}


})();
