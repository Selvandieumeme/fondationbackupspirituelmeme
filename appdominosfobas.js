(() => {
    "use strict";

    /* =========================================================
       FOBAS DOMINO 3D
       Version corrigee : 2.0.0
       4 joueurs | 3 IA | Double-Six | IndexedDB
       Compatible avec les identifiants HTML existants
       ========================================================= */

    const $ = id => document.getElementById(id);

    const DB_NAME = "FOBASDominoDB";
    const DB_VERSION = 1;
    const STORE_NAME = "sauvegardes";
    const SAVE_KEY = "partieEnCours";

    const noms = {
        human: "Vous",
        ai1: "Alex",
        ai2: "Chris",
        ai3: "Jordan"
    };

    const ordre = ["human", "ai1", "ai2", "ai3"];

    const elements = {
        status: $("statusMessage"),
        indicator: $("statusIndicator"),
        viewport: $("tableViewport"),
        world: $("tableWorld"),
        chain: $("dominoChain"),
        placeholder: $("chainPlaceholder"),
        turn: $("turnIndicator"),
        humanHint: $("humanTurnHint"),
        hand: $("handTiles"),
        handCount: $("handCount"),
        instructions: $("handInstructions"),
        selectedInfo: $("selectedInfo"),
        pass: $("passButton"),
        left: $("playLeftButton"),
        right: $("playRightButton"),
        zoomValue: $("zoomValue"),
        round: $("roundNumber"),
        score: $("humanScore"),
        played: $("playedCount"),
        turnText: $("turnText"),
        log: $("moveLog"),
        footer: $("gameStateFooter"),
        saveStatus: $("saveStatus"),
        modal: $("modalBackdrop"),
        modalTitle: $("modalTitle"),
        modalContent: $("modalContent"),
        toast: $("toast")
    };

    let db = null;
    let soundEnabled = true;
    let selectedTileId = null;
    let busy = false;
    let toastTimer = null;
    let aiTimer = null;
    let zoom = 1;
    let panX = 0;
    let panY = 0;
    let pointers = new Map();
    let gestureStart = null;
    let audioContext = null;
    let state = null;

    /* ======================== OUTILS ======================== */

    function randomId() {
        return Math.random().toString(36).slice(2, 10) +
            Date.now().toString(36);
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function showToast(message) {
        if (!elements.toast) return;

        elements.toast.textContent = message;
        elements.toast.classList.add("show");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            elements.toast.classList.remove("show");
        }, 2800);
    }

    function setStatus(message) {
        if (elements.status) {
            elements.status.textContent = message;
        }

        if (elements.footer) {
            elements.footer.textContent = message;
        }
    }

    function logAction(message) {
        if (!elements.log) return;

        const empty = elements.log.querySelector(".log-empty");
        if (empty) empty.remove();

        const li = document.createElement("li");
        li.textContent = message;
        elements.log.prepend(li);

        while (elements.log.children.length > 12) {
            elements.log.lastElementChild.remove();
        }
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function cleanPlayerName(value, fallback) {
        const name = String(value || "").trim().replace(/\s+/g, " ");
        return name.slice(0, 24) || fallback;
    }

    function syncNamesFromState() {
        if (!state || !Array.isArray(state.players)) return;

        for (const id of ordre) {
            const player = state.players.find(item => item.id === id);

            if (player && typeof player.name === "string") {
                noms[id] = cleanPlayerName(player.name, noms[id]);
            }

            if (player) player.name = noms[id];
        }
    }

    function syncNamesToState() {
        if (!state || !Array.isArray(state.players)) return;

        state.players.forEach(player => {
            if (noms[player.id]) {
                player.name = noms[player.id];
            }
        });
    }

    function updatePlayerNameLabels() {
        /*
         * Les éléments HTML qui utilisent data-player-name="human",
         * "ai1", "ai2" ou "ai3" sont automatiquement actualisés.
         */
        document.querySelectorAll("[data-player-name]").forEach(node => {
            const id = node.getAttribute("data-player-name");

            if (noms[id]) {
                node.textContent = noms[id];
            }
        });

        /*
         * Actualisation facultative des noms présents dans les sièges.
         * Le code ne remplace que les éléments explicitement identifiés.
         */
        ordre.forEach(id => {
            const seat = $(id === "human" ? "humanSeat" : id + "Seat");
            if (!seat) return;

            const label = seat.querySelector(
                "[data-name-label], .player-name, .seat-name"
            );

            if (label) label.textContent = noms[id];
        });
    }

    function playSound(frequency = 520, duration = 0.07) {
        if (!soundEnabled) return;

        try {
            const AudioCtx =
                window.AudioContext || window.webkitAudioContext;

            if (!AudioCtx) return;

            audioContext = audioContext || new AudioCtx();

            if (audioContext.state === "suspended") {
                audioContext.resume().catch(() => {});
            }

            const oscillator = audioContext.createOscillator();
            const gain = audioContext.createGain();

            oscillator.type = "sine";
            oscillator.frequency.value = frequency;

            gain.gain.setValueAtTime(0.055, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(
                0.001,
                audioContext.currentTime + duration
            );

            oscillator.connect(gain);
            gain.connect(audioContext.destination);

            oscillator.start();
            oscillator.stop(audioContext.currentTime + duration);
        } catch (error) {
            console.warn("Audio indisponible :", error);
        }
    }

    /* ======================== INDEXEDDB ======================== */

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!("indexedDB" in window)) {
                reject(new Error("IndexedDB n'est pas disponible."));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = () => {
                const database = request.result;

                if (!database.objectStoreNames.contains(STORE_NAME)) {
                    database.createObjectStore(STORE_NAME, {
                        keyPath: "id"
                    });
                }
            };

            request.onsuccess = () => {
                db = request.result;
                db.onversionchange = () => db.close();
                resolve(db);
            };

            request.onerror = () => {
                reject(
                    request.error ||
                    new Error("Impossible d'ouvrir IndexedDB.")
                );
            };

            request.onblocked = () => {
                console.warn("Ouverture IndexedDB bloquée.");
            };
        });
    }

    function databaseOperation(mode, callback) {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error("La base de données n'est pas ouverte."));
                return;
            }

            let transaction;

            try {
                transaction = db.transaction(STORE_NAME, mode);
            } catch (error) {
                reject(error);
                return;
            }

            const store = transaction.objectStore(STORE_NAME);
            let request = null;

            try {
                request = callback(store);
            } catch (error) {
                reject(error);
                return;
            }

            transaction.oncomplete = () => {
                if (request && "result" in request) {
                    resolve(request.result);
                } else {
                    resolve(request);
                }
            };

            transaction.onerror = () => {
                reject(
                    transaction.error ||
                    new Error("Erreur de transaction.")
                );
            };

            transaction.onabort = () => {
                reject(
                    transaction.error ||
                    new Error("Transaction annulée.")
                );
            };
        });
    }

    async function saveGame(silent = false) {
        if (!state) return false;

        try {
            if (!db) await openDatabase();

            syncNamesToState();

            const snapshot = clone(state);
            snapshot.savedAt = new Date().toISOString();

            await databaseOperation("readwrite", store => {
                return store.put({
                    id: SAVE_KEY,
                    state: snapshot
                });
            });

            if (elements.saveStatus) {
                elements.saveStatus.textContent =
                    "Partie sauvegardée : " +
                    new Date(snapshot.savedAt).toLocaleTimeString();
            }

            if (!silent) {
                showToast("Partie sauvegardée avec succès.");
            }

            return true;
        } catch (error) {
            console.error("Erreur de sauvegarde :", error);

            if (elements.saveStatus) {
                elements.saveStatus.textContent =
                    "Échec de la sauvegarde. Vérifiez le navigateur.";
            }

            if (!silent) {
                showToast(
                    "Sauvegarde impossible. Vérifiez les permissions du navigateur."
                );
            }

            return false;
        }
    }

    function validateState(candidate) {
        if (
            !candidate ||
            !Array.isArray(candidate.players) ||
            !Array.isArray(candidate.chain) ||
            !Array.isArray(candidate.log) ||
            !ordre.includes(candidate.currentPlayer)
        ) {
            return false;
        }

        if (candidate.players.length !== 4) return false;

        const playerIds = candidate.players.map(player => player && player.id);

        if (new Set(playerIds).size !== 4) return false;

        if (!ordre.every(id => playerIds.includes(id))) return false;

        if (!candidate.players.every(player =>
            player &&
            ordre.includes(player.id) &&
            Array.isArray(player.hand)
        )) {
            return false;
        }

        if (!["playing", "finished"].includes(candidate.phase)) {
            return false;
        }

        if (!Number.isFinite(Number(candidate.round))) return false;

        for (const player of candidate.players) {
            for (const tile of player.hand) {
                if (
                    !tile ||
                    tile.id == null ||
                    !Number.isInteger(tile.a) ||
                    !Number.isInteger(tile.b) ||
                    tile.a < 0 || tile.a > 6 ||
                    tile.b < 0 || tile.b > 6
                ) {
                    return false;
                }
            }
        }

        for (const item of candidate.chain) {
            if (
                !item ||
                !item.tile ||
                !ordre.includes(item.player) ||
                !Number.isInteger(item.tile.a) ||
                !Number.isInteger(item.tile.b)
            ) {
                return false;
            }
        }

        return true;
    }

    function migrateSavedState(savedState) {
        if (!validateState(savedState)) return false;

        /*
         * Compatibilité avec les anciennes sauvegardes.
         */
        if (!Array.isArray(savedState.log)) {
            savedState.log = [];
        }

        if (!Number.isFinite(Number(savedState.playedCount))) {
            savedState.playedCount = savedState.chain.length;
        }

        if (!Number.isFinite(Number(savedState.consecutivePasses))) {
            savedState.consecutivePasses = 0;
        }

        if (!Number.isFinite(Number(savedState.round))) {
            savedState.round = 1;
        }

        if (!("winner" in savedState)) {
            savedState.winner = null;
        }

        if (!("lastMove" in savedState)) {
            savedState.lastMove = null;
        }

        savedState.version = 2;

        syncNamesFromStateFor(savedState);

        /*
         * Une chaîne déjà commencée n'a plus besoin de la règle
         * spéciale du double-six d'ouverture.
         */
        if (savedState.chain.length > 0) {
            savedState.openingTileId = null;
            return true;
        }

        /*
         * Ancienne sauvegarde sans chaîne : retrouver le double-six.
         */
        if (!savedState.openingTileId) {
            for (const player of savedState.players) {
                const doubleSix = player.hand.find(tile =>
                    tile.a === 6 && tile.b === 6
                );

                if (doubleSix) {
                    savedState.openingTileId = doubleSix.id;
                    savedState.currentPlayer = player.id;
                    savedState.leftEnd = null;
                    savedState.rightEnd = null;
                    return true;
                }
            }

            /*
             * Si une ancienne sauvegarde vide ne contient plus le
             * double-six, elle ne peut pas reprendre légalement.
             */
            return false;
        }

        return true;
    }

    function syncNamesFromStateFor(candidate) {
        if (!candidate || !Array.isArray(candidate.players)) return;

        candidate.players.forEach(player => {
            if (player && ordre.includes(player.id)) {
                player.name = cleanPlayerName(
                    player.name,
                    noms[player.id]
                );
            }
        });
    }

    async function loadGame() {
        try {
            if (!db) await openDatabase();

            const saved = await new Promise((resolve, reject) => {
                const transaction = db.transaction(
                    STORE_NAME,
                    "readonly"
                );

                const request = transaction
                    .objectStore(STORE_NAME)
                    .get(SAVE_KEY);

                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => reject(request.error);
            });

            if (!saved || !saved.state) {
                showToast("Aucune sauvegarde trouvée.");
                return;
            }

            const restored = clone(saved.state);

            if (!migrateSavedState(restored)) {
                showToast(
                    "Cette ancienne sauvegarde est incompatible. Commencez une nouvelle manche."
                );
                return;
            }

            state = restored;
            syncNamesFromState();
            selectedTileId = null;
            busy = false;
            clearTimeout(aiTimer);

            renderAll();
            showToast("Sauvegarde chargée.");
            setStatus("Partie restaurée");

            if (
                state.phase === "playing" &&
                state.currentPlayer !== "human"
            ) {
                scheduleAI();
            }
        } catch (error) {
            console.error("Erreur de chargement :", error);
            showToast("Impossible de lire la sauvegarde.");
        }
    }

    /* ======================== RÈGLES ET DISTRIBUTION ======================== */

    function createSet() {
        const tiles = [];
        let id = 0;

        for (let a = 0; a <= 6; a++) {
            for (let b = a; b <= 6; b++) {
                tiles.push({
                    id: "d" + id++,
                    a,
                    b
                });
            }
        }

        return shuffle(tiles);
    }

    function newGame() {
        clearTimeout(aiTimer);
        busy = false;

        const previousRound = state ? Number(state.round) || 0 : 0;
        const tiles = createSet();

        const players = ordre.map(id => {
            const oldPlayer = state && Array.isArray(state.players)
                ? state.players.find(player => player.id === id)
                : null;

            return {
                id,
                name: noms[id],
                hand: [],
                score: oldPlayer ? Number(oldPlayer.score) || 0 : 0
            };
        });

        /*
         * Chaque joueur reçoit exactement 7 dominos.
         * Le double-six reste dans la main du joueur qui le possède.
         */
        for (let i = 0; i < 7; i++) {
            for (const player of players) {
                player.hand.push(tiles.pop());
            }
        }

        const opening = players
            .flatMap(player => player.hand.map(tile => ({
                player,
                tile
            })))
            .find(item => item.tile.a === 6 && item.tile.b === 6);

        const startingPlayer = opening
            ? opening.player.id
            : "human";

        state = {
            version: 2,
            round: previousRound + 1,
            players,
            chain: [],
            leftEnd: null,
            rightEnd: null,
            currentPlayer: startingPlayer,
            consecutivePasses: 0,
            phase: "playing",
            winner: null,
            openingTileId: opening ? opening.tile.id : null,
            selectedTileId: null,
            log: [],
            playedCount: 0,
            lastMove: null
        };

        selectedTileId = null;
        pointers.clear();
        gestureStart = null;

        const message = opening
            ? `${noms[startingPlayer]} détient le double-six et ouvre la manche.`
            : "Nouvelle manche : chaque joueur reçoit 7 dominos.";

        state.log.push(message);

        renderAll();
        setStatus(message);
        logAction(message);

        if (opening && startingPlayer !== "human") {
            scheduleAI();
        }

        saveGame(true);
    }

    function nextPlayer(id) {
        const index = ordre.indexOf(id);
        return ordre[(index + 1 + ordre.length) % ordre.length];
    }

    function getPlayer(id) {
        if (!state || !Array.isArray(state.players)) return null;
        return state.players.find(player => player.id === id) || null;
    }

    function pipCount(tile) {
        return Number(tile.a) + Number(tile.b);
    }

    function legalSides(tile) {
        if (!state || state.phase !== "playing" || !tile) return [];

        /*
         * Tant que la chaîne est vide, seul le double-six peut être joué.
         */
        if (state.chain.length === 0) {
            return state.openingTileId &&
                tile.id === state.openingTileId &&
                tile.a === 6 &&
                tile.b === 6
                ? ["left", "right"]
                : [];
        }

        const sides = [];

        if (tile.a === state.leftEnd || tile.b === state.leftEnd) {
            sides.push("left");
        }

        if (tile.a === state.rightEnd || tile.b === state.rightEnd) {
            sides.push("right");
        }

        return sides;
    }

    function canPass(playerId) {
        const player = getPlayer(playerId);

        return Boolean(
            player &&
            player.hand.length > 0 &&
            player.hand.every(tile => legalSides(tile).length === 0)
        );
    }

    /* ======================== AFFICHAGE DES DOMINOS ======================== */

    const pipPositions = {
        0: [],
        1: [[50, 50]],
        2: [[25, 25], [75, 75]],
        3: [[25, 25], [50, 50], [75, 75]],
        4: [[25, 25], [75, 25], [25, 75], [75, 75]],
        5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
        6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]]
    };

    function halfMarkup(value) {
        const dots = (pipPositions[value] || []).map(([x, y]) =>
            `<i class="pip" style="left:${x}%;top:${y}%"></i>`
        ).join("");

        return `
            <span class="domino-half value-${value}"
                aria-label="${value} points">
                ${dots}
            </span>`;
    }

    function tileMarkup(tile, options = {}) {
        const selected = options.selected ? " is-selected" : "";
        const disabled = options.disabled ? " is-disabled" : "";
        const orientation = options.vertical ? " domino-vertical" : "";

        return `
            <button type="button"
                class="domino-tile${selected}${disabled}${orientation}"
                data-tile-id="${escapeHtml(tile.id)}"
                aria-label="Domino ${tile.a} et ${tile.b}"
                ${options.disabled ? "disabled" : ""}>
                ${halfMarkup(tile.a)}
                <span class="domino-divider"></span>
                ${halfMarkup(tile.b)}
            </button>`;
    }

    /*
     * Sur la table, les dominos sont des DIV, et non des boutons.
     * Cela évite de créer des boutons de sélection dans la chaîne.
     */
    function playedTileMarkup(tile, vertical = false) {
        return `
            <div class="domino-tile played-tile${vertical ? " domino-vertical" : ""}"
                aria-label="Domino posé ${tile.a} et ${tile.b}">
                ${halfMarkup(tile.a)}
                <span class="domino-divider"></span>
                ${halfMarkup(tile.b)}
            </div>`;
    }

    function renderHand() {
        const player = getPlayer("human");
        if (!player || !elements.hand) return;

        const hand = player.hand;
        const disabled = state.phase !== "playing" ||
            state.currentPlayer !== "human" ||
            busy;

        elements.hand.innerHTML = hand.map(tile =>
            tileMarkup(tile, {
                selected: tile.id === selectedTileId,
                disabled
            })
        ).join("");

        if (elements.handCount) {
            elements.handCount.textContent = `(${hand.length})`;
        }

        if (elements.selectedInfo) {
            const tile = hand.find(item => item.id === selectedTileId);

            elements.selectedInfo.textContent = tile
                ? `Domino sélectionné : ${tile.a} | ${tile.b}`
                : "Aucun domino sélectionné";
        }

        updatePlayButtons();
    }

    function renderChain() {
        if (!elements.chain || !state) return;

        const chain = state.chain;

        if (chain.length === 0) {
            elements.chain.innerHTML = `
                <div class="chain-placeholder" id="chainPlaceholder">
                    <span class="placeholder-symbol">◇</span>
                    <strong>La partie commence ici</strong>
                    <small>
                        ${state.openingTileId
                            ? "Le détenteur du double-six peut le poser."
                            : "Nouvelle partie en attente."}
                    </small>
                </div>`;
            return;
        }

        elements.chain.innerHTML = chain.map((item, index) => {
            const tile = item.tile;
            const vertical = tile.a === tile.b;
            const playerName = noms[item.player] || item.player;

            return `
                <div class="played-domino ${vertical ? "played-double" : ""}"
                    data-played-index="${index}"
                    title="${escapeHtml(playerName)} : ${tile.a}-${tile.b}">
                    <span class="played-owner">
                        ${escapeHtml(playerName)}
                    </span>
                    ${playedTileMarkup(tile, vertical)}
                </div>`;
        }).join("");

        /*
         * Placer la vue près du dernier domino ajouté sans masquer
         * la main du joueur.
         */
        elements.chain.scrollLeft = elements.chain.scrollWidth;
    }

    function renderCounts() {
        for (const id of ordre) {
            const player = getPlayer(id);
            if (!player) continue;

            const suffix = id[0].toUpperCase() + id.slice(1);
            const countEl = $(id === "human" ? "countHuman" : "count" + suffix);
            const listEl = $("list" + suffix);
            const row = $("row" + suffix);

            if (countEl) {
                countEl.textContent =
                    `${player.hand.length} pièce${player.hand.length === 1 ? "" : "s"}`;
            }

            if (listEl) {
                listEl.textContent = String(player.hand.length);
            }

            if (row) {
                row.classList.toggle(
                    "active-player",
                    state.currentPlayer === id && state.phase === "playing"
                );
            }
        }

        updatePlayerNameLabels();
    }

    function renderScores() {
        const human = getPlayer("human");

        if (elements.round) {
            elements.round.textContent =
                String(state.round || 1).padStart(2, "0");
        }

        if (elements.score && human) {
            elements.score.textContent = String(human.score || 0);
        }

        if (elements.played) {
            elements.played.textContent = String(state.playedCount || 0);
        }
    }

    function renderTurn() {
        if (!state) return;

        const current = state.currentPlayer;

        const message = state.phase === "finished"
            ? (
                state.winner
                    ? `${noms[state.winner]} a gagné la manche !`
                    : "Manche bloquée."
            )
            : current === "human"
                ? "À vous de jouer"
                : `${noms[current]} réfléchit…`;

        if (elements.turn) elements.turn.textContent = message;
        if (elements.turnText) elements.turnText.textContent = message;

        if (elements.humanHint) {
            elements.humanHint.textContent =
                state.phase === "finished"
                    ? "Manche terminée"
                    : current === "human"
                        ? (
                            state.chain.length === 0
                                ? "Sélectionnez le double-six pour commencer."
                                : "Choisissez un domino jouable."
                        )
                        : "Attendez votre tour";
        }

        if (elements.indicator) {
            elements.indicator.classList.toggle(
                "ai-thinking",
                current !== "human" && state.phase === "playing"
            );
        }

        setStatus(message);
    }

    function renderLog() {
        if (!elements.log) return;

        elements.log.innerHTML = "";

        const recent = (state.log || []).slice(-12).reverse();

        if (!recent.length) {
            elements.log.innerHTML =
                '<li class="log-empty">La partie va commencer.</li>';
            return;
        }

        recent.forEach(entry => {
            const li = document.createElement("li");
            li.textContent = entry;
            elements.log.appendChild(li);
        });
    }

    function renderAll() {
        if (!state) return;

        syncNamesToState();
        renderHand();
        renderChain();
        renderCounts();
        renderScores();
        renderTurn();
        renderLog();
        updatePlayButtons();
    }

    /* ======================== ACTIONS DE JEU ======================== */

    function updatePlayButtons() {
        if (!state) return;

        const human = getPlayer("human");
        const tile = human
            ? human.hand.find(item => item.id === selectedTileId)
            : null;

        const isHumanTurn =
            state.phase === "playing" &&
            state.currentPlayer === "human" &&
            !busy;

        const sides = tile ? legalSides(tile) : [];

        if (elements.left) {
            elements.left.disabled =
                !isHumanTurn || !tile || !sides.includes("left");
        }

        if (elements.right) {
            elements.right.disabled =
                !isHumanTurn || !tile || !sides.includes("right");
        }

        if (elements.pass) {
            elements.pass.disabled =
                !isHumanTurn || !canPass("human");
        }
    }

    function selectTile(id) {
        if (
            !state ||
            state.phase !== "playing" ||
            state.currentPlayer !== "human" ||
            busy
        ) {
            return;
        }

        const player = getPlayer("human");
        const tile = player && player.hand.find(item => item.id === id);

        if (!tile) return;

        selectedTileId = selectedTileId === id ? null : id;

        if (selectedTileId) {
            const selected = player.hand.find(item =>
                item.id === selectedTileId
            );

            const sides = selected ? legalSides(selected) : [];

            if (elements.instructions) {
                elements.instructions.textContent = sides.length
                    ? (
                        state.chain.length === 0
                            ? "Le double-six peut ouvrir la partie."
                            : "Choisissez le côté où poser votre domino."
                    )
                    : "Ce domino ne peut pas être joué maintenant.";
            }
        } else if (elements.instructions) {
            elements.instructions.textContent =
                "Touchez un domino pour le sélectionner.";
        }

        renderHand();
        playSound(420, 0.04);
    }

    function orientTile(tile, side, endValue) {
        let a = tile.a;
        let b = tile.b;

        if (state.chain.length > 0) {
            if (side === "left") {
                /*
                 * À gauche, la valeur raccordée doit se trouver
                 * sur le côté droit du domino posé.
                 */
                if (b !== endValue && a === endValue) {
                    [a, b] = [b, a];
                }
            } else if (side === "right") {
                /*
                 * À droite, la valeur raccordée doit se trouver
                 * sur le côté gauche du domino posé.
                 */
                if (a !== endValue && b === endValue) {
                    [a, b] = [b, a];
                }
            }
        }

        return { ...tile, a, b };
    }

    function playTile(playerId, tileId, side) {
        if (!state || state.phase !== "playing") return false;
        if (state.currentPlayer !== playerId) return false;

        const player = getPlayer(playerId);
        if (!player) return false;

        const tileIndex = player.hand.findIndex(tile => tile.id === tileId);
        if (tileIndex < 0) return false;

        const original = player.hand[tileIndex];
        const sides = legalSides(original);

        if (!sides.includes(side)) {
            if (playerId === "human") {
                showToast(
                    state.chain.length === 0
                        ? "Seul le double-six peut ouvrir la partie."
                        : "Ce domino ne correspond pas à cette extrémité."
                );
            }

            return false;
        }

        const isFirst = state.chain.length === 0;
        const endValue = side === "left"
            ? state.leftEnd
            : state.rightEnd;

        const oriented = orientTile(original, side, endValue);

        player.hand.splice(tileIndex, 1);

        if (isFirst) {
            state.chain.push({
                tile: { ...original },
                player: playerId,
                side: "center"
            });

            state.leftEnd = original.a;
            state.rightEnd = original.b;
            state.openingTileId = null;
        } else if (side === "left") {
            state.chain.unshift({
                tile: oriented,
                player: playerId,
                side: "left"
            });

            state.leftEnd = oriented.a;
        } else {
            state.chain.push({
                tile: oriented,
                player: playerId,
                side: "right"
            });

            state.rightEnd = oriented.b;
        }

        state.playedCount = (state.playedCount || 0) + 1;
        state.consecutivePasses = 0;
        state.lastMove = {
            player: playerId,
            tile: { ...original },
            side
        };

        const sideText = isFirst
            ? "au centre"
            : side === "left"
                ? "à gauche"
                : "à droite";

        const message =
            `${noms[playerId]} joue ${original.a}-${original.b} ${sideText}.`;

        state.log.push(message);
        logAction(message);

        selectedTileId = null;
        playSound(640, 0.08);

        if (player.hand.length === 0) {
            finishRound(playerId);
            renderAll();
            saveGame(true);
            return true;
        }

        state.currentPlayer = nextPlayer(playerId);

        renderAll();
        saveGame(true);

        if (state.currentPlayer !== "human") {
            scheduleAI();
        }

        return true;
    }

    function passTurn(playerId) {
        if (
            !state ||
            state.phase !== "playing" ||
            state.currentPlayer !== playerId
        ) {
            return;
        }

        if (!canPass(playerId)) {
            if (playerId === "human") {
                showToast("Vous avez au moins un domino jouable.");
            }

            return;
        }

        const message = `${noms[playerId]} passe son tour.`;

        state.log.push(message);
        logAction(message);

        state.consecutivePasses = (state.consecutivePasses || 0) + 1;
        selectedTileId = null;

        if (state.consecutivePasses >= 4) {
            finishBlockedRound();
            renderAll();
            saveGame(true);
            return;
        }

        state.currentPlayer = nextPlayer(playerId);

        renderAll();
        saveGame(true);

        if (state.currentPlayer !== "human") {
            scheduleAI();
        }
    }

    function finishRound(winnerId) {
        state.phase = "finished";
        state.winner = winnerId;

        const remaining = state.players
            .filter(player => player.id !== winnerId)
            .reduce((sum, player) =>
                sum + player.hand.reduce(
                    (subtotal, tile) => subtotal + pipCount(tile),
                    0
                ), 0);

        const winner = getPlayer(winnerId);
        winner.score = (Number(winner.score) || 0) + remaining;

        const message =
            `${noms[winnerId]} gagne la manche et marque ${remaining} points.`;

        state.log.push(message);
        logAction(message);
        playSound(780, 0.2);

        showModal("Fin de manche", `
            <p><strong>${escapeHtml(noms[winnerId])}</strong>
            a posé tous ses dominos !</p>
            <p>Points gagnés : <strong>${remaining}</strong></p>
            <p>Choisissez « Nouvelle partie » pour commencer une nouvelle manche.</p>
            <button type="button" data-menu-action="new-game">
                Commencer une nouvelle manche
            </button>
        `);
    }

    function finishBlockedRound() {
        state.phase = "finished";
        state.winner = null;

        const totals = state.players.map(player => ({
            id: player.id,
            total: player.hand.reduce(
                (sum, tile) => sum + pipCount(tile),
                0
            )
        })).sort((a, b) => a.total - b.total);

        const best = totals[0];
        const tied = totals.filter(item => item.total === best.total).length > 1;

        if (!tied) {
            const winner = getPlayer(best.id);

            const points = state.players
                .filter(player => player.id !== best.id)
                .reduce((sum, player) =>
                    sum + player.hand.reduce(
                        (subtotal, tile) => subtotal + pipCount(tile),
                        0
                    ), 0);

            winner.score = (Number(winner.score) || 0) + points;
            state.winner = best.id;
        }

        const message = tied
            ? "Partie bloquée : égalité aux points restants."
            : `Partie bloquée : ${noms[best.id]} gagne au plus petit total restant.`;

        state.log.push(message);
        logAction(message);

        showModal("Partie bloquée", `
            <p>${escapeHtml(message)}</p>
            <p>Le joueur qui conserve le plus petit total de points gagne,
            sauf en cas d'égalité.</p>
            <button type="button" data-menu-action="new-game">
                Commencer une nouvelle manche
            </button>
        `);

        playSound(360, 0.15);
    }

    /* ======================== INTELLIGENCE ARTIFICIELLE ======================== */

    function chooseAIMove(player) {
        if (!player || !Array.isArray(player.hand)) return null;

        const candidates = [];

        for (const tile of player.hand) {
            for (const side of legalSides(tile)) {
                let score = pipCount(tile);

                /*
                 * Défausser les dominos lourds en priorité.
                 */
                if (tile.a === tile.b) score += 2;

                const matchingAfter = player.hand.filter(other =>
                    other.id !== tile.id &&
                    (
                        other.a === tile.a ||
                        other.b === tile.a ||
                        other.a === tile.b ||
                        other.b === tile.b
                    )
                ).length;

                score += matchingAfter * 0.25;

                if (
                    side === "left" &&
                    state.chain.length > 0 &&
                    (tile.a === state.leftEnd || tile.b === state.leftEnd)
                ) {
                    score += 0.1;
                }

                if (
                    side === "right" &&
                    state.chain.length > 0 &&
                    (tile.a === state.rightEnd || tile.b === state.rightEnd)
                ) {
                    score += 0.1;
                }

                candidates.push({ tile, side, score });
            }
        }

        candidates.sort((a, b) => b.score - a.score);

        return candidates[0] || null;
    }

    function scheduleAI() {
        clearTimeout(aiTimer);

        if (
            !state ||
            state.phase !== "playing" ||
            state.currentPlayer === "human" ||
            busy
        ) {
            return;
        }

        busy = true;
        renderHand();
        renderTurn();
        updatePlayButtons();

        aiTimer = setTimeout(() => {
            busy = false;

            if (
                !state ||
                state.phase !== "playing" ||
                state.currentPlayer === "human"
            ) {
                renderAll();
                return;
            }

            const player = getPlayer(state.currentPlayer);

            if (!player) {
                renderAll();
                return;
            }

            const move = chooseAIMove(player);

            if (move) {
                playTile(player.id, move.tile.id, move.side);
            } else {
                passTurn(player.id);
            }
        }, 650 + Math.random() * 650);
    }

    /* ======================== SUGGESTION ET TRI ======================== */

    function suggestMove() {
        if (
            !state ||
            state.phase !== "playing" ||
            state.currentPlayer !== "human" ||
            busy
        ) {
            showToast("Attendez votre tour pour demander une suggestion.");
            return;
        }

        const player = getPlayer("human");
        const move = chooseAIMove(player);

        if (!move) {
            showToast("Aucun domino jouable. Vous pouvez passer.");
            return;
        }

        selectedTileId = move.tile.id;
        renderHand();

        showToast(
            `Suggestion : ${move.tile.a}-${move.tile.b}, ` +
            `${move.side === "left" ? "à gauche" : "à droite"}.`
        );
    }

    function sortHand() {
        if (!state) return;

        const player = getPlayer("human");
        if (!player) return;

        player.hand.sort((a, b) => {
            const sumDifference = pipCount(b) - pipCount(a);

            return sumDifference ||
                b.a - a.a ||
                b.b - a.b;
        });

        renderHand();
        saveGame(true);
        showToast("Vos dominos sont triés.");
    }

    /* ======================== ZOOM TACTILE ANDROID ======================== */

    function applyView() {
        if (!elements.world) return;

        elements.world.style.transform =
            `translate(${panX}px, ${panY}px) scale(${zoom})`;

        elements.world.style.transformOrigin = "center center";

        if (elements.zoomValue) {
            elements.zoomValue.textContent =
                `${Math.round(zoom * 100)}%`;
        }
    }

    function setZoom(value) {
        zoom = Math.max(0.65, Math.min(2.4, value));
        applyView();
    }

    function resetView() {
        zoom = 1;
        panX = 0;
        panY = 0;
        applyView();
    }

    function pointerDistance(a, b) {
        return Math.hypot(a.x - b.x, a.y - b.y);
    }

    function pointerCenter(a, b) {
        return {
            x: (a.x + b.x) / 2,
            y: (a.y + b.y) / 2
        };
    }

    function onPointerDown(event) {
        if (!elements.viewport) return;

        pointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY
        });

        if (pointers.size === 1) {
            gestureStart = {
                x: event.clientX,
                y: event.clientY,
                panX,
                panY
            };
        } else if (pointers.size === 2) {
            const points = [...pointers.values()];

            gestureStart = {
                distance: pointerDistance(points[0], points[1]),
                center: pointerCenter(points[0], points[1]),
                zoom,
                panX,
                panY
            };
        }

        if (elements.viewport.setPointerCapture) {
            try {
                elements.viewport.setPointerCapture(event.pointerId);
            } catch (_) {
                // Le navigateur peut refuser la capture du pointeur.
            }
        }
    }

    function onPointerMove(event) {
        if (!pointers.has(event.pointerId)) return;

        pointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY
        });

        if (pointers.size >= 2) {
            const points = [...pointers.values()].slice(0, 2);

            if (!gestureStart || !gestureStart.distance) {
                gestureStart = {
                    distance: pointerDistance(points[0], points[1]),
                    center: pointerCenter(points[0], points[1]),
                    zoom,
                    panX,
                    panY
                };

                return;
            }

            const distance = pointerDistance(points[0], points[1]);
            const center = pointerCenter(points[0], points[1]);
            const ratio = distance / Math.max(1, gestureStart.distance);

            zoom = Math.max(
                0.65,
                Math.min(2.4, gestureStart.zoom * ratio)
            );

            panX = gestureStart.panX +
                center.x - gestureStart.center.x;

            panY = gestureStart.panY +
                center.y - gestureStart.center.y;

            applyView();
        } else if (pointers.size === 1 && gestureStart) {
            panX = gestureStart.panX +
                event.clientX - gestureStart.x;

            panY = gestureStart.panY +
                event.clientY - gestureStart.y;

            applyView();
        }
    }

    function onPointerUp(event) {
        pointers.delete(event.pointerId);

        if (pointers.size === 1) {
            const remaining = [...pointers.values()][0];

            gestureStart = {
                x: remaining.x,
                y: remaining.y,
                panX,
                panY
            };
        } else {
            gestureStart = null;
        }
    }

    /* ======================== MODALE ET PLEIN ÉCRAN ======================== */

    function showModal(title, html) {
        if (!elements.modal) {
            showToast(title);
            return;
        }

        if (elements.modalTitle) {
            elements.modalTitle.textContent = title;
        }

        if (elements.modalContent) {
            elements.modalContent.innerHTML = html;
        }

        elements.modal.classList.remove("hidden");
        elements.modal.setAttribute("aria-hidden", "false");
    }

    function hideModal() {
        if (elements.modal) {
            elements.modal.classList.add("hidden");
            elements.modal.setAttribute("aria-hidden", "true");
        }
    }

    function showRules() {
        showModal("Règles du domino Double-Six", `
            <p><strong>Distribution :</strong>
            les 28 dominos sont mélangés. Chaque joueur reçoit 7 pièces.</p>

            <p><strong>Départ :</strong>
            le joueur qui détient le double-six doit le jouer en premier.</p>

            <p><strong>Jouer :</strong>
            raccordez une extrémité de votre domino à une extrémité
            de même valeur de la chaîne.</p>

            <p><strong>Passer :</strong>
            vous ne pouvez passer que si aucun de vos dominos ne correspond
            aux extrémités ouvertes.</p>

            <p><strong>Victoire :</strong>
            le premier joueur qui n'a plus de dominos gagne.
            Si les quatre joueurs passent successivement, le plus petit
            total de points restants détermine le gagnant.</p>

            <p><strong>Score :</strong>
            le gagnant marque la somme des points présents dans les mains
            adverses.</p>
        `);
    }

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                if (!document.documentElement.requestFullscreen) {
                    showToast("Le plein écran n'est pas pris en charge.");
                    return;
                }

                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            showToast(
                "Le plein écran n'est pas autorisé par ce navigateur."
            );
        }
    }

    /* ======================== MODIFICATION DES NOMS ======================== */

    function showRenamePlayers() {
        showModal("Modifier les noms des joueurs", `
            <form id="renamePlayersForm">
                <label for="nameHuman">Votre nom</label>
                <input
                    id="nameHuman"
                    name="nameHuman"
                    type="text"
                    maxlength="24"
                    value="${escapeHtml(noms.human)}"
                    autocomplete="off"
                    required>

                <label for="nameAi1">Joueur IA 1</label>
                <input
                    id="nameAi1"
                    name="nameAi1"
                    type="text"
                    maxlength="24"
                    value="${escapeHtml(noms.ai1)}"
                    autocomplete="off"
                    required>

                <label for="nameAi2">Joueur IA 2</label>
                <input
                    id="nameAi2"
                    name="nameAi2"
                    type="text"
                    maxlength="24"
                    value="${escapeHtml(noms.ai2)}"
                    autocomplete="off"
                    required>

                <label for="nameAi3">Joueur IA 3</label>
                <input
                    id="nameAi3"
                    name="nameAi3"
                    type="text"
                    maxlength="24"
                    value="${escapeHtml(noms.ai3)}"
                    autocomplete="off"
                    required>

                <div class="rename-actions">
                    <button type="submit">Enregistrer les noms</button>
                    <button type="button" data-menu-action="cancel">
                        Annuler
                    </button>
                </div>
            </form>
        `);
    }

    function savePlayerNames() {
        const humanInput = $("nameHuman");
        const ai1Input = $("nameAi1");
        const ai2Input = $("nameAi2");
        const ai3Input = $("nameAi3");

        if (!humanInput || !ai1Input || !ai2Input || !ai3Input) {
            showToast("Les champs de nom sont introuvables.");
            return;
        }

        noms.human = cleanPlayerName(humanInput.value, "Vous");
        noms.ai1 = cleanPlayerName(ai1Input.value, "Alex");
        noms.ai2 = cleanPlayerName(ai2Input.value, "Chris");
        noms.ai3 = cleanPlayerName(ai3Input.value, "Jordan");

        syncNamesToState();
        updatePlayerNameLabels();
        renderAll();
        hideModal();
        saveGame(true);

        showToast("Les noms des quatre joueurs ont été enregistrés.");
    }

    /* ======================== MENU ======================== */

    function showMenu() {
        showModal("Options de jeu", `
            <p>Choisissez une action :</p>

            <p>
                <button type="button" data-menu-action="save">
                    Sauvegarder la partie
                </button>
            </p>

            <p>
                <button type="button" data-menu-action="load">
                    Reprendre la sauvegarde
                </button>
            </p>

            <p>
                <button type="button" data-menu-action="rename">
                    Modifier les noms des joueurs
                </button>
            </p>

            <p>
                <button type="button" data-menu-action="sort">
                    Trier mes dominos
                </button>
            </p>

            <p>
                <button type="button" data-menu-action="sound">
                    ${soundEnabled ? "Couper le son" : "Activer le son"}
                </button>
            </p>

            <p>
                <button type="button" data-menu-action="fullscreen">
                    Plein écran
                </button>
            </p>

            <p>
                <button type="button" data-menu-action="reset-view">
                    Réinitialiser la vue
                </button>
            </p>
        `);
    }

    function handleMenuAction(action) {
        if (action === "save") {
            saveGame(false);
        } else if (action === "load") {
            loadGame();
        } else if (action === "rename") {
            showRenamePlayers();
        } else if (action === "sort") {
            sortHand();
        } else if (action === "sound") {
            soundEnabled = !soundEnabled;
            showToast(soundEnabled ? "Son activé." : "Son coupé.");

            if (soundEnabled) playSound();
        } else if (action === "fullscreen") {
            toggleFullscreen();
        } else if (action === "reset-view") {
            resetView();
            showToast("Vue réinitialisée.");
        } else if (action === "new-game") {
            hideModal();
            newGame();
        } else if (action === "cancel") {
            hideModal();
        }
    }

    /* ======================== ÉVÉNEMENTS ======================== */

    function bind(id, event, callback) {
        const node = $(id);
        if (node) node.addEventListener(event, callback);
    }

    function bindEvents() {
        bind("newGameButton", "click", () => {
            if (state && state.phase === "playing") {
                showModal("Nouvelle partie ?", `
                    <p>
                        Une nouvelle manche va remplacer la manche actuelle.
                        Sauvegardez d'abord si vous souhaitez la conserver.
                    </p>

                    <button type="button" data-menu-action="new-game">
                        Commencer une nouvelle manche
                    </button>

                    <button type="button" data-menu-action="cancel">
                        Annuler
                    </button>
                `);
            } else {
                newGame();
            }
        });

        bind("soundButton", "click", () => {
            soundEnabled = !soundEnabled;

            const button = $("soundButton");

            if (button) {
                button.setAttribute(
                    "aria-label",
                    soundEnabled ? "Couper le son" : "Activer le son"
                );

                button.setAttribute(
                    "aria-pressed",
                    soundEnabled ? "true" : "false"
                );
            }

            showToast(soundEnabled ? "Son activé." : "Son coupé.");

            if (soundEnabled) playSound();
        });

        bind("rulesButton", "click", showRules);
        bind("menuButton", "click", showMenu);

        bind("zoomInButton", "click", () => setZoom(zoom + 0.12));
        bind("zoomOutButton", "click", () => setZoom(zoom - 0.12));
        bind("resetViewButton", "click", resetView);

        bind("passButton", "click", () => passTurn("human"));

        bind("playLeftButton", "click", () => {
            if (selectedTileId) {
                playTile("human", selectedTileId, "left");
            }
        });

        bind("playRightButton", "click", () => {
            if (selectedTileId) {
                playTile("human", selectedTileId, "right");
            }
        });

        bind("sortButton", "click", sortHand);
        bind("hintButton", "click", suggestMove);
        bind("saveButton", "click", () => saveGame(false));
        bind("loadButton", "click", loadGame);
        bind("fullscreenButton", "click", toggleFullscreen);

        bind("modalClose", "click", hideModal);
        bind("modalOk", "click", hideModal);

        if (elements.modal) {
            elements.modal.addEventListener("click", event => {
                if (event.target === elements.modal) {
                    hideModal();
                    return;
                }

                const actionButton = event.target.closest(
                    "[data-menu-action]"
                );

                if (!actionButton) return;

                const action = actionButton.dataset.menuAction;
                handleMenuAction(action);
            });

            elements.modal.addEventListener("submit", event => {
                if (event.target && event.target.id === "renamePlayersForm") {
                    event.preventDefault();
                    savePlayerNames();
                }
            });
        }

        if (elements.hand) {
            elements.hand.addEventListener("click", event => {
                const tileButton = event.target.closest("[data-tile-id]");

                if (
                    tileButton &&
                    elements.hand.contains(tileButton)
                ) {
                    selectTile(tileButton.dataset.tileId);
                }
            });
        }

        if (elements.viewport) {
            elements.viewport.style.touchAction = "none";

            elements.viewport.addEventListener(
                "pointerdown",
                onPointerDown
            );

            elements.viewport.addEventListener(
                "pointermove",
                onPointerMove
            );

            elements.viewport.addEventListener(
                "pointerup",
                onPointerUp
            );

            elements.viewport.addEventListener(
                "pointercancel",
                onPointerUp
            );

            elements.viewport.addEventListener(
                "lostpointercapture",
                onPointerUp
            );

            elements.viewport.addEventListener("wheel", event => {
                event.preventDefault();

                setZoom(
                    zoom + (event.deltaY < 0 ? 0.06 : -0.06)
                );
            }, { passive: false });

            elements.viewport.addEventListener("contextmenu", event => {
                event.preventDefault();
            });
        }

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") hideModal();

            if (event.key === "+" || event.key === "=") {
                setZoom(zoom + 0.1);
            }

            if (event.key === "-") {
                setZoom(zoom - 0.1);
            }

            if (
                event.key === "ArrowLeft" &&
                selectedTileId &&
                state &&
                state.currentPlayer === "human"
            ) {
                playTile("human", selectedTileId, "left");
            }

            if (
                event.key === "ArrowRight" &&
                selectedTileId &&
                state &&
                state.currentPlayer === "human"
            ) {
                playTile("human", selectedTileId, "right");
            }
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden && state) {
                saveGame(true);
            }
        });

        window.addEventListener("beforeunload", () => {
            if (db) db.close();
        });
    }

    /* ======================== DÉMARRAGE ======================== */

    async function init() {
        bindEvents();
        applyView();

        try {
            await openDatabase();
        } catch (error) {
            console.warn("IndexedDB indisponible :", error);

            if (elements.saveStatus) {
                elements.saveStatus.textContent =
                    "IndexedDB indisponible : les sauvegardes peuvent échouer.";
            }
        }

        let restored = false;

        if (db) {
            try {
                const saved = await new Promise((resolve, reject) => {
                    const request = db
                        .transaction(STORE_NAME, "readonly")
                        .objectStore(STORE_NAME)
                        .get(SAVE_KEY);

                    request.onsuccess = () => {
                        resolve(request.result || null);
                    };

                    request.onerror = () => reject(request.error);
                });

                if (saved && saved.state) {
                    const candidate = clone(saved.state);

                    if (migrateSavedState(candidate)) {
                        state = candidate;
                        syncNamesFromState();
                        restored = true;

                        renderAll();
                        setStatus("Sauvegarde précédente restaurée.");
                    }
                }
            } catch (error) {
                console.warn(
                    "Restauration automatique impossible :",
                    error
                );
            }
        }

        if (!restored) {
            state = {
                version: 2,
                round: 0,
                players: ordre.map(id => ({
                    id,
                    name: noms[id],
                    hand: [],
                    score: 0
                })),
                chain: [],
                leftEnd: null,
                rightEnd: null,
                currentPlayer: "human",
                consecutivePasses: 0,
                phase: "playing",
                winner: null,
                openingTileId: null,
                log: [],
                playedCount: 0,
                lastMove: null
            };

            newGame();
        } else if (
            state.phase === "playing" &&
            state.currentPlayer !== "human"
        ) {
            scheduleAI();
        }

        renderAll();
        updatePlayerNameLabels();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, {
            once: true
        });
    } else {
        init();
    }
})();



















