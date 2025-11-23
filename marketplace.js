// -----------------------------
// Sidebar & Ajout Store
// -----------------------------
async function loadStoresSidebar() {
    const storeContent = document.querySelector("#fobas-store");
    sidebar.innerHTML = "";




 // ---------- Ajoute Store FOBAS kòm premye ---------- 
    const liFOBAS = document.createElement("li");
    liFOBAS.textContent = "Store FOBAS";
    liFOBAS.onclick = () => loadStoreProducts("fobas-store-id", "Store FOBAS"); 
    sidebar.prepend(liFOBAS);




    

    
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
            // TODO: API integration pou sove store
        };
    };
}

// -----------------------------
// ADMIN MODE Dinamik pou Market FOBAS
// -----------------------------
document.getElementById("adminModeBtn").onclick = async () => {
    const key = prompt("Antre modpas admin la :");
    if (!key) return;

    try {
        const res = await fetch("/api/admin/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key })
        });

        const data = await res.json();
        if (data.success) {
            localStorage.setItem("fobas_admin", "1");
            alert("Mode Admin aktive !");
            location.reload();
        } else {
            alert("Modpas incorect.");
        }
    } catch (err) {
        alert("Erè sou sèvè. Eseye ankò.");
        console.error(err);
    }
};

const isAdmin = localStorage.getItem("fobas_admin") === "1";
if (isAdmin) {
    const adminPanel = document.getElementById("admin-panel");
    if (adminPanel) adminPanel.style.display = "block";
}

// -----------------------------
// Chaje Products soti nan MongoDB
// -----------------------------
async function loadStoreProducts(storeId, storeName) {
    const storeContent = document.querySelector(".store-content");
    storeContent.innerHTML = `
        <h2>⭐ ${storeName} ⭐</h2>
        <div class="product-grid" id="product-grid"></div>
        <div id="paypal-button-container"></div>
    `;

    const grid = document.getElementById("product-grid");
    grid.innerHTML = "";

    try {
        const res = await fetch(`/api/products?storeId=${storeId}`);
        if (!res.ok) throw new Error("Pa ka chaje pwodwi nan sèvè a");
        const products = await res.json();

        products.forEach(prod => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <img src="${prod.image}" />
                <h3>${prod.name}</h3>
                <p class="price">${prod.price} Gdes</p>
                <button onclick="buyProduct('${prod.name}', ${prod.price})">Achte kounya</button>
                ${isAdmin ? `<button class="delete-btn" onclick="deleteProduct('${prod._id}', this)">❌ Efase</button>` : ""}
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        console.error("Erreur chargement produits:", err);
        grid.innerHTML = "<p>Pa gen pwodwi pou kounye a.</p>";
    }
}






// -----------------------------
// Ajoute Nouvo Produit (ADMIN) soti nan Modal HTML
// -----------------------------
async function addNewProduct(storeId) {  // ajoute storeId kòm paramèt
const name = document.getElementById("productName").value;
const price = parseFloat(document.getElementById("productPrice").value);
const imageFile = document.getElementById("productImage").files[0];

    if (!name || !price || !imageFile) return alert("Tout chan yo obligatwa.");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("image", imageFile);
    formData.append("storeId", storeId);  // voye storeId ansanm

    try {
        const res = await fetch("/api/products", { method: "POST", body: formData });
        if (res.ok) {
            alert("Pwodwi ajoute avèk siksè!");
            document.getElementById('addProductModal').style.display = 'none';
            loadStoreProducts(storeId); // chaje pwodwi pou store sa sèlman
        }
    } catch (err) {
        console.error(err);
        alert("Erè pandan ajoute pwodwi.");
    }
}


// -----------------------------
// Efase Produit (ADMIN)
// -----------------------------
async function deleteProduct(id, btn) {
    if (!confirm("Ou vle efase pwodui sa ?")) return;
    try {
        const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
        if (res.ok) btn.closest(".product-card").remove();
    } catch (err) {
        console.error(err);
        alert("Erè pandan efase pwodwi.");
    }
}












// -----------------------------
// PAYPAL CHECKOUT
// -----------------------------
let selectedProduct = null;
let selectedAmount = null;

function gdesToUSD(gdes) {
    return (gdes / 135).toFixed(2);
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










