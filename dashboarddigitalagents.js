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
    if (data.avatar && userAvatar) {
  userAvatar.src = `${API_URL}${data.avatar}?t=${Date.now()}`;
}
    


    // ==========================
    // BASIC USER INFO
    // ==========================
    document.getElementById("userName").innerText = data.name || "Utilisateur";

    document.getElementById("userRole").innerText = data.role || "agent";

    document.getElementById("userRoleCard").innerText = data.role || "agent";


// ==========================
// AVATAR STABILITY
// ==========================
if (
  data.avatar &&
  userAvatar
) {

  if (
    data.avatar.startsWith("http")
  ) {

    userAvatar.src =
      data.avatar;

  } else {

    userAvatar.src =
      `${API_URL}${data.avatar}`;

  }

}

    


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
      if(
        data.success &&
        data.avatar
      ){

        userAvatar.src =
        `${API_URL}${data.avatar}`;

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
