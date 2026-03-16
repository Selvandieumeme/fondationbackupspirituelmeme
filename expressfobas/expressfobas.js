document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // ELEMENT DASHBOARD
  // =========================
  const btnExpress = document.getElementById("expressfobastransfert");
  const loader = document.getElementById("transfertLoader");

  const userRoleEl = document.getElementById("userAccountType");
  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");

  const rolesAutorises = ["Agent Autorise", "FONDATEUR FOBAS"];

  // =========================
  // VERIFIKASYON EXISTANS
  // =========================
  if (!btnExpress) {
    console.error("Bouton expressfobastransfert introuvable.");
  }

  if (!loader) {
    console.error("Loader transfertLoader introuvable.");
  }

  // =========================
  // BOUTON EXPRESS FOBAS
  // =========================
  if (btnExpress && loader) {

    btnExpress.addEventListener("click", (e) => {

      e.preventDefault();

      loader.style.display = "flex";
      btnExpress.disabled = true;

      if (!userRoleEl || !userNameEl || !userEmailEl) {

        loader.style.display = "none";
        btnExpress.disabled = false;

        alert("Erreur récupération informations utilisateur.");
        return;
      }

      let roleText = userRoleEl.textContent.trim();

      if (roleText.includes(":")) {
        roleText = roleText.split(":")[1].trim();
      }

      const userName = userNameEl.textContent.trim();
      const userEmail = userEmailEl.textContent.trim();

      setTimeout(() => {

        if (rolesAutorises.includes(roleText)) {

          window.location.href =
            "expressfobas/expressfobas.html" +
            "?name=" + encodeURIComponent(userName) +
            "&email=" + encodeURIComponent(userEmail) +
            "&role=" + encodeURIComponent(roleText);

        } else {

          loader.style.display = "none";
          btnExpress.disabled = false;

          alert("Vous n'avez aucun accès pour entrer dans cette page.");

        }

      }, 800);

    });

  }

  // =========================
  // PAGE EXPRESSFOBAS.HTML
  // =========================
  if (window.location.search.includes("name=")) {

    const params = new URLSearchParams(window.location.search);

    const name = params.get("name");
    const email = params.get("email");
    const role = params.get("role");

    if (!name || !email || !rolesAutorises.includes(role)) {

      alert("Accès refusé.");

      window.location.href =
        "https://fondationbackupspirituel.com/walletfobasdashboard.html";

      return;
    }

    const agentNameInput = document.getElementById("agentName");
    const agentEmailInput = document.getElementById("agentEmail");

    if (agentNameInput) {
      agentNameInput.value = name;
      agentNameInput.readOnly = true;
    }

    if (agentEmailInput) {
      agentEmailInput.value = email;
      agentEmailInput.readOnly = true;
    }

    // =========================
    // FORMULAIRE EXPRESSFOBAS
    // =========================

    const form = document.getElementById("expressForm");
    const transferResult = document.getElementById("transferResult");
    const transferCodeInput = document.getElementById("transferCode");
    const createdDateInput = document.getElementById("createdDate");
    const expirationDateInput = document.getElementById("expirationDate");

    if (!form) return;

    // =========================
    // GENERATE CODE
    // =========================
    function generateTransferCode() {
      return "FOB-" + Date.now().toString().slice(-7);
    }

    // =========================
    // CALCUL EXPIRATION
    // =========================
    function calculateExpiration() {
      const today = new Date();
      const expiration = new Date();
      expiration.setDate(today.getDate() + 21);
      return expiration.toISOString().split("T")[0];
    }

    // =========================
    // SUBMIT FORM
    // =========================
    form.addEventListener("submit", async (e) => {

      e.preventDefault();
      transferResult.innerHTML = "";

      const data = {

        agentName: document.getElementById("agentName").value.trim(),
        agentEmail: document.getElementById("agentEmail").value.trim(),

        senderName: document.getElementById("senderName").value.trim(),
        senderId: document.getElementById("senderId").value.trim(),
        senderCountry: document.getElementById("senderCountry").value.trim(),
        senderCity: document.getElementById("senderCity").value.trim(),
        senderAddress: document.getElementById("senderAddress").value.trim(),
        senderWhatsapp: document.getElementById("senderWhatsapp").value.trim(),

        receiverName: document.getElementById("receiverName").value.trim(),
        receiverCountry: document.getElementById("receiverCountry").value.trim(),
        receiverCity: document.getElementById("receiverCity").value.trim(),
        receiverAddress: document.getElementById("receiverAddress").value.trim(),
        receiverWhatsapp: document.getElementById("receiverWhatsapp").value.trim(),

        amountHTG: Number(document.getElementById("amountHTG").value)

      };

      if (data.amountHTG <= 0) {
        alert("Montant doit être supérieur à 0");
        return;
      }

      const fees = data.amountHTG * 0.15;
      const totalDebit = data.amountHTG + fees;

      const transferCode = generateTransferCode();
      const today = new Date().toISOString().split("T")[0];
      const expiration = calculateExpiration();

      transferCodeInput.value = transferCode;
      createdDateInput.value = today;
      expirationDateInput.value = expiration;

      const payload = {
        ...data,
        feesHTG: fees,
        totalDebitHTG: totalDebit,
        transferCode: transferCode,
        createdAt: today,
        expirationDate: expiration,
        status: "Pending"
      };

      try {

        const res = await fetch("https://api.fondationbackupspirituel.com/expressfobas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const result = await res.json();

        if (result.error) {

          transferResult.innerHTML =
            `<span style="color:red;font-weight:bold">${result.error}</span>`;

        } else {

          transferResult.innerHTML =
            `<span style="color:green;font-weight:bold">
            Transfert créé avec succès ! Code ExpressFOBAS : ${result.transferCode}
            </span>`;

        }

      } catch (err) {

        console.error("Erreur API ExpressFOBAS :", err);

        transferResult.innerHTML =
          `<span style="color:red;font-weight:bold">
          Erreur de communication avec le serveur. Veuillez réessayer.
          </span>`;

      }

    });

    // =========================
    // BOUTON BACK
    // =========================
    const backBtn = document.getElementById("backBtn");

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        window.history.back();
      });
    }

    // =========================
    // BOUTON EXPRESS RETRAIT
    // =========================
    const retraitBtn = document.getElementById("retraitBtn");

    if (retraitBtn) {
      retraitBtn.addEventListener("click", () => {
        window.location.href = "expressretrait.html";
      });
    }

  }

});
















// ===============================
// SCRIPT IZOLÉ POU RANPLI FÒM EXPRESSFOBAS
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  try {
    // ==== Si nou sou paj dashboard, prepare sessionStorage pou fòm nan ====
    const btnExpress = document.getElementById("expressfobastransfert");
    if (btnExpress) {
      btnExpress.addEventListener("click", () => {
        const userNameEl = document.getElementById("userName");
        const userEmailEl = document.getElementById("userEmail");
        const userRoleEl = document.getElementById("userAccountType");

        if (!userNameEl || !userEmailEl || !userRoleEl) return;

        let userRole = userRoleEl.textContent.trim();
        if (userRole.includes(":")) userRole = userRole.split(":")[1].trim();

        const titresAutorises = ["Agent Autorise", "FONDATEUR FOBAS"];
        if (!titresAutorises.includes(userRole)) {
          alert("Ou pa gen aksè pou fòm ExpressFOBAS");
          return;
        }

        // Mete done itilizatè yo nan sessionStorage
        sessionStorage.setItem("fobas_agent_nom", userNameEl.textContent.trim());
        sessionStorage.setItem("fobas_agent_email", userEmailEl.textContent.trim());

        // Loader si egziste
        const loader = document.getElementById("transfertLoader");
        if (loader) loader.style.display = "flex";

        setTimeout(() => {
          if (loader) loader.style.display = "none";
          // Redireksyon nan fòm ExpressFOBAS
          window.location.href = "expressfobas/expressfobas.html";
        }, 600);
      });
    }

    // ==== Si nou sou paj expressfobas.html, ranpli fòm otomatik ====
    if (window.location.pathname.includes("expressfobas/expressfobas.html")) {
      const agentNameInput = document.getElementById("agentName");
      const agentEmailInput = document.getElementById("agentEmail");

      const nom = sessionStorage.getItem("fobas_agent_nom") || "";
      const email = sessionStorage.getItem("fobas_agent_email") || "";

      if (agentNameInput) {
        agentNameInput.value = nom;
        agentNameInput.readOnly = true;
      }

      if (agentEmailInput) {
        agentEmailInput.value = email;
        agentEmailInput.readOnly = true;
      }

      console.log("Fòm ExpressFOBAS ranpli otomatik:", nom, email);
    }

  } catch (err) {
    console.error("Erè script izole ExpressFOBAS:", err);
  }
});
