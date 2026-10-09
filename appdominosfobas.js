(() => {
    "use strict";

    /* =========================================================
       FOBAS DOMINO 3D
       Moteur de jeu : 4 joueurs, 3 IA, Double-Six, IndexedDB
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

            request.onerror = () => reject(
                request.error || new Error("Impossible d'ouvrir IndexedDB.")
            );
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

            transaction.oncomplete = () => resolve(
                result && "result" in result ? result.result : result
            );
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
            console.error(error);

            if (elements.saveStatus) {
                elements.saveStatus.textContent =
                    "Échec de la sauvegarde. Vérifiez les permissions du navigateur.";
            }

            if (!silent) {
                showToast("Sauvegarde impossible dans ce navigateur.");
            }
        }
    }

    async function loadGame() {
        try {
            if (!db) await openDatabase();

            const saved = await new Promise((resolve, reject) => {
                const transaction = db.transaction(STORE_NAME, "readonly");
                const request = transaction.objectStore(STORE_NAME).get(SAVE_KEY);

                request.onsuccess = () => resolve(request.result || null);
                request.onerror = () => reject(request.error);
            });

            if (!saved || !saved.state) {
                showToast("Aucune sauvegarde trouvée.");
                return;
            }

            if (!validateState(saved.state)) {
                showToast("La sauvegarde est invalide ou incompatible.");
                return;
            }

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
        if (!candidate || !Array.isArray(candidate.players) ||
            !Array.isArray(candidate.chain) ||
            !Array.isArray(candidate.log) ||
            !ordre.includes(candidate.currentPlayer)) {
            return false;
        }

        if (candidate.players.length !== 4) return false;

        return candidate.players.every(player =>
            player && ordre.includes(player.id) &&
            Array.isArray(player.hand)
        );
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

        const tiles = createSet();
        const players = ordre.map(id => ({
            id,
            name: noms[id],
            hand: [],
            score: state && state.players
                ? (state.players.find(p => p.id === id)?.score || 0)
                : 0
        }));

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
            .filter(item => item.tile.a === 6 && item.tile.b === 6)
            .sort((x, y) => x.player.id.localeCompare(y.player.id))[0];

        let startingPlayer = opening ? opening.player.id : "human";

        if (opening) {
            const owner = players.find(p => p.id === startingPlayer);
            owner.hand = owner.hand.filter(t => t.id !== opening.tile.id);
        }

        state = {
            version: 1,
            round: state ? state.round + 1 : 1,
            players,
            chain: opening ? [{
                tile: opening.tile,
                player: startingPlayer,
                leftValue: opening.tile.a,
                rightValue: opening.tile.b,
                side: "center"
            }] : [],
            leftEnd: opening ? opening.tile.a : null,
            rightEnd: opening ? opening.tile.b : null,
            currentPlayer: opening ? nextPlayer(startingPlayer) : startingPlayer,
            consecutivePasses: 0,
            phase: "playing",
            winner: null,
            selectedTileId: null,
            log: [],
            playedCount: opening ? 1 : 0,
            lastMove: null
        };

        selectedTileId = null;
        busy = false;

        if (opening) {
            logAction("Le double-six ouvre la partie.");
            state.log.push("Le double-six ouvre la partie.");
        } else {
            logAction("Nouvelle manche : distribution de 7 dominos par joueur.");
            state.log.push("Nouvelle manche : distribution de 7 dominos par joueur.");
        }

        renderAll();
        setStatus("Nouvelle manche — " + noms[state.currentPlayer] + " joue");

        if (state.currentPlayer !== "human") scheduleAI();

        saveGame(true);
    }

    function nextPlayer(id) {
        return ordre[(ordre.indexOf(id) + 1) % ordre.length];
    }

    function getPlayer(id) {
        return state.players.find(player => player.id === id);
    }

    function pipCount(tile) {
        return tile.a + tile.b;
    }

    function legalSides(tile) {
        if (!state || state.phase !== "playing") return [];

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
        return player && player.hand.length > 0 &&
            player.hand.every(tile => legalSides(tile).length === 0);
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

        return `<span class="domino-half value-${value}" aria-label="${value} points">${dots}</span>`;
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

    function renderHand() {
        const player = getPlayer("human");
        if (!player || !elements.hand) return;

        const hand = player.hand;

        elements.hand.innerHTML = hand.map(tile =>
            tileMarkup(tile, {
                selected: tile.id === selectedTileId,
                disabled: state.phase !== "playing" ||
                    state.currentPlayer !== "human" || busy
            })
        ).join("");

        if (elements.handCount) {
            elements.handCount.textContent = `(${hand.length})`;
        }

        if (elements.selectedInfo) {
            const tile = hand.find(t => t.id === selectedTileId);

            elements.selectedInfo.textContent = tile
                ? `Domino sélectionné : ${tile.a} | ${tile.b}`
                : "Aucun domino sélectionné";
        }

        updatePlayButtons();
    }

    function renderChain() {
        if (!elements.chain) return;

        const chain = state.chain;

        if (chain.length === 0) {
            elements.chain.innerHTML = `
                <div class="chain-placeholder" id="chainPlaceholder">
                    <span class="placeholder-symbol">◇</span>
                    <strong>La partie commence ici</strong>
                    <small>Le premier domino sera posé au centre.</small>
                </div>`;
            return;
        }

        elements.chain.innerHTML = chain.map((item, index) => {
            const tile = item.tile;
            const vertical = tile.a === tile.b;

            return `
                <div class="played-domino ${vertical ? "played-double" : ""}"
                    data-played-index="${index}"
                    title="${escapeHtml(item.player)} : ${tile.a}-${tile.b}">
                    <span class="played-owner">${escapeHtml(noms[item.player])}</span>
                    ${tileMarkup(tile, { vertical })}
                </div>`;
        }).join("");

        elements.chain.scrollLeft = elements.chain.scrollWidth;
    }

    function renderCounts() {
        for (const id of ordre) {
            const player = getPlayer(id);
            if (!player) continue;

            const count = player.hand.length;
            const countEl = $(id === "human" ? "countHuman" : "count" + id[0].toUpperCase() + id.slice(1));
            const listEl = $("list" + id[0].toUpperCase() + id.slice(1));

            if (countEl) countEl.textContent = `${count} pièce${count === 1 ? "" : "s"}`;
            if (listEl) listEl.textContent = count;

            const row = $("row" + id[0].toUpperCase() + id.slice(1));
            if (row) {
                row.classList.toggle("active-player",
                    state.currentPlayer === id && state.phase === "playing");
            }
        }

        // Compatibilité avec les identifiants présents dans le HTML fourni.
        if ($("countAi1")) $("countAi1").textContent = `${getPlayer("ai1").hand.length} pièces`;
        if ($("countAi2")) $("countAi2").textContent = `${getPlayer("ai2").hand.length} pièces`;
        if ($("countAi3")) $("countAi3").textContent = `${getPlayer("ai3").hand.length} pièces`;

        const countHuman = $("countHuman");
        if (countHuman) countHuman.textContent = `${getPlayer("human").hand.length} pièces`;
    }

    function renderScores() {
        if (elements.round) {
            elements.round.textContent = String(state.round).padStart(2, "0");
        }

        if (elements.score) {
            elements.score.textContent = getPlayer("human").score;
        }

        if (elements.played) {
            elements.played.textContent = state.playedCount;
        }
    }

    function renderTurn() {
        const current = state.currentPlayer;
        const message = state.phase === "finished"
            ? (state.winner ? `${noms[state.winner]} a gagné la manche !` : "Manche bloquée.")
            : current === "human"
                ? "À vous de jouer"
                : `${noms[current]} réfléchit…`;

        if (elements.turn) elements.turn.textContent = message;
        if (elements.turnText) elements.turnText.textContent = message;
        if (elements.humanHint) {
            elements.humanHint.textContent = current === "human"
                ? "Choisissez un domino"
                : "Attendez votre tour";
        }

        if (elements.indicator) {
            elements.indicator.classList.toggle("ai-thinking",
                current !== "human" && state.phase === "playing");
        }

        setStatus(message);
    }

    function renderLog() {
        if (!elements.log) return;

        elements.log.innerHTML = "";

        const recent = state.log.slice(-12).reverse();

        if (!recent.length) {
            elements.log.innerHTML = "<li>La partie va commencer.</li>";
            return;
        }

        for (const entry of recent) {
            const li = document.createElement("li");
            li.textContent = entry;
            elements.log.appendChild(li);
        }
    }

    function renderAll() {
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
        const human = getPlayer("human");
        const tile = human && human.hand.find(t => t.id === selectedTileId);
        const isHumanTurn = state && state.phase === "playing" &&
            state.currentPlayer === "human" && !busy;

        const sides = tile ? legalSides(tile) : [];

        if (elements.left) {
            elements.left.disabled = !isHumanTurn || !tile || !sides.includes("left");
        }

        if (elements.right) {
            elements.right.disabled = !isHumanTurn || !tile || !sides.includes("right");
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

        if (selectedTileId) {
            const sides = legalSides(tile);
            if (elements.instructions) {
                elements.instructions.textContent = sides.length
                    ? "Choisissez le côté où poser votre domino."
                    : "Ce domino ne peut pas être joué maintenant.";
            }
        } else if (elements.instructions) {
            elements.instructions.textContent = "Touchez un domino pour le sélectionner.";
        }

        renderHand();
        playSound(420, 0.04);
    }

    function orientTile(tile, side, endValue) {
        let a = tile.a;
        let b = tile.b;

        if (side === "left" && state.chain.length > 0) {
            if (b === endValue) [a, b] = [b, a];
        } else if (side === "right" && state.chain.length > 0) {
            if (a === endValue) [a, b] = [b, a];
        }

        return { ...tile, a, b };
    }

    function playTile(playerId, tileId, side) {
        if (!state || state.phase !== "playing") return false;
        if (state.currentPlayer !== playerId) return false;

        const player = getPlayer(playerId);
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
            side
        };

        const sideText = side === "left" ? "à gauche" :
            side === "right" ? "à droite" : "au centre";

        const message = `${noms[playerId]} joue ${original.a}-${original.b} ${sideText}.`;
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
                sum + player.hand.reduce((s, tile) => s + pipCount(tile), 0), 0);

        const winner = getPlayer(winnerId);
        winner.score += remaining;

        const message = `${noms[winnerId]} gagne la manche et marque ${remaining} points.`;
        state.log.push(message);
        logAction(message);
        playSound(780, 0.2);

        renderAll();
        showModal("Fin de manche", `
            <p><strong>${escapeHtml(noms[winnerId])}</strong> a posé tous ses dominos !</p>
            <p>Points gagnés : <strong>${remaining}</strong></p>
            <p>Choisissez « Nouvelle partie » pour commencer une nouvelle manche.</p>
        `);
    }

    function finishBlockedRound() {
        state.phase = "finished";
        state.winner = null;

        const totals = state.players.map(player => ({
            id: player.id,
            total: player.hand.reduce((sum, tile) => sum + pipCount(tile), 0)
        })).sort((a, b) => a.total - b.total);

        const best = totals[0];
        const tied = totals.filter(item => item.total === best.total).length > 1;

        if (!tied) {
            getPlayer(best.id).score += state.players
                .filter(p => p.id !== best.id)
                .reduce((sum, p) =>
                    sum + p.hand.reduce((s, t) => s + pipCount(t), 0), 0);

            state.winner = best.id;
        }

        const message = tied
            ? "Partie bloquée : égalité aux points restants."
            : `Partie bloquée : ${noms[best.id]} gagne au plus petit total restant.`;

        state.log.push(message);
        logAction(message);

        showModal("Partie bloquée", `
            <p>${escapeHtml(message)}</p>
            <p>Les points restants déterminent le gagnant selon le plus petit total de points.</p>
        `);
    }

    /* ======================== INTELLIGENCE ARTIFICIELLE ======================== */

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
        if (!state || state.phase !== "playing" ||
            state.currentPlayer !== "human") {
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

        const hand = getPlayer("human").hand;
        hand.sort((a, b) => {
            const sumDifference = pipCount(b) - pipCount(a);
            return sumDifference || b.a - a.a || b.b - a.b;
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
            const pts = [...pointers.values()];
            gestureStart = {
                distance: pointerDistance(pts[0], pts[1]),
                center: pointerCenter(pts[0], pts[1]),
                zoom,
                panX,
                panY
            };
        }

        if (elements.viewport.setPointerCapture) {
            try {
                elements.viewport.setPointerCapture(event.pointerId);
            } catch (_) {}
        }
    }

    function onPointerMove(event) {
        if (!pointers.has(event.pointerId)) return;

        pointers.set(event.pointerId, {
            x: event.clientX,
            y: event.clientY
        });

        if (pointers.size >= 2) {
            const pts = [...pointers.values()].slice(0, 2);

            if (!gestureStart || !gestureStart.distance) {
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

            zoom = Math.max(0.65, Math.min(2.4, gestureStart.zoom * ratio));
            panX = gestureStart.panX + center.x - gestureStart.center.x;
            panY = gestureStart.panY + center.y - gestureStart.center.y;

            applyView();
        } else if (pointers.size === 1 && gestureStart) {
            panX = gestureStart.panX + event.clientX - gestureStart.x;
            panY = gestureStart.panY + event.clientY - gestureStart.y;
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
        if (!elements.modal) return;

        if (elements.modalTitle) elements.modalTitle.textContent = title;
        if (elements.modalContent) elements.modalContent.innerHTML = html;

        elements.modal.classList.remove("hidden");
    }

    function hideModal() {
        if (elements.modal) elements.modal.classList.add("hidden");
    }

    function showRules() {
        showModal("Règles du domino Double-Six", `
            <p><strong>Distribution :</strong> 28 dominos sont mélangés.
            Chaque joueur reçoit 7 pièces.</p>
            <p><strong>Départ :</strong> le joueur qui détient le double-six
            ouvre la manche. Si nécessaire, la partie démarre avec le premier joueur.</p>
            <p><strong>Jouer :</strong> raccordez une extrémité de votre domino
            à une extrémité de même valeur de la chaîne.</p>
            <p><strong>Passer :</strong> vous ne pouvez passer que si aucun de vos
            dominos ne correspond aux extrémités ouvertes.</p>
            <p><strong>Victoire :</strong> le premier joueur qui n'a plus de dominos
            gagne. Si les quatre joueurs passent successivement, le plus petit
            total de points restants gagne la manche.</p>
            <p><strong>Score :</strong> le gagnant marque la somme des points
            présents dans les mains adverses.</p>
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

    /* ======================== MENU ======================== */

    function showMenu() {
        showModal("Options de jeu", `
            <p>Choisissez une action :</p>
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
            if (state && state.phase === "playing") {
                showModal("Nouvelle partie ?", `
                    <p>Une nouvelle manche va remplacer la manche actuelle.
                    Sauvegardez d'abord si vous souhaitez la conserver.</p>
                    <button type="button" id="confirmNewGame">Commencer une nouvelle manche</button>
                `);

                setTimeout(() => {
                    bind("confirmNewGame", "click", () => {
                        hideModal();
                        newGame();
                    });
                }, 0);
            } else {
                newGame();
            }
        });

        bind("soundButton", "click", () => {
            soundEnabled = !soundEnabled;
            $("soundButton").setAttribute(
                "aria-label",
                soundEnabled ? "Couper le son" : "Activer le son"
            );
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
                if (event.target === elements.modal) hideModal();

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

        if (elements.hand) {
            elements.hand.addEventListener("click", event => {
                const tileButton = event.target.closest("[data-tile-id]");
                if (tileButton && elements.hand.contains(tileButton)) {
                    selectTile(tileButton.dataset.tileId);
                }
            });
        }

        if (elements.viewport) {
            elements.viewport.addEventListener("pointerdown", onPointerDown);
            elements.viewport.addEventListener("pointermove", onPointerMove);
            elements.viewport.addEventListener("pointerup", onPointerUp);
            elements.viewport.addEventListener("pointercancel", onPointerUp);
            elements.viewport.addEventListener("lostpointercapture", onPointerUp);

            elements.viewport.addEventListener("wheel", event => {
                event.preventDefault();
                setZoom(zoom + (event.deltaY < 0 ? 0.06 : -0.06));
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

        try {
            await openDatabase();
        } catch (error) {
            console.warn("IndexedDB indisponible :", error);
            if (elements.saveStatus) {
                elements.saveStatus.textContent =
                    "IndexedDB indisponible : les sauvegardes ne fonctionneront pas.";
            }
        }

        // Reprendre automatiquement une sauvegarde, si elle existe.
        let restored = false;

        if (db) {
            try {
                const saved = await new Promise((resolve, reject) => {
                    const request = db
                        .transaction(STORE_NAME, "readonly")
                        .objectStore(STORE_NAME)
                        .get(SAVE_KEY);

                    request.onsuccess = () => resolve(request.result || null);
                    request.onerror = () => reject(request.error);
                });

                if (saved && validateState(saved.state)) {
                    state = saved.state;
                    restored = true;
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
        } else if (state.phase === "playing" &&
                   state.currentPlayer !== "human") {
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