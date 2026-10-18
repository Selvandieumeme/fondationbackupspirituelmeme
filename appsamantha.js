/* ============================================================
   SAMANTHA — JAVASCRIPT PRINCIPAL
   Version 1.0.0
   Gestion commerciale complète
   Stockage principal : IndexedDB
   Repli : localStorage
   Compatible avec appsamantha.html et appsamantha.css
============================================================ */

(() => {
    "use strict";

    /* ========================================================
       1. CONFIGURATION GÉNÉRALE
    ======================================================== */

    const APP_VERSION = "1.0.0";
    const DB_NAME = "SamanthaCommercialDB";
    const DB_VERSION = 1;
    const PRODUCT_SLOTS = 50;
    const VALID_CURRENCIES = ["HTG", "USD", "EUR"];
    const BACKUP_SCHEMA = "samantha-backup-v1";
    const LOCAL_FALLBACK_KEY = "SamanthaCommercialFallbackV1";

    const STORE_NAMES = [
        "products",
        "sales",
        "purchases",
        "inventories",
        "stockExits",
        "drafts",
        "settings",
        "meta"
    ];

    const DEFAULT_SETTINGS = {
        businessName: "",
        businessPhone: "",
        businessEmail: "",
        businessAddress: "",
        baseCurrency: "USD",
        rates: { HTG: null, USD: 1, EUR: null },
        exchangeRateDate: "",
        costMethod: "weighted-average",
        defaultLowStock: 5,
        autoRefreshMinutes: 10,
        themePreference: "system",
        languagePreference: "fr",
        numberFormat: "fr-FR",
        displayCurrency: "USD"
    };

    const state = {
        db: null,
        storageMode: "initializing",
        products: [],
        sales: [],
        purchases: [],
        inventories: [],
        stockExits: [],
        drafts: [],
        settings: structuredCloneSafe(DEFAULT_SETTINGS),
        currentView: "dashboard",
        historyPage: 1,
        historyPageSize: 15,
        historyFiltered: [],
        selectedHistory: null,
        pendingConfirmation: null,
        pendingBackup: null,
        dirty: false,
        scene: null,
        sceneEngine: null,
        sceneState: {
            yaw: -0.65,
            pitch: -0.2,
            distance: 11,
            targetX: 0,
            targetY: 0,
            targetZ: 0
        },
        scenePointer: null,
        refreshHandle: null,
        initialized: false,
        busy: false
    };

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    function structuredCloneSafe(value) {
        if (typeof structuredClone === "function") {
            return structuredClone(value);
        }
        return JSON.parse(JSON.stringify(value));
    }

    function uid(prefix = "ID") {
        return prefix + "-" +
            Date.now().toString(36).toUpperCase() + "-" +
            Math.random().toString(36).slice(2, 8).toUpperCase();
    }

    function nowISO() {
        return new Date().toISOString();
    }

    function localDateTimeValue(date = new Date()) {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    }

    function localDateValue(date = new Date()) {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString().slice(0, 10);
    }

    function toNumber(value, fallback = 0) {
        if (typeof value === "number") {
            return Number.isFinite(value) ? value : fallback;
        }

        if (typeof value === "string") {
            const cleaned = value.trim().replace(/\s/g, "").replace(",", ".");
            if (!cleaned) return fallback;
            const parsed = Number(cleaned);
            return Number.isFinite(parsed) ? parsed : fallback;
        }

        return fallback;
    }

    function integer(value, fallback = 0) {
        return Math.max(0, Math.floor(toNumber(value, fallback)));
    }

    function roundMoney(value) {
        return Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    function safeText(value) {
        return escapeHTML(value);
    }

    function validCurrency(value) {
        return VALID_CURRENCIES.includes(value) ? value : "USD";
    }

    function currencySymbol(currency) {
        return validCurrency(currency);
    }

    function formatNumber(value, decimals = 2) {
        const locale = state.settings.numberFormat || "fr-FR";
        return new Intl.NumberFormat(locale, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(toNumber(value));
    }

    function formatMoney(value, currency = state.settings.displayCurrency) {
        return `${formatNumber(value, 2)} ${currencySymbol(currency)}`;
    }

    function formatDate(value, includeTime = true) {
        if (!value) return "—";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);

        try {
            return new Intl.DateTimeFormat("fr-FR", includeTime
                ? { dateStyle: "short", timeStyle: "short" }
                : { dateStyle: "short" }
            ).format(date);
        } catch {
            return date.toLocaleString();
        }
    }

    function normalizeDate(value) {
        if (!value) return "";
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? "" : date.toISOString();
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function setText(id, value) {
        const element = byId(id);
        if (element) element.textContent = String(value ?? "");
    }

    function setHTML(id, html) {
        const element = byId(id);
        if (element) element.innerHTML = html;
    }

    function setValue(id, value) {
        const element = byId(id);
        if (element) element.value = value ?? "";
    }

    function markDirty() {
        state.dirty = true;
        const status = byId("storageStatus");
        if (status) status.textContent = "Modifications en attente";
    }

    function markSaved() {
        state.dirty = false;
        const status = byId("storageStatus");
        if (status) status.textContent =
            state.storageMode === "indexeddb"
                ? "IndexedDB opérationnel"
                : "Stockage local actif";
    }

    /* ========================================================
       2. NOTIFICATIONS ET CONFIRMATIONS
    ======================================================== */

    function toast(message, type = "info", duration = 3500) {
        const container = byId("toastContainer");
        if (!container) {
            console.log(`[Samantha/${type}] ${message}`);
            return;
        }

        const item = document.createElement("div");
        item.className = `app-toast toast-${type}`;
        item.setAttribute("role", type === "error" ? "alert" : "status");

        const text = document.createElement("span");
        text.textContent = String(message);

        const close = document.createElement("button");
        close.type = "button";
        close.className = "toast-close";
        close.setAttribute("aria-label", "Fermer la notification");
        close.textContent = "×";
        close.addEventListener("click", () => item.remove());

        item.append(text, close);
        container.appendChild(item);

        window.setTimeout(() => {
            if (item.isConnected) item.remove();
        }, duration);
    }

    function showLoading(message = "Chargement...") {
        const element = byId("globalLoading");
        if (!element) return;
        setText("globalLoadingText", message);
        element.hidden = false;
    }

    function hideLoading() {
        const element = byId("globalLoading");
        if (element) element.hidden = true;
    }

    function openConfirm(title, message, callback, acceptLabel = "Confirmer") {
        state.pendingConfirmation = callback;

        setText("confirmDialogTitle", title);
        setText("confirmDialogMessage", message);
        setText("confirmDialogAccept", acceptLabel);

        const dialog = byId("confirmDialog");
        if (dialog && typeof dialog.showModal === "function") {
            if (!dialog.open) dialog.showModal();
            return;
        }

        if (window.confirm(`${title}\n\n${message}`)) {
            executeConfirmation();
        } else {
            state.pendingConfirmation = null;
        }
    }

    async function executeConfirmation() {
        const callback = state.pendingConfirmation;
        state.pendingConfirmation = null;
        closeDialog("confirmDialog");

        if (typeof callback === "function") {
            try {
                await callback();
            } catch (error) {
                reportError(error);
            }
        }
    }

    function closeDialog(id) {
        const dialog = byId(id);
        if (dialog && dialog.open && typeof dialog.close === "function") {
            dialog.close();
        }
    }

    function showDetails(title, html) {
        setText("detailsDialogTitle", title);
        setHTML("detailsDialogContent", html);

        const dialog = byId("detailsDialog");
        if (dialog && typeof dialog.showModal === "function") {
            if (!dialog.open) dialog.showModal();
        } else {
            toast(title, "info");
        }
    }

    function reportError(error) {
        console.error("[Samantha]", error);
        hideLoading();
        toast(
            error && error.message
                ? error.message
                : "Une erreur inattendue est survenue.",
            "error",
            6000
        );
    }

    /* ========================================================
       3. STOCKAGE INDEXEDDB ET SOLUTION DE REPLI
    ======================================================== */

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!("indexedDB" in window)) {
                reject(new Error("IndexedDB indisponible."));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = () => {
                const db = request.result;

                STORE_NAMES.forEach(name => {
                    if (!db.objectStoreNames.contains(name)) {
                        db.createObjectStore(name, { keyPath: "id" });
                    }
                });
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(
                request.error || new Error("Impossible d'ouvrir la base de données.")
            );
            request.onblocked = () => {
                console.warn("Ouverture IndexedDB bloquée par un autre onglet.");
            };
        });
    }

    function fallbackRead() {
        try {
            const raw = localStorage.getItem(LOCAL_FALLBACK_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch (error) {
            console.warn("Lecture du stockage de repli impossible.", error);
            return {};
        }
    }

    function fallbackWrite(data) {
        try {
            localStorage.setItem(LOCAL_FALLBACK_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            throw new Error(
                "Le stockage local est plein ou indisponible. Exportez une sauvegarde."
            );
        }
    }

    async function readAllFromDB(storeName) {
        if (state.storageMode !== "indexeddb" || !state.db) {
            const fallback = fallbackRead();
            return Array.isArray(fallback[storeName]) ? fallback[storeName] : [];
        }

        return new Promise((resolve, reject) => {
            const tx = state.db.transaction(storeName, "readonly");
            const request = tx.objectStore(storeName).getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    async function writeOne(storeName, record) {
        if (!record || !record.id) {
            throw new Error("Enregistrement invalide : identifiant manquant.");
        }

        if (state.storageMode !== "indexeddb" || !state.db) {
            const data = fallbackRead();
            data[storeName] = Array.isArray(data[storeName]) ? data[storeName] : [];

            const index = data[storeName].findIndex(item => item.id === record.id);
            if (index >= 0) data[storeName][index] = record;
            else data[storeName].push(record);

            fallbackWrite(data);
            return record;
        }

        return new Promise((resolve, reject) => {
            const tx = state.db.transaction(storeName, "readwrite");
            tx.objectStore(storeName).put(record);
            tx.oncomplete = () => resolve(record);
            tx.onerror = () => reject(tx.error || new Error("Échec de l'enregistrement."));
            tx.onabort = () => reject(tx.error || new Error("Transaction annulée."));
        });
    }

    async function writeMany(storeName, records) {
        if (state.storageMode !== "indexeddb" || !state.db) {
            const data = fallbackRead();
            data[storeName] = Array.isArray(data[storeName]) ? data[storeName] : [];

            for (const record of records) {
                const index = data[storeName].findIndex(item => item.id === record.id);
                if (index >= 0) data[storeName][index] = record;
                else data[storeName].push(record);
            }

            fallbackWrite(data);
            return;
        }

        await new Promise((resolve, reject) => {
            const tx = state.db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);

            records.forEach(record => store.put(record));

            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error || new Error("Échec d'écriture."));
            tx.onabort = () => reject(tx.error || new Error("Écriture annulée."));
        });
    }

    async function deleteOne(storeName, id) {
        if (state.storageMode !== "indexeddb" || !state.db) {
            const data = fallbackRead();
            data[storeName] = (data[storeName] || []).filter(item => item.id !== id);
            fallbackWrite(data);
            return;
        }

        await new Promise((resolve, reject) => {
            const tx = state.db.transaction(storeName, "readwrite");
            tx.objectStore(storeName).delete(id);
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error);
        });
    }

    async function replaceAllStores(snapshot) {
        if (state.storageMode !== "indexeddb" || !state.db) {
            fallbackWrite(snapshot);
            return;
        }

        const tx = state.db.transaction(STORE_NAMES, "readwrite");

        for (const storeName of STORE_NAMES) {
            const store = tx.objectStore(storeName);
            store.clear();

            const records = Array.isArray(snapshot[storeName])
                ? snapshot[storeName]
                : [];

            records.forEach(record => {
                if (record && record.id) store.put(record);
            });
        }

        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = () => reject(tx.error || new Error("Restauration impossible."));
            tx.onabort = () => reject(tx.error || new Error("Restauration annulée."));
        });
    }

    async function initializeStorage() {
        try {
            state.db = await openDatabase();
            state.storageMode = "indexeddb";

            for (const name of STORE_NAMES) {
                const records = await readAllFromDB(name);
                if (records.length === 0 && name === "settings") {
                    await writeOne("settings", {
                        id: "main",
                        ...structuredCloneSafe(DEFAULT_SETTINGS)
                    });
                }
            }
        } catch (error) {
            console.warn("IndexedDB indisponible, utilisation du repli.", error);
            state.db = null;
            state.storageMode = "localstorage";

            const fallback = fallbackRead();
            if (!fallback.settings || !fallback.settings.length) {
                fallback.settings = [{
                    id: "main",
                    ...structuredCloneSafe(DEFAULT_SETTINGS)
                }];
                fallbackWrite(fallback);
            }
        }

        setText("databaseStatus",
            state.storageMode === "indexeddb"
                ? "IndexedDB opérationnel"
                : "Stockage local de repli"
        );

        setText("storageStatus",
            state.storageMode === "indexeddb"
                ? "IndexedDB opérationnel"
                : "Stockage local actif"
        );
    }

    async function loadState() {
        const [
            products,
            sales,
            purchases,
            inventories,
            stockExits,
            drafts,
            settingsRecords
        ] = await Promise.all([
            readAllFromDB("products"),
            readAllFromDB("sales"),
            readAllFromDB("purchases"),
            readAllFromDB("inventories"),
            readAllFromDB("stockExits"),
            readAllFromDB("drafts"),
            readAllFromDB("settings")
        ]);

        state.products = products.sort((a, b) => a.slot - b.slot);
        state.sales = sales;
        state.purchases = purchases;
        state.inventories = inventories;
        state.stockExits = stockExits;
        state.drafts = drafts;

        const storedSettings = settingsRecords.find(item => item.id === "main");

        state.settings = {
            ...structuredCloneSafe(DEFAULT_SETTINGS),
            ...(storedSettings || {}),
            rates: {
                ...DEFAULT_SETTINGS.rates,
                ...((storedSettings && storedSettings.rates) || {})
            }
        };

        if (!state.settings.displayCurrency) {
            state.settings.displayCurrency = "USD";
        }

        setValue("displayCurrency", state.settings.displayCurrency);
        setValue("reportCurrency", state.settings.displayCurrency);
    }

    async function saveSettings() {
        await writeOne("settings", {
            id: "main",
            ...structuredCloneSafe(state.settings),
            updatedAt: nowISO()
        });
        markSaved();
    }

    async function saveAll() {
        showLoading("Enregistrement des données...");

        try {
            await Promise.all([
                writeMany("products", state.products),
                writeMany("sales", state.sales),
                writeMany("purchases", state.purchases),
                writeMany("inventories", state.inventories),
                writeMany("stockExits", state.stockExits),
                writeMany("drafts", state.drafts),
                saveSettings()
            ]);

            markSaved();
            setText("lastSyncDate", formatDate(nowISO()));
            toast("Toutes les données ont été enregistrées.", "success");
        } finally {
            hideLoading();
        }
    }












/* ========================================================
   4. PRODUITS ET COÛTS
======================================================== */

/* ========================================================
   4.1 NOMS DES 4 PREMIERS PRODUITS
   Remplacement des noms dans les emplacements 1 à 4.
   Aucun emplacement supplémentaire n'est créé.
======================================================== */

const FIRST_FOUR_PRODUCT_NAMES = [
    "Boxer",
    "Culotte-A",
    "Culotte-B",
    "Collans"
];

function getProduct(id) {
    return state.products.find(product => product.id === id) || null;
}

function getProductBySlot(slot) {
    return state.products.find(product => Number(product.slot) === Number(slot)) || null;
}

function activeProducts() {
    return state.products
        .filter(product => product.active !== false && product.name)
        .sort((a, b) => a.slot - b.slot);
}

/* ========================================================
   REMPLACEMENT DES 4 PREMIERS NOMS
   Préserve les ID, stocks, prix, références et autres données.
======================================================== */

async function replaceFirstFourProductNames() {
    const changedProducts = [];

    FIRST_FOUR_PRODUCT_NAMES.forEach((name, index) => {
        const product = getProductBySlot(index + 1);

        // Ne pas créer de produit si l'emplacement n'existe pas.
        if (!product) return;

        if (product.name !== name) {
            product.name = name;
            product.updatedAt = nowISO();
            changedProducts.push(product);
        }

        // Réactiver le produit si l'ancien emplacement était désactivé.
        if (product.active === false) {
            product.active = true;

            if (!changedProducts.includes(product)) {
                product.updatedAt = nowISO();
                changedProducts.push(product);
            }
        }
    });

    if (!changedProducts.length) return;

    try {
        for (const product of changedProducts) {
            await writeOne("products", product);
        }

        markSaved();
        populateProductSelectors();
        renderAll();
    } catch (error) {
        reportError(error);
    }
}

function productStock(product) {
    return Math.max(0, toNumber(product && product.stock));
}

function productCost(product) {
    return Math.max(0, toNumber(product && product.purchasePrice));
}

function productPrice(product) {
    return Math.max(0, toNumber(product && product.salePrice));
}

function productCurrency(product) {
    return validCurrency(product && product.currency);
}

function stockValue(currency = null) {
    return roundMoney(state.products.reduce((total, product) => {
        if (currency && productCurrency(product) !== currency) return total;
        return total + productStock(product) * productCost(product);
    }, 0));
}

function getOutOfStockProducts() {
    return activeProducts().filter(product => productStock(product) <= 0);
}

function getLowStockProducts() {
    return activeProducts().filter(product => {
        const threshold = Math.max(
            0,
            toNumber(product.lowStockThreshold, state.settings.defaultLowStock)
        );

        return productStock(product) > 0 && productStock(product) <= threshold;
    });
}

function productStatus(product) {
    if (!product || product.active === false || !product.name) {
        return { label: "Libre", css: "neutral" };
    }

    if (productStock(product) <= 0) {
        return { label: "Rupture", css: "danger" };
    }

    const threshold = toNumber(
        product.lowStockThreshold,
        state.settings.defaultLowStock
    );

    if (productStock(product) <= threshold) {
        return { label: "Stock faible", css: "warning" };
    }

    return { label: "En stock", css: "success" };
}

function productSlotOptions(selected = "", includeFree = true) {
    const parts = ['<option value="">Choisir un emplacement</option>'];

    for (let slot = 1; slot <= PRODUCT_SLOTS; slot++) {
        const product = getProductBySlot(slot);

        if (!product || product.active === false || !product.name) {
            if (includeFree) {
                parts.push(
                    `<option value="${slot}" ${String(selected) === String(slot) ? "selected" : ""}>Emplacement ${slot} — Libre</option>`
                );
            }
        } else {
            parts.push(
                `<option value="${slot}" ${String(selected) === String(slot) ? "selected" : ""}>Emplacement ${slot} — ${safeText(product.name)}</option>`
            );
        }
    }

    return parts.join("");
}

/* ========================================================
   SÉLECTEUR PRODUITS — 50 EMPLACEMENTS
   Compatible avec les ventes et les achats.
======================================================== */

function productSelectOptions(selected = "", includeStock = false) {
    const parts = ['<option value="">Choisir un produit</option>'];

    for (let slot = 1; slot <= PRODUCT_SLOTS; slot++) {
        const product = getProductBySlot(slot);

        if (!product || product.active === false || !product.name) {
            parts.push(
                `<option value="" disabled>Emplacement ${slot} — Libre</option>`
            );
            continue;
        }

        const stock = productStock(product);
        const isSelected = String(product.id) === String(selected);
        const disabled = includeStock && stock <= 0 ? "disabled" : "";

        parts.push(
            `<option value="${safeText(product.id)}" ${isSelected ? "selected" : ""} ${disabled}>${slot}. ${safeText(product.name)} — Stock : ${formatNumber(stock, 0)}</option>`
        );
    }

    return parts.join("");
}

function populateProductSelectors() {
    const slot = byId("productSlot");

    if (slot) {
        const selected = slot.value;
        slot.innerHTML = productSlotOptions(selected, true);
    }

    const exitProduct = byId("stockExitProduct");

    if (exitProduct) {
        const selected = exitProduct.value;
        exitProduct.innerHTML = productSelectOptions(selected);
    }

    const reportProduct = byId("reportProductFilter");

    if (reportProduct) {
        const selected = reportProduct.value || "all";

        reportProduct.innerHTML =
            '<option value="all">Tous les produits</option>' +
            activeProducts().map(product =>
                `<option value="${safeText(product.id)}">${safeText(product.name)}</option>`
            ).join("");

        reportProduct.value = selected;
    }
}

function resetProductForm() {
    const form = byId("productForm");
    if (form) form.reset();

    setValue("productId", "");
    setValue("productInitialStock", "0");
    setValue("productPurchasePrice", "0.00");
    setValue("productSalePrice", "0.00");
    setValue("productLowStockThreshold", state.settings.defaultLowStock);

    const slot = byId("productSlot");
    if (slot) slot.innerHTML = productSlotOptions("", true);

    setText("saveProductButton", "Enregistrer le produit");
}

function editProduct(id) {
    const product = getProduct(id);

    if (!product) {
        toast("Produit introuvable.", "error");
        return;
    }

    setValue("productId", product.id);
    setValue("productSlot", product.slot);
    setValue("productName", product.name);
    setValue("productReference", product.reference || "");
    setValue("productInitialStock", productStock(product));
    setValue("productPurchasePrice", productCost(product));
    setValue("productSalePrice", productPrice(product));
    setValue("productCurrency", productCurrency(product));
    setValue("productLowStockThreshold", product.lowStockThreshold ?? 5);

    const slot = byId("productSlot");

    if (slot) {
        slot.innerHTML = productSlotOptions(String(product.slot), true);
        slot.value = String(product.slot);
    }

    setText("saveProductButton", "Enregistrer les modifications");
    navigate("products");

    const form = byId("productForm");

    if (form) {
        form.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    toast("Produit chargé pour modification.", "info");
}

async function handleProductSubmit(event) {
    event.preventDefault();

    const id = $("#productId")?.value || "";
    const slot = integer($("#productSlot")?.value, 0);
    const name = $("#productName")?.value.trim() || "";
    const reference = $("#productReference")?.value.trim() || "";
    const initialStock = toNumber($("#productInitialStock")?.value, 0);
    const purchasePrice = toNumber($("#productPurchasePrice")?.value, 0);
    const salePrice = toNumber($("#productSalePrice")?.value, 0);
    const currency = validCurrency($("#productCurrency")?.value);
    const lowStockThreshold = integer($("#productLowStockThreshold")?.value, 5);

    if (!slot || slot > PRODUCT_SLOTS) {
        toast("Choisissez un emplacement valide.", "error");
        return;
    }

    if (!name) {
        toast("Le nom du produit est obligatoire.", "error");
        return;
    }

    if (initialStock < 0 || purchasePrice < 0 || salePrice < 0) {
        toast("Le stock et les prix ne peuvent pas être négatifs.", "error");
        return;
    }

    const slotOwner = getProductBySlot(slot);

    if (
        slotOwner &&
        slotOwner.id !== id &&
        slotOwner.active !== false &&
        slotOwner.name
    ) {
        toast("Cet emplacement est déjà occupé par un autre produit.", "error");
        return;
    }

    const duplicateReference = state.products.find(product =>
        product.id !== id &&
        reference &&
        product.reference &&
        product.reference.toLowerCase() === reference.toLowerCase()
    );

    if (duplicateReference) {
        toast("Cette référence existe déjà.", "error");
        return;
    }

    const existing = id ? getProduct(id) : null;

    if (id && !existing) {
        toast("Le produit à modifier n'existe plus.", "error");
        return;
    }

    if (existing && Number(existing.slot) !== slot) {
        const target = getProductBySlot(slot);

        if (
            target &&
            target.id !== existing.id &&
            target.name &&
            target.active !== false
        ) {
            toast("L'emplacement choisi est occupé.", "error");
            return;
        }
    }

    const product = {
        id: existing ? existing.id : uid("PROD"),
        slot,
        name,
        reference,
        currency,
        purchasePrice: roundMoney(purchasePrice),
        salePrice: roundMoney(salePrice),
        lowStockThreshold,
        stock: existing ? productStock(existing) : integer(initialStock),
        active: true,
        createdAt: existing ? existing.createdAt : nowISO(),
        updatedAt: nowISO()
    };

    if (existing) {
        const index = state.products.findIndex(item => item.id === existing.id);
        state.products[index] = product;
    } else {
        state.products.push(product);
    }

    try {
        await writeOne("products", product);
        markSaved();
        resetProductForm();
        renderAll();
        toast(existing ? "Produit modifié." : "Produit enregistré.", "success");
    } catch (error) {
        reportError(error);
    }
}

async function deleteProduct(id) {
    const product = getProduct(id);
    if (!product) return;

    const hasHistory =
        state.sales.some(sale => sale.lines?.some(line => line.productId === id)) ||
        state.purchases.some(purchase => purchase.lines?.some(line => line.productId === id)) ||
        state.inventories.some(inventory => inventory.lines?.some(line => line.productId === id)) ||
        state.stockExits.some(exit => exit.productId === id);

    openConfirm(
        hasHistory ? "Désactiver le produit" : "Supprimer le produit",
        hasHistory
            ? `Le produit « ${product.name} » apparaît dans l'historique. Il sera désactivé sans effacer les anciennes opérations.`
            : `Supprimer définitivement « ${product.name} » du catalogue ?`,
        async () => {
            if (hasHistory) {
                product.active = false;
                product.updatedAt = nowISO();
                await writeOne("products", product);
            } else {
                state.products = state.products.filter(item => item.id !== id);
                await deleteOne("products", id);
            }

            renderAll();
            toast("Opération effectuée.", "success");
        },
        hasHistory ? "Désactiver" : "Supprimer"
    );
}

function filterProducts() {
    const search = ($("#productSearch")?.value || "").trim().toLowerCase();
    const filter = $("#productStockFilter")?.value || "all";

    return state.products
        .filter(product => {
            const matchesSearch =
                !search ||
                String(product.name || "").toLowerCase().includes(search) ||
                String(product.reference || "").toLowerCase().includes(search);

            if (!matchesSearch) return false;

            if (filter === "inactive") {
                return !product.name || product.active === false;
            }

            if (filter === "out-of-stock") {
                return product.name && productStock(product) <= 0;
            }

            if (filter === "in-stock") {
                return product.name && productStock(product) > 0;
            }

            return true;
        })
        .sort((a, b) => a.slot - b.slot);
}

function renderProducts() {
    const tbody = byId("productsTableBody");
    if (!tbody) return;

    const rows = filterProducts();

    setText("productSlotCount", PRODUCT_SLOTS);
    setText("activeProductCount", activeProducts().length);
    setText(
        "inStockProductCount",
        activeProducts().filter(product => productStock(product) > 0).length
    );
    setText("outOfStockProductCount", getOutOfStockProducts().length);
    setText(
        "productListCount",
        `${rows.length} produit${rows.length === 1 ? "" : "s"}`
    );

    if (!rows.length) {
        tbody.innerHTML =
            '<tr><td colspan="8" class="empty-cell">Aucun produit trouvé.</td></tr>';
        return;
    }

    tbody.innerHTML = rows.map(product => {
        const status = productStatus(product);
        const inactive = product.active === false || !product.name;

        return `
            <tr>
                <td>${product.slot}</td>
                <td>${safeText(product.reference || "—")}</td>
                <td><strong>${safeText(product.name || "Emplacement libre")}</strong></td>
                <td>${inactive ? "—" : formatNumber(productStock(product), 0)}</td>
                <td>${inactive ? "—" : formatMoney(productCost(product), productCurrency(product))}</td>
                <td>${inactive ? "—" : formatMoney(productPrice(product), productCurrency(product))}</td>
                <td><span class="status-badge status-${status.css}">${status.label}</span></td>
                <td class="table-actions">
                    ${
                        inactive
                            ? `<button type="button" class="button button-small button-secondary" data-action="use-product-slot" data-slot="${product.slot}">Utiliser</button>`
                            : `
                                <button type="button" class="button button-small button-secondary" data-action="edit-product" data-id="${safeText(product.id)}">Modifier</button>
                                <button type="button" class="button button-small button-danger-outline" data-action="delete-product" data-id="${safeText(product.id)}">Désactiver</button>
                            `
                    }
                </td>
            </tr>
        `;
    }).join("");
}


    /* ========================================================
       5. DEVISES ET VALEURS
    ======================================================== */

    function convertCurrency(amount, from, to) {
        from = validCurrency(from);
        to = validCurrency(to);

        if (from === to) return toNumber(amount);

        const rates = state.settings.rates || {};
        const fromRate = toNumber(rates[from], NaN);
        const toRate = toNumber(rates[to], NaN);

        if (!Number.isFinite(fromRate) || !Number.isFinite(toRate) ||
            fromRate <= 0 || toRate <= 0) {
            return null;
        }

        return toNumber(amount) / fromRate * toRate;
    }

    function formatConverted(amount, from, to) {
        const result = convertCurrency(amount, from, to);
        if (result === null) return "Taux non configuré";
        return formatMoney(result, to);
    }

    function transactionTotals(lines) {
        let units = 0;
        let revenue = 0;
        let cost = 0;

        (lines || []).forEach(line => {
            const quantity = integer(line.quantity);
            units += quantity;
            revenue += quantity * toNumber(line.unitPrice);
            cost += quantity * toNumber(line.unitCost);
        });

        revenue = roundMoney(revenue);
        cost = roundMoney(cost);

        return {
            units,
            revenue,
            cost,
            profit: roundMoney(revenue - cost)
        };
    }

    function currencyMismatch(lines, currency) {
        return (lines || []).some(line => line.currency && line.currency !== currency);
    }







/* ========================================================
   6. VENTES
   Produits dynamiques : 50 emplacements
   4 produits de référence :
   Boxer, Culotte-A, Culotte-B, Collans
======================================================== */

const SALE_PRODUCT_NAMES = [
    "Boxer",
    "Culotte-A",
    "Culotte-B",
    "Collans"
];

function createSaleLineRow() {
    const tbody = byId("saleLinesBody");
    if (!tbody) return;

    const empty = tbody.querySelector(".empty-row");
    if (empty) tbody.innerHTML = "";

    const tr = document.createElement("tr");
    tr.className = "sale-line";

    tr.innerHTML = `
        <td>
            <select class="line-product"
                    aria-label="Produit de la vente"
                    required>
                ${productSelectOptions("", false)}
            </select>
        </td>
        <td class="line-stock">—</td>
        <td class="line-cost">—</td>
        <td>
            <input class="line-price"
                   type="number"
                   min="0"
                   step="0.01"
                   value="0.00"
                   inputmode="decimal"
                   aria-label="Prix de vente unitaire"
                   required>
        </td>
        <td>
            <input class="line-quantity"
                   type="number"
                   min="1"
                   step="1"
                   value="1"
                   inputmode="numeric"
                   aria-label="Quantité"
                   required>
        </td>
        <td class="line-total">0,00</td>
        <td class="line-profit">0,00</td>
        <td>
            <button type="button"
                    class="button button-small button-danger-outline"
                    data-action="remove-sale-line"
                    aria-label="Retirer la ligne">×</button>
        </td>
    `;

    tbody.appendChild(tr);

    const productSelect = $(".line-product", tr);

    if (productSelect) {
        productSelect.innerHTML = productSelectOptions("", false);

        // Placer les quatre produits de référence en premier
        // sans créer de faux produits ni modifier leurs données.
        const options = Array.from(productSelect.options);
        const placeholder = options.find(option => option.value === "");

        const referenceOptions = options.filter(option =>
            option.value !== "" &&
            SALE_PRODUCT_NAMES.some(name => {
                const product = getProduct(option.value);
                return product &&
                    String(product.name).trim().toLowerCase() === name.toLowerCase();
            })
        );

        referenceOptions.sort((a, b) => {
            const productA = getProduct(a.value);
            const productB = getProduct(b.value);

            return SALE_PRODUCT_NAMES.indexOf(productA?.name) -
                   SALE_PRODUCT_NAMES.indexOf(productB?.name);
        });

        productSelect.replaceChildren();

        if (placeholder) {
            productSelect.appendChild(placeholder);
        }

        referenceOptions.forEach(option => {
            productSelect.appendChild(option);
        });

        options.forEach(option => {
            if (
                option.value !== "" &&
                !referenceOptions.some(reference => reference.value === option.value)
            ) {
                productSelect.appendChild(option);
            }
        });
    }

    updateSaleLine(tr);
    calculateSale();
}

function updateSaleLine(row) {
    if (!row) return;

    const id = $(".line-product", row)?.value || "";
    const product = getProduct(id);
    const quantity = integer($(".line-quantity", row)?.value, 1);
    const priceInput = $(".line-price", row);
    const saleCurrency = validCurrency($("#saleCurrency")?.value || "USD");

    if (!product) {
        setLineText(row, ".line-stock", "—");
        setLineText(row, ".line-cost", "—");
        setLineText(row, ".line-total", formatMoney(0, saleCurrency));
        setLineText(row, ".line-profit", formatMoney(0, saleCurrency));
        calculateSale();
        return;
    }

    if (priceInput && !priceInput.dataset.userEdited) {
        const converted = convertCurrency(
            productPrice(product),
            productCurrency(product),
            saleCurrency
        );

        priceInput.value = converted === null
            ? productPrice(product).toFixed(2)
            : converted.toFixed(2);
    }

    const unitPrice = Math.max(0, toNumber(priceInput?.value));

    const convertedCost = convertCurrency(
        productCost(product),
        productCurrency(product),
        saleCurrency
    );

    const unitCost = convertedCost === null
        ? productCost(product)
        : convertedCost;

    setLineText(row, ".line-stock", formatNumber(productStock(product), 0));
    setLineText(row, ".line-cost", formatMoney(unitCost, saleCurrency));
    setLineText(
        row,
        ".line-total",
        formatMoney(roundMoney(unitPrice * quantity), saleCurrency)
    );
    setLineText(
        row,
        ".line-profit",
        formatMoney(roundMoney((unitPrice - unitCost) * quantity), saleCurrency)
    );

    calculateSale();
}

function setLineText(row, selector, value) {
    const element = $(selector, row);
    if (element) element.textContent = value;
}

function readSaleLines() {
    const rows = $$("#saleLinesBody .sale-line");

    return rows.map(row => {
        const productId = $(".line-product", row)?.value || "";
        const product = getProduct(productId);
        const quantity = integer($(".line-quantity", row)?.value, 0);
        const unitPrice = roundMoney($(".line-price", row)?.value);
        const currency = validCurrency($("#saleCurrency")?.value || "USD");

        if (!product || quantity <= 0) return null;

        const convertedCost = convertCurrency(
            productCost(product),
            productCurrency(product),
            currency
        );

        return {
            productId: product.id,
            slot: product.slot,
            name: product.name,
            reference: product.reference || "",
            quantity,
            unitPrice,
            unitCost: roundMoney(
                convertedCost === null ? productCost(product) : convertedCost
            ),
            currency,
            originalCost: productCost(product),
            originalCurrency: productCurrency(product)
        };
    }).filter(Boolean);
}

function calculateSale() {
    const lines = readSaleLines();
    const totals = transactionTotals(lines);
    const currency = validCurrency($("#saleCurrency")?.value || "USD");

    setText("saleTotalUnits", formatNumber(totals.units, 0));
    setText("saleTotalCost", formatMoney(totals.cost, currency));
    setText("saleTotalRevenue", formatMoney(totals.revenue, currency));
    setText("saleTotalProfit", formatMoney(totals.profit, currency));
}

function resetSaleForm() {
    const form = byId("saleForm");
    if (form) form.reset();

    setValue("saleDate", localDateTimeValue());
    setValue("saleReference", generateReference("VTE"));
    setValue("saleCurrency", state.settings.displayCurrency || "USD");

    setHTML("saleLinesBody", `
        <tr class="empty-row">
            <td colspan="8" class="empty-cell">
                Ajoutez un produit pour commencer.
            </td>
        </tr>
    `);

    calculateSale();
}

function generateReference(prefix) {
    const date = new Date();

    const stamp = [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("");

    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();

    return `${prefix}-${stamp}-${suffix}`;
}

async function handleSaleSubmit(event) {
    event.preventDefault();

    const lines = readSaleLines();
    const currency = validCurrency($("#saleCurrency")?.value || "USD");

    if (!lines.length) {
        toast("Ajoutez au moins un produit valide.", "error");
        return;
    }

    if (currencyMismatch(lines, currency)) {
        toast("Les devises des lignes doivent correspondre à la vente.", "error");
        return;
    }

    const combined = new Map();

    lines.forEach(line => {
        combined.set(
            line.productId,
            (combined.get(line.productId) || 0) + line.quantity
        );
    });

    for (const [productId, quantity] of combined) {
        const product = getProduct(productId);

        if (!product || productStock(product) < quantity) {
            toast(
                `Stock insuffisant pour ${product ? product.name : "un produit"}. Disponible : ${product ? productStock(product) : 0}.`,
                "error",
                6000
            );
            return;
        }
    }

    const totals = transactionTotals(lines);

    if (totals.revenue < 0 || lines.some(line => line.unitPrice < 0)) {
        toast("Montant de vente invalide.", "error");
        return;
    }

    const sale = {
        id: uid("SALE"),
        reference: $("#saleReference")?.value || generateReference("VTE"),
        date: normalizeDate($("#saleDate")?.value) || nowISO(),
        customer: $("#saleCustomer")?.value.trim() || "",
        currency,
        notes: $("#saleNotes")?.value.trim() || "",
        lines,
        units: totals.units,
        revenue: totals.revenue,
        cost: totals.cost,
        profit: totals.profit,
        status: "validated",
        createdAt: nowISO()
    };

    showLoading("Validation de la vente...");

    const snapshots = [...combined.keys()].map(productId => {
        const product = getProduct(productId);

        return {
            product,
            stock: product ? productStock(product) : 0
        };
    });

    try {
        try {
            for (const [productId, quantity] of combined) {
                const product = getProduct(productId);

                if (!product) {
                    throw new Error(`Produit introuvable : ${productId}`);
                }

                product.stock = productStock(product) - quantity;
                product.updatedAt = nowISO();

                await writeOne("products", product);
            }

            await writeOne("sales", sale);
            state.sales.push(sale);
        } catch (error) {
            snapshots.forEach(snapshot => {
                if (snapshot.product) {
                    snapshot.product.stock = snapshot.stock;
                }
            });

            await Promise.all(
                snapshots.map(snapshot =>
                    snapshot.product
                        ? writeOne("products", snapshot.product)
                        : Promise.resolve()
                )
            );

            throw error;
        }

        markSaved();
        resetSaleForm();
        renderAll();

        toast(`Vente ${sale.reference} enregistrée.`, "success");
    } finally {
        hideLoading();
    }
}

async function saveSaleDraft() {
    const lines = readSaleLines();

    const draft = {
        id: uid("DRAFT"),
        type: "sale",
        reference: $("#saleReference")?.value || generateReference("BROUILLON"),
        date: $("#saleDate")?.value || localDateTimeValue(),
        currency: validCurrency($("#saleCurrency")?.value),
        customer: $("#saleCustomer")?.value || "",
        notes: $("#saleNotes")?.value || "",
        lines,
        updatedAt: nowISO()
    };

    state.drafts.push(draft);

    await writeOne("drafts", draft);

    toast("Brouillon de vente enregistré.", "success");
}

function renderRecentSales() {
    const tbody = byId("recentSalesBody");
    if (!tbody) return;

    const sales = [...state.sales]
        .filter(sale => sale.status === "validated")
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

    if (!sales.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-cell">
                    Aucune vente enregistrée.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = sales.map(sale => `
        <tr>
            <td>${formatDate(sale.date)}</td>
            <td>${safeText(sale.reference)}</td>
            <td>${safeText((sale.lines || []).map(line => line.name).join(", "))}</td>
            <td>${formatNumber(sale.units, 0)}</td>
            <td>${formatMoney(sale.revenue, sale.currency)}</td>
            <td>${formatMoney(sale.profit, sale.currency)}</td>
            <td>
                <button type="button"
                        class="button button-small button-secondary"
                        data-action="view-transaction"
                        data-type="sale"
                        data-id="${safeText(sale.id)}">
                    Détails
                </button>
            </td>
        </tr>
    `).join("");
}









/* ========================================================
   7. ACHATS
   50 emplacements dynamiques
   4 produits de référence :
   Boxer, Culotte-A, Culotte-B, Collans
======================================================== */

const PURCHASE_PRODUCT_NAMES = [
    "Boxer",
    "Culotte-A",
    "Culotte-B",
    "Collans"
];

function createPurchaseLineRow() {
    const tbody = byId("purchaseLinesBody");
    if (!tbody) return;

    const empty = tbody.querySelector(".empty-row");
    if (empty) tbody.innerHTML = "";

    const tr = document.createElement("tr");
    tr.className = "purchase-line";

    tr.innerHTML = `
        <td>
            <select class="purchase-product"
                    aria-label="Produit acheté"
                    required>
                ${productSelectOptions("", false)}
            </select>
        </td>
        <td>
            <input class="purchase-quantity"
                   type="number"
                   min="1"
                   step="1"
                   value="1"
                   inputmode="numeric"
                   aria-label="Quantité achetée"
                   required>
        </td>
        <td>
            <input class="purchase-price"
                   type="number"
                   min="0"
                   step="0.01"
                   value="0.00"
                   inputmode="decimal"
                   aria-label="Prix d'achat unitaire"
                   required>
        </td>
        <td class="purchase-line-total">0,00</td>
        <td>
            <button type="button"
                    class="button button-small button-danger-outline"
                    data-action="remove-purchase-line"
                    aria-label="Retirer la ligne">×</button>
        </td>
    `;

    tbody.appendChild(tr);

    const productSelect = $(".purchase-product", tr);

    if (productSelect) {
        productSelect.innerHTML = productSelectOptions("", false);

        // Prioriser l'affichage des quatre produits de référence
        // lorsqu'ils existent déjà dans la liste des produits.
        const options = Array.from(productSelect.options);

        const referenceOptions = options.filter(option =>
            PURCHASE_PRODUCT_NAMES.some(name =>
                option.textContent.trim().includes(name)
            )
        );

        referenceOptions.forEach(option => {
            productSelect.insertBefore(option, productSelect.options[1] || null);
        });
    }

    updatePurchaseLine(tr);
    calculatePurchase();
}

function updatePurchaseLine(row) {
    if (!row) return;

    const product = getProduct($(".purchase-product", row)?.value || "");
    const quantity = integer($(".purchase-quantity", row)?.value, 0);
    const currency = validCurrency($("#purchaseCurrency")?.value || "USD");
    const input = $(".purchase-price", row);

    let price = Math.max(0, toNumber(input?.value));

    if (product && input && !input.dataset.userEdited) {
        const converted = convertCurrency(
            productCost(product),
            productCurrency(product),
            currency
        );

        price = converted === null ? productCost(product) : converted;
        input.value = price.toFixed(2);
    }

    setLineText(
        row,
        ".purchase-line-total",
        formatMoney(roundMoney(quantity * price), currency)
    );

    calculatePurchase();
}

function readPurchaseLines() {
    return $$("#purchaseLinesBody .purchase-line").map(row => {
        const product = getProduct($(".purchase-product", row)?.value || "");
        const quantity = integer($(".purchase-quantity", row)?.value, 0);
        const unitCost = roundMoney($(".purchase-price", row)?.value);
        const currency = validCurrency($("#purchaseCurrency")?.value || "USD");

        if (!product || quantity <= 0) return null;

        return {
            productId: product.id,
            slot: product.slot,
            name: product.name,
            reference: product.reference || "",
            quantity,
            unitCost,
            unitPrice: unitCost,
            currency
        };
    }).filter(Boolean);
}

function calculatePurchase() {
    const lines = readPurchaseLines();

    const units = lines.reduce(
        (sum, line) => sum + line.quantity,
        0
    );

    const total = roundMoney(
        lines.reduce(
            (sum, line) => sum + line.quantity * line.unitCost,
            0
        )
    );

    const currency = validCurrency($("#purchaseCurrency")?.value || "USD");

    setText("purchaseTotalUnits", formatNumber(units, 0));
    setText("purchaseTotalAmount", formatMoney(total, currency));
}

function resetPurchaseForm() {
    const form = byId("purchaseForm");
    if (form) form.reset();

    setValue("purchaseDate", localDateTimeValue());
    setValue("purchaseReference", generateReference("ACH"));
    setValue("purchaseCurrency", state.settings.displayCurrency || "USD");

    setHTML("purchaseLinesBody", `
        <tr class="empty-row">
            <td colspan="5" class="empty-cell">
                Ajoutez un produit pour commencer.
            </td>
        </tr>
    `);

    calculatePurchase();
}

async function handlePurchaseSubmit(event) {
    event.preventDefault();

    const lines = readPurchaseLines();

    if (!lines.length) {
        toast("Ajoutez au moins un produit à l'achat.", "error");
        return;
    }

    const currency = validCurrency($("#purchaseCurrency")?.value || "USD");

    const units = lines.reduce(
        (sum, line) => sum + line.quantity,
        0
    );

    const total = roundMoney(
        lines.reduce(
            (sum, line) => sum + line.quantity * line.unitCost,
            0
        )
    );

    const purchase = {
        id: uid("PUR"),
        reference: $("#purchaseReference")?.value || generateReference("ACH"),
        date: normalizeDate($("#purchaseDate")?.value) || nowISO(),
        supplier: $("#purchaseSupplier")?.value.trim() || "",
        currency,
        notes: $("#purchaseNotes")?.value.trim() || "",
        lines,
        units,
        total,
        status: "validated",
        createdAt: nowISO()
    };

    showLoading("Enregistrement de l'achat...");

    // Une seule sauvegarde initiale par produit, même si
    // le produit apparaît sur plusieurs lignes de l'achat.
    const productIds = [...new Set(lines.map(line => line.productId))];

    const snapshots = productIds.map(productId => {
        const product = getProduct(productId);

        return product
            ? {
                product,
                stock: productStock(product),
                purchasePrice: product.purchasePrice,
                lastPurchaseCost: product.lastPurchaseCost
            }
            : null;
    }).filter(Boolean);

    try {
        try {
            for (const productId of productIds) {
                const product = getProduct(productId);

                if (!product) {
                    throw new Error("Un produit de l'achat n'existe plus.");
                }

                const productLines = lines.filter(
                    line => line.productId === productId
                );

                const addedQuantity = productLines.reduce(
                    (sum, line) => sum + line.quantity,
                    0
                );

                const addedCost = productLines.reduce(
                    (sum, line) => sum + line.quantity * line.unitCost,
                    0
                );

                const purchaseUnitCost = addedQuantity > 0
                    ? addedCost / addedQuantity
                    : 0;

                const oldStock = productStock(product);
                const newStock = oldStock + addedQuantity;

                if (
                    state.settings.costMethod === "weighted-average" &&
                    newStock > 0
                ) {
                    const purchaseCostInProductCurrency = convertCurrency(
                        purchaseUnitCost,
                        currency,
                        productCurrency(product)
                    );

                    if (purchaseCostInProductCurrency !== null) {
                        product.purchasePrice = roundMoney(
                            (
                                oldStock * productCost(product) +
                                addedQuantity * purchaseCostInProductCurrency
                            ) / newStock
                        );
                    }
                } else if (state.settings.costMethod === "fifo") {
                    product.lastPurchaseCost = purchaseUnitCost;
                }

                product.stock = newStock;
                product.updatedAt = nowISO();

                await writeOne("products", product);
            }

            await writeOne("purchases", purchase);
            state.purchases.push(purchase);
        } catch (error) {
            snapshots.forEach(snapshot => {
                snapshot.product.stock = snapshot.stock;
                snapshot.product.purchasePrice = snapshot.purchasePrice;
                snapshot.product.lastPurchaseCost = snapshot.lastPurchaseCost;
            });

            await Promise.all(
                snapshots.map(snapshot =>
                    writeOne("products", snapshot.product)
                )
            );

            throw error;
        }

        markSaved();
        resetPurchaseForm();
        renderAll();

        toast(`Achat ${purchase.reference} enregistré.`, "success");
    } finally {
        hideLoading();
    }
}

async function savePurchaseDraft() {
    const draft = {
        id: uid("DRAFT"),
        type: "purchase",
        reference: $("#purchaseReference")?.value || generateReference("BROUILLON"),
        date: $("#purchaseDate")?.value || localDateTimeValue(),
        currency: validCurrency($("#purchaseCurrency")?.value),
        supplier: $("#purchaseSupplier")?.value || "",
        notes: $("#purchaseNotes")?.value || "",
        lines: readPurchaseLines(),
        updatedAt: nowISO()
    };

    state.drafts.push(draft);

    await writeOne("drafts", draft);

    toast("Brouillon d'achat enregistré.", "success");
}

function renderPurchasesHistory() {
    const tbody = byId("purchasesHistoryBody");
    if (!tbody) return;

    const purchases = [...state.purchases]
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    if (!purchases.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-cell">
                    Aucun achat enregistré.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = purchases.map(purchase => `
        <tr>
            <td>${formatDate(purchase.date)}</td>
            <td>${safeText(purchase.reference)}</td>
            <td>${safeText(purchase.supplier || "—")}</td>
            <td>${safeText((purchase.lines || []).map(line => line.name).join(", "))}</td>
            <td>${formatNumber(purchase.units, 0)}</td>
            <td>${formatMoney(purchase.total, purchase.currency)}</td>
            <td>
                <button type="button"
                        class="button button-small button-secondary"
                        data-action="view-transaction"
                        data-type="purchase"
                        data-id="${safeText(purchase.id)}">
                    Détails
                </button>
            </td>
        </tr>
    `).join("");
}





    /* ========================================================
       8. INVENTAIRE PHYSIQUE ET SORTIES
    ======================================================== */

    function loadInventoryLines() {
        const tbody = byId("inventoryLinesBody");
        if (!tbody) return;

        const products = activeProducts();
        if (!products.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-cell">Aucun produit à inventorier.</td></tr>';
            calculateInventory();
            return;
        }

        tbody.innerHTML = products.map(product => `
            <tr class="inventory-line" data-product-id="${safeText(product.id)}">
                <td>${product.slot}</td>
                <td>${safeText(product.name)}</td>
                <td class="inventory-theoretical">${formatNumber(productStock(product), 0)}</td>
                <td>
                    <input class="inventory-physical" type="number" min="0" step="1"
                           value="${productStock(product)}" inputmode="numeric"
                           aria-label="Stock physique pour ${safeText(product.name)}">
                </td>
                <td class="inventory-variance">0</td>
                <td class="inventory-cost">${formatMoney(productCost(product), productCurrency(product))}</td>
                <td class="inventory-variance-value">${formatMoney(0, productCurrency(product))}</td>
            </tr>
        `).join("");

        calculateInventory();
    }

    function calculateInventory() {
        let positive = 0;
        let negative = 0;
        let total = 0;
        let count = 0;

        $$("#inventoryLinesBody .inventory-line").forEach(row => {
            const product = getProduct(row.dataset.productId);
            if (!product) return;

            const theoretical = productStock(product);
            const physical = integer($(".inventory-physical", row)?.value, 0);
            const variance = physical - theoretical;
            const value = roundMoney(variance * productCost(product));

            setLineText(row, ".inventory-variance", formatNumber(variance, 0));
            setLineText(row, ".inventory-variance-value",
                formatMoney(value, productCurrency(product)));

            if (variance > 0) positive += variance;
            if (variance < 0) negative += Math.abs(variance);

            total += variance;
            count++;
        });

        setText("inventoryProductCount", count);
        setText("inventoryPositiveVariance", positive);
        setText("inventoryNegativeVariance", negative);
        setText("inventoryTotalVariance", total);
    }

    function resetInventory() {
        const form = byId("inventoryForm");
        if (form) form.reset();

        setValue("inventoryDate", localDateTimeValue());
        setValue("inventoryReference", generateReference("INV"));
        setHTML("inventoryLinesBody", `
            <tr><td colspan="7" class="empty-cell">Lancez une session pour afficher les produits.</td></tr>
        `);

        calculateInventory();
    }

    async function handleInventorySubmit(event) {
        event.preventDefault();

        const rows = $$("#inventoryLinesBody .inventory-line");
        if (!rows.length) {
            toast("Chargez d'abord les stocks théoriques.", "error");
            return;
        }

        const lines = rows.map(row => {
            const product = getProduct(row.dataset.productId);
            if (!product) return null;

            const theoretical = productStock(product);
            const physical = integer($(".inventory-physical", row)?.value, 0);

            return {
                productId: product.id,
                slot: product.slot,
                name: product.name,
                theoretical,
                physical,
                variance: physical - theoretical,
                unitCost: productCost(product),
                currency: productCurrency(product)
            };
        }).filter(Boolean);

        const inventory = {
            id: uid("INV"),
            reference: $("#inventoryReference")?.value || generateReference("INV"),
            date: normalizeDate($("#inventoryDate")?.value) || nowISO(),
            notes: $("#inventoryNotes")?.value.trim() || "",
            lines,
            totalVariance: lines.reduce((sum, line) => sum + line.variance, 0),
            status: "counted",
            createdAt: nowISO()
        };

        openConfirm(
            "Enregistrer l'inventaire",
            "La session sera conservée dans l'historique. Les écarts seront enregistrés, mais le stock théorique ne sera pas modifié automatiquement. Voulez-vous continuer ?",
            async () => {
                await writeOne("inventories", inventory);
                state.inventories.push(inventory);
                renderAll();
                resetInventory();
                toast("Session d'inventaire enregistrée.", "success");
            }
        );
    }

    async function handleStockExitSubmit(event) {
        event.preventDefault();

        const product = getProduct($("#stockExitProduct")?.value || "");
        const quantity = integer($("#stockExitQuantity")?.value, 0);
        const reason = $("#stockExitReason")?.value || "";

        if (!product || quantity < 1 || !reason) {
            toast("Complétez tous les champs obligatoires.", "error");
            return;
        }

        if (quantity > productStock(product)) {
            toast(`Stock insuffisant. Stock disponible : ${productStock(product)}.`, "error");
            return;
        }

        const exit = {
            id: uid("OUT"),
            reference: generateReference("SOR"),
            date: normalizeDate($("#stockExitDate")?.value) || nowISO(),
            productId: product.id,
            productName: product.name,
            slot: product.slot,
            quantity,
            unitCost: productCost(product),
            currency: productCurrency(product),
            reason,
            notes: $("#stockExitNotes")?.value.trim() || "",
            status: "validated",
            createdAt: nowISO()
        };

        const previousStock = productStock(product);

        try {
            product.stock = previousStock - quantity;
            product.updatedAt = nowISO();

            await writeOne("products", product);
            await writeOne("stockExits", exit);

            state.stockExits.push(exit);
            byId("stockExitForm")?.reset();
            setValue("stockExitDate", localDateTimeValue());

            renderAll();
            toast("Sortie de stock enregistrée.", "success");
        } catch (error) {
            product.stock = previousStock;
            await writeOne("products", product);
            throw error;
        }
    }

    function reasonLabel(reason) {
        const labels = {
            damage: "Casse ou détérioration",
            loss: "Perte",
            "personal-use": "Utilisation interne",
            adjustment: "Ajustement autorisé",
            other: "Autre"
        };
        return labels[reason] || reason || "—";
    }

    function renderInventoryHistory() {
        const tbody = byId("inventoryHistoryBody");
        if (!tbody) return;

        const items = [...state.inventories].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        if (!items.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">Aucun inventaire enregistré.</td></tr>';
            return;
        }

        tbody.innerHTML = items.map(item => `
            <tr>
                <td>${formatDate(item.date)}</td>
                <td>${safeText(item.reference)}</td>
                <td>${(item.lines || []).length}</td>
                <td>${formatNumber(item.totalVariance, 0)}</td>
                <td>${safeText(item.notes || "—")}</td>
                <td>
                    <button type="button" class="button button-small button-secondary"
                            data-action="view-transaction" data-type="inventory" data-id="${safeText(item.id)}">Détails</button>
                </td>
            </tr>
        `).join("");
    }

    function renderStockExits() {
        const tbody = byId("stockExitsBody");
        if (!tbody) return;

        const items = [...state.stockExits].sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        );

        if (!items.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="empty-cell">Aucune sortie enregistrée.</td></tr>';
            return;
        }

        tbody.innerHTML = items.map(item => `
            <tr>
                <td>${formatDate(item.date)}</td>
                <td>${safeText(item.productName)}</td>
                <td>${formatNumber(item.quantity, 0)}</td>
                <td>${safeText(reasonLabel(item.reason))}</td>
                <td>${safeText(item.notes || "—")}</td>
                <td>
                    <button type="button" class="button button-small button-secondary"
                            data-action="view-transaction" data-type="stock-exit" data-id="${safeText(item.id)}">Détails</button>
                </td>
            </tr>
        `).join("");
    }

    /* ========================================================
       9. TABLEAU DE BORD
    ======================================================== */

    function validSales() {
        return state.sales.filter(sale => sale.status === "validated");
    }

    function dashboardTotalByCurrency(field, currency) {
        return roundMoney(validSales().reduce((sum, sale) => {
            if (validCurrency(sale.currency) !== currency) return sum;
            return sum + toNumber(sale[field]);
        }, 0));
    }

    function renderDashboard() {
        const currency = validCurrency(state.settings.displayCurrency || "USD");

        setText("dashboardRevenue", formatMoney(dashboardTotalByCurrency("revenue", currency), currency));
        setText("dashboardProfit", formatMoney(dashboardTotalByCurrency("profit", currency), currency));
        setText("dashboardStockValue", formatMoney(stockValue(currency), currency));
        setText("dashboardOutOfStock", getOutOfStockProducts().length);

        const alerts = byId("dashboardStockAlerts");
        if (alerts) {
            const low = getLowStockProducts();
            const out = getOutOfStockProducts();

            const combined = [
                ...out.map(product => ({ product, level: "danger", label: "Rupture de stock" })),
                ...low.map(product => ({ product, level: "warning", label: "Stock faible" }))
            ].slice(0, 8);

            alerts.innerHTML = combined.length
                ? combined.map(item => `
                    <div class="stock-alert stock-alert-${item.level}">
                        <span class="stock-alert-dot" aria-hidden="true">●</span>
                        <div>
                            <strong>${safeText(item.product.name)}</strong>
                            <small>${item.label} — ${formatNumber(productStock(item.product), 0)} unité(s)</small>
                        </div>
                        <button type="button" class="text-button"
                                data-action="edit-product" data-id="${safeText(item.product.id)}">Voir</button>
                    </div>
                `).join("")
                : '<p class="empty-state">Aucune alerte de stock.</p>';
        }

        const tbody = byId("recentActivityBody");
        if (tbody) {
            const operations = allOperations()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .slice(0, 8);

            tbody.innerHTML = operations.length
                ? operations.map(item => `
                    <tr>
                        <td>${formatDate(item.date)}</td>
                        <td>${safeText(item.reference || "—")}</td>
                        <td>${safeText(item.label)}</td>
                        <td>${item.amount === null ? "—" : formatMoney(item.amount, item.currency)}</td>
                        <td><span class="status-badge status-${item.status === "validated" || item.status === "counted" ? "success" : "neutral"}">${safeText(item.statusLabel)}</span></td>
                    </tr>
                `).join("")
                : '<tr><td colspan="5" class="empty-cell">Aucune opération enregistrée.</td></tr>';
        }
    }

    /* ========================================================
       10. HISTORIQUE ET DÉTAILS
    ======================================================== */

    function allOperations() {
        const result = [];

        state.sales.forEach(item => result.push({
            ...item, type: "sale", label: "Vente",
            amount: toNumber(item.revenue), statusLabel: "Validée"
        }));

        state.purchases.forEach(item => result.push({
            ...item, type: "purchase", label: "Achat",
            amount: toNumber(item.total), statusLabel: "Validé"
        }));

        state.inventories.forEach(item => result.push({
            ...item, type: "inventory", label: "Inventaire",
            amount: null, statusLabel: "Compté"
        }));

        state.stockExits.forEach(item => result.push({
            ...item, type: "stock-exit", label: "Sortie de stock",
            amount: null, statusLabel: "Validée"
        }));

        return result;
    }

    function getFilteredHistory() {
        const type = $("#historyType")?.value || "all";
        const start = $("#historyStartDate")?.value || "";
        const end = $("#historyEndDate")?.value || "";
        const search = ($("#historySearch")?.value || "").trim().toLowerCase();

        return allOperations()
            .filter(item => {
                if (type !== "all" && item.type !== type) return false;

                const day = String(item.date || "").slice(0, 10);
                if (start && day < start) return false;
                if (end && day > end) return false;

                const searchable = [
                    item.reference,
                    item.customer,
                    item.supplier,
                    item.productName,
                    item.notes,
                    ...(item.lines || []).map(line => line.name)
                ].join(" ").toLowerCase();

                return !search || searchable.includes(search);
            })
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    function renderHistory() {
        const tbody = byId("historyTableBody");
        if (!tbody) return;

        state.historyFiltered = getFilteredHistory();

        const total = state.historyFiltered.length;
        const pages = Math.max(1, Math.ceil(total / state.historyPageSize));

        state.historyPage = Math.max(1, Math.min(state.historyPage, pages));

        const startIndex = (state.historyPage - 1) * state.historyPageSize;
        const visible = state.historyFiltered.slice(
            startIndex,
            startIndex + state.historyPageSize
        );

        setText("historyResultCount", `${total} opération${total === 1 ? "" : "s"}`);
        setText("historyPageInfo", `Page ${state.historyPage} / ${pages}`);

        if (!visible.length) {
            tbody.innerHTML = '<tr><td colspan="8" class="empty-cell">Aucune opération ne correspond aux filtres.</td></tr>';
            return;
        }

        tbody.innerHTML = visible.map(item => {
            const amount = item.amount === null || item.amount === undefined
                ? "—"
                : formatMoney(item.amount, item.currency);

            let detail = "";
            if (item.type === "sale" || item.type === "purchase") {
                detail = (item.lines || []).map(line => line.name).join(", ");
            } else if (item.type === "stock-exit") {
                detail = `${item.productName} × ${item.quantity}`;
            } else {
                detail = `${(item.lines || []).length} produit(s) compté(s)`;
            }

            return `
                <tr>
                    <td>${formatDate(item.date)}</td>
                    <td>${safeText(item.reference || "—")}</td>
                    <td>${safeText(item.label)}</td>
                    <td>${safeText(detail || "—")}</td>
                    <td>${amount}</td>
                    <td>${safeText(item.currency || "—")}</td>
                    <td><span class="status-badge status-success">${safeText(item.statusLabel)}</span></td>
                    <td>
                        <button type="button" class="button button-small button-secondary"
                                data-action="view-transaction"
                                data-type="${safeText(item.type)}"
                                data-id="${safeText(item.id)}">Détails</button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function getTransaction(type, id) {
        const mapping = {
            sale: state.sales,
            purchase: state.purchases,
            inventory: state.inventories,
            "stock-exit": state.stockExits
        };

        return (mapping[type] || []).find(item => item.id === id) || null;
    }

    function viewTransaction(type, id) {
        const item = getTransaction(type, id);
        if (!item) {
            toast("Opération introuvable.", "error");
            return;
        }

        state.selectedHistory = { type, id };

        let html = `
            <dl class="detail-list">
                <dt>Référence</dt><dd>${safeText(item.reference || "—")}</dd>
                <dt>Date</dt><dd>${formatDate(item.date)}</dd>
                <dt>Type</dt><dd>${safeText(type)}</dd>
            `;

        if (type === "sale") {
            html += `
                <dt>Client</dt><dd>${safeText(item.customer || "—")}</dd>
                <dt>Chiffre d'affaires</dt><dd>${formatMoney(item.revenue, item.currency)}</dd>
                <dt>Coût des produits vendus</dt><dd>${formatMoney(item.cost, item.currency)}</dd>
                <dt>Bénéfice brut</dt><dd>${formatMoney(item.profit, item.currency)}</dd>
            `;
        } else if (type === "purchase") {
            html += `
                <dt>Fournisseur</dt><dd>${safeText(item.supplier || "—")}</dd>
                <dt>Total</dt><dd>${formatMoney(item.total, item.currency)}</dd>
            `;
        } else if (type === "stock-exit") {
            html += `
                <dt>Produit</dt><dd>${safeText(item.productName)}</dd>
                <dt>Quantité</dt><dd>${formatNumber(item.quantity, 0)}</dd>
                <dt>Motif</dt><dd>${safeText(reasonLabel(item.reason))}</dd>
                <dt>Commentaires</dt><dd>${safeText(item.notes || "—")}</dd>
            `;
        } else {
            html += `
                <dt>Nombre de lignes</dt><dd>${(item.lines || []).length}</dd>
                <dt>Écart total</dt><dd>${formatNumber(item.totalVariance, 0)}</dd>
                <dt>Observations</dt><dd>${safeText(item.notes || "—")}</dd>
            `;
        }

        html += "</dl>";

        if (Array.isArray(item.lines) && item.lines.length) {
            html += `
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Produit</th><th>Quantité</th><th>Prix unitaire</th><th>Total</th></tr></thead>
                        <tbody>
                            ${item.lines.map(line => {
                                const quantity = toNumber(line.quantity ?? line.physical ?? 0);
                                const unit = toNumber(line.unitPrice ?? line.unitCost ?? 0);
                                return `<tr>
                                    <td>${safeText(line.name || "—")}</td>
                                    <td>${formatNumber(quantity, 0)}</td>
                                    <td>${formatMoney(unit, line.currency || item.currency || "USD")}</td>
                                    <td>${formatMoney(quantity * unit, line.currency || item.currency || "USD")}</td>
                                </tr>`;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            `;
        }

        if (item.notes) {
            html += `<p><strong>Notes :</strong> ${safeText(item.notes)}</p>`;
        }

        setHTML("historyDetails", html);
        showDetails(`Détails — ${item.reference || type}`, html);
    }

    function closeHistoryDetails() {
        state.selectedHistory = null;
        setHTML("historyDetails", '<p class="empty-state">Sélectionnez une opération dans l’historique.</p>');
    }

    /* ========================================================
       11. RAPPORTS
    ======================================================== */

    function reportRange() {
        const type = $("#reportType")?.value || "daily";
        const date = $("#reportDate")?.value || localDateValue();
        const month = $("#reportMonth")?.value || date.slice(0, 7);
        const year = integer($("#reportYear")?.value, new Date().getFullYear());
        let start = "";
        let end = "";
        let label = "";

        if (type === "daily") {
            start = date;
            end = date;
            label = `Journée du ${date}`;
        } else if (type === "monthly") {
            const [y, m] = month.split("-").map(Number);
            if (!y || !m) throw new Error("Sélectionnez un mois valide.");
            start = `${month}-01`;
            end = localDateValue(new Date(y, m, 0));
            label = `Mois de ${month}`;
        } else if (type === "yearly") {
            start = `${year}-01-01`;
            end = `${year}-12-31`;
            label = `Année ${year}`;
        } else if (type === "custom") {
            start = $("#reportStartDate")?.value || "";
            end = $("#reportEndDate")?.value || "";
            if (!start || !end) throw new Error("Choisissez les deux dates de la période.");
            if (start > end) throw new Error("La date de début doit précéder la date de fin.");
            label = `Du ${start} au ${end}`;
        } else {
            start = $("#reportStartDate")?.value || "0001-01-01";
            end = $("#reportEndDate")?.value || localDateValue();
            label = `Du ${start} au ${end}`;
        }

        return { type, start, end, label };
    }

    function isInRange(date, start, end) {
        const day = String(date || "").slice(0, 10);
        return day >= start && day <= end;
    }

    function generateReportData() {
        const range = reportRange();
        const currency = validCurrency($("#reportCurrency")?.value || "USD");
        const productFilter = $("#reportProductFilter")?.value || "all";

        const sales = validSales().filter(sale =>
            isInRange(sale.date, range.start, range.end) &&
            sale.currency === currency &&
            (productFilter === "all" || sale.lines.some(line => line.productId === productFilter))
        );

        const purchases = state.purchases.filter(purchase =>
            isInRange(purchase.date, range.start, range.end) &&
            purchase.currency === currency
        );

        const saleLines = sales.flatMap(sale => {
            const lines = productFilter === "all"
                ? sale.lines
                : sale.lines.filter(line => line.productId === productFilter);

            return lines.map(line => ({
                ...line,
                saleDate: sale.date,
                saleReference: sale.reference
            }));
        });

        const revenue = roundMoney(saleLines.reduce((sum, line) =>
            sum + line.quantity * line.unitPrice, 0
        ));

        const cost = roundMoney(saleLines.reduce((sum, line) =>
            sum + line.quantity * line.unitCost, 0
        ));

        const units = saleLines.reduce((sum, line) => sum + integer(line.quantity), 0);

        const purchasesTotal = roundMoney(purchases.reduce((sum, purchase) =>
            sum + purchase.total, 0
        ));

        const productPerformance = activeProducts()
            .filter(product => productFilter === "all" || product.id === productFilter)
            .map(product => {
                const lines = saleLines.filter(line => line.productId === product.id);
                const productUnits = lines.reduce((sum, line) => sum + line.quantity, 0);
                const productRevenue = roundMoney(lines.reduce((sum, line) =>
                    sum + line.quantity * line.unitPrice, 0
                ));
                const productCostTotal = roundMoney(lines.reduce((sum, line) =>
                    sum + line.quantity * line.unitCost, 0
                ));

                return {
                    product,
                    units: productUnits,
                    revenue: productRevenue,
                    cost: productCostTotal,
                    profit: roundMoney(productRevenue - productCostTotal)
                };
            });

        return {
            ...range,
            currency,
            sales,
            purchases,
            saleLines,
            units,
            revenue,
            cost,
            profit: roundMoney(revenue - cost),
            purchasesTotal,
            productPerformance,
            stockValue: stockValue(currency),
            stockouts: getOutOfStockProducts().length
        };
    }

    function renderReport(report) {
        setText("reportSalesCount", report.sales.length);
        setText("reportUnitsSold", formatNumber(report.units, 0));
        setText("reportRevenue", formatMoney(report.revenue, report.currency));
        setText("reportCostOfGoods", formatMoney(report.cost, report.currency));
        setText("reportGrossProfit", formatMoney(report.profit, report.currency));
        setText("reportPurchasesTotal", formatMoney(report.purchasesTotal, report.currency));
        setText("reportStockValue", formatMoney(report.stockValue, report.currency));
        setText("reportStockouts", report.stockouts);
        setText("reportPeriodLabel", report.label);

        setHTML("reportSummary", `
            <div class="report-summary-grid">
                <div><span>Ventes validées</span><strong>${report.sales.length}</strong></div>
                <div><span>Quantités vendues</span><strong>${formatNumber(report.units, 0)}</strong></div>
                <div><span>Revenus</span><strong>${formatMoney(report.revenue, report.currency)}</strong></div>
                <div><span>Coût des produits</span><strong>${formatMoney(report.cost, report.currency)}</strong></div>
                <div><span>Bénéfice brut</span><strong>${formatMoney(report.profit, report.currency)}</strong></div>
                <div><span>Achats</span><strong>${formatMoney(report.purchasesTotal, report.currency)}</strong></div>
            </div>
            <p class="form-help">Les calculs sont basés sur les transactions validées dans la devise ${report.currency}. Les montants dans d'autres devises ne sont pas additionnés.</p>
        `);

        const salesBody = byId("reportSalesBody");
        if (salesBody) {
            salesBody.innerHTML = report.sales.length
                ? report.sales.map(sale => {
                    const lines = report.saleLines.filter(line => line.saleReference === sale.reference);
                    const totals = transactionTotals(lines);

                    return `<tr>
                        <td>${formatDate(sale.date)}</td>
                        <td>${safeText(sale.reference)}</td>
                        <td>${safeText(lines.map(line => line.name).join(", "))}</td>
                        <td>${formatNumber(totals.units, 0)}</td>
                        <td>${formatMoney(totals.revenue, report.currency)}</td>
                        <td>${formatMoney(totals.cost, report.currency)}</td>
                        <td>${formatMoney(totals.profit, report.currency)}</td>
                        <td>${report.currency}</td>
                    </tr>`;
                }).join("")
                : '<tr><td colspan="8" class="empty-cell">Aucune vente validée pour cette période et cette devise.</td></tr>';
        }

        const productsBody = byId("reportProductsBody");
        if (productsBody) {
            productsBody.innerHTML = report.productPerformance.map(item => {
                const product = item.product;
                const status = productStatus(product);

                return `<tr>
                    <td>${product.slot}</td>
                    <td>${safeText(product.name)}</td>
                    <td>${formatNumber(item.units, 0)}</td>
                    <td>${formatMoney(item.revenue, report.currency)}</td>
                    <td>${formatMoney(item.cost, report.currency)}</td>
                    <td>${formatMoney(item.profit, report.currency)}</td>
                    <td>${formatNumber(productStock(product), 0)}</td>
                    <td><span class="status-badge status-${status.css}">${status.label}</span></td>
                </tr>`;
            }).join("") || '<tr><td colspan="8" class="empty-cell">Aucun produit.</td></tr>';
        }
    }

    function generateReport() {
        try {
            const report = generateReportData();
            renderReport(report);
            toast("Rapport calculé à partir des données enregistrées.", "success");
        } catch (error) {
            toast(error.message, "error");
        }
    }

    function comparePeriods() {
        const startA = $("#comparisonStartA")?.value;
        const endA = $("#comparisonEndA")?.value;
        const startB = $("#comparisonStartB")?.value;
        const endB = $("#comparisonEndB")?.value;
        const currency = validCurrency($("#reportCurrency")?.value || "USD");

        if (!startA || !endA || !startB || !endB ||
            startA > endA || startB > endB) {
            toast("Configurez correctement les deux périodes.", "error");
            return;
        }

        function totals(start, end) {
            const sales = validSales().filter(sale =>
                isInRange(sale.date, start, end) && sale.currency === currency
            );

            return {
                sales: sales.length,
                units: sales.reduce((sum, sale) => sum + integer(sale.units), 0),
                revenue: roundMoney(sales.reduce((sum, sale) => sum + sale.revenue, 0)),
                cost: roundMoney(sales.reduce((sum, sale) => sum + sale.cost, 0)),
                profit: roundMoney(sales.reduce((sum, sale) => sum + sale.profit, 0))
            };
        }

        const a = totals(startA, endA);
        const b = totals(startB, endB);

        const metrics = [
            ["Nombre de ventes", a.sales, b.sales],
            ["Quantités vendues", a.units, b.units],
            ["Chiffre d'affaires", a.revenue, b.revenue],
            ["Coût des produits vendus", a.cost, b.cost],
            ["Bénéfice brut", a.profit, b.profit]
        ];

        const tbody = byId("comparisonTableBody");
        if (!tbody) return;

        tbody.innerHTML = metrics.map(([label, valueA, valueB]) => {
            const variation = valueA === 0
                ? (valueB === 0 ? "0 %" : "N/A")
                : `${formatNumber(((valueB - valueA) / Math.abs(valueA)) * 100, 2)} %`;

            const decimals = typeof valueA === "number" &&
                !Number.isInteger(valueA) ? 2 : 0;

            const formatValue = value =>
                decimals
                    ? formatMoney(value, currency)
                    : formatNumber(value, 0);

            return `<tr>
                <td>${label}</td>
                <td>${formatValue(valueA)}</td>
                <td>${formatValue(valueB)}</td>
                <td>${variation}</td>
            </tr>`;
        }).join("");

        toast("Comparaison des périodes terminée.", "success");
    }

    function resetReportFilters() {
        setValue("reportType", "daily");
        setValue("reportDate", localDateValue());
        setValue("reportMonth", localDateValue().slice(0, 7));
        setValue("reportYear", new Date().getFullYear());
        setValue("reportStartDate", "");
        setValue("reportEndDate", "");
        setValue("reportCurrency", state.settings.displayCurrency || "USD");
        setValue("reportProductFilter", "all");

        generateReport();
    }

    /* ========================================================
       12. PARAMÈTRES
    ======================================================== */

    function fillSettingsForms() {
        const s = state.settings;

        setValue("businessName", s.businessName);
        setValue("businessPhone", s.businessPhone);
        setValue("businessEmail", s.businessEmail);
        setValue("businessAddress", s.businessAddress);

        setValue("baseCurrency", s.baseCurrency);
        setValue("rateHTG", s.rates.HTG ?? "");
        setValue("rateUSD", s.rates.USD ?? "");
        setValue("rateEUR", s.rates.EUR ?? "");
        setValue("exchangeRateDate", s.exchangeRateDate || "");

        setValue("costMethod", s.costMethod);
        setValue("defaultLowStock", s.defaultLowStock);
        setValue("autoRefreshMinutes", s.autoRefreshMinutes);

        setValue("themePreference", s.themePreference);
        setValue("languagePreference", s.languagePreference);
        setValue("numberFormat", s.numberFormat);
    }

    async function saveBusinessSettings(event) {
        event.preventDefault();

        state.settings.businessName = $("#businessName")?.value.trim() || "";
        state.settings.businessPhone = $("#businessPhone")?.value.trim() || "";
        state.settings.businessEmail = $("#businessEmail")?.value.trim() || "";
        state.settings.businessAddress = $("#businessAddress")?.value.trim() || "";

        await saveSettings();
        toast("Informations de l'entreprise enregistrées.", "success");
    }

    async function saveCurrencySettings(event) {
        event.preventDefault();

        const base = validCurrency($("#baseCurrency")?.value);
        const htg = $("#rateHTG")?.value;
        const usd = $("#rateUSD")?.value;
        const eur = $("#rateEUR")?.value;

        const values = { HTG: htg, USD: usd, EUR: eur };

        for (const currency of VALID_CURRENCIES) {
            if (values[currency] !== "" && values[currency] !== undefined) {
                const value = toNumber(values[currency], NaN);
                if (!Number.isFinite(value) || value <= 0) {
                    toast(`Le taux ${currency} doit être supérieur à zéro.`, "error");
                    return;
                }
            }
        }

        if (!values[base] || toNumber(values[base], 0) <= 0) {
            toast("Saisissez le taux de la devise de référence.", "error");
            return;
        }

        state.settings.baseCurrency = base;
        state.settings.rates = {
            HTG: htg === "" ? null : toNumber(htg),
            USD: usd === "" ? null : toNumber(usd),
            EUR: eur === "" ? null : toNumber(eur)
        };

        state.settings.exchangeRateDate = $("#exchangeRateDate")?.value || "";

        await saveSettings();
        renderAll();
        toast("Taux enregistrés. Les transactions historiques restent inchangées.", "success");
    }

    async function resetExchangeRates() {
        openConfirm(
            "Réinitialiser les taux",
            "Les taux configurés seront effacés, sauf la référence 1 de la devise de base. Les montants historiques ne seront pas modifiés.",
            async () => {
                const base = state.settings.baseCurrency || "USD";
                state.settings.rates = { HTG: null, USD: null, EUR: null };
                state.settings.rates[base] = 1;
                state.settings.exchangeRateDate = "";

                await saveSettings();
                fillSettingsForms();
                renderAll();
                toast("Taux réinitialisés.", "success");
            }
        );
    }

    async function saveStockSettings(event) {
        event.preventDefault();

        const threshold = integer($("#defaultLowStock")?.value, 5);
        const refreshMinutes = Math.max(1, integer($("#autoRefreshMinutes")?.value, 10));
        const method = $("#costMethod")?.value;

        if (!["weighted-average", "fifo"].includes(method)) {
            toast("Méthode de coût non reconnue.", "error");
            return;
        }

        state.settings.costMethod = method;
        state.settings.defaultLowStock = threshold;
        state.settings.autoRefreshMinutes = refreshMinutes;

        await saveSettings();
        configureAutoRefresh();
        renderAll();
        toast("Paramètres de stock enregistrés.", "success");
    }

    async function saveDisplaySettings(event) {
        event.preventDefault();

        state.settings.themePreference = $("#themePreference")?.value || "system";
        state.settings.languagePreference = $("#languagePreference")?.value || "fr";
        state.settings.numberFormat = $("#numberFormat")?.value || "fr-FR";

        applyTheme();
        await saveSettings();
        renderAll();
        toast("Préférences enregistrées.", "success");
    }

    function applyTheme() {
        const preference = state.settings.themePreference || "system";
        const root = document.documentElement;

        if (preference === "system") {
            root.dataset.theme = window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
        } else {
            root.dataset.theme = preference;
        }
    }

    /* ========================================================
       13. NAVIGATION
    ======================================================== */

    const VIEW_NAMES = {
        dashboard: "Tableau de bord",
        products: "Produits",
        sales: "Ventes",
        purchases: "Achats",
        inventory: "Inventaire",
        history: "Historique",
        reports: "Rapports",
        settings: "Paramètres",
        backup: "Sauvegarde"
    };

    function navigate(view) {
        if (!VIEW_NAMES[view]) {
            toast("Cette page n'existe pas.", "error");
            return;
        }

        state.currentView = view;

        $$("[data-view-panel]").forEach(panel => {
            const active = panel.dataset.viewPanel === view;
            panel.hidden = !active;
            panel.classList.toggle("active", active);
        });

        $$(".nav-link[data-view]").forEach(link => {
            const active = link.dataset.view === view;
            link.classList.toggle("active", active);

            if (active) link.setAttribute("aria-current", "page");
            else link.removeAttribute("aria-current");
        });

        setText("currentPageName", VIEW_NAMES[view]);
        closeMenu();

        if (view === "products") renderProducts();
        if (view === "history") renderHistory();
        if (view === "inventory") {
            renderInventoryHistory();
            renderStockExits();
        }
        if (view === "purchases") renderPurchasesHistory();
        if (view === "sales") renderRecentSales();
        if (view === "reports") populateProductSelectors();

        window.dispatchEvent(new CustomEvent("samantha:viewchange", {
            detail: { view }
        }));
    }

    function toggleMenu() {
        const nav = byId("mainNavigation");
        const overlay = byId("navigationOverlay");
        const button = byId("menuToggle");

        if (!nav) return;

        const isOpen = nav.classList.toggle("is-open");
        if (overlay) overlay.classList.toggle("is-visible", isOpen);

        if (button) button.setAttribute("aria-expanded", String(isOpen));
    }

    function closeMenu() {
        const nav = byId("mainNavigation");
        const overlay = byId("navigationOverlay");
        const button = byId("menuToggle");

        nav?.classList.remove("is-open");
        overlay?.classList.remove("is-visible");
        if (button) button.setAttribute("aria-expanded", "false");
    }

    /* ========================================================
       14. EXPORT CSV, JSON ET RAPPORTS
    ======================================================== */

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function downloadJSON(data, filename) {
        const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: "application/json;charset=utf-8" }
        );
        downloadBlob(blob, filename);
    }

    function csvCell(value) {
        const textValue = String(value ?? "");
        return `"${textValue.replace(/"/g, '""')}"`;
    }

    function downloadCSV(rows, filename) {
        const csv = "\uFEFF" + rows.map(row =>
            row.map(csvCell).join(";")
        ).join("\r\n");

        downloadBlob(
            new Blob([csv], { type: "text/csv;charset=utf-8" }),
            filename
        );
    }

    function createBackupSnapshot() {
        return {
            schema: BACKUP_SCHEMA,
            app: "Samantha",
            version: APP_VERSION,
            createdAt: nowISO(),
            stores: {
                products: state.products,
                sales: state.sales,
                purchases: state.purchases,
                inventories: state.inventories,
                stockExits: state.stockExits,
                drafts: state.drafts,
                settings: [{
                    id: "main",
                    ...state.settings
                }],
                meta: [{
                    id: "backup",
                    lastBackupAt: nowISO()
                }]
            }
        };
    }

    async function exportBackup() {
        await saveAll();

        const snapshot = createBackupSnapshot();
        downloadJSON(snapshot, `samantha-sauvegarde-${localDateValue()}.json`);

        setText("lastBackupDate", formatDate(nowISO()));
        toast("Sauvegarde complète exportée.", "success");
    }

    function exportProducts() {
        const rows = [[
            "Emplacement", "Référence", "Produit", "Stock",
            "Prix d'achat", "Prix de vente", "Devise", "Seuil d'alerte", "Actif"
        ]];

        state.products
            .sort((a, b) => a.slot - b.slot)
            .forEach(product => rows.push([
                product.slot,
                product.reference || "",
                product.name || "",
                productStock(product),
                productCost(product),
                productPrice(product),
                productCurrency(product),
                product.lowStockThreshold ?? state.settings.defaultLowStock,
                product.active !== false
            ]));

        downloadCSV(rows, `samantha-produits-${localDateValue()}.csv`);
        toast("Catalogue exporté.", "success");
    }

    function exportHistory() {
        const rows = [[
            "Date", "Référence", "Type", "Détails", "Montant", "Devise", "Statut"
        ]];

        allOperations().sort((a, b) => new Date(b.date) - new Date(a.date))
            .forEach(item => {
                let detail = "";
                if (item.lines) detail = item.lines.map(line => `${line.name} x${line.quantity ?? line.physical ?? 0}`).join(" | ");
                else detail = `${item.productName || ""} x${item.quantity || ""}`;

                rows.push([
                    item.date,
                    item.reference,
                    item.label,
                    detail,
                    item.amount ?? "",
                    item.currency || "",
                    item.statusLabel
                ]);
            });

        downloadCSV(rows, `samantha-historique-${localDateValue()}.csv`);
        toast("Historique exporté.", "success");
    }

    function exportDashboard() {
        const currency = validCurrency(state.settings.displayCurrency);
        const rows = [
            ["Indicateur", "Valeur", "Devise"],
            ["Chiffre d'affaires validé", dashboardTotalByCurrency("revenue", currency), currency],
            ["Bénéfice brut réalisé", dashboardTotalByCurrency("profit", currency), currency],
            ["Valeur du stock", stockValue(currency), currency],
            ["Produits en rupture", getOutOfStockProducts().length, ""],
            ["Produits actifs", activeProducts().length, ""]
        ];

        downloadCSV(rows, `samantha-tableau-de-bord-${localDateValue()}.csv`);
        toast("Tableau de bord exporté.", "success");
    }

    function exportInventory() {
        const rows = [[
            "Emplacement", "Produit", "Stock actuel", "Coût unitaire", "Devise", "État"
        ]];

        activeProducts().forEach(product => rows.push([
            product.slot,
            product.name,
            productStock(product),
            productCost(product),
            productCurrency(product),
            productStatus(product).label
        ]));

        downloadCSV(rows, `samantha-inventaire-${localDateValue()}.csv`);
        toast("Inventaire exporté.", "success");
    }

    function exportReport() {
        let report;

        try {
            report = generateReportData();
        } catch (error) {
            toast(error.message, "error");
            return;
        }

        const rows = [[
            "Date", "Référence", "Produits", "Quantité",
            "Chiffre d'affaires", "Coût", "Bénéfice brut", "Devise"
        ]];

        report.sales.forEach(sale => {
            const lines = report.saleLines.filter(line =>
                line.saleReference === sale.reference
            );
            const totals = transactionTotals(lines);

            rows.push([
                sale.date,
                sale.reference,
                lines.map(line => line.name).join(", "),
                totals.units,
                totals.revenue,
                totals.cost,
                totals.profit,
                report.currency
            ]);
        });

        rows.push([]);
        rows.push(["Période", report.label]);
        rows.push(["Nombre de ventes", report.sales.length]);
        rows.push(["Quantité vendue", report.units]);
        rows.push(["Chiffre d'affaires", report.revenue, report.currency]);
        rows.push(["Coût des produits vendus", report.cost, report.currency]);
        rows.push(["Bénéfice brut", report.profit, report.currency]);
        rows.push(["Achats", report.purchasesTotal, report.currency]);

        downloadCSV(rows, `samantha-rapport-${localDateValue()}.csv`);
        toast("Rapport exporté.", "success");
    }

    /* ========================================================
       15. IMPORTATION ET RESTAURATION
    ======================================================== */

    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result || ""));
            reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
            reader.readAsText(file);
        });
    }

    function normalizeBackup(parsed) {
        if (!parsed || typeof parsed !== "object") {
            throw new Error("Le fichier JSON n'est pas un objet valide.");
        }

        let stores = parsed.stores || parsed;

        const normalized = {};

        for (const name of STORE_NAMES) {
            const records = stores[name];
            normalized[name] = Array.isArray(records) ? records : [];
        }

        if (parsed.schema && parsed.schema !== BACKUP_SCHEMA) {
            throw new Error("Le format de cette sauvegarde n'est pas reconnu.");
        }

        const settings = normalized.settings.find(item => item.id === "main");
        if (settings) {
            normalized.settings = [{
                ...structuredCloneSafe(DEFAULT_SETTINGS),
                ...settings,
                id: "main",
                rates: {
                    ...DEFAULT_SETTINGS.rates,
                    ...(settings.rates || {})
                }
            }];
        } else {
            normalized.settings = [{
                id: "main",
                ...structuredCloneSafe(DEFAULT_SETTINGS)
            }];
        }

        normalized.products.forEach(product => {
            if (!product.id || !Number.isFinite(Number(product.slot)) ||
                Number(product.slot) < 1 || Number(product.slot) > PRODUCT_SLOTS) {
                throw new Error("Un produit de la sauvegarde possède un emplacement invalide.");
            }

            if (toNumber(product.stock, -1) < 0) {
                throw new Error("Un produit possède un stock négatif.");
            }
        });

        const productIds = normalized.products.map(product => product.id);
        if (new Set(productIds).size !== productIds.length) {
            throw new Error("La sauvegarde contient des identifiants de produits en double.");
        }

        return normalized;
    }

    async function validateBackupFile(file) {
        if (!file) throw new Error("Sélectionnez un fichier JSON.");
        if (file.size > 25 * 1024 * 1024) {
            throw new Error("Le fichier dépasse la limite de 25 Mo.");
        }

        const text = await readFileAsText(file);
        let parsed;

        try {
            parsed = JSON.parse(text);
        } catch {
            throw new Error("Le fichier ne contient pas un JSON valide.");
        }

        const normalized = normalizeBackup(parsed);
        state.pendingBackup = normalized;

        setHTML("backupValidationResult", `
            <div class="validation-success">
                <strong>Fichier valide</strong>
                <p>Produits : ${normalized.products.length}</p>
                <p>Ventes : ${normalized.sales.length}</p>
                <p>Achats : ${normalized.purchases.length}</p>
                <p>Inventaires : ${normalized.inventories.length}</p>
                <p>Sorties de stock : ${normalized.stockExits.length}</p>
                <p>Vérification terminée. La restauration exige une confirmation.</p>
            </div>
        `);

        toast("Sauvegarde vérifiée. Vous pouvez la restaurer après confirmation.", "success");
    }

    async function restoreBackup() {
        if (!state.pendingBackup) {
            toast("Vérifiez d'abord le fichier de sauvegarde.", "error");
            return;
        }

        openConfirm(
            "Restaurer la sauvegarde",
            "Cette action remplacera les données actuellement enregistrées. Exportez d'abord une copie de sécurité si vous souhaitez conserver l'état actuel.",
            async () => {
                showLoading("Restauration des données...");

                try {
                    await replaceAllStores(state.pendingBackup);
                    await loadState();
                    fillSettingsForms();
                    resetSaleForm();
                    resetPurchaseForm();
                    resetInventory();
                    renderAll();

                    state.pendingBackup = null;
                    markSaved();
                    toast("Sauvegarde restaurée avec succès.", "success");
                } finally {
                    hideLoading();
                }
            },
            "Restaurer"
        );
    }

    function openBackupPicker() {
        const input = byId("backupFileInput");
        if (input) input.click();
    }

    /* ========================================================
       16. MAINTENANCE ET VÉRIFICATION
    ======================================================== */

    async function verifyDatabase() {
        showLoading("Vérification de la base de données...");

        try {
            const results = {};

            for (const name of STORE_NAMES) {
                results[name] = (await readAllFromDB(name)).length;
            }

            const brokenProducts = state.products.filter(product =>
                !product.id ||
                !Number.isFinite(Number(product.slot)) ||
                productStock(product) < 0
            );

            setText("databaseStatus",
                `${state.storageMode === "indexeddb" ? "IndexedDB" : "Stockage local"} — vérification terminée`
            );
            setText("lastSyncDate", formatDate(nowISO()));

            showDetails("Vérification de la base de données", `
                <div class="validation-success">
                    <p><strong>Mode de stockage :</strong> ${safeText(state.storageMode)}</p>
                    <p><strong>Produits :</strong> ${results.products}</p>
                    <p><strong>Ventes :</strong> ${results.sales}</p>
                    <p><strong>Achats :</strong> ${results.purchases}</p>
                    <p><strong>Inventaires :</strong> ${results.inventories}</p>
                    <p><strong>Sorties :</strong> ${results.stockExits}</p>
                    <p><strong>Produits suspects :</strong> ${brokenProducts.length}</p>
                </div>
            `);

            toast("Vérification terminée.", "success");
        } finally {
            hideLoading();
        }
    }

    async function clearCache() {
        openConfirm(
            "Réinitialiser les données temporaires",
            "Les brouillons et les filtres temporaires seront effacés. Les produits et transactions validées seront conservés.",
            async () => {
                for (const draft of state.drafts) {
                    await deleteOne("drafts", draft.id);
                }

                state.drafts = [];
                state.historyPage = 1;
                state.selectedHistory = null;

                ["productSearch", "historySearch"].forEach(id => setValue(id, ""));
                closeHistoryDetails();
                renderAll();

                toast("Données temporaires réinitialisées.", "success");
            }
        );
    }

    async function resetApplication() {
        openConfirm(
            "Réinitialiser toute l'application",
            "Cette action supprimera le catalogue, les ventes, les achats, les inventaires, les sorties, les brouillons et les paramètres personnalisés. Exportez une sauvegarde avant de continuer.",
            async () => {
                const secondConfirmation = window.prompt(
                    "Pour confirmer la suppression complète, saisissez exactement : EFFACER SAMANTHA"
                );

                if (secondConfirmation !== "EFFACER SAMANTHA") {
                    toast("Réinitialisation annulée.", "info");
                    return;
                }

                showLoading("Réinitialisation de l'application...");

                try {
                    const empty = {};
                    STORE_NAMES.forEach(name => { empty[name] = []; });
                    empty.settings = [{
                        id: "main",
                        ...structuredCloneSafe(DEFAULT_SETTINGS)
                    }];

                    await replaceAllStores(empty);

                    state.products = [];
                    state.sales = [];
                    state.purchases = [];
                    state.inventories = [];
                    state.stockExits = [];
                    state.drafts = [];
                    state.settings = structuredCloneSafe(DEFAULT_SETTINGS);

                    await loadState();
                    fillSettingsForms();
                    resetProductForm();
                    resetSaleForm();
                    resetPurchaseForm();
                    resetInventory();
                    renderAll();

                    toast("Application réinitialisée.", "success");
                } finally {
                    hideLoading();
                }
            },
            "Continuer"
        );
    }

    /* ========================================================
       17. SCÈNE 3D PLAYCANVAS
       Gestes tactiles, zoom, rotation, plein écran
    ======================================================== */

    function sceneMessage(message) {
        setText("sceneMessage", message);
        setText("engineStatus", message);
    }

    function sceneDistance(value) {
        return Math.min(24, Math.max(4, value));
    }

    function updateSceneCamera() {
        if (!state.scene || !state.scene.camera) return;

        const camera = state.scene.camera;
        const s = state.sceneState;

        const horizontal = Math.cos(s.pitch) * s.distance;

        camera.setPosition(
            s.targetX + Math.sin(s.yaw) * horizontal,
            s.targetY + Math.sin(s.pitch) * s.distance,
            s.targetZ + Math.cos(s.yaw) * horizontal
        );

        camera.lookAt(s.targetX, s.targetY, s.targetZ);
    }

    function resetScene() {
        state.sceneState = {
            yaw: -0.65,
            pitch: -0.2,
            distance: 11,
            targetX: 0,
            targetY: 0,
            targetZ: 0
        };

        updateSceneCamera();
        sceneMessage("Vue 3D réinitialisée");
    }

    function createSceneBox(app, material, x, y, z, sx, sy, sz) {
        const entity = new pc.Entity("Samantha-objet");
        entity.addComponent("model", { type: "box" });
        entity.setLocalScale(sx, sy, sz);
        entity.setPosition(x, y, z);
        entity.model.material = material;
        app.root.addChild(entity);
        return entity;
    }

    function initializeScene() {
        const canvas = byId("playcanvas");
        const loading = byId("sceneLoading");

        if (!canvas || !window.pc || !window.pc.Application) {
            if (loading) loading.hidden = true;
            sceneMessage("Mode 3D indisponible — gestion commerciale active");
            return;
        }

        try {
            const app = new pc.Application(canvas, {
                mouse: new pc.Mouse(canvas),
                touch: window.pc.TouchDevice ? new pc.TouchDevice(canvas) : undefined,
                graphicsDeviceOptions: {
                    alpha: false,
                    antialias: true,
                    powerPreference: "low-power"
                }
            });

            state.sceneEngine = app;
            app.setCanvasFillMode(pc.FILLMODE_KEEP_ASPECT);
            app.setCanvasResolution(pc.RESOLUTION_AUTO);

            app.scene.ambientLight = new pc.Color(0.35, 0.4, 0.55);

            const camera = new pc.Entity("Samantha-Camera");
            camera.addComponent("camera", {
                clearColor: new pc.Color(0.055, 0.075, 0.13),
                farClip: 100,
                nearClip: 0.1,
                fov: 50
            });

            app.root.addChild(camera);
            state.scene = { app, camera };

            const light = new pc.Entity("Samantha-Lumiere");
            light.addComponent("light", {
                type: "directional",
                color: new pc.Color(1, 0.93, 0.78),
                intensity: 1.2
            });
            light.setEulerAngles(35, 25, 0);
            app.root.addChild(light);

            const fillLight = new pc.Entity("Samantha-Lumiere-secondaire");
            fillLight.addComponent("light", {
                type: "omni",
                color: new pc.Color(0.3, 0.55, 1),
                intensity: 0.5,
                range: 25
            });
            fillLight.setPosition(-5, 4, 3);
            app.root.addChild(fillLight);

            const groundMaterial = new pc.StandardMaterial();
            groundMaterial.diffuse = new pc.Color(0.12, 0.17, 0.27);
            groundMaterial.metalness = 0.15;
            groundMaterial.gloss = 0.25;
            groundMaterial.update();

            const accentMaterial = new pc.StandardMaterial();
            accentMaterial.diffuse = new pc.Color(0.18, 0.55, 0.95);
            accentMaterial.metalness = 0.25;
            accentMaterial.gloss = 0.6;
            accentMaterial.update();

            const greenMaterial = new pc.StandardMaterial();
            greenMaterial.diffuse = new pc.Color(0.13, 0.7, 0.53);
            greenMaterial.metalness = 0.1;
            greenMaterial.update();

            createSceneBox(app, groundMaterial, 0, -0.65, 0, 12, 0.3, 8);
            createSceneBox(app, accentMaterial, -2.5, 0.2, 0, 1.4, 1.4, 1.4);
            createSceneBox(app, greenMaterial, 0, 0.4, 0, 1.5, 2, 1.5);
            createSceneBox(app, accentMaterial, 2.6, 0.15, -0.2, 1.3, 1.3, 1.3);

            for (let i = 0; i < 5; i++) {
                const material = i % 2 ? greenMaterial : accentMaterial;
                createSceneBox(
                    app,
                    material,
                    -4.5 + i * 2.25,
                    -0.25,
                    -2.7,
                    0.75,
                    0.5,
                    0.75
                );
            }

            updateSceneCamera();
            app.start();

            if (loading) loading.hidden = true;
            sceneMessage("Environnement 3D prêt");

            app.on("update", () => {
                if (!state.scene) return;
                updateSceneCamera();
            });

            app.on("destroy", () => {
                state.scene = null;
                state.sceneEngine = null;
            });

            bindSceneGestures(canvas);
        } catch (error) {
            console.error("Initialisation 3D impossible :", error);
            if (loading) loading.hidden = true;
            sceneMessage("3D indisponible — le reste de l'application fonctionne");
        }
    }

    function bindSceneGestures(canvas) {
        let pointerStart = null;
        let pinchStart = null;
        let previousTouchDistance = null;

        canvas.addEventListener("pointerdown", event => {
            if (event.pointerType === "mouse" && event.button !== 0) return;

            pointerStart = {
                x: event.clientX,
                y: event.clientY,
                yaw: state.sceneState.yaw,
                pitch: state.sceneState.pitch,
                id: event.pointerId
            };

            state.scenePointer = pointerStart;

            try {
                canvas.setPointerCapture(event.pointerId);
            } catch {
                // Certains navigateurs mobiles refusent la capture.
            }
        });

        canvas.addEventListener("pointermove", event => {
            if (!pointerStart || pointerStart.id !== event.pointerId) return;

            const dx = event.clientX - pointerStart.x;
            const dy = event.clientY - pointerStart.y;

            state.sceneState.yaw = pointerStart.yaw - dx * 0.008;
            state.sceneState.pitch = Math.max(
                -1.1,
                Math.min(1.1, pointerStart.pitch + dy * 0.006)
            );

            updateSceneCamera();
        });

        const stopPointer = event => {
            if (pointerStart && pointerStart.id === event.pointerId) {
                pointerStart = null;
                state.scenePointer = null;
            }
        };

        canvas.addEventListener("pointerup", stopPointer);
        canvas.addEventListener("pointercancel", stopPointer);

        canvas.addEventListener("wheel", event => {
            event.preventDefault();
            state.sceneState.distance = sceneDistance(
                state.sceneState.distance + Math.sign(event.deltaY) * 0.7
            );
            updateSceneCamera();
        }, { passive: false });

        canvas.addEventListener("touchstart", event => {
            if (event.touches.length === 2) {
                const a = event.touches[0];
                const b = event.touches[1];

                previousTouchDistance = Math.hypot(
                    a.clientX - b.clientX,
                    a.clientY - b.clientY
                );

                pinchStart = {
                    x: (a.clientX + b.clientX) / 2,
                    y: (a.clientY + b.clientY) / 2,
                    targetX: state.sceneState.targetX,
                    targetY: state.sceneState.targetY
                };
            }
        }, { passive: true });

        canvas.addEventListener("touchmove", event => {
            if (event.touches.length !== 2 || previousTouchDistance === null) return;

            const a = event.touches[0];
            const b = event.touches[1];
            const distance = Math.hypot(
                a.clientX - b.clientX,
                a.clientY - b.clientY
            );

            const delta = distance - previousTouchDistance;
            state.sceneState.distance = sceneDistance(
                state.sceneState.distance - delta * 0.025
            );

            if (pinchStart) {
                const centerX = (a.clientX + b.clientX) / 2;
                const centerY = (a.clientY + b.clientY) / 2;

                state.sceneState.targetX = pinchStart.targetX -
                    (centerX - pinchStart.x) * 0.008;
                state.sceneState.targetY = pinchStart.targetY +
                    (centerY - pinchStart.y) * 0.008;
            }

            previousTouchDistance = distance;
            updateSceneCamera();
        }, { passive: true });

        canvas.addEventListener("touchend", event => {
            if (event.touches.length < 2) {
                previousTouchDistance = null;
                pinchStart = null;
            }
        }, { passive: true });
    }

    function zoomScene(direction) {
        state.sceneState.distance = sceneDistance(
            state.sceneState.distance + direction * 1.1
        );
        updateSceneCamera();
    }

    function rotateScene(direction) {
        state.sceneState.yaw += direction * 0.25;
        updateSceneCamera();
    }

    async function toggleSceneFullscreen() {
        const viewport = byId("sceneViewport");
        if (!viewport) return;

        try {
            if (!document.fullscreenElement) {
                if (viewport.requestFullscreen) await viewport.requestFullscreen();
                else toast("Le plein écran n'est pas disponible sur cet appareil.", "warning");
            } else if (document.exitFullscreen) {
                await document.exitFullscreen();
            }

            state.sceneEngine?.resizeCanvas();
        } catch (error) {
            toast("Impossible d'activer le plein écran.", "error");
        }
    }

    function reloadScene() {
        if (state.sceneEngine) {
            state.sceneEngine.destroy();
            state.scene = null;
            state.sceneEngine = null;
        }

        const loading = byId("sceneLoading");
        if (loading) loading.hidden = false;

        window.setTimeout(initializeScene, 100);
    }

    /* ========================================================
       18. IMPRESSION
    ======================================================== */

    function printReport() {
        generateReport();
        window.setTimeout(() => window.print(), 100);
    }

    function printDetails() {
        const content = $("#detailsDialogContent")?.innerHTML ||
            $("#historyDetails")?.innerHTML || "";

        const title = $("#detailsDialogTitle")?.textContent || "Détails";

        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast("Autorisez les fenêtres contextuelles pour imprimer.", "warning");
            return;
        }

        printWindow.document.open();
        printWindow.document.write(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <title>${safeText(title)}</title>
                <style>
                    body{font-family:Arial,sans-serif;padding:24px;color:#111}
                    h1{font-size:22px}
                    table{border-collapse:collapse;width:100%;margin-top:18px}
                    th,td{border:1px solid #bbb;padding:8px;text-align:left}
                    dl{display:grid;grid-template-columns:180px 1fr;gap:8px}
                    dt{font-weight:bold}
                </style>
            </head>
            <body>
                <h1>${safeText(title)}</h1>
                ${content}
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }

    /* ========================================================
       19. ACTUALISATION PÉRIODIQUE
    ======================================================== */

    function configureAutoRefresh() {
        if (state.refreshHandle) {
            clearInterval(state.refreshHandle);
            state.refreshHandle = null;
        }

        const minutes = Math.max(
            1,
            integer(state.settings.autoRefreshMinutes, 10)
        );

        state.refreshHandle = window.setInterval(async () => {
            try {
                await loadState();
                renderAll();
                setText("lastSyncDate", formatDate(nowISO()));
            } catch (error) {
                console.warn("Actualisation automatique impossible.", error);
            }
        }, minutes * 60 * 1000);
    }

    async function refreshData() {
        showLoading("Actualisation des données...");

        try {
            await loadState();
            fillSettingsForms();
            renderAll();
            setText("lastSyncDate", formatDate(nowISO()));
            toast("Données actualisées.", "success");
        } finally {
            hideLoading();
        }
    }

    /* ========================================================
       20. FILTRES ET FORMULAIRES
    ======================================================== */

    function resetHistoryFilters() {
        setValue("historyType", "all");
        setValue("historyStartDate", "");
        setValue("historyEndDate", "");
        setValue("historySearch", "");
        state.historyPage = 1;
        renderHistory();
    }

    function resetProductFilters() {
        setValue("productSearch", "");
        setValue("productStockFilter", "all");
        renderProducts();
    }

    function resetStockExitForm() {
        byId("stockExitForm")?.reset();
        setValue("stockExitDate", localDateTimeValue());
    }

    function startNewSale() {
        navigate("sales");
        resetSaleForm();
        createSaleLineRow();
    }

    function startNewPurchase() {
        navigate("purchases");
        resetPurchaseForm();
        createPurchaseLineRow();
    }

    function startNewInventory() {
        navigate("inventory");
        resetInventory();
        loadInventoryLines();
    }

    function cancelForm(formId, resetFunction, title) {
        openConfirm(
            title || "Annuler l'opération",
            "Les modifications non enregistrées de ce formulaire seront perdues.",
            async () => {
                if (typeof resetFunction === "function") resetFunction();
                else byId(formId)?.reset();

                toast("Formulaire réinitialisé.", "info");
            },
            "Annuler"
        );
    }

    /* ========================================================
       21. ACTIONS CENTRALISÉES
    ======================================================== */

    async function handleAction(action, element) {
        const id = element.dataset.id || "";
        const type = element.dataset.type || "";
        const slot = element.dataset.slot || "";

        switch (action) {
            case "toggle-menu":
                toggleMenu();
                break;

            case "close-menu":
                closeMenu();
                break;

            case "navigate":
                navigate(element.dataset.view);
                break;

            case "navigate-inventory":
                navigate("inventory");
                break;

            case "navigate-history":
                navigate("history");
                break;

            case "save-all":
                await saveAll();
                break;

            case "refresh-data":
                await refreshData();
                break;

            case "new-sale":
                startNewSale();
                break;

            case "new-purchase":
                startNewPurchase();
                break;

            case "new-inventory":
                startNewInventory();
                break;

            case "open-daily-report":
                navigate("reports");
                setValue("reportType", "daily");
                setValue("reportDate", localDateValue());
                generateReport();
                break;

            case "save-products":
                await saveAll();
                break;

            case "export-products":
                exportProducts();
                break;

            case "edit-product":
                editProduct(id);
                break;

            case "delete-product":
                await deleteProduct(id);
                break;

            case "use-product-slot":
                resetProductForm();
                setValue("productSlot", slot);
                navigate("products");
                $("#productName")?.focus();
                break;

            case "reset-product-form":
                resetProductForm();
                break;

            case "cancel-product-edit":
                cancelForm("productForm", resetProductForm, "Annuler la modification");
                break;

            case "reset-product-filters":
                resetProductFilters();
                break;

            case "add-sale-line":
                createSaleLineRow();
                break;

            case "remove-sale-line":
                element.closest("tr")?.remove();
                if (!$$("#saleLinesBody .sale-line").length) {
                    setHTML("saleLinesBody", '<tr class="empty-row"><td colspan="8" class="empty-cell">Ajoutez un produit pour commencer.</td></tr>');
                }
                calculateSale();
                break;

            case "save-sale-draft":
                await saveSaleDraft();
                break;

            case "reset-sale-form":
                cancelForm("saleForm", resetSaleForm, "Réinitialiser la vente");
                break;

            case "cancel-sale":
                cancelForm("saleForm", resetSaleForm, "Annuler la vente");
                break;

            case "add-purchase-line":
                createPurchaseLineRow();
                break;

            case "remove-purchase-line":
                element.closest("tr")?.remove();
                if (!$$("#purchaseLinesBody .purchase-line").length) {
                    setHTML("purchaseLinesBody", '<tr class="empty-row"><td colspan="5" class="empty-cell">Ajoutez un produit pour commencer.</td></tr>');
                }
                calculatePurchase();
                break;

            case "save-purchase-draft":
                await savePurchaseDraft();
                break;

            case "reset-purchase-form":
                cancelForm("purchaseForm", resetPurchaseForm, "Réinitialiser l'achat");
                break;

            case "cancel-purchase":
                cancelForm("purchaseForm", resetPurchaseForm, "Annuler l'achat");
                break;

            case "load-inventory-count":
                loadInventoryLines();
                toast("Stocks théoriques chargés.", "success");
                break;

            case "recalculate-inventory":
                calculateInventory();
                toast("Écarts recalculés.", "success");
                break;

            case "cancel-inventory":
                cancelForm("inventoryForm", resetInventory, "Annuler l'inventaire");
                break;

            case "reset-stock-exit":
                resetStockExitForm();
                break;

            case "filter-history":
                state.historyPage = 1;
                renderHistory();
                break;

            case "reset-history-filters":
                resetHistoryFilters();
                break;

            case "history-previous-page":
                state.historyPage = Math.max(1, state.historyPage - 1);
                renderHistory();
                break;

            case "history-next-page":
                state.historyPage += 1;
                renderHistory();
                break;

            case "close-history-details":
                closeHistoryDetails();
                break;

            case "view-transaction":
                viewTransaction(type, id);
                break;

            case "generate-report":
                generateReport();
                break;

            case "reset-report-filters":
                resetReportFilters();
                break;

            case "compare-periods":
                comparePeriods();
                break;

            case "export-report":
                exportReport();
                break;

            case "print-report":
                printReport();
                break;

            case "export-history":
                exportHistory();
                break;

            case "export-dashboard":
                exportDashboard();
                break;

            case "export-inventory":
                exportInventory();
                break;

            case "scene-zoom-in":
                zoomScene(-1);
                break;

            case "scene-zoom-out":
                zoomScene(1);
                break;

            case "scene-rotate-left":
                rotateScene(-1);
                break;

            case "scene-rotate-right":
                rotateScene(1);
                break;

            case "scene-reset":
                resetScene();
                break;

            case "scene-fullscreen":
                await toggleSceneFullscreen();
                break;

            case "scene-reload":
                reloadScene();
                break;

            case "reset-exchange-rates":
                await resetExchangeRates();
                break;

            case "export-backup":
                await exportBackup();
                break;

            case "import-backup":
                openBackupPicker();
                break;

            case "verify-database":
                await verifyDatabase();
                break;

            case "clear-cache":
                await clearCache();
                break;

            case "reset-application":
                await resetApplication();
                break;

            case "validate-backup-file": {
                const file = byId("backupRestoreFile")?.files?.[0];
                await validateBackupFile(file);
                break;
            }

            case "restore-backup":
                await restoreBackup();
                break;

            case "close-confirm-dialog":
                state.pendingConfirmation = null;
                closeDialog("confirmDialog");
                break;

            case "confirm-dialog-accept":
                await executeConfirmation();
                break;

            case "close-details-dialog":
                closeDialog("detailsDialog");
                break;

            case "print-details":
                printDetails();
                break;

            default:
                console.warn(`Action non configurée : ${action}`);
                toast(`Action non reconnue : ${action}`, "warning");
        }
    }

    /* ========================================================
       22. ÉVÉNEMENTS CENTRALISÉS
    ======================================================== */

    function bindEvents() {
        document.addEventListener("click", async event => {
            const element = event.target.closest("[data-action]");
            if (!element) return;

            const action = element.dataset.action;
            if (!action) return;

            if (element.matches("button") && element.type === "submit") {
                return;
            }

            event.preventDefault();

            try {
                await handleAction(action, element);
            } catch (error) {
                reportError(error);
            }
        });

        $("#productForm")?.addEventListener("submit", async event => {
            try {
                await handleProductSubmit(event);
            } catch (error) {
                reportError(error);
            }
        });

        $("#saleForm")?.addEventListener("submit", async event => {
            try {
                await handleSaleSubmit(event);
            } catch (error) {
                reportError(error);
            }
        });

        $("#purchaseForm")?.addEventListener("submit", async event => {
            try {
                await handlePurchaseSubmit(event);
            } catch (error) {
                reportError(error);
            }
        });

        $("#inventoryForm")?.addEventListener("submit", async event => {
            try {
                await handleInventorySubmit(event);
            } catch (error) {
                reportError(error);
            }
        });

        $("#stockExitForm")?.addEventListener("submit", async event => {
            event.preventDefault();

            try {
                await handleStockExitSubmit(event);
            } catch (error) {
                reportError(error);
            }
        });

        $("#businessSettingsForm")?.addEventListener("submit", async event => {
            try {
                await saveBusinessSettings(event);
            } catch (error) {
                reportError(error);
            }
        });

        $("#currencySettingsForm")?.addEventListener("submit", async event => {
            try {
                await saveCurrencySettings(event);
            } catch (error) {
                reportError(error);
            }
        });

        $("#stockSettingsForm")?.addEventListener("submit", async event => {
            try {
                await saveStockSettings(event);
            } catch (error) {
                reportError(error);
            }
        });

        $("#displaySettingsForm")?.addEventListener("submit", async event => {
            try {
                await saveDisplaySettings(event);
            } catch (error) {
                reportError(error);
            }
        });

        $("#productSearch")?.addEventListener("input", renderProducts);
        $("#productStockFilter")?.addEventListener("change", renderProducts);

        $("#saleLinesBody")?.addEventListener("change", event => {
            const row = event.target.closest(".sale-line");
            if (!row) return;

            if (event.target.matches(".line-product")) {
                const priceInput = $(".line-price", row);
                if (priceInput) delete priceInput.dataset.userEdited;
            }

            updateSaleLine(row);
        });

        $("#saleLinesBody")?.addEventListener("input", event => {
            const row = event.target.closest(".sale-line");
            if (!row) return;

            if (event.target.matches(".line-price")) {
                event.target.dataset.userEdited = "true";
            }

            updateSaleLine(row);
        });

        $("#saleCurrency")?.addEventListener("change", () => {
            $$("#saleLinesBody .sale-line").forEach(row => {
                const priceInput = $(".line-price", row);
                if (priceInput) delete priceInput.dataset.userEdited;
                updateSaleLine(row);
            });
            calculateSale();
        });

        $("#purchaseLinesBody")?.addEventListener("change", event => {
            const row = event.target.closest(".purchase-line");
            if (!row) return;

            if (event.target.matches(".purchase-product")) {
                const priceInput = $(".purchase-price", row);
                if (priceInput) delete priceInput.dataset.userEdited;
            }

            updatePurchaseLine(row);
        });

        $("#purchaseLinesBody")?.addEventListener("input", event => {
            const row = event.target.closest(".purchase-line");
            if (!row) return;

            if (event.target.matches(".purchase-price")) {
                event.target.dataset.userEdited = "true";
            }

            updatePurchaseLine(row);
        });

        $("#purchaseCurrency")?.addEventListener("change", () => {
            $$("#purchaseLinesBody .purchase-line").forEach(row => {
                const input = $(".purchase-price", row);
                if (input) delete input.dataset.userEdited;
                updatePurchaseLine(row);
            });
        });

        $("#inventoryLinesBody")?.addEventListener("input", event => {
            if (event.target.matches(".inventory-physical")) calculateInventory();
        });

        ["historyType", "historyStartDate", "historyEndDate", "historySearch"]
            .forEach(id => {
                const element = byId(id);
                if (!element) return;

                element.addEventListener(id === "historySearch" ? "input" : "change", () => {
                    state.historyPage = 1;
                    renderHistory();
                });
            });

        $("#reportType")?.addEventListener("change", () => {
            const type = $("#reportType").value;
            const today = localDateValue();

            if (type === "daily") setValue("reportDate", today);
            if (type === "monthly") setValue("reportMonth", today.slice(0, 7));
            if (type === "yearly") setValue("reportYear", new Date().getFullYear());
        });

        $("#displayCurrency")?.addEventListener("change", async event => {
            state.settings.displayCurrency = validCurrency(event.target.value);
            await saveSettings();
            renderAll();
        });

        $("#backupFileInput")?.addEventListener("change", async event => {
            const file = event.target.files?.[0];
            if (!file) return;

            try {
                await validateBackupFile(file);
                await restoreBackup();
            } catch (error) {
                reportError(error);
            } finally {
                event.target.value = "";
            }
        });

        $("#backupRestoreFile")?.addEventListener("change", () => {
            state.pendingBackup = null;
            setHTML("backupValidationResult",
                '<p class="empty-state">Fichier sélectionné. Cliquez sur « Vérifier le fichier » avant restauration.</p>'
            );
        });

        byId("confirmDialog")?.addEventListener("cancel", () => {
            state.pendingConfirmation = null;
        });

        window.addEventListener("resize", () => {
            state.sceneEngine?.resizeCanvas();
        });

        window.addEventListener("beforeunload", event => {
            if (state.dirty) {
                event.preventDefault();
                event.returnValue = "";
            }
        });

        window.addEventListener("online", () => {
            setText("connectionStatusText", "Application disponible");
        });

        window.addEventListener("offline", () => {
            setText("connectionStatusText", "Mode hors ligne");
        });
    }

    /* ========================================================
       23. RENDU GLOBAL
    ======================================================== */

    function renderAll() {
        populateProductSelectors();
        renderDashboard();
        renderProducts();
        renderRecentSales();
        renderPurchasesHistory();
        renderInventoryHistory();
        renderStockExits();
        renderHistory();

        if (state.currentView === "reports") {
            try {
                renderReport(generateReportData());
            } catch {
                // Le rapport attend une période valide.
            }
        }

        setText("footerYear", new Date().getFullYear());
        setText("appVersion", `Version ${APP_VERSION}`);
        setText("connectionStatusText",
            navigator.onLine ? "Application prête" : "Mode hors ligne"
        );

        setText("databaseStatus",
            state.storageMode === "indexeddb"
                ? "IndexedDB opérationnel"
                : "Stockage local de repli"
        );
    }

    /* ========================================================
       24. INITIALISATION
    ======================================================== */

    async function initializeApp() {
        if (state.initialized) return;

        state.initialized = true;
        showLoading("Initialisation de Samantha...");

        try {
            await initializeStorage();
            await loadState();

            fillSettingsForms();
            applyTheme();
            bindEvents();

            setValue("saleDate", localDateTimeValue());
            setValue("saleReference", generateReference("VTE"));
            setValue("saleCurrency", state.settings.displayCurrency || "USD");

            setValue("purchaseDate", localDateTimeValue());
            setValue("purchaseReference", generateReference("ACH"));
            setValue("purchaseCurrency", state.settings.displayCurrency || "USD");

            setValue("inventoryDate", localDateTimeValue());
            setValue("inventoryReference", generateReference("INV"));
            setValue("stockExitDate", localDateTimeValue());

            setValue("reportDate", localDateValue());
            setValue("reportMonth", localDateValue().slice(0, 7));
            setValue("reportYear", new Date().getFullYear());
            setValue("reportCurrency", state.settings.displayCurrency || "USD");

            setText("footerYear", new Date().getFullYear());
            setText("appVersion", `Version ${APP_VERSION}`);
            setText("lastSyncDate", formatDate(nowISO()));

            renderAll();
            configureAutoRefresh();

            if (state.storageMode === "indexeddb") {
                toast("Samantha est prête. Base de données IndexedDB active.", "success");
            } else {
                toast("Samantha est prête en mode stockage local de repli.", "warning", 5000);
            }

            initializeScene();

            if (location.protocol === "file:") {
                console.warn(
                    "Samantha est ouverte en local. Pour un stockage plus fiable, utilisez un navigateur compatible et un contexte sécurisé si nécessaire."
                );
            }
        } catch (error) {
            console.error("Initialisation de Samantha impossible :", error);
            toast("Le démarrage a rencontré une erreur. Consultez la console du navigateur.", "error", 7000);
        } finally {
            hideLoading();
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeApp, { once: true });
    } else {
        initializeApp();
    }

    /* ========================================================
       25. API PUBLIQUE FACULTATIVE
       Pour les tests et intégrations complémentaires
    ======================================================== */

    window.SamanthaApp = Object.freeze({
        version: APP_VERSION,
        navigate,
        refresh: refreshData,
        save: saveAll,
        exportBackup,
        generateReport,
        comparePeriods,
        getProducts: () => structuredCloneSafe(state.products),
        getSales: () => structuredCloneSafe(state.sales),
        getPurchases: () => structuredCloneSafe(state.purchases),
        getInventories: () => structuredCloneSafe(state.inventories),
        getStockExits: () => structuredCloneSafe(state.stockExits),
        getSettings: () => structuredCloneSafe(state.settings),
        getStorageMode: () => state.storageMode
    });

})();