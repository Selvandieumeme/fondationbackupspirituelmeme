// ==========================
// FOBAS DASHBOARD JS
// ==========================

const API_URL = "https://api.fondationbackupspirituel.com";


// ==========================
// LOAD DASHBOARD
// ==========================
window.addEventListener("DOMContentLoaded", async () => {

  try {

    const email = localStorage.getItem("userEmail");

    if (!email) {
      window.location.href = "/deveniragents.html";
      return;
    }

    const response = await fetch(
      `${API_URL}/dashboard/profile?email=${email}`
    );

    const data = await response.json();

   const productBtn = document.getElementById("openProductUploaderBtn");

if (productBtn) {
  productBtn.addEventListener("click", () => {

    if (
      data.role === "entrepreneur" ||
      data.role === "agent_entrepreneur"
    ) {
      openProductModal();
    } else {
      alert("Accès refusé");
    }

  });
}

    // ==========================
    // AVATAR (CLEAN + SINGLE SOURCE OF TRUTH)
    // ==========================
    const userAvatar = document.getElementById("userAvatar");

    if (userAvatar) {
      userAvatar.src = data.avatar
        ? `${API_URL}${data.avatar}?t=${Date.now()}`
        : "https://via.placeholder.com/120";
    }

    
   
    


    // ==========================
    // BASIC USER INFO
    // ==========================
    document.getElementById("userName").innerText = data.name || "Utilisateur";

    document.getElementById("userRole").innerText = data.role || "agent";

    document.getElementById("userRoleCard").innerText = data.role || "agent";



    


    // ==========================
    // STATS
    // ==========================
    document.getElementById("totalCommission").innerText =
      (data.totalCommission || 0) + " HTG";

    document.getElementById("userLevel").innerText =
      data.level || "Bronze";

    document.getElementById("userProgress").innerText =
      (data.progress || 0) + "%";


    // ==========================
    // AGENT SECTION
    // ==========================
    if (
      data.role === "agent" ||
      data.role === "agent_entrepreneur"
    ) {

      document.getElementById("agentSection").style.display = "block";

      document.getElementById("referralCode").innerText =
        data.referralCode || "---";

      document.getElementById("totalReferrals").innerText =
        data.totalReferrals || 0;

      document.getElementById("monthlyRevenue").innerText =
        (data.monthlyRevenue || 0) + " HTG";


  // ==========================
      // REFERRAL LINK
      // ==========================
      const referralLinkInput =
        document.getElementById(
          "referralLink"
        );

      if (
        referralLinkInput &&
        data.referralCode
      ) {

        referralLinkInput.value =
          `https://fondationbackupspirituel.com/deveniragents.html?ref=${data.referralCode}`;

      }


 const marketplaceLink =
  document.getElementById("marketplaceLink");

if (
  marketplaceLink &&
  data.referralCode &&
  (data.role === "agent" || data.role === "agent_entrepreneur")
) {

  marketplaceLink.value =
    `https://www.fondationbackupspirituel.com/businesses.html?ref=${data.referralCode}`;

}


      



      
      
      // ==========================
// REFERRAL LIST
// ==========================
const referralList =
  document.getElementById(
    "referralList"
  );

if (
  referralList &&
  Array.isArray(data.referrals)
) {

  referralList.innerHTML = "";

  if (data.referrals.length === 0) {

    referralList.innerHTML =
      "<li>Aucune référence pour le moment.</li>";

  } else {

    data.referrals.forEach(
      (ref) => {

        const li =
          document.createElement("li");

        li.innerText =
          `${ref.name || "Utilisateur"} (${ref.role || "entrepreneur"})`;

        referralList.appendChild(li);

      }
    );

  }

}

      
      

    } else {

      document.getElementById("agentSection").style.display = "none";

    }



      

    
    
    // ==========================
    // ENTREPRENEUR SECTION
    // ==========================
    if (
      data.role === "entrepreneur" ||
      data.role === "agent_entrepreneur"
    ) {

      document.getElementById("entrepreneurSection").style.display = "block";

      document.getElementById("businessName").innerText =
        data.businessName || "---";

      document.getElementById("businessCity").innerText =
        data.city || "---";

      document.getElementById("businessWhatsapp").innerText =
        data.whatsapp || "---";

      // ==========================
      // BUSINESS LOGO STABILITY
      // ==========================
      if (
        data.logo &&
        businessLogoPreview
      ) {

        // ==========================
        // AUTO FIX URL
        // ==========================
        if (
          data.logo.startsWith("http")
        ) {

          businessLogoPreview.src =
            data.logo;

        } else {

          businessLogoPreview.src =
            `${API_URL}${data.logo}`;

        }

      }

    } else {

      document.getElementById("entrepreneurSection").style.display = "none";

    }

  }
 
  catch (err) {

    console.error("DASHBOARD ERROR:", err);

  }

});


// ==========================
// LOGOUT
// ==========================
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn?.addEventListener("click", () => {

  localStorage.removeItem("userEmail");
  localStorage.removeItem("agentReferralCode");

  window.location.href = "/deveniragents.html";

});




// ==========================
// BUSINESS LOGO PREVIEW
// ==========================

const businessLogoInput =
document.getElementById(
  "businessLogoInput"
);

const businessLogoPreview =
document.getElementById(
  "businessLogoPreview"
);

businessLogoInput?.addEventListener(
  "change",
  (e) => {

    const file =
      e.target.files[0];

    if(!file) return;

    const reader =
      new FileReader();

    reader.onload = () => {

      businessLogoPreview.src =
        reader.result;

    };

    reader.readAsDataURL(file);

});





// ==========================
// UPLOAD BUSINESS LOGO
// ==========================

const uploadBusinessLogoBtn =
document.getElementById(
  "uploadBusinessLogoBtn"
);

uploadBusinessLogoBtn?.addEventListener(
  "click",
  async () => {

    try{

      const file =
      businessLogoInput.files[0];

      if(!file){

        alert(
          "Choisissez un logo."
        );

        return;
      }

      const email =
      localStorage.getItem(
        "userEmail"
      );

      const formData =
      new FormData();

      formData.append(
        "logo",
        file
      );

      formData.append(
        "email",
        email
      );

      const res = await fetch(

        `${API_URL}/business/upload-logo`,

        {
          method:"POST",
          body:formData
        }

      );

      const data =
      await res.json();

      if(data.success){

        alert(
          "Logo business mis à jour."
        );

      }

      else{

        alert(
          data.message ||
          "Erreur upload."
        );

      }

    }

    catch(error){

      console.error(
        "UPLOAD LOGO ERROR:",
        error
      );

      alert(
        "Erreur serveur."
      );

    }

});











// ==========================
// AVATAR SYSTEM
// ==========================

const avatarInput =
document.getElementById(
  "avatarInput"
);

const userAvatar =
document.getElementById(
  "userAvatar"
);

// ==========================
// OPEN FILE SELECTOR
// ==========================
userAvatar?.addEventListener(
  "click",
  () => {

    avatarInput.click();

  }
);

// ==========================
// UPLOAD AVATAR
// ==========================
avatarInput?.addEventListener(
  "change",

  async (e) => {

    try {

      const file =
      e.target.files[0];

      if(!file) return;

      // ==========================
      // LOCAL PREVIEW
      // ==========================
      const reader =
      new FileReader();

      reader.onload = () => {

        userAvatar.src =
        reader.result;

      };

      reader.readAsDataURL(file);

      // ==========================
      // FORM DATA
      // ==========================
      const formData =
      new FormData();

      formData.append(
        "avatar",
        file
      );

      formData.append(
        "email",
        localStorage.getItem(
          "userEmail"
        )
      );

      // ==========================
      // REQUEST
      // ==========================
      const res =
await fetch(

  `${API_URL}/agents/upload-avatar`,

  {
    method:"POST",
    body:formData
  }

);

if(!res.ok){

  throw new Error(
    `HTTP ${res.status}`
  );

}

let data;

try{

  data = await res.json();

}

catch{

  throw new Error(
    "Réponse JSON invalide"
  );

}

      // ==========================
      // FINAL AVATAR
      // ==========================
      if (
  data.success &&
  data.avatar
) {

  const finalAvatar =
    data.avatar.startsWith("http")
      ? data.avatar
      : `${API_URL}${data.avatar}`;

  // TEST IMAGE LOAD
  const testImg = new Image();

  testImg.onload = () => {

    userAvatar.src =
      `${finalAvatar}?t=${Date.now()}`;

    alert("Avatar uploadé avec succès");

  };

  testImg.onerror = () => {

    console.error(
      "IMAGE LOAD ERROR:",
      finalAvatar
    );

    alert(
      "Avatar sauvegardé mais image inaccessible"
    );

  };

  testImg.src = finalAvatar;

}

      else{

        alert(
          data.message ||
          "Erreur avatar"
        );

      }

    }

    catch(err){

      console.error(
        "AVATAR JS ERROR:",
        err
      );

      alert(
        "Erreur serveur"
      );

    }

});










// ==========================
// COPY REFERRAL LINK
// ==========================
function copyReferralLink() {

  const referralInput =
    document.getElementById(
      "referralLink"
    );

  if (!referralInput) return;

  referralInput.select();
  referralInput.setSelectionRange(
    0,
    99999
  );

  navigator.clipboard.writeText(
    referralInput.value
  );

  alert("Lien referral copié");

}





// ==========================
// PRODUCT UPLOADER (SAFE)
// ==========================

function openProductModal() {

  const modal = document.createElement("div");

  modal.className = "modal-overlay";
  modal.id = "productModal";

  modal.innerHTML = `
    <div class="modal-box">

      <h2>Upload Produits</h2>

      <input type="text" id="productName" placeholder="Nom produit" />
      <input type="number" id="productPrice" placeholder="Prix HTG" />
      <input type="file" id="productImage" accept="image/*" />

      <button onclick="submitProduct()">Enregistrer</button>
      <button onclick="closeProductModal()">Fermer</button>

    </div>
  `;

  document.body.appendChild(modal);
}

function closeProductModal() {
  document.getElementById("productModal")?.remove();
}




// ==========================
// WITHDRAW SYSTEM (SAFE MODULE)
// ==========================

let currentWithdrawUser = null;

// OPEN MODAL
function requestWithdraw() {

  const modal = document.getElementById("withdrawModal");
  if (!modal) return;

  const email = localStorage.getItem("userEmail");

  if (!email) {
    alert("User not found");
    return;
  }

  currentWithdrawUser = email;

  // load balance live
  fetch(`${API_URL}/dashboard/profile?email=${email}`)
    .then(res => res.json())
    .then(data => {

      const text = document.getElementById("withdrawBalanceText");

      if (text) {
        text.innerText =
          `Commission disponible: ${data.totalCommission || 0} HTG`;
      }

      modal.style.display = "flex";

    });

}

// CLOSE MODAL
function closeWithdraw() {

  const modal = document.getElementById("withdrawModal");
  if (modal) modal.style.display = "none";

}


// SUBMIT WITHDRAW
async function submitWithdraw() {

  try {

    const amount = Number(document.getElementById("withdrawAmount").value);

    const method =
      document.getElementById("withdrawMethod").value;

   const withdrawNumber =
  document.getElementById("withdrawDestination").value.trim();

    if (!currentWithdrawUser) {

      alert("User not loaded");

      return;

    }

    if (!amount || amount < 2500) {

      alert("Minimum withdraw is 2500 HTG");

      return;

    }

    // ==========================
    // VALIDATE NUMBER / EMAIL
    // ==========================
    if (!withdrawNumber) {

      alert("Enter your payment number or FOBAS email");

      return;

    }

    const res = await fetch(

      `${API_URL}/agents/withdraw`,

      {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          email: currentWithdrawUser,

          amount,

          method,

          withdrawNumber

        })

      }

    );

    const data = await res.json();

    if (data.success) {

      alert("Withdraw request sent");

      closeWithdraw();

      // refresh dashboard WITHOUT reload page
      const refresh = await fetch(
        `${API_URL}/dashboard/profile?email=${currentWithdrawUser}`
      );

      const newData = await refresh.json();

      document.getElementById(
        "totalCommission"
      ).innerText =

        (newData.totalCommission || 0) + " HTG";

      // ==========================
      // RESET FIELDS
      // ==========================
      document.getElementById(
        "withdrawAmount"
      ).value = "";

      document.getElementById(
        "withdrawDestination"
      ).value = "";

    }

    else {

      alert(
        data.message || "Withdraw error"
      );

    }

  }

  catch (err) {

    console.error(
      "WITHDRAW ERROR:",
      err
    );

    alert("Server error");

  }

}







window.copyMarketplaceLink = function () {

  const input = document.getElementById("marketplaceLink");

  if (!input || !input.value) {
    alert("Lien marketplace pa disponib");
    return;
  }

  navigator.clipboard.writeText(input.value);

  alert("lien referral order copie");
};








window.submitProduct = async function () {

  try {

    const name = document.getElementById("productName")?.value?.trim();
    const price = document.getElementById("productPrice")?.value;
    const imageInput = document.getElementById("productImage");

    const image = imageInput?.files?.[0];
    const email = localStorage.getItem("userEmail");

    // ==========================
    // DEBUG (IMPORTANT)
    // ==========================
    console.log({ name, price, image, email });

    // ==========================
    // VALIDATION PROPRE
    // ==========================
    if (!name || !price || !email) {
      alert("Ranpli tout chan yo");
      return;
    }

    if (!image) {
      alert("Chwazi yon imaj pwodwi");
      return;
    }

    const formData = new FormData();

    formData.append("email", email);
    formData.append("productName_0", name);
    formData.append("productPrice_0", price);
    formData.append("products", image);

    const res = await fetch(`${API_URL}/business/save`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      alert("Produit enregistré avec succès");
      closeProductModal();
    } else {
      alert(data.message || "Erreur upload produit");
    }

  } catch (err) {
    console.error("PRODUCT ERROR:", err);
    alert("Erreur serveur");
  }

};











// ==========================
// LOAD ENTREPRENEUR PRODUCTS
// ==========================

async function loadDashboardProducts() {

  try {

    const email =
      localStorage.getItem("userEmail");

    if (!email) return;

    const container =
      document.getElementById(
        "dashboardProducts"
      );

    if (!container) return;

    const res = await fetch(
      `${API_URL}/dashboard/profile?email=${email}`
    );

    const data = await res.json();

    container.innerHTML = "";

    if (
      !data.products ||
      !Array.isArray(data.products) ||
      data.products.length === 0
    ) {

      container.innerHTML =
        "<p>Aucun produit uploadé.</p>";

      return;

    }

    data.products.forEach(
      (product, index) => {

        const card =
          document.createElement("div");

        card.className =
          "product-card";

        const imageUrl =
          product.image?.startsWith("http")
            ? product.image
            : `${API_URL}${product.image}`;

        card.innerHTML = `

          <img
            src="${imageUrl}"
            class="product-image"
          >

          <h3>
            ${product.name || "Produit"}
          </h3>

          <p>
            ${product.price || 0} HTG
          </p>

         <button
  onclick="deleteProduct('${product._id}')"
>
  Supprimer
</button>

        `;

        container.appendChild(card);

      }

    );

  }

  catch(err) {

    console.error(
      "LOAD PRODUCTS ERROR:",
      err
    );

  }

}







// ==========================
// DELETE PRODUCT
// ==========================

window.deleteProduct =
async function(index) {

  try {

    const email =
      localStorage.getItem("userEmail");

    if (!email) {

      alert("Utilisateur introuvable");
      return;

    }

    // ==========================
    // LOAD USER PRODUCTS
    // ==========================
    const profileRes =
      await fetch(
        `${API_URL}/dashboard/profile?email=${email}`
      );

    const profileData =
      await profileRes.json();

    if (
      !profileData.success
    ) {

      alert("Business introuvable");
      return;

    }

    // ==========================
    // PRODUCTS ARRAY
    // ==========================
    const products =
      Array.isArray(profileData.products)
        ? profileData.products
        : [];

    // ==========================
    // FIND PRODUCT
    // ==========================
    const product =
      products[index];

    if (!product) {

      alert("Produit introuvable");
      return;

    }

    // ==========================
    // DELETE REQUEST
    // ==========================
    const res =
      await fetch(

        `${API_URL}/business/delete-product`,

        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            businessId:
              profileData.id ||
              profileData._id,

            productId:
              product._id

          })

        }

      );

    const data =
      await res.json();

    if (data.success) {

      alert("Produit supprimé");

      loadDashboardProducts();

    }

    else {

      alert(
        data.message ||
        "Erreur suppression"
      );

    }

  }

  catch (err) {

    console.error(
      "DELETE ERROR:",
      err
    );

    alert("Erreur serveur");

  }

};
// ==========================
// AUTO REFRESH PRODUCTS
// ==========================

window.addEventListener(
  "DOMContentLoaded",
  () => {

    loadDashboardProducts();

  }
);
