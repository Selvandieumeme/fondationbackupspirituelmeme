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
