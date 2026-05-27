// ==========================
// FOBAS BUSINESSES
// FINAL VERSION
// ==========================

const API_URL =
"https://api.fondationbackupspirituel.com";


// ==========================
// LOADER
// ==========================
window.addEventListener("load", () => {

  const loader =
    document.getElementById("loader");

  setTimeout(() => {

    if(loader){
      loader.style.display = "none";
    }

  }, 800);

  loadBusinesses();

});


// ==========================
// LOAD BUSINESSES
// ==========================
async function loadBusinesses() {

  try {

    const res = await fetch(
      `${API_URL}/business/all`
    );

    const data = await res.json();
   window.businessCache = data.businesses || [];
    
    const grid =
      document.getElementById("businessGrid");

    if(!grid) return;

    grid.innerHTML = "";

    // ==========================
    // EMPTY
    // ==========================
    if(!data.businesses?.length){

      grid.innerHTML = `

      <div class="empty-business">

        <i class="fa-solid fa-shop"></i>

        <h3>
          Aucun business disponible
        </h3>

        <p>
          Les entrepreneurs FOBAS
          arriveront bientôt.
        </p>

      </div>

      `;

      return;
    }

    // ==========================
    // LOOP
    // ==========================
    data.businesses.forEach((business) => {

      // ==========================
      // PRODUCTS
      // ==========================
      let productsHTML = "";

if (business.products && business.products.length) {

  business.products.forEach((product) => {

    const wa =
      (business.whatsapp || "").replace(/\D/g, "");

    productsHTML += `
      <div class="product-card" data-product-id="${product._id}">

        <img
          class="product-image"
          src="${product.image}"
        />

        <div class="product-details">

          <div class="product-name">
            ${product.name || "Produit"}
          </div>

          <div class="product-price">
            ${product.price || 0} HTG
          </div>




<!-- ACTIONS -->
<div style="margin-top:10px; display:flex; gap:8px;">

  <button
    class="command-btn"
    onclick='openOrderModal(
      ${JSON.stringify(business)},
      ${JSON.stringify(product)}
    )'
  >
    Commander
  </button>

  <a
    class="whatsapp-btn"
    href="${wa ? `https://wa.me/${wa}` : "#"}"
    target="_blank"
  >
    WhatsApp
  </a>

</div>

        </div>

      </div>
    `;
  });
}



       // ==========================
      // CARD
      // ==========================
      grid.innerHTML += `

      <div class="business-card">

        <!-- BANNER -->
<div class="business-banner">

  <img
    src="${
      business.logo
      ? `${API_URL}${business.logo}`
      : 'https://via.placeholder.com/200'
    }"
    class="business-logo"
  />

</div>

        <!-- CONTENT -->
        <div class="business-content">

          <h3>
            ${business.businessName || "FOBAS BUSINESS"}
          </h3>

          <div class="business-info">

            <p>
              <i class="fa-solid fa-location-dot"></i>
              ${business.city || "Ville"}
            </p>

            

            <p>
              <i class="fa-solid fa-user"></i>
              ${business.name || "Entrepreneur"}
            </p>

          </div>

          <!-- PRODUCTS -->
          <div class="products-gallery">

            ${productsHTML}

          </div>
        </div>

        </div>

      </div>

      `;

    });

  }

  catch(error){

    console.error(
      "BUSINESS LOAD ERROR:",
      error
    );

  }

}


// ==========================
// SEARCH
// ==========================
const search =
document.getElementById("searchBusiness");

search?.addEventListener("input", () => {

  const value =
    search.value.toLowerCase();

  const cards =
    document.querySelectorAll(".business-card");

  cards.forEach((card) => {

    const text =
      card.innerText.toLowerCase();

    card.style.display =
      text.includes(value)
      ? "block"
      : "none";

  });

});


// ==========================
// ORDER MODAL
// ==========================
function openOrderModal(business, product = null){
  
  // REMOVE OLD
  const old =
    document.getElementById("orderModal");

  if(old){
    old.remove();
  }

  // CREATE
  const modal =
    document.createElement("div");

  modal.className =
    "order-modal active";

  modal.id = "orderModal";

  let price = product?.price;

if(!price && business.products?.length){
  price = business.products[0].price;
}

setProductPrice(price || 1);

  modal.innerHTML = `

  <div class="order-box">

    <h2>
      Commander chez
      ${business.businessName}
    </h2>

    <div class="order-grid">

      <div class="order-group">

        <label>Nom complet</label>

        <input
          type="text"
          id="clientName"
          placeholder="Votre nom"
        />

      </div>

      <div class="order-group">

        <label>Téléphone</label>

        <input
          type="text"
          id="clientPhone"
          placeholder="+509..."
        />

      </div>

      <div class="order-group">

        <label>Adresse</label>

        <input
          type="text"
          id="clientAddress"
          placeholder="Votre adresse"
        />

      </div>


  <div class="order-group">

  <label>Quantité</label>

  <input
    type="number"
    id="quantity"
    min="1"
    value="1"
    oninput="updateTotalPrice()"
  />

</div>

<div class="order-group">

  <label>Total à payer</label>

  <input
    type="number"
    id="totalPrice"
    readonly
    value="0"
  />

</div>
      

      <div class="order-group">

        <label>Méthode paiement</label>

        <select id="paymentMethod">

          <option value="Natcash">
            Natcash
          </option>

          <option value="Moncash">
            Moncash
          </option>

          <option value="FOBAS">
            FOBAS
          </option>

        </select>

      </div>

    </div>

    <div class="order-group" style="margin-top:20px;">

      <label>Commande</label>

      <textarea
        id="clientOrder"
        placeholder="Votre commande..."
      ></textarea>

    </div>

    <!-- PAYMENT -->
    <div class="payment-preview">

      <h3>
        Informations Paiement
      </h3>

      <p>
        <strong>Natcash :</strong>
        ${business.natcash || "Non disponible"}
      </p>

      <p>
        <strong>Moncash :</strong>
        ${business.moncash || "Non disponible"}
      </p>

      <p>
        <strong>FOBAS :</strong>
        ${business.fobasEmail || "Non disponible"}
      </p>

      <div class="payment-upload">

        <label>
          Preuve Paiement
        </label>

        <input
          type="file"
          id="paymentProof"
          accept="image/*"
        />

      </div>

    </div>

    <!-- BUTTONS -->
    <div class="order-buttons">

      <button
        class="send-order-btn"
        onclick='submitOrder("${business._id}")'
      >
        Envoyer Commande
      </button>

      <button
        class="close-order-btn"
        onclick="closeOrderModal()"
      >
        Fermer
      </button>

    </div>

  </div>

  `;

  document.body.appendChild(modal);

}


// ==========================
// CLOSE MODAL
// ==========================
function closeOrderModal(){

  const modal =
    document.getElementById("orderModal");

  if(modal){
    modal.remove();
  }

}


// ==========================
// SUBMIT ORDER
// ==========================
async function submitOrder(businessId){

  try {

    const file =
      document.getElementById("paymentProof")?.files[0];

    const clientName =
      document.getElementById("clientName").value.trim();

    const phone =
      document.getElementById("clientPhone").value.trim();

    const address =
      document.getElementById("clientAddress").value.trim();

    const paymentMethod =
      document.getElementById("paymentMethod").value;

    const orderText =
      document.getElementById("clientOrder")?.value?.trim() || "";

  const totalPrice =
    document.getElementById("totalPrice")?.value || 0;

    const email =
      localStorage.getItem("userEmail");

    // ⚠️ VALIDATION SAFE
    if(!clientName || !phone || !address || !file){
      alert("Ranpli tout chan yo");
      return;
    }

    const formData = new FormData();

    formData.append("businessId", businessId);
    formData.append("clientName", clientName);
    formData.append("phone", phone);
    formData.append("address", address);
    formData.append("product", orderText);
    formData.append("paymentMethod", paymentMethod);
    formData.append("basePrice", totalPrice);
    formData.append("email", email);

    if(file){
      formData.append("proof", file);
    }

    const res = await fetch(
      `${API_URL}/business/order`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await res.json();

    if(data.success){

      alert("Commande envoyée avec succès");

      closeOrderModal();

    } else {

      alert(data.message || "Erreur commande");

    }

  } catch(err){

    console.error("ORDER ERROR:", err);
    alert("Erreur serveur");

  }
}



// ==========================
// DEBUG
// ==========================
console.log(
  "FOBAS BUSINESSES CONNECTED"
);


function openOrderModalById(id){
  const business = (window.businessCache || []).find(b => b._id === id);

  if(!business) return;

  openOrderModal(business);
}








let currentBusinessProductPrice = 1;

// ==========================
// SET PRICE WHEN MODAL OPEN
// ==========================
function setProductPrice(price) {
  currentBusinessProductPrice = Number(price) || 0;
  updateTotalPrice();
}

// ==========================
// UPDATE TOTAL (SAFE)
// ==========================
function updateTotalPrice() {

  const qtyEl =
    document.getElementById("quantity");

  const totalEl =
    document.getElementById("totalPrice");

  if(!qtyEl || !totalEl) return;

  const qty =
    Number(qtyEl.value) || 1;

  // PRIX BASE
  const subtotal =
    currentBusinessProductPrice * qty;

  // FOBAS 5%
  const fee =
    subtotal * 0.05;

  // TOTAL CLIENT
  const total =
    subtotal + fee;

  totalEl.value =
    Math.round(total);

}
