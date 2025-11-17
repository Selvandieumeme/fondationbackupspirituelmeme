const API_BASE = "https://fondationbackupspirituelmeme-vip.vercel.app";

// -----------------------------
// Sidebar & Ajout Store
// -----------------------------
async function loadStoresSidebar() {
    const sidebar = document.querySelector(".stores-sidebar ul");
    sidebar.innerHTML = "";

    try {
        const res = await fetch(`${API_BASE}/api/merchants`);
        const data = await res.json();

        data.merchants.forEach(store => {
            const li = document.createElement("li");
            li.textContent = store.storeName;
            li.onclick = () => loadStoreProducts(store._id, store.storeName);
            sidebar.appendChild(li);
        });
    } catch (err) {
        console.error("Erreur chaje stores:", err);
    }
}

function addStoreButton() {
    const btn = document.querySelector(".btn-add-store");
    btn.onclick = () => {
        const formHtml = `
        <div style="padding:20px; background:#f7f7f7; border-radius:16px; text-align:center;">
            <h3>Ajoutez votre Store</h3>
            <p>Frais d'inscription: 20 USD</p>
            <input type="text" id="store-name" placeholder="Nom du store" style="padding:8px; width:80%; margin:8px 0;"/>
            <input type="text" id="store-desc" placeholder="Description" style="padding:8px; width:80%; margin:8px 0;"/>
            <button id="pay-store" style="padding:10px 16px; border:none; border-radius:10px; background:linear-gradient(90deg, #0b3b8c, #1e6fff); color:white; font-weight:700; cursor:pointer;">Payer 20 USD</button>
        </div>`;
        const sidebar = document.querySelector(".stores-sidebar");
        sidebar.insertAdjacentHTML("beforeend", formHtml);

        document.getElementById("pay-store").onclick = () => {
            const name = document.getElementById("store-name").value;
            const desc = document.getElementById("store-desc").value;
            if (!name) { alert("Veuillez entrer le nom du store."); return; }
            alert(`Store "${name}" enregisté! Vous pouvez maintenant ajouter vos produits.`);
            // ICI: Ajouter integration API pour enregistrer store
        };
    };
}

// -----------------------------
// Load Products for a Store
// -----------------------------
async function loadStoreProducts(storeId, storeName) {
    const storeContent = document.querySelector(".store-content");
    storeContent.innerHTML = `<h2>${storeName}</h2><div class="product-grid" id="product-grid"></div><div id="paypal-button-container"></div>`;

    try {
        // Simule products si API pa disponib
        const products = [
            { name: "T-shirt Fobas", price: 1500, img: "https://i.imgur.com/WMGqfIh.jpeg" },
            { name: "Casquette Fobas", price: 1200, img: "https://i.imgur.com/J5vPW5C.jpeg" },
            { name: "Sac Fobas Premium", price: 3200, img: "https://i.imgur.com/fn8m8c3.jpeg" },
            { name: "Hoodie Fobas", price: 2800, img: "https://i.imgur.com/1Y2kIhT.jpeg" },
            { name: "Mug Fobas", price: 800, img: "https://i.imgur.com/2H3dFjh.jpeg" }
        ];

        const grid = document.getElementById("product-grid");
        grid.innerHTML = "";

        products.forEach(prod => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <img src="${prod.img}" />
                <h3>${prod.name}</h3>
                <p class="price">${prod.price} Gdes</p>
                <button onclick="buyProduct('${prod.name}', ${prod.price})">Achte kounya</button>
            `;
            grid.appendChild(card);
        });

    } catch (err) {
        console.error("Erreur chargement produits:", err);
    }
}

// -----------------------------
// PAYPAL CHECKOUT
// -----------------------------
let selectedProduct = null;
let selectedAmount = null;

function gdesToUSD(gdes) {
    return (gdes / 135).toFixed(2); // konvèsyon Gdes -> USD
}

function buyProduct(name, priceGdes) {
    selectedProduct = name;
    selectedAmount = gdesToUSD(priceGdes);
    alert(`Produi: ${name}\nPri: ${priceGdes} Gdes\nUSD: ${selectedAmount}`);

    document.getElementById("paypal-button-container").innerHTML = "";
    loadPayPal();
}

function loadPayPal() {
    if (!window.paypal) { console.error("PayPal SDK pa chaje!"); return; }

    paypal.Buttons({
        createOrder: function (data, actions) {
            return actions.order.create({
                purchase_units: [{ description: selectedProduct, amount: { value: selectedAmount } }]
            });
        },
        onApprove: function (data, actions) {
            return actions.order.capture().then(details => {
                alert("Peman reyisi! Mèsi " + details.payer.name.given_name);
            });
        },
        onError: function (err) {
            console.error(err);
            alert("Erè pandan peman an!");
        }
    }).render("#paypal-button-container");
}

// -----------------------------
// INIT PAGE
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
    loadStoresSidebar();
    addStoreButton();
});
