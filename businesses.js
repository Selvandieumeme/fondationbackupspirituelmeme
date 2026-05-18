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

      if(
        business.products &&
        business.products.length
      ){

        business.products.forEach((product) => {

          productsHTML += `

          <div class="product-card">

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
              business.logo ||
              "https://via.placeholder.com/200"
            }"
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
              <i class="fa-brands fa-whatsapp"></i>
              ${business.whatsapp || "Whatsapp"}
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

          <!-- ACTIONS -->
          <div class="business-actions">

            <button
              class="command-btn"
              onclick='openOrderModal(${JSON.stringify(business)})'
            >
              Commander
            </button>

            <a
              href="https://wa.me/${(
                business.whatsapp || ""
              ).replace(/\D/g, "")}"
              target="_blank"
            >

              <button class="whatsapp-btn">
                WhatsApp
              </button>

            </a>

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
function openOrderModal(business){

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

    const formData =
      new FormData();

    formData.append(
      "businessId",
      businessId
    );

    formData.append(
      "name",
      document.getElementById("clientName").value
    );

    formData.append(
      "phone",
      document.getElementById("clientPhone").value
    );

    formData.append(
      "address",
      document.getElementById("clientAddress").value
    );

    formData.append(
      "order",
      document.getElementById("clientOrder").value
    );

    formData.append(
      "paymentMethod",
      document.getElementById("paymentMethod").value
    );

    // IMAGE
    const file =
      document.getElementById("paymentProof")
      ?.files[0];

    if(file){
      formData.append(
        "proof",
        file
      );
    }

    // SEND
    const res = await fetch(

      `${API_URL}/business/order`,

      {
        method:"POST",
        body:formData
      }

    );

    const data =
      await res.json();

    if(data.success){

      alert(
        "Commande envoyée avec succès"
      );

      closeOrderModal();

    }else{

      alert(
        data.message ||
        "Erreur commande"
      );

    }

  }

  catch(error){

    console.error(
      "ORDER ERROR:",
      error
    );

    alert(
      "Erreur serveur"
    );

  }

}


// ==========================
// DEBUG
// ==========================
console.log(
  "FOBAS BUSINESSES CONNECTED"
);
