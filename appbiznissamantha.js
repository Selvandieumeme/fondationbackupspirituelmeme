
/* =========================================================
   APPBIZNIS SAMANTHA — JAVASCRIPT PRINCIPAL
   Version 1.0.0
   Stockage local : IndexedDB
   Compatible avec appbiznissamantha.html
========================================================= */

(() => {
    "use strict";

    /* =====================================================
       1. CONFIGURATION ET OUTILS GÉNÉRAUX
    ===================================================== */

    const DB_NAME = "AppBiznisSamanthaDB";
    const DB_VERSION = 1;
    const LOW_STOCK_DEFAULT = 5;

    const STORE_NAMES = [
        "products",
        "purchases",
        "sales",
        "expenses",
        "movements",
        "settings",
        "meta"
    ];

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) =>
        Array.from(root.querySelectorAll(selector));

    const byId = id => document.getElementById(id);

    const state = {
        db: null,
        products: [],
        purchases: [],
        sales: [],
        expenses: [],
        movements: [],
        settings: {
            businessName: "AppBiznis Samantha",
            currency: "HTG",
            lowStockThreshold: LOW_STOCK_DEFAULT,
            language: "fr"
        },
        selectedProductId: null,
        purchaseRowCounter: 0,
        confirmCallback: null,
        saving: false
    };

    const pad = number => String(number).padStart(2, "0");

    function localDateString(date = new Date()) {
        return [
            date.getFullYear(),
            pad(date.getMonth() + 1),
            pad(date.getDate())
        ].join("-");
    }

    function localDateTime(date = new Date()) {
        return `${localDateString(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    }

    function today() {
        return localDateString();
    }

    function uid(prefix = "ID") {
        if (window.crypto && typeof window.crypto.randomUUID === "function") {
            return `${prefix}-${window.crypto.randomUUID()}`;
        }

        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }

    function number(value, fallback = 0) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    }

    function integer(value, fallback = 0) {
        return Math.max(0, Math.floor(number(value, fallback)));
    }

    function money(value) {
        const amount = number(value);

        try {
            return new Intl.NumberFormat(
                state.settings.language === "ht" ? "fr-HT" : "fr-FR",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            ).format(amount);
        } catch {
            return amount.toFixed(2);
        }
    }

    function currencyCode() {
        return state.settings.currency || "HTG";
    }

    function moneyText(value) {
        return `${money(value)} ${currencyCode() === "HTG" ? "G" : currencyCode()}`;
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function dateLabel(value) {
        if (!value) return "—";

        const date = new Date(`${String(value).slice(0, 10)}T12:00:00`);

        if (Number.isNaN(date.getTime())) return String(value);

        return new Intl.DateTimeFormat("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }).format(date);
    }

    function timeLabel(value) {
        if (!value) return "—";

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return "—";

        return new Intl.DateTimeFormat("fr-FR", {
            hour: "2-digit",
            minute: "2-digit"
        }).format(date);
    }

    function productById(id) {
        return state.products.find(product => product.id === id);
    }

    function emptyRow(columns, message) {
        return `<tr class="empty-row"><td colspan="${columns}">${escapeHTML(message)}</td></tr>`;
    }

    function categoryLabel(category) {
        const labels = {
            "soin-visage": "Soins du visage",
            maquillage: "Maquillage",
            cheveux: "Soins capillaires",
            corps: "Soins du corps",
            parfum: "Parfums",
            hygiene: "Hygiène",
            autre: "Autre"
        };

        return labels[category] || category || "Autre";
    }

    function productStatus(product) {
        if (integer(product.stock) <= 0) return "Rupture";

        if (
            integer(product.stock) <=
            integer(state.settings.lowStockThreshold, LOW_STOCK_DEFAULT)
        ) {
            return "Stock faible";
        }

        return "Disponible";
    }

    function statusHTML(product) {
        const status = productStatus(product);
        let className = "status-available";

        if (status === "Rupture") className = "status-out";
        if (status === "Stock faible") className = "status-low";

        return `<span class="stock-status ${className}">${escapeHTML(status)}</span>`;
    }

    function notify(message, type = "success") {
        const region = byId("appNotifications");
        const announcement = byId("liveAnnouncement");

        if (announcement) announcement.textContent = message;

        if (!region) {
            window.alert(message);
            return;
        }

        const item = document.createElement("div");
        item.className = `app-notification notification-${type}`;
        item.setAttribute("role", type === "error" ? "alert" : "status");
        item.textContent = message;

        region.appendChild(item);

        window.setTimeout(() => {
            item.remove();
        }, 5000);
    }

    function askConfirmation(message, callback) {
        const dialog = byId("confirmModal");
        const messageNode = byId("confirmModalMessage");

        state.confirmCallback = callback;

        if (messageNode) messageNode.textContent = message;

        if (dialog && typeof dialog.showModal === "function") {
            if (!dialog.open) dialog.showModal();
            return;
        }

        if (window.confirm(message)) {
            const action = state.confirmCallback;
            state.confirmCallback = null;
            if (action) action();
        }
    }

    function closeDialog(id) {
        const dialog = byId(id);
        if (dialog && dialog.open) dialog.close();
    }

    function downloadFile(filename, content, mimeType = "text/plain;charset=utf-8") {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = filename;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        link.remove();

        window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    }

    function csvCell(value) {
        const text = String(value ?? "");
        return `"${text.replace(/"/g, '""')}"`;
    }

    function exportCSV(filename, headers, rows) {
        const csv = [
            headers.map(csvCell).join(";"),
            ...rows.map(row => row.map(csvCell).join(";"))
        ].join("\r\n");

        downloadFile(
            filename,
            "\uFEFF" + csv,
            "text/csv;charset=utf-8"
        );
    }

    function setText(id, value) {
        const element = byId(id);
        if (element) element.textContent = value;
    }

    function setValue(id, value) {
        const element = byId(id);
        if (element) element.value = value;
    }

    function setHTML(id, html) {
        const element = byId(id);
        if (element) element.innerHTML = html;
    }

    /* =====================================================
       2. CATALOGUE INITIAL DE 50 PRODUITS COSMÉTIQUES

       Les noms, codes, prix et catégories peuvent être
       modifiés depuis la page "Mes 50 produits".

       Le stock initial est à zéro : il faut enregistrer
       les achats pour augmenter le stock disponible.
    ===================================================== */

    const DEFAULT_PRODUCTS = [
        ["COS-001", "Crème hydratante visage", "soin-visage", 250, 400],
        ["COS-002", "Sérum vitamine C", "soin-visage", 350, 550],
        ["COS-003", "Nettoyant visage", "soin-visage", 180, 300],
        ["COS-004", "Tonique visage", "soin-visage", 200, 350],
        ["COS-005", "Masque visage", "soin-visage", 220, 375],
        ["COS-006", "Crème anti-imperfections", "soin-visage", 300, 475],
        ["COS-007", "Lait démaquillant", "soin-visage", 190, 325],
        ["COS-008", "Baume à lèvres", "soin-visage", 75, 150],
        ["COS-009", "Crème contour des yeux", "soin-visage", 280, 450],
        ["COS-010", "Exfoliant visage", "soin-visage", 210, 350],

        ["COS-011", "Fond de teint", "maquillage", 300, 500],
        ["COS-012", "Poudre compacte", "maquillage", 220, 375],
        ["COS-013", "Rouge à lèvres", "maquillage", 120, 250],
        ["COS-014", "Gloss à lèvres", "maquillage", 100, 225],
        ["COS-015", "Mascara", "maquillage", 180, 325],
        ["COS-016", "Crayon pour les yeux", "maquillage", 65, 140],
        ["COS-017", "Palette de fards", "maquillage", 350, 600],
        ["COS-018", "Blush", "maquillage", 170, 300],
        ["COS-019", "Correcteur teint", "maquillage", 160, 290],
        ["COS-020", "Fixateur de maquillage", "maquillage", 240, 400],

        ["COS-021", "Shampooing nourrissant", "cheveux", 200, 350],
        ["COS-022", "Après-shampooing", "cheveux", 210, 360],
        ["COS-023", "Masque capillaire", "cheveux", 275, 450],
        ["COS-024", "Huile capillaire", "cheveux", 180, 325],
        ["COS-025", "Crème coiffante", "cheveux", 220, 375],
        ["COS-026", "Gel coiffant", "cheveux", 150, 275],
        ["COS-027", "Spray démêlant", "cheveux", 190, 325],
        ["COS-028", "Sérum capillaire", "cheveux", 260, 425],
        ["COS-029", "Beurre de karité", "cheveux", 175, 300],
        ["COS-030", "Lotion cuir chevelu", "cheveux", 230, 390],

        ["COS-031", "Lait corporel", "corps", 250, 425],
        ["COS-032", "Beurre corporel", "corps", 280, 475],
        ["COS-033", "Gommage corporel", "corps", 220, 375],
        ["COS-034", "Crème pour les mains", "corps", 100, 200],
        ["COS-035", "Crème pour les pieds", "corps", 125, 225],
        ["COS-036", "Huile corporelle", "corps", 200, 350],
        ["COS-037", "Gel douche", "corps", 175, 300],
        ["COS-038", "Déodorant", "corps", 120, 225],
        ["COS-039", "Écran solaire", "corps", 350, 575],
        ["COS-040", "Savon cosmétique", "corps", 65, 140],

        ["COS-041", "Eau de parfum", "parfum", 450, 750],
        ["COS-042", "Eau de toilette", "parfum", 350, 600],
        ["COS-043", "Brume parfumée", "parfum", 200, 350],
        ["COS-044", "Huile parfumée", "parfum", 150, 275],
        ["COS-045", "Parfum de poche", "parfum", 175, 300],

        ["COS-046", "Gel nettoyant mains", "hygiene", 80, 150],
        ["COS-047", "Lotion nettoyante", "hygiene", 160, 275],
        ["COS-048", "Lingettes démaquillantes", "hygiene", 100, 180],
        ["COS-049", "Brosse cosmétique", "autre", 125, 225],
        ["COS-050", "Éponge de maquillage", "autre", 60, 125]
    ];

    function createDefaultProducts() {
        return DEFAULT_PRODUCTS.map((item, index) => ({
            id: `product-${String(index + 1).padStart(3, "0")}`,
            code: item[0],
            name: item[1],
            category: item[2],
            purchasePrice: item[3],
            sellingPrice: item[4],
            initialStock: 0,
            stock: 0,
            totalPurchased: 0,
            totalSold: 0,
            description: "",
            createdAt: localDateTime(),
            updatedAt: localDateTime()
        }));
    }

    /* =====================================================
       3. INDEXEDDB : CRÉATION ET OPÉRATIONS
    ===================================================== */

    function openDatabase() {
        return new Promise((resolve, reject) => {
            if (!("indexedDB" in window)) {
                reject(new Error(
                    "IndexedDB n'est pas disponible dans ce navigateur."
                ));
                return;
            }

            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = event => {
                const db = event.target.result;

                STORE_NAMES.forEach(storeName => {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName, { keyPath: "id" });
                    }
                });
            };

            request.onsuccess = () => {
                state.db = request.result;

                state.db.onversionchange = () => {
                    state.db.close();
                    notify(
                        "La base de données a changé. Rechargez l'application.",
                        "warning"
                    );
                };

                resolve(state.db);
            };

            request.onerror = () => {
                reject(request.error || new Error("Ouverture IndexedDB impossible."));
            };

            request.onblocked = () => {
                notify(
                    "Fermez les autres onglets de l'application puis rechargez.",
                    "warning"
                );
            };
        });
    }

    function getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = state.db.transaction(storeName, "readonly");
            const request = transaction.objectStore(storeName).getAll();

            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    }

    function putRecord(storeName, record) {
        return new Promise((resolve, reject) => {
            const transaction = state.db.transaction(storeName, "readwrite");
            transaction.objectStore(storeName).put(record);

            transaction.oncomplete = () => resolve(record);
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(
                transaction.error || new Error("Écriture annulée.")
            );
        });
    }

    function deleteRecord(storeName, id) {
        return new Promise((resolve, reject) => {
            const transaction = state.db.transaction(storeName, "readwrite");
            transaction.objectStore(storeName).delete(id);

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(
                transaction.error || new Error("Suppression annulée.")
            );
        });
    }

    async function writeMany(recordsByStore) {
        const storeNames = Object.keys(recordsByStore);

        return new Promise((resolve, reject) => {
            const transaction = state.db.transaction(storeNames, "readwrite");

            storeNames.forEach(storeName => {
                const store = transaction.objectStore(storeName);

                recordsByStore[storeName].forEach(record => {
                    store.put(record);
                });
            });

            transaction.oncomplete = resolve;
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(
                transaction.error || new Error("Transaction annulée.")
            );
        });
    }

    async function reloadState() {
        const [
            products,
            purchases,
            sales,
            expenses,
            movements,
            settingsRecords
        ] = await Promise.all([
            getAll("products"),
            getAll("purchases"),
            getAll("sales"),
            getAll("expenses"),
            getAll("movements"),
            getAll("settings")
        ]);

        state.products = products;
        state.purchases = purchases;
        state.sales = sales;
        state.expenses = expenses;
        state.movements = movements;

        settingsRecords.forEach(record => {
            if (record.id === "preferences") {
                state.settings = {
                    ...state.settings,
                    ...record.value
                };
            }
        });
    }

    async function initializeDatabase() {
        await openDatabase();

        const existingProducts = await getAll("products");

        if (existingProducts.length === 0) {
            const defaults = createDefaultProducts();

            await writeMany({
                products: defaults,
                settings: [{
                    id: "preferences",
                    value: { ...state.settings }
                }]
            });
        }

        await reloadState();

        if (!state.settings.currency) state.settings.currency = "HTG";
        if (!state.settings.lowStockThreshold && state.settings.lowStockThreshold !== 0) {
            state.settings.lowStockThreshold = LOW_STOCK_DEFAULT;
        }

        await applySettingsToForm();
        await updateDatabaseStatus();

        return true;
    }

    async function updateDatabaseStatus() {
        const status = byId("databaseStatus");

        if (!status) return;

        try {
            const records = await getAll("products");
            status.textContent =
                `Base locale opérationnelle · ${records.length} produit(s) enregistré(s).`;
        } catch {
            status.textContent = "Impossible de lire la base locale.";
        }
    }

    /* =====================================================
       4. NAVIGATION ET MENU MOBILE
    ===================================================== */

    const PAGE_NAMES = {
        dashboard: "Dashboard",
        purchases: "Achats en gros",
        sales: "Ventes du jour",
        products: "Mes 50 produits",
        inventory: "Gestion du stock",
        expenses: "Dépenses",
        reports: "Rapports détaillés",
        history: "Historique",
        settings: "Paramètres"
    };

    function navigateTo(page) {
        if (!PAGE_NAMES[page]) return;

        $$(".page-section").forEach(section => {
            const active = section.dataset.section === page;
            section.classList.toggle("active", active);
            section.hidden = !active;
        });

        $$(".nav-item[data-page]").forEach(button => {
            const active = button.dataset.page === page;
            button.classList.toggle("active", active);

            if (active) {
                button.setAttribute("aria-current", "page");
            } else {
                button.removeAttribute("aria-current");
            }
        });

        setText("breadcrumbCurrent", PAGE_NAMES[page]);

        const sidebar = byId("sidebar");
        const menuToggle = byId("menuToggle");

        if (sidebar) sidebar.classList.remove("sidebar-open");
        if (menuToggle) menuToggle.setAttribute("aria-expanded", "false");

        if (page === "reports") renderReports();
        if (page === "sales") renderSalesPage();
        if (page === "products") renderProductsPage();
        if (page === "inventory") renderInventoryPage();
        if (page === "history") renderHistory();
    }

    function toggleMobileMenu() {
        const sidebar = byId("sidebar");
        const toggle = byId("menuToggle");

        if (!sidebar || !toggle) return;

        const opened = sidebar.classList.toggle("sidebar-open");
        toggle.setAttribute("aria-expanded", String(opened));
    }

    /* =====================================================
       5. PRODUITS : TABLEAU ET MODALE
    ===================================================== */

    function renderProductsPage() {
        const query = (byId("productsSearch")?.value || "")
            .trim().toLowerCase();

        const filtered = state.products.filter(product => {
            const searchable = [
                product.code,
                product.name,
                product.category,
                product.description
            ].join(" ").toLowerCase();

            return searchable.includes(query);
        });

        setText("productsTotalCount", `${state.products.length} / 50`);
        setText(
            "productsAvailableCount",
            state.products.filter(product => integer(product.stock) > 0).length
        );
        setText(
            "productsRuptureCount",
            state.products.filter(product => integer(product.stock) <= 0).length
        );
        setText(
            "productsStockValue",
            moneyText(state.products.reduce(
                (sum, product) =>
                    sum + integer(product.stock) * number(product.purchasePrice),
                0
            ))
        );

        const body = byId("productsTableBody");
        if (!body) return;

        if (filtered.length === 0) {
            body.innerHTML = emptyRow(10, "Aucun produit correspondant.");
            return;
        }

        body.innerHTML = filtered.map(product => `
            <tr>
                <td>${escapeHTML(product.code)}</td>
                <td>
                    <strong>${escapeHTML(product.name)}</strong>
                    ${product.description
                        ? `<small>${escapeHTML(product.description)}</small>`
                        : ""}
                </td>
                <td>${escapeHTML(categoryLabel(product.category))}</td>
                <td>${moneyText(product.purchasePrice)}</td>
                <td>${moneyText(product.sellingPrice)}</td>
                <td>${moneyText(number(product.sellingPrice) - number(product.purchasePrice))}</td>
                <td>${integer(product.stock)}</td>
                <td>${moneyText(integer(product.stock) * number(product.purchasePrice))}</td>
                <td>${statusHTML(product)}</td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="btn btn-outline btn-small"
                                data-edit-product="${escapeHTML(product.id)}">
                            Modifier
                        </button>
                    </div>
                </td>
            </tr>
        `).join("");
    }

    function openProductModal(product = null) {
        const form = byId("productForm");
        const dialog = byId("productModal");

        if (!form || !dialog) return;

        form.reset();

        setValue("editProductId", product?.id || "");
        setValue("productCode", product?.code || nextProductCode());
        setValue("productName", product?.name || "");
        setValue("productCategory", product?.category || "soin-visage");
        setValue("productPurchasePrice", product?.purchasePrice ?? "");
        setValue("productSellingPrice", product?.sellingPrice ?? "");
        setValue("productInitialStock", product?.stock ?? 0);
        setValue("productDescription", product?.description || "");

        setText(
            "productModalTitle",
            product ? "Modifier un produit" : "Ajouter un produit"
        );

        if (!dialog.open) dialog.showModal();
    }

    function nextProductCode() {
        const used = new Set(state.products.map(product => product.code));
        let index = 1;

        while (used.has(`COS-${String(index).padStart(3, "0")}`)) {
            index++;
        }

        return `COS-${String(index).padStart(3, "0")}`;
    }

    async function handleProductSubmit(event) {
        event.preventDefault();

        const id = byId("editProductId").value || uid("product");
        const oldProduct = productById(id);

        const code = byId("productCode").value.trim();
        const name = byId("productName").value.trim();
        const category = byId("productCategory").value;
        const purchasePrice = number(byId("productPurchasePrice").value, -1);
        const sellingPrice = number(byId("productSellingPrice").value, -1);
        const requestedStock = integer(byId("productInitialStock").value);
        const description = byId("productDescription").value.trim();

        if (!code || !name) {
            notify("Le code et le nom du produit sont obligatoires.", "error");
            return;
        }

        if (
            state.products.some(
                product => product.code.toLowerCase() === code.toLowerCase()
                    && product.id !== id
            )
        ) {
            notify("Ce code produit est déjà utilisé.", "error");
            return;
        }

        if (purchasePrice < 0 || sellingPrice < 0) {
            notify("Les prix ne peuvent pas être négatifs.", "error");
            return;
        }

        const product = {
            id,
            code,
            name,
            category,
            purchasePrice,
            sellingPrice,
            initialStock: oldProduct?.initialStock ?? requestedStock,
            stock: oldProduct ? requestedStock : requestedStock,
            totalPurchased: oldProduct?.totalPurchased ?? 0,
            totalSold: oldProduct?.totalSold ?? 0,
            description,
            createdAt: oldProduct?.createdAt || localDateTime(),
            updatedAt: localDateTime()
        };

        if (oldProduct) {
            const difference = requestedStock - integer(oldProduct.stock);

            product.initialStock =
                integer(oldProduct.initialStock) + difference;

            const movement = {
                id: uid("movement"),
                date: localDateTime(),
                productId: id,
                productName: name,
                type: "adjustment",
                quantityIn: difference > 0 ? difference : 0,
                quantityOut: difference < 0 ? Math.abs(difference) : 0,
                stockAfter: requestedStock,
                reference: "Modification du produit"
            };

            await writeMany({
                products: [product],
                movements: [movement]
            });

            notify("Produit modifié avec succès.");
        } else {
            await putRecord("products", product);

            if (requestedStock > 0) {
                await putRecord("movements", {
                    id: uid("movement"),
                    date: localDateTime(),
                    productId: id,
                    productName: name,
                    type: "initial",
                    quantityIn: requestedStock,
                    quantityOut: 0,
                    stockAfter: requestedStock,
                    reference: "Stock initial"
                });
            }

            notify("Produit ajouté au catalogue.");
        }

        closeDialog("productModal");
        await refreshAll();
    }

    /* =====================================================
       6. ACHATS : LIGNES DYNAMIQUES
    ===================================================== */

    function productOptions(selectedId = "") {
        return [
            `<option value="">Choisir un produit</option>`,
            ...state.products.map(product => `
                <option value="${escapeHTML(product.id)}"
                    ${product.id === selectedId ? "selected" : ""}>
                    ${escapeHTML(product.code)} — ${escapeHTML(product.name)}
                </option>
            `)
        ].join("");
    }

    function addPurchaseRow(productId = "", quantity = 1, unitCost = null) {
        const body = byId("purchaseItemsBody");
        if (!body) return;

        const rowId = `purchase-row-${++state.purchaseRowCounter}`;
        const product = productById(productId);
        const price = unitCost ?? product?.purchasePrice ?? "";

        const row = document.createElement("tr");
        row.dataset.purchaseRow = rowId;

        row.innerHTML = `
            <td>
                <select class="purchase-product" aria-label="Produit acheté" required>
                    ${productOptions(productId)}
                </select>
            </td>
            <td>
                <input class="purchase-quantity" type="number"
                       min="1" step="1" value="${integer(quantity) || 1}"
                       aria-label="Quantité achetée" required>
            </td>
            <td>
                <input class="purchase-unit-cost" type="number"
                       min="0" step="0.01" value="${escapeHTML(price)}"
                       aria-label="Prix d'achat unitaire" required>
            </td>
            <td class="purchase-line-total">${moneyText(0)}</td>
            <td>
                <button type="button" class="btn btn-outline btn-small"
                        data-remove-purchase-row="${rowId}">
                    Retirer
                </button>
            </td>
        `;

        body.appendChild(row);
        calculatePurchaseTotal();
    }

    function calculatePurchaseTotal() {
        let total = 0;

        $$("#purchaseItemsBody tr[data-purchase-row]").forEach(row => {
            const quantity = integer($(".purchase-quantity", row)?.value);
            const cost = number($(".purchase-unit-cost", row)?.value);
            const lineTotal = quantity * cost;

            total += lineTotal;

            const cell = $(".purchase-line-total", row);
            if (cell) cell.textContent = moneyText(lineTotal);
        });

        setText("purchaseGrandTotal", moneyText(total));
        return total;
    }

    async function handlePurchaseSubmit(event) {
        event.preventDefault();

        const rows = $$("#purchaseItemsBody tr[data-purchase-row]");
        const items = [];

        for (const row of rows) {
            const productId = $(".purchase-product", row)?.value;
            const quantity = integer($(".purchase-quantity", row)?.value);
            const unitCost = number($(".purchase-unit-cost", row)?.value, -1);
            const product = productById(productId);

            if (!product || quantity < 1 || unitCost < 0) {
                notify("Vérifiez chaque ligne de l'achat.", "error");
                return;
            }

            items.push({
                productId,
                productName: product.name,
                code: product.code,
                quantity,
                unitCost,
                total: quantity * unitCost
            });
        }

        if (items.length === 0) {
            notify("Ajoutez au moins un produit à cet achat.", "error");
            return;
        }

        const date = byId("purchaseDate").value || today();
        const supplier = byId("purchaseSupplier").value.trim();
        const reference = byId("purchaseReference").value.trim();
        const currency = byId("purchaseCurrency").value || currencyCode();

        const purchase = {
            id: uid("purchase"),
            date,
            createdAt: localDateTime(),
            supplier,
            reference: reference || uid("REF"),
            currency,
            items,
            total: items.reduce((sum, item) => sum + item.total, 0)
        };

        const updatedProducts = [];
        const newMovements = [];

        items.forEach(item => {
            const product = productById(item.productId);
            const updated = {
                ...product,
                stock: integer(product.stock) + item.quantity,
                totalPurchased: integer(product.totalPurchased) + item.quantity,
                purchasePrice: item.unitCost,
                updatedAt: localDateTime()
            };

            updatedProducts.push(updated);

            newMovements.push({
                id: uid("movement"),
                date: localDateTime(),
                productId: product.id,
                productName: product.name,
                type: "purchase",
                quantityIn: item.quantity,
                quantityOut: 0,
                stockAfter: updated.stock,
                reference: purchase.reference
            });
        });

        await writeMany({
            purchases: [purchase],
            products: updatedProducts,
            movements: newMovements
        });

        byId("purchaseForm").reset();
        setValue("purchaseDate", today());
        setValue("purchaseCurrency", currencyCode());
        setHTML("purchaseItemsBody", "");
        addPurchaseRow();

        notify("Achat enregistré. Le stock a été mis à jour.");
        await refreshAll();
    }

    function renderPurchaseHistory() {
        const body = byId("purchaseHistoryBody");
        if (!body) return;

        const purchases = [...state.purchases].sort(
            (a, b) => String(b.createdAt).localeCompare(String(a.createdAt))
        );

        if (!purchases.length) {
            body.innerHTML = emptyRow(6, "Aucun achat enregistré.");
            return;
        }

        body.innerHTML = purchases.map(purchase => `
            <tr>
                <td>${dateLabel(purchase.date)}</td>
                <td>${escapeHTML(purchase.reference)}</td>
                <td>${escapeHTML(purchase.supplier || "—")}</td>
                <td>${purchase.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                <td>${moneyText(purchase.total)}</td>
                <td>
                    <button type="button" class="btn btn-outline btn-small"
                            data-delete-purchase="${escapeHTML(purchase.id)}">
                        Annuler
                    </button>
                </td>
            </tr>
        `).join("");
    }

    async function reversePurchase(id) {
        const purchase = state.purchases.find(item => item.id === id);
        if (!purchase) return;

        for (const item of purchase.items) {
            const product = productById(item.productId);

            if (!product || integer(product.stock) < item.quantity) {
                notify(
                    `Impossible d'annuler cet achat : stock insuffisant pour ${item.productName}.`,
                    "error"
                );
                return;
            }
        }

        askConfirmation(
            "Annuler cet achat diminuera le stock des produits concernés. Continuer ?",
            async () => {
                const products = [];
                const movements = [];

                purchase.items.forEach(item => {
                    const product = productById(item.productId);
                    const updated = {
                        ...product,
                        stock: integer(product.stock) - item.quantity,
                        totalPurchased: Math.max(
                            0,
                            integer(product.totalPurchased) - item.quantity
                        ),
                        updatedAt: localDateTime()
                    };

                    products.push(updated);

                    movements.push({
                        id: uid("movement"),
                        date: localDateTime(),
                        productId: product.id,
                        productName: product.name,
                        type: "purchase-reversal",
                        quantityIn: 0,
                        quantityOut: item.quantity,
                        stockAfter: updated.stock,
                        reference: purchase.reference
                    });
                });

                await writeMany({ products, movements });
                await deleteRecord("purchases", purchase.id);

                notify("Achat annulé et stock corrigé.");
                await refreshAll();
            }
        );
    }

    /* =====================================================
       7. VENTES : CATALOGUE ET CALCULS
    ===================================================== */

    function getSalesProducts() {
        const query = (byId("salesProductSearch")?.value || "")
            .trim().toLowerCase();
        const filter = byId("salesStockFilter")?.value || "all";
        const sort = byId("salesSortOrder")?.value || "name";

        let products = state.products.filter(product => {
            const matchesSearch = [
                product.code,
                product.name,
                categoryLabel(product.category)
            ].join(" ").toLowerCase().includes(query);

            const stock = integer(product.stock);
            const threshold = integer(
                state.settings.lowStockThreshold,
                LOW_STOCK_DEFAULT
            );

            const matchesFilter =
                filter === "all"
                || (filter === "available" && stock > 0)
                || (filter === "low" && stock > 0 && stock <= threshold)
                || (filter === "rupture" && stock <= 0);

            return matchesSearch && matchesFilter;
        });

        products.sort((a, b) => {
            if (sort === "priceAsc") return number(a.sellingPrice) - number(b.sellingPrice);
            if (sort === "priceDesc") return number(b.sellingPrice) - number(a.sellingPrice);
            if (sort === "stockAsc") return integer(a.stock) - integer(b.stock);
            return a.name.localeCompare(b.name, "fr");
        });

        return products;
    }

    function renderSalesCatalogue() {
        const catalogue = byId("salesProductCatalogue");
        if (!catalogue) return;

        const products = getSalesProducts();

        setText("salesProductCount", `${state.products.length} produits`);
        setText("catalogueResultsText", `${products.length} produit(s) affiché(s)`);

        if (!products.length) {
            catalogue.innerHTML = `
                <div class="empty-state">
                    <p>Aucun produit ne correspond à la recherche.</p>
                </div>
            `;
            return;
        }

        catalogue.innerHTML = products.map(product => `
            <button type="button"
                    class="product-card ${product.id === state.selectedProductId ? "selected" : ""}"
                    data-select-product="${escapeHTML(product.id)}"
                    ${integer(product.stock) <= 0 ? 'aria-label="' + escapeHTML(product.name) + ', en rupture de stock"' : ""}>
                <span class="product-card-code">${escapeHTML(product.code)}</span>
                <strong>${escapeHTML(product.name)}</strong>
                <span class="product-card-category">${escapeHTML(categoryLabel(product.category))}</span>
                <span class="product-card-price">${moneyText(product.sellingPrice)}</span>
                <span class="product-card-stock">Stock : ${integer(product.stock)}</span>
                ${statusHTML(product)}
            </button>
        `).join("");
    }

    function selectSaleProduct(id) {
        const product = productById(id);
        if (!product) return;

        state.selectedProductId = id;

        setValue("saleProductId", id);
        setText("selectedProductName", product.name);
        setText("selectedProductPrice", `Prix de vente : ${moneyText(product.sellingPrice)}`);
        setText("selectedProductStock", integer(product.stock));
        setText("saleStockBefore", integer(product.stock));
        setValue("saleUnitPrice", product.sellingPrice);
        setValue("saleQuantity", "1");
        setValue("saleDiscount", "0");
        setValue("saleAmountPaid", "");
        setText("saleSelectionStatus", "Produit sélectionné");

        calculateSale();
        renderSalesCatalogue();
    }

    function calculateSale() {
        const id = byId("saleProductId")?.value;
        const product = productById(id);

        const quantity = integer(byId("saleQuantity")?.value);
        const unitPrice = number(byId("saleUnitPrice")?.value);
        const discount = number(byId("saleDiscount")?.value);
        const stock = product ? integer(product.stock) : 0;

        const subtotal = quantity * unitPrice;
        const total = Math.max(0, subtotal - discount);
        const profit = total - (quantity * number(product?.purchasePrice));
        const remaining = stock - quantity;

        setText("saleStockBefore", stock);
        setText("saleStockAfter", product && quantity > 0 ? remaining : "—");
        setText("saleCalculatedTotal", moneyText(total));
        setText("saleCalculatedProfit", moneyText(profit));

        const warning = byId("saleStockWarning");
        const warningText = byId("saleStockWarningText");
        const confirmButton = byId("confirmSaleButton");

        let invalid = !product || quantity < 1 || unitPrice < 0 || discount < 0;

        if (product && quantity > stock) {
            invalid = true;

            if (warning) warning.hidden = false;
            if (warningText) {
                warningText.textContent =
                    `Stock insuffisant : ${stock} unité(s) disponible(s), ${quantity} demandée(s).`;
            }
        } else if (product && quantity > 0 && discount > subtotal) {
            invalid = true;

            if (warning) warning.hidden = false;
            if (warningText) {
                warningText.textContent =
                    "La remise ne peut pas dépasser le montant de la vente.";
            }
        } else {
            if (warning) warning.hidden = true;
        }

        setText(
            "saleStockStatus",
            product
                ? (remaining <= 0 ? "Rupture après vente" : "Stock suffisant")
                : "En attente"
        );

        if (confirmButton) confirmButton.disabled = invalid;

        return { product, quantity, unitPrice, discount, subtotal, total, profit, remaining, invalid };
    }

    async function handleSaleSubmit(event) {
        event.preventDefault();

        const calculation = calculateSale();

        if (calculation.invalid || !calculation.product) {
            notify("Vérifiez le produit, la quantité, le prix et la remise.", "error");
            return;
        }

        const {
            product,
            quantity,
            unitPrice,
            discount,
            total,
            profit,
            remaining
        } = calculation;

        if (quantity > integer(product.stock)) {
            notify("Vente refusée : le stock est insuffisant.", "error");
            return;
        }

        const amountPaidField = byId("saleAmountPaid").value;
        const amountPaid = amountPaidField === ""
            ? total
            : number(amountPaidField, -1);

        if (amountPaid < 0) {
            notify("Le montant reçu ne peut pas être négatif.", "error");
            return;
        }

        const sale = {
            id: uid("sale"),
            date: byId("saleDate").value || today(),
            createdAt: localDateTime(),
            customer: byId("saleCustomer").value.trim(),
            paymentMethod: byId("salePaymentMethod").value || "cash",
            productId: product.id,
            productCode: product.code,
            productName: product.name,
            quantity,
            unitPrice,
            unitCost: number(product.purchasePrice),
            discount,
            total,
            profit,
            amountPaid,
            balanceDue: Math.max(0, total - amountPaid),
            stockBefore: integer(product.stock),
            stockAfter: remaining,
            status: "completed"
        };

        const updatedProduct = {
            ...product,
            stock: remaining,
            totalSold: integer(product.totalSold) + quantity,
            updatedAt: localDateTime()
        };

        const movement = {
            id: uid("movement"),
            date: localDateTime(),
            productId: product.id,
            productName: product.name,
            type: "sale",
            quantityIn: 0,
            quantityOut: quantity,
            stockAfter: remaining,
            reference: sale.id
        };

        await writeMany({
            sales: [sale],
            products: [updatedProduct],
            movements: [movement]
        });

        byId("saleForm").reset();

        state.selectedProductId = null;

        setValue("saleProductId", "");
        setText("selectedProductName", "Aucun produit");
        setText("selectedProductPrice", "Prix de vente : —");
        setText("selectedProductStock", "—");
        setText("saleSelectionStatus", "Aucun produit sélectionné");
        setText("saleStockBefore", "0");
        setText("saleStockAfter", "—");
        setText("saleCalculatedTotal", moneyText(0));
        setText("saleCalculatedProfit", moneyText(0));
        setText("saleStockStatus", "En attente");

        if (byId("saleStockWarning")) byId("saleStockWarning").hidden = true;

        notify(
            `Vente enregistrée : ${quantity} unité(s) de ${product.name}. Stock restant : ${remaining}.`
        );

        await refreshAll();
    }

    function salesForDate(date) {
        return state.sales.filter(sale => sale.date === date);
    }

    function renderTodaySalesHistory() {
        const body = byId("todaySalesHistoryBody");
        if (!body) return;

        const sales = [...salesForDate(byId("saleDate")?.value || today())]
            .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

        if (!sales.length) {
            body.innerHTML = emptyRow(8, "Aucune vente enregistrée pour cette date.");
            setText("todaySalesHistoryTotal", moneyText(0));
            return;
        }

        body.innerHTML = sales.map(sale => `
            <tr>
                <td>${timeLabel(sale.createdAt)}</td>
                <td>${escapeHTML(sale.productName)}<small>${escapeHTML(sale.customer || "Client non précisé")}</small></td>
                <td>${integer(sale.quantity)}</td>
                <td>${moneyText(sale.unitPrice)}</td>
                <td>${moneyText(sale.total)}</td>
                <td>${moneyText(sale.profit)}</td>
                <td>${integer(sale.stockAfter)}</td>
                <td>
                    <button type="button" class="btn btn-outline btn-small"
                            data-delete-sale="${escapeHTML(sale.id)}">
                        Annuler
                    </button>
                </td>
            </tr>
        `).join("");

        setText(
            "todaySalesHistoryTotal",
            moneyText(sales.reduce((sum, sale) => sum + number(sale.total), 0))
        );
    }

    async function reverseSale(id) {
        const sale = state.sales.find(item => item.id === id);
        if (!sale) return;

        askConfirmation(
            "Annuler cette vente réintégrera les unités dans le stock. Continuer ?",
            async () => {
                const product = productById(sale.productId);

                if (product) {
                    const updatedProduct = {
                        ...product,
                        stock: integer(product.stock) + integer(sale.quantity),
                        totalSold: Math.max(
                            0,
                            integer(product.totalSold) - integer(sale.quantity)
                        ),
                        updatedAt: localDateTime()
                    };

                    await putRecord("products", updatedProduct);

                    await putRecord("movements", {
                        id: uid("movement"),
                        date: localDateTime(),
                        productId: product.id,
                        productName: product.name,
                        type: "sale-reversal",
                        quantityIn: integer(sale.quantity),
                        quantityOut: 0,
                        stockAfter: updatedProduct.stock,
                        reference: sale.id
                    });
                }

                await deleteRecord("sales", sale.id);

                notify("Vente annulée. Le stock a été corrigé.");
                await refreshAll();
            }
        );
    }

    function renderSalesPage() {
        renderSalesCatalogue();
        renderTodaySalesHistory();

        const date = byId("saleDate")?.value || today();
        const sales = salesForDate(date);

        setText("salesTransactionCount", sales.length);
        setText(
            "salesRevenueTotal",
            moneyText(sales.reduce((sum, sale) => sum + number(sale.total), 0))
        );
        setText(
            "salesProfitTotal",
            moneyText(sales.reduce((sum, sale) => sum + number(sale.profit), 0))
        );

        calculateSale();
    }

    /* =====================================================
       8. INVENTAIRE ET MOUVEMENTS
    ===================================================== */

    function renderInventoryPage() {
        const body = byId("inventoryTableBody");
        if (!body) return;

        const totalUnits = state.products.reduce(
            (sum, product) => sum + integer(product.stock),
            0
        );

        const lowCount = state.products.filter(product =>
            integer(product.stock) > 0 &&
            integer(product.stock) <= integer(state.settings.lowStockThreshold)
        ).length;

        const outCount = state.products.filter(
            product => integer(product.stock) <= 0
        ).length;

        const stockValue = state.products.reduce(
            (sum, product) =>
                sum + integer(product.stock) * number(product.purchasePrice),
            0
        );

        setText("inventoryUnits", totalUnits);
        setText("inventoryLowCount", lowCount);
        setText("inventoryRuptureCount", outCount);
        setText("inventoryStockValue", moneyText(stockValue));

        body.innerHTML = state.products.length
            ? state.products.map(product => `
                <tr>
                    <td>${escapeHTML(product.name)}<small>${escapeHTML(product.code)}</small></td>
                    <td>${integer(product.initialStock)}</td>
                    <td>${integer(product.totalPurchased)}</td>
                    <td>${integer(product.totalSold)}</td>
                    <td>${integer(product.stock)}</td>
                    <td>${moneyText(integer(product.stock) * number(product.purchasePrice))}</td>
                    <td>${statusHTML(product)}</td>
                </tr>
            `).join("")
            : emptyRow(7, "Aucun produit.");

        const movementBody = byId("stockMovementsBody");
        if (!movementBody) return;

        const movements = [...state.movements].sort(
            (a, b) => String(b.date).localeCompare(String(a.date))
        );

        movementBody.innerHTML = movements.length
            ? movements.map(movement => `
                <tr>
                    <td>${dateLabel(movement.date)}</td>
                    <td>${escapeHTML(movement.productName || "Produit supprimé")}</td>
                    <td>${escapeHTML(movement.type)}</td>
                    <td>${integer(movement.quantityIn)}</td>
                    <td>${integer(movement.quantityOut)}</td>
                    <td>${integer(movement.stockAfter)}</td>
                    <td>${escapeHTML(movement.reference || "—")}</td>
                </tr>
            `).join("")
            : emptyRow(7, "Aucun mouvement enregistré.");
    }

    /* =====================================================
       9. DÉPENSES
    ===================================================== */

    async function handleExpenseSubmit(event) {
        event.preventDefault();

        const amount = number(byId("expenseAmount").value, -1);
        const description = byId("expenseDescription").value.trim();

        if (amount <= 0 || !description) {
            notify("Saisissez une description et un montant positif.", "error");
            return;
        }

        const expense = {
            id: uid("expense"),
            date: byId("expenseDate").value || today(),
            category: byId("expenseCategory").value,
            description,
            amount,
            createdAt: localDateTime()
        };

        await putRecord("expenses", expense);

        byId("expenseForm").reset();
        setValue("expenseDate", today());

        notify("Dépense enregistrée.");
        await refreshAll();
    }

    function renderExpenses() {
        const body = byId("expensesTableBody");
        if (!body) return;

        const expenses = [...state.expenses].sort(
            (a, b) => String(b.date).localeCompare(String(a.date))
        );

        body.innerHTML = expenses.length
            ? expenses.map(expense => `
                <tr>
                    <td>${dateLabel(expense.date)}</td>
                    <td>${escapeHTML(expense.category)}</td>
                    <td>${escapeHTML(expense.description)}</td>
                    <td>${moneyText(expense.amount)}</td>
                    <td>
                        <button type="button" class="btn btn-outline btn-small"
                                data-delete-expense="${escapeHTML(expense.id)}">
                            Supprimer
                        </button>
                    </td>
                </tr>
            `).join("")
            : emptyRow(5, "Aucune dépense enregistrée.");

        setText(
            "expensesTotal",
            `Total : ${moneyText(expenses.reduce((sum, expense) => sum + number(expense.amount), 0))}`
        );
    }

    async function deleteExpense(id) {
        const expense = state.expenses.find(item => item.id === id);
        if (!expense) return;

        askConfirmation("Supprimer cette dépense ?", async () => {
            await deleteRecord("expenses", id);
            notify("Dépense supprimée.");
            await refreshAll();
        });
    }

    /* =====================================================
       10. DASHBOARD
    ===================================================== */

    function renderDashboard() {
        const dailySales = salesForDate(today());

        setText(
            "dashboardTodaySales",
            moneyText(dailySales.reduce((sum, sale) => sum + number(sale.total), 0))
        );

        setText(
            "dashboardTodayProfit",
            moneyText(dailySales.reduce((sum, sale) => sum + number(sale.profit), 0))
        );

        setText(
            "dashboardStockValue",
            moneyText(state.products.reduce(
                (sum, product) =>
                    sum + integer(product.stock) * number(product.purchasePrice),
                0
            ))
        );

        setText(
            "dashboardOutOfStock",
            state.products.filter(product => integer(product.stock) <= 0).length
        );

        setText("todaySalesCount", dailySales.length);

        const recentBody = byId("dashboardRecentSales");

        if (recentBody) {
            const recent = [...state.sales]
                .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
                .slice(0, 7);

            recentBody.innerHTML = recent.length
                ? recent.map(sale => `
                    <tr>
                        <td>${dateLabel(sale.date)}</td>
                        <td>${escapeHTML(sale.productName)}</td>
                        <td>${integer(sale.quantity)}</td>
                        <td>${moneyText(sale.total)}</td>
                        <td>${moneyText(sale.profit)}</td>
                    </tr>
                `).join("")
                : emptyRow(5, "Aucune vente enregistrée.");
        }

        const alerts = byId("dashboardStockAlerts");

        if (alerts) {
            const threshold = integer(state.settings.lowStockThreshold);
            const products = state.products.filter(
                product => integer(product.stock) <= threshold
            );

            alerts.innerHTML = products.length
                ? products.slice(0, 10).map(product => `
                    <div class="stock-alert-item">
                        <div>
                            <strong>${escapeHTML(product.name)}</strong>
                            <small>${escapeHTML(product.code)}</small>
                        </div>
                        <span>${integer(product.stock)} unité(s)</span>
                        ${statusHTML(product)}
                    </div>
                `).join("")
                : `<div class="empty-state"><p>Aucune alerte de stock.</p></div>`;
        }
    }

    /* =====================================================
       11. RAPPORTS PAR PÉRIODE
    ===================================================== */

    function periodDates(period) {
        const now = new Date();
        const end = today();
        let start = end;

        if (period === "week") {
            const day = now.getDay();
            const daysSinceMonday = (day + 6) % 7;
            const monday = new Date(now);
            monday.setDate(now.getDate() - daysSinceMonday);
            start = localDateString(monday);
        } else if (period === "month") {
            start = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
        } else if (period === "year") {
            start = `${now.getFullYear()}-01-01`;
        }

        return { start, end };
    }

    function reportForRange(start, end) {
        const sales = state.sales.filter(
            sale => sale.date >= start && sale.date <= end
        );

        const expenses = state.expenses.filter(
            expense => expense.date >= start && expense.date <= end
        );

        const revenue = sales.reduce((sum, sale) => sum + number(sale.total), 0);
        const costOfGoods = sales.reduce(
            (sum, sale) => sum + number(sale.unitCost) * integer(sale.quantity),
            0
        );
        const grossProfit = revenue - costOfGoods;
        const expenseTotal = expenses.reduce(
            (sum, expense) => sum + number(expense.amount),
            0
        );

        const byProduct = new Map();

        sales.forEach(sale => {
            const id = sale.productId;
            const entry = byProduct.get(id) || {
                name: sale.productName,
                quantity: 0,
                revenue: 0,
                cost: 0,
                profit: 0
            };

            entry.quantity += integer(sale.quantity);
            entry.revenue += number(sale.total);
            entry.cost += number(sale.unitCost) * integer(sale.quantity);
            entry.profit += number(sale.profit);

            byProduct.set(id, entry);
        });

        return {
            sales,
            expenses,
            revenue,
            costOfGoods,
            grossProfit,
            expenseTotal,
            netProfit: grossProfit - expenseTotal,
            byProduct: Array.from(byProduct.values()).sort(
                (a, b) => b.revenue - a.revenue
            )
        };
    }

    function renderReports() {
        const start = byId("reportStartDate")?.value || today();
        const end = byId("reportEndDate")?.value || today();

        if (start > end) {
            notify("La date de début doit précéder la date de fin.", "error");
            return;
        }

        const report = reportForRange(start, end);

        setText("reportRevenue", moneyText(report.revenue));
        setText("reportCostOfGoods", moneyText(report.costOfGoods));
        setText("reportGrossProfit", moneyText(report.grossProfit));
        setText("reportNetProfit", moneyText(report.netProfit));

        const body = byId("reportProductsBody");
        if (!body) return;

        body.innerHTML = report.byProduct.length
            ? report.byProduct.map(item => `
                <tr>
                    <td>${escapeHTML(item.name)}</td>
                    <td>${item.quantity}</td>
                    <td>${moneyText(item.revenue)}</td>
                    <td>${moneyText(item.cost)}</td>
                    <td>${moneyText(item.profit)}</td>
                </tr>
            `).join("")
            : emptyRow(5, "Aucune vente sur cette période.");
    }

    function exportReport() {
        const start = byId("reportStartDate")?.value || today();
        const end = byId("reportEndDate")?.value || today();
        const report = reportForRange(start, end);

        exportCSV(
            `rapport-${start}-${end}.csv`,
            ["Produit", "Quantité vendue", "Chiffre d'affaires", "Coût des ventes", "Bénéfice brut"],
            report.byProduct.map(item => [
                item.name,
                item.quantity,
                item.revenue.toFixed(2),
                item.cost.toFixed(2),
                item.profit.toFixed(2)
            ])
        );
    }

    /* =====================================================
       12. HISTORIQUE GLOBAL
    ===================================================== */

    function getHistoryItems() {
        const entries = [];

        state.sales.forEach(sale => entries.push({
            id: sale.id,
            date: sale.createdAt || sale.date,
            reference: sale.id,
            type: "sale",
            typeLabel: "Vente",
            detail: `${sale.productName} × ${sale.quantity}${sale.customer ? ` — ${sale.customer}` : ""}`,
            amount: sale.total,
            status: sale.status || "completed"
        }));

        state.purchases.forEach(purchase => entries.push({
            id: purchase.id,
            date: purchase.createdAt || purchase.date,
            reference: purchase.reference,
            type: "purchase",
            typeLabel: "Achat",
            detail: `${purchase.items.length} ligne(s) — ${purchase.supplier || "Fournisseur non précisé"}`,
            amount: purchase.total,
            status: "Enregistré"
        }));

        state.expenses.forEach(expense => entries.push({
            id: expense.id,
            date: expense.createdAt || expense.date,
            reference: expense.id,
            type: "expense",
            typeLabel: "Dépense",
            detail: expense.description,
            amount: expense.amount,
            status: "Enregistré"
        }));

        return entries.sort(
            (a, b) => String(b.date).localeCompare(String(a.date))
        );
    }

    function renderHistory() {
        const body = byId("historyTableBody");
        if (!body) return;

        const query = (byId("historySearch")?.value || "").trim().toLowerCase();
        const type = byId("historyTypeFilter")?.value || "all";

        const entries = getHistoryItems().filter(entry => {
            const matchesType = type === "all" || entry.type === type;
            const searchable = [
                entry.reference,
                entry.typeLabel,
                entry.detail,
                entry.status
            ].join(" ").toLowerCase();

            return matchesType && searchable.includes(query);
        });

        body.innerHTML = entries.length
            ? entries.map(entry => `
                <tr>
                    <td>${dateLabel(entry.date)}</td>
                    <td>${escapeHTML(entry.reference)}</td>
                    <td>${escapeHTML(entry.typeLabel)}</td>
                    <td>${escapeHTML(entry.detail)}</td>
                    <td>${moneyText(entry.amount)}</td>
                    <td>${escapeHTML(entry.status)}</td>
                    <td>
                        ${entry.type === "sale"
                            ? `<button type="button" class="btn btn-outline btn-small" data-delete-sale="${escapeHTML(entry.id)}">Annuler</button>`
                            : entry.type === "purchase"
                                ? `<button type="button" class="btn btn-outline btn-small" data-delete-purchase="${escapeHTML(entry.id)}">Annuler</button>`
                                : `<button type="button" class="btn btn-outline btn-small" data-delete-expense="${escapeHTML(entry.id)}">Supprimer</button>`
                        }
                    </td>
                </tr>
            `).join("")
            : emptyRow(7, "Aucune transaction correspondant à votre recherche.");
    }

    /* =====================================================
       13. PARAMÈTRES
    ===================================================== */

    async function applySettingsToForm() {
        setValue("businessName", state.settings.businessName);
        setValue("defaultCurrency", state.settings.currency);
        setValue("lowStockThreshold", state.settings.lowStockThreshold);
        setValue("businessLanguage", state.settings.language);
    }

    async function handleSettingsSubmit(event) {
        event.preventDefault();

        const threshold = Number(byId("lowStockThreshold").value);

        if (!Number.isInteger(threshold) || threshold < 0) {
            notify("Le seuil de stock doit être un entier positif ou zéro.", "error");
            return;
        }

        state.settings = {
            businessName: byId("businessName").value.trim() || "AppBiznis Samantha",
            currency: byId("defaultCurrency").value || "HTG",
            lowStockThreshold: threshold,
            language: byId("businessLanguage").value || "fr"
        };

        await putRecord("settings", {
            id: "preferences",
            value: { ...state.settings }
        });

        document.title = `${state.settings.businessName} | Gestion commerciale`;

        const businessStrong = $(".brand-text strong");
        if (businessStrong) {
            businessStrong.textContent = state.settings.businessName;
        }

        notify("Paramètres enregistrés.");
        await refreshAll();
    }

    /* =====================================================
       14. SAUVEGARDE MANUELLE ET EXPORT JSON
    ===================================================== */

    async function saveNow() {
        if (state.saving) return;

        state.saving = true;

        const button = byId("saveNowButton");
        const previousLabel = button?.textContent;

        if (button) {
            button.disabled = true;
            button.setAttribute("aria-busy", "true");
        }

        try {
            // Toutes les opérations métier sont écrites dans IndexedDB
            // avant de signaler leur succès. Ici, on vérifie l'accès
            // et enregistre l'heure de la sauvegarde demandée.
            await reloadState();

            const savedAt = localDateTime();

            await putRecord("meta", {
                id: "lastSavedAt",
                value: savedAt
            });

            setText("lastSavedAt", `Dernière sauvegarde : ${timeLabel(savedAt)}`);
            await updateDatabaseStatus();

            notify("Données vérifiées et sauvegardées dans le stockage local.");
        } catch (error) {
            console.error("Sauvegarde impossible :", error);
            notify("Échec de la sauvegarde. Exportez une copie JSON et vérifiez le navigateur.", "error");
        } finally {
            state.saving = false;

            if (button) {
                button.disabled = false;
                button.removeAttribute("aria-busy");

                if (previousLabel) {
                    // Le contenu original du bouton reste inchangé.
                    button.setAttribute("title", "Sauvegarder les données de l'application");
                }
            }
        }
    }

    async function exportBackup() {
        try {
            await reloadState();

            const backup = {
                application: "AppBiznis Samantha",
                version: "1.0.0",
                exportedAt: localDateTime(),
                data: {
                    products: state.products,
                    purchases: state.purchases,
                    sales: state.sales,
                    expenses: state.expenses,
                    movements: state.movements,
                    settings: [{ id: "preferences", value: state.settings }]
                }
            };

            downloadFile(
                `appbiznis-samantha-sauvegarde-${today()}.json`,
                JSON.stringify(backup, null, 2),
                "application/json;charset=utf-8"
            );

            notify("Fichier de sauvegarde JSON créé.");
        } catch (error) {
            console.error(error);
            notify("Impossible de créer la sauvegarde.", "error");
        }
    }

    async function importBackupFile(file) {
        if (!file) return;

        try {
            const textContent = await file.text();
            const backup = JSON.parse(textContent);
            const data = backup.data || backup;

            const allowed = [
                "products",
                "purchases",
                "sales",
                "expenses",
                "movements",
                "settings"
            ];

            if (!Array.isArray(data.products) || !Array.isArray(data.sales)) {
                throw new Error("Fichier invalide : produits ou ventes manquants.");
            }

            for (const storeName of allowed) {
                if (data[storeName] !== undefined && !Array.isArray(data[storeName])) {
                    throw new Error(`Le champ ${storeName} doit être une liste.`);
                }
            }

            const normalized = {
                products: data.products,
                purchases: data.purchases || [],
                sales: data.sales,
                expenses: data.expenses || [],
                movements: data.movements || [],
                settings: data.settings || [{
                    id: "preferences",
                    value: state.settings
                }]
            };

            const validProducts = normalized.products.every(product =>
                product && typeof product.id === "string" &&
                typeof product.name === "string" &&
                Number.isFinite(Number(product.stock))
            );

            if (!validProducts) {
                throw new Error("Le fichier contient des produits invalides.");
            }

            askConfirmation(
                "Importer cette sauvegarde remplacera les données actuelles. Exportez d'abord une copie si nécessaire. Continuer ?",
                async () => {
                    try {
                        // Remplacement transactionnel des données :
                        // si l'écriture échoue, IndexedDB annule la transaction.
                        await new Promise((resolve, reject) => {
                            const transaction = state.db.transaction(
                                allowed,
                                "readwrite"
                            );

                            allowed.forEach(storeName => {
                                const store = transaction.objectStore(storeName);
                                store.clear();

                                (normalized[storeName] || []).forEach(record => {
                                    store.put(record);
                                });
                            });

                            transaction.oncomplete = resolve;
                            transaction.onerror = () => reject(transaction.error);
                            transaction.onabort = () => reject(
                                transaction.error || new Error("Import annulé.")
                            );
                        });

                        await reloadState();
                        await applySettingsToForm();
                        await refreshAll();

                        notify("Sauvegarde importée avec succès.");
                    } catch (error) {
                        console.error(error);
                        notify(`Import impossible : ${error.message}`, "error");
                    }
                }
            );
        } catch (error) {
            console.error(error);
            notify(`Fichier de sauvegarde invalide : ${error.message}`, "error");
        }
    }

    /* =====================================================
       15. EXPORTATIONS CSV
    ===================================================== */

    function exportProducts() {
        exportCSV(
            `catalogue-produits-${today()}.csv`,
            [
                "Code", "Produit", "Catégorie", "Prix achat",
                "Prix vente", "Bénéfice unitaire", "Stock", "Statut"
            ],
            state.products.map(product => [
                product.code,
                product.name,
                categoryLabel(product.category),
                product.purchasePrice,
                product.sellingPrice,
                number(product.sellingPrice) - number(product.purchasePrice),
                product.stock,
                productStatus(product)
            ])
        );
    }

    function exportInventory() {
        exportCSV(
            `inventaire-${today()}.csv`,
            ["Code", "Produit", "Stock initial", "Total acheté", "Total vendu", "Stock actuel", "Valeur stock", "Statut"],
            state.products.map(product => [
                product.code,
                product.name,
                product.initialStock,
                product.totalPurchased,
                product.totalSold,
                product.stock,
                integer(product.stock) * number(product.purchasePrice),
                productStatus(product)
            ])
        );
    }

    function exportSales() {
        const sales = [...state.sales].sort(
            (a, b) => String(a.createdAt).localeCompare(String(b.createdAt))
        );

        exportCSV(
            `ventes-${today()}.csv`,
            ["Date", "Heure", "Client", "Produit", "Quantité", "Prix unitaire", "Remise", "Total", "Bénéfice", "Montant reçu", "Reste à payer"],
            sales.map(sale => [
                sale.date,
                timeLabel(sale.createdAt),
                sale.customer,
                sale.productName,
                sale.quantity,
                sale.unitPrice,
                sale.discount,
                sale.total,
                sale.profit,
                sale.amountPaid,
                sale.balanceDue
            ])
        );
    }

    function exportPurchases() {
        exportCSV(
            `achats-${today()}.csv`,
            ["Date", "Référence", "Fournisseur", "Produit", "Quantité", "Prix achat unitaire", "Total ligne"],
            state.purchases.flatMap(purchase =>
                purchase.items.map(item => [
                    purchase.date,
                    purchase.reference,
                    purchase.supplier,
                    item.productName,
                    item.quantity,
                    item.unitCost,
                    item.total
                ])
            )
        );
    }

    /* =====================================================
       16. RAFRAÎCHISSEMENT GÉNÉRAL
    ===================================================== */

    async function refreshAll() {
        await reloadState();

        renderDashboard();
        renderProductsPage();
        renderSalesPage();
        renderInventoryPage();
        renderExpenses();
        renderPurchaseHistory();
        renderHistory();
        renderReports();

        setText("footerYear", new Date().getFullYear());

        const headerDate = byId("headerDate");
        if (headerDate) {
            const span = $("span", headerDate);
            if (span) {
                span.textContent = new Intl.DateTimeFormat("fr-FR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                }).format(new Date());
            }
        }
    }

    /* =====================================================
       17. ÉVÉNEMENTS : BOUTONS, FORMULAIRES, FILTRES
    ===================================================== */

    function bindEvents() {
        // Navigation : tous les éléments portant data-page
        document.addEventListener("click", event => {
            const navigation = event.target.closest("[data-page]");

            if (navigation) {
                event.preventDefault();
                navigateTo(navigation.dataset.page);
                return;
            }

            const closeButton = event.target.closest("[data-close-modal]");

            if (closeButton) {
                closeDialog(closeButton.dataset.closeModal);
                return;
            }

            const selectButton = event.target.closest("[data-select-product]");

            if (selectButton) {
                const product = productById(selectButton.dataset.selectProduct);

                if (product && integer(product.stock) > 0) {
                    selectSaleProduct(product.id);
                } else if (product) {
                    notify("Ce produit est en rupture de stock.", "warning");
                }

                return;
            }

            const editButton = event.target.closest("[data-edit-product]");

            if (editButton) {
                openProductModal(productById(editButton.dataset.editProduct));
                return;
            }

            const removePurchase = event.target.closest("[data-remove-purchase-row]");

            if (removePurchase) {
                const row = $(`[data-purchase-row="${CSS.escape(removePurchase.dataset.removePurchaseRow)}"]`);

                if (row) row.remove();

                calculatePurchaseTotal();
                return;
            }

            const deleteSaleButton = event.target.closest("[data-delete-sale]");

            if (deleteSaleButton) {
                reverseSale(deleteSaleButton.dataset.deleteSale);
                return;
            }

            const deletePurchaseButton = event.target.closest("[data-delete-purchase]");

            if (deletePurchaseButton) {
                reversePurchase(deletePurchaseButton.dataset.deletePurchase);
                return;
            }

            const deleteExpenseButton = event.target.closest("[data-delete-expense]");

            if (deleteExpenseButton) {
                deleteExpense(deleteExpenseButton.dataset.deleteExpense);
            }
        });

        byId("menuToggle")?.addEventListener("click", toggleMobileMenu);

        byId("refreshButton")?.addEventListener("click", async () => {
            try {
                await refreshAll();
                notify("Données actualisées.");
            } catch (error) {
                console.error(error);
                notify("Échec de l'actualisation.", "error");
            }
        });

        byId("saveNowButton")?.addEventListener("click", saveNow);

        byId("addProductButton")?.addEventListener("click", () => openProductModal());

        byId("productForm")?.addEventListener("submit", async event => {
            try {
                await handleProductSubmit(event);
            } catch (error) {
                console.error(error);
                notify("Impossible d'enregistrer le produit.", "error");
            }
        });

        byId("productsSearch")?.addEventListener("input", renderProductsPage);

        byId("purchaseForm")?.addEventListener("submit", async event => {
            try {
                await handlePurchaseSubmit(event);
            } catch (error) {
                console.error(error);
                notify("Impossible d'enregistrer l'achat.", "error");
            }
        });

        byId("addPurchaseItem")?.addEventListener("click", () => addPurchaseRow());

        byId("purchaseItemsBody")?.addEventListener("input", event => {
            if (
                event.target.matches(".purchase-quantity") ||
                event.target.matches(".purchase-unit-cost")
            ) {
                calculatePurchaseTotal();
            }
        });

        byId("purchaseItemsBody")?.addEventListener("change", event => {
            if (event.target.matches(".purchase-product")) {
                const product = productById(event.target.value);
                const row = event.target.closest("tr");

                if (product && row) {
                    const costInput = $(".purchase-unit-cost", row);
                    if (costInput) costInput.value = product.purchasePrice;
                }

                calculatePurchaseTotal();
            }
        });

        byId("resetPurchaseForm")?.addEventListener("click", () => {
            window.setTimeout(() => {
                setValue("purchaseDate", today());
                setValue("purchaseCurrency", currencyCode());
                setHTML("purchaseItemsBody", "");
                addPurchaseRow();
            }, 0);
        });

        byId("saleForm")?.addEventListener("submit", async event => {
            try {
                await handleSaleSubmit(event);
            } catch (error) {
                console.error(error);
                notify("Impossible d'enregistrer la vente.", "error");
            }
        });

        byId("saleForm")?.addEventListener("reset", () => {
            window.setTimeout(() => {
                state.selectedProductId = null;
                setValue("saleProductId", "");
                setText("selectedProductName", "Aucun produit");
                setText("selectedProductPrice", "Prix de vente : —");
                setText("selectedProductStock", "—");
                setText("saleSelectionStatus", "Aucun produit sélectionné");
                setText("saleStockBefore", "0");
                setText("saleStockAfter", "—");
                setText("saleCalculatedTotal", moneyText(0));
                setText("saleCalculatedProfit", moneyText(0));

                if (byId("saleStockWarning")) byId("saleStockWarning").hidden = true;

                renderSalesCatalogue();
                calculateSale();
            }, 0);
        });

        ["saleQuantity", "saleUnitPrice", "saleDiscount", "saleAmountPaid"].forEach(id => {
            byId(id)?.addEventListener("input", calculateSale);
        });

        ["salesProductSearch", "salesStockFilter", "salesSortOrder"].forEach(id => {
            byId(id)?.addEventListener(
                id === "salesProductSearch" ? "input" : "change",
                renderSalesCatalogue
            );
        });

        byId("saleDate")?.addEventListener("change", renderSalesPage);

        byId("expenseForm")?.addEventListener("submit", async event => {
            try {
                await handleExpenseSubmit(event);
            } catch (error) {
                console.error(error);
                notify("Impossible d'enregistrer la dépense.", "error");
            }
        });

        byId("settingsForm")?.addEventListener("submit", async event => {
            try {
                await handleSettingsSubmit(event);
            } catch (error) {
                console.error(error);
                notify("Impossible d'enregistrer les paramètres.", "error");
            }
        });

        byId("reportFilterForm")?.addEventListener("submit", event => {
            event.preventDefault();
            renderReports();
        });

        byId("reportPeriod")?.addEventListener("change", event => {
            const period = event.target.value;

            if (period !== "custom") {
                const dates = periodDates(period);
                setValue("reportStartDate", dates.start);
                setValue("reportEndDate", dates.end);
                renderReports();
            }
        });

        ["historySearch", "historyTypeFilter"].forEach(id => {
            byId(id)?.addEventListener(
                id === "historySearch" ? "input" : "change",
                renderHistory
            );
        });

        byId("exportBackupButton")?.addEventListener("click", exportBackup);

        byId("importBackupButton")?.addEventListener("click", () => {
            byId("backupFileInput")?.click();
        });

        byId("backupFileInput")?.addEventListener("change", async event => {
            const file = event.target.files?.[0];

            try {
                await importBackupFile(file);
            } finally {
                event.target.value = "";
            }
        });

        byId("exportProductsButton")?.addEventListener("click", exportProducts);
        byId("exportInventoryButton")?.addEventListener("click", exportInventory);
        byId("exportSalesButton")?.addEventListener("click", exportSales);
        byId("exportPurchasesButton")?.addEventListener("click", exportPurchases);
        byId("exportReportsButton")?.addEventListener("click", exportReport);

        byId("confirmModalAction")?.addEventListener("click", async () => {
            const callback = state.confirmCallback;
            state.confirmCallback = null;
            closeDialog("confirmModal");

            if (callback) {
                try {
                    await callback();
                } catch (error) {
                    console.error(error);
                    notify("L'opération n'a pas pu être terminée.", "error");
                }
            }
        });

        // Évite que le bouton Entrée dans une recherche soumette un formulaire.
        ["productsSearch", "salesProductSearch", "historySearch"].forEach(id => {
            byId(id)?.addEventListener("keydown", event => {
                if (event.key === "Enter") event.preventDefault();
            });
        });
    }

    /* =====================================================
       18. INITIALISATION
    ===================================================== */

    async function init() {
        try {
            if (byId("purchaseDate")) byId("purchaseDate").value = today();
            if (byId("saleDate")) byId("saleDate").value = today();
            if (byId("expenseDate")) byId("expenseDate").value = today();

            if (byId("reportStartDate")) byId("reportStartDate").value = today();
            if (byId("reportEndDate")) byId("reportEndDate").value = today();

            bindEvents();

            await initializeDatabase();

            if (state.products.length === 0) {
                await writeMany({ products: createDefaultProducts() });
                await reloadState();
            }

            addPurchaseRow();

            const savedMeta = (await getAll("meta"))
                .find(record => record.id === "lastSavedAt");

            if (savedMeta?.value) {
                setText("lastSavedAt", `Dernière sauvegarde : ${timeLabel(savedMeta.value)}`);
            } else {
                setText("lastSavedAt", "Aucune sauvegarde récente");
            }

            await refreshAll();
            navigateTo("dashboard");

            notify("AppBiznis Samantha est prête à fonctionner.");

        } catch (error) {
            console.error("Erreur d'initialisation :", error);

            const status = byId("databaseStatus");
            if (status) {
                status.textContent =
                    "Erreur de stockage. Ouvrez l'application dans un navigateur compatible et vérifiez ses autorisations.";
            }

            notify(
                "L'application n'a pas pu démarrer correctement. Vérifiez IndexedDB et la console du navigateur.",
                "error"
            );
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }

})();