(() => {
    "use strict";

    /* =========================================================
       FOBAS DOMINO 3D — VERSION CORRIGÉE
       4 joueurs • 3 IA • Double-Six • IndexedDB
       Android tactile • Drag & Drop • Zoom à deux doigts
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
    let state = null;
    let soundEnabled = true;
    let selectedTileId = null;
    let busy = false;
    let toastTimer = null;
    let aiTimer = null;
    let audioContext = null;

    /* Zoom et déplacement de la table */
    let zoom = 1;
    let panX = 0;
    let panY = 0;
    const pointers = new Map();
    let gestureStart = null;
    let tableGesture = false;

    /* Drag-and-drop des dominos */
    let drag = null;
    let dragGhost = null;
    let dragPreview = null;
    let suppressNextClick = false;
    const DRAG_THRESHOLD = 8;

    /* ======================== OUTILS ======================== */

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
        if (!elements.toast) {
            console.info("[FOBAS DOMINO]", message);
            return;
        }

        elements.toast.textContent = message;
        elements.toast.classList.add("show");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            elements.toast.classList.remove("show");
        }, 2800);
    }

    function setStatus(message) {
        if (elements.status) elements.status.textContent = message;
        if (elements.footer) elements.footer.textContent = message;
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

    function playSound(frequency = 520, duration = 0.07) {
        if (!soundEnabled) return;

        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;

            audioContext = audioContext || new AudioCtx();

            if (audioContext.state === "suspended") {
                audioContext.resume();
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

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function getPlayer(id) {
        return state?.players?.find(player => player.id === id) || null;
    }

    function nextPlayer(id) {
        return ordre[(ordre.indexOf(id) + 1) % ordre.length];
    }

    function pipCount(tile) {
        return Number(tile.a) + Number(tile.b);
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
                reject(request.error || new Error("Ouverture IndexedDB impossible."));
            };
        });
    }

    function databaseOperation(mode, callback) {
        return new Promise((resolve, reject) => {
            if (!db) {
                reject(new Error("La base de données n'est pas ouverte."));
                return;
            }

            const transaction = db.transaction(STORE_NAME, mode);
            const store = transaction.objectStore(STORE_NAME);
            let result;

            try {
                result = callback(store);
            } catch (error) {
                reject(error);
                return;
            }

            transaction.oncomplete = () => {
                resolve(result && "result" in result ? result.result : result);
            };

            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(
                transaction.error || new Error("Transaction annulée.")
            );
        });
    }

    async function saveGame(silent = false) {
        if (!state) return;

        try {
            if (!db) await openDatabase();

            const snapshot = clone(state);
            snapshot.savedAt = new Date().toISOString();

            await databaseOperation("readwrite", store => {
                store.put({ id: SAVE_KEY, state: snapshot });
            });

            if (elements.saveStatus) {
                elements.saveStatus.textContent =
                    "Partie sauvegardée : " +
                    new Date(snapshot.savedAt).toLocaleTimeString();
            }

            if (!silent) showToast("Partie sauvegardée avec succès.");
        } catch (error) {
            console.error("Sauvegarde impossible :", error);

            if (elements.saveStatus) {
                elements.saveStatus.textContent =
                    "Échec de la sauvegarde IndexedDB.";
            }

            if (!silent) showToast("Sauvegarde impossible dans ce navigateur.");
        }
    }

    async function readSavedGame() {
        if (!db) await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const request = transaction.objectStore(STORE_NAME).get(SAVE_KEY);

            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    }

    async function loadGame() {
        try {
            const saved = await readSavedGame();

            if (!saved?.state) {
                showToast("Aucune sauvegarde trouvée.");
                return;
            }

            if (!validateState(saved.state)) {
                showToast("La sauvegarde est invalide ou incompatible.");
                return;
            }

            clearTimeout(aiTimer);
            cancelDrag();

            state = saved.state;
            selectedTileId = null;
            busy = false;

            renderAll();
            showToast("Sauvegarde chargée.");
            setStatus("Partie restaurée");

            if (state.phase === "playing" &&
                state.currentPlayer !== "human") {
                scheduleAI();
            }
        } catch (error) {
            console.error(error);
            showToast("Impossible de lire la sauvegarde.");
        }
    }

    function validateState(candidate) {
        if (!candidate ||
            !Array.isArray(candidate.players) ||
            !Array.isArray(candidate.chain) ||
            !Array.isArray(candidate.log) ||
            !ordre.includes(candidate.currentPlayer)) {
            return false;
        }

        if (candidate.players.length !== 4) return false;

        return candidate.players.every(player =>
            player &&
            ordre.includes(player.id) &&
            Array.isArray(player.hand)
        );
    }

    /* ======================== CRÉATION DE PARTIE ======================== */

    function createSet() {
        const tiles = [];
        let id = 0;

        for (let a = 0; a <= 6; a++) {
            for (let b = a; b <= 6; b++) {
                tiles.push({ id: "d" + id++, a, b });
            }
        }

        return shuffle(tiles);
    }

    function newGame() {
        clearTimeout(aiTimer);
        cancelDrag();

        const previousRound = state?.round || 0;
        const tiles = createSet();

        const players = ordre.map(id => ({
            id,
            name: noms[id],
            hand: [],
            score: getPlayer(id)?.score || 0
        }));

        for (let i = 0; i < 7; i++) {
            for (const player of players) {
                player.hand.push(tiles.pop());
            }
        }

        const opening = players
            .flatMap(player => player.hand.map(tile => ({ player, tile })))
            .find(item => item.tile.a === 6 && item.tile.b === 6);

        let startingPlayer = opening ? opening.player.id : "human";

        if (opening) {
            const owner = players.find(p => p.id === startingPlayer);
            owner.hand = owner.hand.filter(t => t.id !== opening.tile.id);
        }

        state = {
            version: 2,
            round: previousRound + 1,
            players,
            chain: opening ? [{
                tile: { ...opening.tile },
                player: startingPlayer,
                side: "center"
            }] : [],
            leftEnd: opening ? opening.tile.a : null,
            rightEnd: opening ? opening.tile.b : null,
            currentPlayer: opening ? nextPlayer(startingPlayer) : startingPlayer,
            consecutivePasses: 0,
            phase: "playing",
            winner: null,
            log: [],
            playedCount: opening ? 1 : 0,
            lastMove: null
        };

        selectedTileId = null;
        busy = false;

        const message = opening
            ? "Le double-six ouvre la partie."
            : "Nouvelle manche : 7 dominos par joueur.";

        state.log.push(message);

        renderAll();
        setStatus("Nouvelle manche — " + noms[state.currentPlayer] + " joue");
        saveGame(true);

        if (state.currentPlayer !== "human") scheduleAI();
    }

    /* ======================== RÈGLES ======================== */

    function legalSides(tile) {
        if (!state || state.phase !== "playing" || !tile) return [];

        if (state.chain.length === 0) return ["left", "right"];

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

    function orientTile(tile, side, endValue) {
        let a = tile.a;
        let b = tile.b;

        if (state.chain.length > 0) {
            if (side === "left" && a === endValue && b !== endValue) {
                [a, b] = [b, a];
            } else if (side === "right" && b === endValue && a !== endValue) {
                [a, b] = [b, a];
            }
        }

        return { ...tile, a, b };
    }

    /* ======================== DOMINOS ET POINTS ======================== */

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

        return `<span class="domino-half value-${value}" aria-label="${value} points">${dots}</span>`;
    }

    function tileMarkup(tile, options = {}) {
        const selected = options.selected ? " is-selected" : "";
        const disabled = options.disabled ? " is-disabled" : "";
        const vertical = options.vertical ? " domino-vertical" : "";
        const dragging = options.dragging ? " domino-dragging" : "";

        return `
            <button type="button"
                class="domino-tile${selected}${disabled}${vertical}${dragging}"
                data-tile-id="${escapeHtml(tile.id)}"
                aria-label="Domino ${tile.a} et ${tile.b}"
                ${options.disabled ? "disabled" : ""}
                draggable="false">
                ${halfMarkup(tile.a)}
                <span class="domino-divider"></span>
                ${halfMarkup(tile.b)}
            </button>`;
    }

    function renderHand() {
        const player = getPlayer("human");
        if (!player || !elements.hand) return;

        elements.hand.innerHTML = player.hand.map(tile =>
            tileMarkup(tile, {
                selected: tile.id === selectedTileId,
                disabled: state.phase !== "playing" ||
                    state.currentPlayer !== "human" ||
                    busy
            })
        ).join("");

        if (elements.handCount) {
            elements.handCount.textContent = `(${player.hand.length})`;
        }

        if (elements.selectedInfo) {
            const tile = player.hand.find(t => t.id === selectedTileId);

            elements.selectedInfo.textContent = tile
                ? `Domino sélectionné : ${tile.a} | ${tile.b}`
                : "Aucun domino sélectionné";
        }

        updatePlayButtons();
    }

    /*
     * La chaîne reste rendue dans le conteneur dominoChain existant.
     * Les zones de dépôt sont calculées à partir de ses extrémités réelles.
     */
    function renderChain() {
        if (!elements.chain || !state) return;

        if (state.chain.length === 0) {
            elements.chain.innerHTML = `
                <div class="chain-placeholder" id="chainPlaceholder">
                    <span class="placeholder-symbol">◇</span>
                    <strong>La partie commence ici</strong>
                    <small>Déposez un domino pour commencer.</small>
                </div>`;
            return;
        }

        elements.chain.innerHTML = state.chain.map((item, index) => {
            const tile = item.tile;
            const vertical = tile.a === tile.b;

            return `
                <div class="played-domino ${vertical ? "played-double" : ""}"
                     data-played-index="${index}"
                     data-chain-side="${index === 0 ? "left" :
                        index === state.chain.length - 1 ? "right" : "middle"}"
                     title="${escapeHtml(noms[item.player] || item.player)} : ${tile.a}-${tile.b}">
                    <span class="played-owner">${escapeHtml(noms[item.player] || item.player)}</span>
                    ${tileMarkup(tile, { vertical, disabled: true })}
                </div>`;
        }).join("");
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

            if (listEl) listEl.textContent = player.hand.length;

            if (row) {
                row.classList.toggle(
                    "active-player",
                    state.currentPlayer === id && state.phase === "playing"
                );
            }
        }
    }

    function renderScores() {
        if (elements.round) {
            elements.round.textContent = String(state.round).padStart(2, "0");
        }

        if (elements.score) {
            elements.score.textContent = getPlayer("human")?.score ?? 0;
        }

        if (elements.played) {
            elements.played.textContent = state.playedCount;
        }
    }

    function renderTurn() {
        const current = state.currentPlayer;

        const message = state.phase === "finished"
            ? (state.winner
                ? `${noms[state.winner]} a gagné la manche !`
                : "Manche bloquée.")
            : current === "human"
                ? "À vous de jouer"
                : `${noms[current]} réfléchit…`;

        if (elements.turn) elements.turn.textContent = message;
        if (elements.turnText) elements.turnText.textContent = message;

        if (elements.humanHint) {
            elements.humanHint.textContent = current === "human"
                ? "Glissez un domino vers le bout choisi."
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
            elements.log.innerHTML = "<li>La partie va commencer.</li>";
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

        renderHand();
        renderChain();
        renderCounts();
        renderScores();
        renderTurn();
        renderLog();
        updatePlayButtons();
    }

    /* ======================== BOUTONS DE JEU ======================== */

    function updatePlayButtons() {
        if (!state) return;

        const human = getPlayer("human");
        const tile = human?.hand.find(t => t.id === selectedTileId);
        const isHumanTurn = state.phase === "playing" &&
            state.currentPlayer === "human" && !busy;

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
            elements.pass.disabled = !isHumanTurn || !canPass("human");
        }
    }

    function selectTile(id) {
        if (!state || state.phase !== "playing" ||
            state.currentPlayer !== "human" || busy) return;

        const tile = getPlayer("human").hand.find(t => t.id === id);
        if (!tile) return;

        selectedTileId = selectedTileId === id ? null : id;

        if (elements.instructions) {
            if (!selectedTileId) {
                elements.instructions.textContent =
                    "Touchez ou glissez un domino pour le jouer.";
            } else {
                elements.instructions.textContent =
                    legalSides(tile).length
                        ? "Glissez le domino vers le bout gauche ou droit."
                        : "Ce domino ne peut pas être joué maintenant.";
            }
        }

        renderHand();
        playSound(420, 0.04);
    }

    /* ======================== PLACEMENT RÉEL ======================== */

    function playTile(playerId, tileId, side) {
        if (!state || state.phase !== "playing") return false;
        if (state.currentPlayer !== playerId) return false;

        const player = getPlayer(playerId);
        if (!player) return false;

        const tileIndex = player.hand.findIndex(t => t.id === tileId);
        if (tileIndex < 0) return false;

        const original = player.hand[tileIndex];
        const sides = legalSides(original);

        if (!sides.includes(side)) {
            if (playerId === "human") {
                showToast("Ce domino ne correspond pas à cette extrémité.");
            }
            return false;
        }

        const isFirst = state.chain.length === 0;
        const endValue = side === "left" ? state.leftEnd : state.rightEnd;
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

        state.playedCount++;
        state.consecutivePasses = 0;
        state.lastMove = {
            player: playerId,
            tile: { ...original },
            side,
            at: Date.now()
        };

        const sideText = isFirst
            ? "au centre"
            : side === "left" ? "à gauche" : "à droite";

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

        if (state.currentPlayer !== "human") scheduleAI();

        return true;
    }

    function passTurn(playerId) {
        if (!state || state.phase !== "playing" ||
            state.currentPlayer !== playerId) return;

        if (!canPass(playerId)) {
            if (playerId === "human") {
                showToast("Vous avez au moins un domino jouable.");
            }
            return;
        }

        const message = `${noms[playerId]} passe son tour.`;
        state.log.push(message);
        logAction(message);

        state.consecutivePasses++;
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

        if (state.currentPlayer !== "human") scheduleAI();
    }

    function finishRound(winnerId) {
        state.phase = "finished";
        state.winner = winnerId;

        const remaining = state.players
            .filter(player => player.id !== winnerId)
            .reduce((sum, player) =>
                sum + player.hand.reduce((total, tile) =>
                    total + pipCount(tile), 0), 0);

        getPlayer(winnerId).score += remaining;

        const message =
            `${noms[winnerId]} gagne la manche et marque ${remaining} points.`;

        state.log.push(message);
        logAction(message);
        playSound(780, 0.2);

        showModal("Fin de manche", `
            <p><strong>${escapeHtml(noms[winnerId])}</strong> a posé tous ses dominos !</p>
            <p>Points gagnés : <strong>${remaining}</strong></p>
            <p>Choisissez « Nouvelle partie » pour recommencer.</p>
        `);
    }

    function finishBlockedRound() {
        state.phase = "finished";
        state.winner = null;

        const totals = state.players.map(player => ({
            id: player.id,
            total: player.hand.reduce((sum, tile) =>
                sum + pipCount(tile), 0)
        })).sort((a, b) => a.total - b.total);

        const best = totals[0];
        const tied = totals.filter(item => item.total === best.total).length > 1;

        if (!tied) {
            getPlayer(best.id).score += state.players
                .filter(player => player.id !== best.id)
                .reduce((sum, player) =>
                    sum + player.hand.reduce((total, tile) =>
                        total + pipCount(tile), 0), 0);

            state.winner = best.id;
        }

        const message = tied
            ? "Partie bloquée : égalité aux points restants."
            : `Partie bloquée : ${noms[best.id]} gagne au plus petit total restant.`;

        state.log.push(message);
        logAction(message);

        showModal("Partie bloquée", `
            <p>${escapeHtml(message)}</p>
            <p>Le total des points restants détermine le gagnant.</p>
        `);
    }

    /* ======================== IA ======================== */

    function chooseAIMove(player) {
        const candidates = [];

        for (const tile of player.hand) {
            for (const side of legalSides(tile)) {
                let score = pipCount(tile);

                if (tile.a === tile.b) score += 2;

                const matchingAfter = player.hand.filter(other =>
                    other.id !== tile.id &&
                    (other.a === tile.a || other.b === tile.a ||
                     other.a === tile.b || other.b === tile.b)
                ).length;

                score += matchingAfter * 0.25;

                if (side === "left" && tile.a === state.leftEnd) score += 0.1;
                if (side === "right" && tile.b === state.rightEnd) score += 0.1;

                candidates.push({ tile, side, score });
            }
        }

        candidates.sort((a, b) => b.score - a.score);
        return candidates[0] || null;
    }

    function scheduleAI() {
        clearTimeout(aiTimer);

        if (!state || state.phase !== "playing" ||
            state.currentPlayer === "human" || busy) return;

        busy = true;
        renderHand();
        renderTurn();

        aiTimer = setTimeout(() => {
            busy = false;

            if (!state || state.phase !== "playing" ||
                state.currentPlayer === "human") return;

            const player = getPlayer(state.currentPlayer);
            if (!player) return;

            const move = chooseAIMove(player);

            if (move) {
                playTile(player.id, move.tile.id, move.side);
            } else {
                passTurn(player.id);
            }
        }, 650 + Math.random() * 650);
    }

    function suggestMove() {
        if (!state || state.phase !== "playing" ||
            state.currentPlayer !== "human") {
            showToast("Attendez votre tour pour demander une suggestion.");
            return;
        }

        const move = chooseAIMove(getPlayer("human"));

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

        getPlayer("human").hand.sort((a, b) =>
            pipCount(b) - pipCount(a) || b.a - a.a || b.b - a.b
        );

        renderHand();
        saveGame(true);
        showToast("Vos dominos sont triés.");
    }

    /* =========================================================
       DRAG & DROP ANDROID
       Le joueur prend une pièce en main, la déplace et la dépose
       près de l'extrémité gauche ou droite de la chaîne.
       ========================================================= */

    function createDragGhost(tile, x, y) {
        removeDragGhost();

        dragGhost = document.createElement("div");
        dragGhost.className = "fobas-domino-drag-ghost";
        dragGhost.innerHTML = tileMarkup(tile, {
            selected: true,
            vertical: tile.a === tile.b
        });

        Object.assign(dragGhost.style, {
            position: "fixed",
            left: `${x}px`,
            top: `${y}px`,
            zIndex: "2147483647",
            pointerEvents: "none",
            opacity: "0.96",
            transform: "translate(-50%, -50%) scale(1.08)",
            filter: "drop-shadow(0 10px 12px rgba(0,0,0,.35))",
            margin: "0",
            width: "max-content"
        });

        document.body.appendChild(dragGhost);
    }

    function moveDragGhost(x, y) {
        if (!dragGhost) return;

        dragGhost.style.left = `${x}px`;
        dragGhost.style.top = `${y}px`;
    }

    function removeDragGhost() {
        if (dragGhost) {
            dragGhost.remove();
            dragGhost = null;
        }
    }

    function clearDropPreview() {
        if (dragPreview) {
            dragPreview.classList.remove("fobas-drop-left", "fobas-drop-right");
            dragPreview = null;
        }

        if (elements.chain) {
            elements.chain.classList.remove(
                "fobas-drop-zone-left",
                "fobas-drop-zone-right"
            );
        }
    }

    /*
     * Renvoie le côté de dépôt d'après la position réelle du doigt.
     * Si la chaîne est vide, le premier domino est posé au centre.
     */
    function getDropSide(x, y) {
        if (!elements.viewport || !elements.chain) return null;

        const viewportRect = elements.viewport.getBoundingClientRect();

        if (
            x < viewportRect.left ||
            x > viewportRect.right ||
            y < viewportRect.top ||
            y > viewportRect.bottom
        ) {
            return null;
        }

        if (state.chain.length === 0) {
            return "left";
        }

        const chainRect = elements.chain.getBoundingClientRect();

        /*
         * Les extrémités utilisent une zone de dépôt généreuse.
         * Cela fonctionne aussi quand la table est agrandie.
         */
        const first = elements.chain.querySelector(
            '[data-chain-side="left"]'
        );

        const last = elements.chain.querySelector(
            '[data-chain-side="right"]'
        );

        if (!first || !last) {
            return x < chainRect.left + chainRect.width / 2
                ? "left"
                : "right";
        }

        const leftRect = first.getBoundingClientRect();
        const rightRect = last.getBoundingClientRect();

        const leftZone = {
            left: Math.max(viewportRect.left, leftRect.left - 70),
            right: leftRect.right + Math.min(100, leftRect.width * 0.8),
            top: Math.max(viewportRect.top, leftRect.top - 55),
            bottom: Math.min(viewportRect.bottom, leftRect.bottom + 55)
        };

        const rightZone = {
            left: rightRect.left - Math.min(100, rightRect.width * 0.8),
            right: Math.min(viewportRect.right, rightRect.right + 70),
            top: Math.max(viewportRect.top, rightRect.top - 55),
            bottom: Math.min(viewportRect.bottom, rightRect.bottom + 55)
        };

        const inLeft =
            x >= leftZone.left && x <= leftZone.right &&
            y >= leftZone.top && y <= leftZone.bottom;

        const inRight =
            x >= rightZone.left && x <= rightZone.right &&
            y >= rightZone.top && y <= rightZone.bottom;

        if (inLeft && inRight) {
            const leftDistance = Math.hypot(
                x - (leftRect.left + leftRect.right) / 2,
                y - (leftRect.top + leftRect.bottom) / 2
            );

            const rightDistance = Math.hypot(
                x - (rightRect.left + rightRect.right) / 2,
                y - (rightRect.top + rightRect.bottom) / 2
            );

            return leftDistance <= rightDistance ? "left" : "right";
        }

        if (inLeft) return "left";
        if (inRight) return "right";

        /*
         * Si le doigt est directement au-dessus de la chaîne,
         * on choisit l'extrémité la plus proche.
         */
        if (
            x >= chainRect.left - 25 &&
            x <= chainRect.right + 25 &&
            y >= chainRect.top - 45 &&
            y <= chainRect.bottom + 45
        ) {
            const leftDistance = Math.abs(x - leftRect.left);
            const rightDistance = Math.abs(x - rightRect.right);

            return leftDistance <= rightDistance ? "left" : "right";
        }

        return null;
    }

    function updateDropPreview(side) {
        clearDropPreview();

        if (!side || !elements.chain) return;

        elements.chain.classList.add(
            side === "left"
                ? "fobas-drop-zone-left"
                : "fobas-drop-zone-right"
        );

        dragPreview = elements.chain.querySelector(
            side === "left"
                ? '[data-chain-side="left"]'
                : '[data-chain-side="right"]'
        );

        if (dragPreview) {
            dragPreview.classList.add(
                side === "left" ? "fobas-drop-left" : "fobas-drop-right"
            );
        }
    }

    function startDrag(event, tileButton) {
        if (event.button !== undefined && event.button !== 0) return;
        if (!state || state.phase !== "playing" ||
            state.currentPlayer !== "human" || busy) return;

        const tileId = tileButton.dataset.tileId;
        const tile = getPlayer("human")?.hand.find(t => t.id === tileId);

        if (!tile) return;

        drag = {
            pointerId: event.pointerId,
            tileId,
            tile,
            startX: event.clientX,
            startY: event.clientY,
            x: event.clientX,
            y: event.clientY,
            started: false,
            source: tileButton
        };

        /*
         * Empêche le navigateur Android de transformer le geste
         * en scroll de la rangée de dominos.
         */
        if (event.cancelable) event.preventDefault();
    }

    function beginActualDrag() {
        if (!drag || drag.started) return;

        drag.started = true;
        selectedTileId = drag.tileId;
        suppressNextClick = true;

        if (drag.source) {
            drag.source.classList.add("is-drag-source");
        }

        createDragGhost(drag.tile, drag.x, drag.y);
        playSound(420, 0.04);

        if (elements.instructions) {
            elements.instructions.textContent =
                "Déposez le domino sur l'extrémité gauche ou droite.";
        }
    }

    function handleDragMove(event) {
        if (!drag || event.pointerId !== drag.pointerId) return;

        drag.x = event.clientX;
        drag.y = event.clientY;

        const distance = Math.hypot(
            drag.x - drag.startX,
            drag.y - drag.startY
        );

        if (!drag.started && distance >= DRAG_THRESHOLD) {
            beginActualDrag();
        }

        if (!drag.started) return;

        if (event.cancelable) event.preventDefault();

        moveDragGhost(drag.x, drag.y);

        const side = getDropSide(drag.x, drag.y);
        const legal = side && legalSides(drag.tile).includes(side)
            ? side
            : null;

        updateDropPreview(legal);
    }

    function finishDrag(event) {
        if (!drag || event.pointerId !== drag.pointerId) return;

        const currentDrag = drag;
        drag = null;

        const moved = currentDrag.started;
        const side = moved
            ? getDropSide(event.clientX, event.clientY)
            : null;

        removeDragGhost();
        clearDropPreview();

        if (currentDrag.source) {
            currentDrag.source.classList.remove("is-drag-source");
        }

        if (!moved) {
            /*
             * Un simple toucher sélectionne la pièce comme avant.
             */
            selectTile(currentDrag.tileId);
            return;
        }

        suppressNextClick = true;

        if (!side) {
            showToast("Déposez le domino près d'une extrémité de la chaîne.");
            return;
        }

        if (!legalSides(currentDrag.tile).includes(side)) {
            showToast("Valeur incompatible : choisissez l'autre extrémité.");
            return;
        }

        const played = playTile("human", currentDrag.tileId, side);

        if (!played) {
            showToast("Ce déplacement n'a pas pu être validé.");
        }
    }

    function cancelDrag() {
        if (drag?.source) {
            drag.source.classList.remove("is-drag-source");
        }

        drag = null;
        removeDragGhost();
        clearDropPreview();
    }

    /* ======================== ZOOM TACTILE ======================== */

    function applyView() {
        if (!elements.world) return;

        elements.world.style.transformOrigin = "center center";
        elements.world.style.transform =
            `translate(${panX}px, ${panY}px) scale(${zoom})`;

        if (elements.zoomValue) {
            elements.zoomValue.textContent = `${Math.round(zoom * 100)}%`;
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

    function onViewportPointerDown(event) {
        /*
         * Si le doigt touche une pièce de domino déjà jouée,
         * ce n'est pas un geste de déplacement de la table.
         */
        if (event.target.closest(".domino-tile")) return;

        pointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY
        });

        tableGesture = true;

        if (pointers.size === 1) {
            gestureStart = {
                x: event.clientX,
                y: event.clientY,
                panX,
                panY
            };
        } else if (pointers.size === 2) {
            const pts = [...pointers.values()];

            gestureStart = {
                distance: pointerDistance(pts[0], pts[1]),
                center: pointerCenter(pts[0], pts[1]),
                zoom,
                panX,
                panY
            };
        }
    }

    function onViewportPointerMove(event) {
        if (!tableGesture || !pointers.has(event.pointerId)) return;

        pointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY
        });

        if (pointers.size >= 2) {
            const pts = [...pointers.values()].slice(0, 2);

            if (!gestureStart?.distance) {
                gestureStart = {
                    distance: pointerDistance(pts[0], pts[1]),
                    center: pointerCenter(pts[0], pts[1]),
                    zoom,
                    panX,
                    panY
                };
                return;
            }

            const distance = pointerDistance(pts[0], pts[1]);
            const center = pointerCenter(pts[0], pts[1]);
            const ratio = distance / Math.max(1, gestureStart.distance);

            zoom = Math.max(
                0.65,
                Math.min(2.4, gestureStart.zoom * ratio)
            );

            panX = gestureStart.panX + center.x - gestureStart.center.x;
            panY = gestureStart.panY + center.y - gestureStart.center.y;

            applyView();
        } else if (pointers.size === 1 && gestureStart) {
            panX = gestureStart.panX + event.clientX - gestureStart.x;
            panY = gestureStart.panY + event.clientY - gestureStart.y;
            applyView();
        }
    }

    function onViewportPointerUp(event) {
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
            tableGesture = false;
        }
    }

    /* ======================== MODALE ======================== */

    function showModal(title, html) {
        if (!elements.modal) {
            showToast(title);
            return;
        }

        if (elements.modalTitle) elements.modalTitle.textContent = title;
        if (elements.modalContent) elements.modalContent.innerHTML = html;

        elements.modal.classList.remove("hidden");
    }

    function hideModal() {
        if (elements.modal) elements.modal.classList.add("hidden");
    }

    function showRules() {
        showModal("Règles du domino Double-Six", `
            <p><strong>Distribution :</strong> 28 dominos, 7 par joueur.</p>
            <p><strong>Départ :</strong> le détenteur du double-six ouvre la manche.</p>
            <p><strong>Jouer :</strong> glissez votre domino vers le bout gauche
            ou droit de la chaîne. La valeur doit correspondre.</p>
            <p><strong>Passer :</strong> uniquement si aucun domino de votre main
            ne peut être joué.</p>
            <p><strong>Victoire :</strong> le premier joueur sans domino gagne.
            Si la partie est bloquée, le plus petit total restant l'emporte.</p>
            <p><strong>Score :</strong> le gagnant marque les points restants
            dans les mains adverses.</p>
        `);
    }

    async function toggleFullscreen() {
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (error) {
            showToast("Le plein écran n'est pas autorisé par ce navigateur.");
        }
    }

    function showMenu() {
        showModal("Options de jeu", `
            <p><button type="button" data-menu-action="save">Sauvegarder la partie</button></p>
            <p><button type="button" data-menu-action="load">Reprendre la sauvegarde</button></p>
            <p><button type="button" data-menu-action="sort">Trier mes dominos</button></p>
            <p><button type="button" data-menu-action="sound">Activer / couper le son</button></p>
            <p><button type="button" data-menu-action="fullscreen">Plein écran</button></p>
        `);
    }

    /* ======================== ÉVÉNEMENTS ======================== */

    function bind(id, event, callback) {
        const node = $(id);
        if (node) node.addEventListener(event, callback);
    }

    function bindEvents() {
        bind("newGameButton", "click", () => {
            if (state?.phase === "playing") {
                showModal("Nouvelle partie ?", `
                    <p>Une nouvelle manche va remplacer la manche actuelle.</p>
                    <button type="button" id="confirmNewGame">
                        Commencer une nouvelle manche
                    </button>
                `);

                bind("confirmNewGame", "click", () => {
                    hideModal();
                    newGame();
                });
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
            if (selectedTileId) playTile("human", selectedTileId, "left");
        });

        bind("playRightButton", "click", () => {
            if (selectedTileId) playTile("human", selectedTileId, "right");
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

                const actionButton = event.target.closest("[data-menu-action]");
                if (!actionButton) return;

                const action = actionButton.dataset.menuAction;
                hideModal();

                if (action === "save") saveGame(false);
                if (action === "load") loadGame();
                if (action === "sort") sortHand();

                if (action === "sound") {
                    soundEnabled = !soundEnabled;
                    showToast(soundEnabled ? "Son activé." : "Son coupé.");
                }

                if (action === "fullscreen") toggleFullscreen();
            });
        }

        /*
         * Gestion des pièces dans la main :
         * pointerdown démarre le suivi ; pointermove déclenche le drag ;
         * pointerup valide le dépôt.
         */
        if (elements.hand) {
            elements.hand.addEventListener("pointerdown", event => {
                const tileButton = event.target.closest("[data-tile-id]");
                if (!tileButton || !elements.hand.contains(tileButton)) return;

                startDrag(event, tileButton);
            });

            document.addEventListener("pointermove", handleDragMove, {
                passive: false
            });

            document.addEventListener("pointerup", finishDrag);
            document.addEventListener("pointercancel", event => {
                if (drag && event.pointerId === drag.pointerId) {
                    cancelDrag();
                }
            });

            elements.hand.addEventListener("click", event => {
                const tileButton = event.target.closest("[data-tile-id]");
                if (!tileButton || !elements.hand.contains(tileButton)) return;

                if (suppressNextClick) {
                    suppressNextClick = false;
                    event.preventDefault();
                    return;
                }

                selectTile(tileButton.dataset.tileId);
            });
        }

        if (elements.viewport) {
            elements.viewport.addEventListener(
                "pointerdown",
                onViewportPointerDown
            );

            elements.viewport.addEventListener(
                "pointermove",
                onViewportPointerMove
            );

            elements.viewport.addEventListener(
                "pointerup",
                onViewportPointerUp
            );

            elements.viewport.addEventListener(
                "pointercancel",
                onViewportPointerUp
            );

            elements.viewport.addEventListener("wheel", event => {
                event.preventDefault();
                setZoom(zoom + (event.deltaY < 0 ? 0.06 : -0.06));
            }, { passive: false });

            elements.viewport.addEventListener("contextmenu", event => {
                event.preventDefault();
            });
        }

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                hideModal();
                cancelDrag();
            }

            if (event.key === "+" || event.key === "=") {
                setZoom(zoom + 0.1);
            }

            if (event.key === "-") {
                setZoom(zoom - 0.1);
            }

            if (event.key === "ArrowLeft" && selectedTileId) {
                playTile("human", selectedTileId, "left");
            }

            if (event.key === "ArrowRight" && selectedTileId) {
                playTile("human", selectedTileId, "right");
            }
        });

        document.addEventListener("visibilitychange", () => {
            if (document.hidden && state) saveGame(true);
        });

        window.addEventListener("beforeunload", () => {
            if (db) db.close();
        });
    }

    /* ======================== DÉMARRAGE ======================== */

    async function init() {
        bindEvents();
        applyView();

        /*
         * CSS tactile complémentaire appliqué par JavaScript,
         * sans exiger de modifier les fichiers HTML existants.
         */
        if (elements.hand) {
            elements.hand.style.touchAction = "pan-x";
        }

        if (elements.viewport) {
            elements.viewport.style.touchAction = "none";
        }

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
                const saved = await readSavedGame();

                if (saved?.state && validateState(saved.state)) {
                    state = saved.state;
                    restored = true;
                    selectedTileId = null;
                    busy = false;
                    renderAll();
                    setStatus("Sauvegarde précédente restaurée");
                }
            } catch (error) {
                console.warn("Restauration automatique impossible :", error);
            }
        }

        if (!restored) {
            state = {
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
                log: [],
                playedCount: 0
            };

            newGame();
        } else if (
            state.phase === "playing" &&
            state.currentPlayer !== "human"
        ) {
            scheduleAI();
        }

        renderAll();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();


