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
