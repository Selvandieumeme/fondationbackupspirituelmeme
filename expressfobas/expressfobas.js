document.addEventListener("DOMContentLoaded", () => {



btnExpress.addEventListener("click", (e) => {
  e.preventDefault();
  loader.style.display = "flex";
  btnExpress.disabled = true;

  const roleText = userRoleEl.textContent.split(":")[1]?.trim() || "";
  const userName = userNameEl.textContent.trim();
  const userEmail = userEmailEl.textContent.trim();

  setTimeout(() => {
    if (roleText === "Agent Autorise" || roleText === "FONDATEUR FOBAS") {
      // Redireksyon fè pati JS sèlman
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




  

  // ======= Nouvo Bouton Express FOBAS 2em Fòm =======
  const btnExpress = document.getElementById("expressfobastransfert");
  const loader = document.getElementById("transfertLoader"); // loader nouvo paj

  if (btnExpress && loader) {
    btnExpress.addEventListener("click", () => {

      // Montre loader vizyèl
      loader.style.display = "flex";
      btnExpress.disabled = true;

      // Rekipere enfòmasyon itilizatè nan dashboard
      const userRoleEl = document.getElementById("userAccountType");
      const userNameEl = document.getElementById("userName");
      const userEmailEl = document.getElementById("userEmail");

      if (!userRoleEl || !userNameEl || !userEmailEl) {
        alert("Erreur: impossible de récupérer les informations utilisateur.");
        loader.style.display = "none";
        btnExpress.disabled = false;
        return;
      }

      const roleText = userRoleEl.textContent.trim();
      const userName = userNameEl.textContent.trim();
      const userEmail = userEmailEl.textContent.trim();

      // Delè ti tan pou loader parèt
      setTimeout(() => {

        if (roleText === "Agent Autorise" || roleText === "FONDATEUR FOBAS") {

          // Redireksyon nan nouvo paj fòm la avèk done itilizatè yo
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

  // ======= Paj expressfobas.html: Ranpli nouvo chan yo =======
  if (window.location.pathname.includes("expressfobas/expressfobas.html")) {

    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");
    const email = params.get("email");
    const role = params.get("role");

    // Sekirite: verifye wòl itilizatè a
    if (!name || !email || (role !== "Agent Autorise" && role !== "FONDATEUR FOBAS")) {
      alert("Vous n'avez pas accès à cette page.");
      window.location.href = "https://fondationbackupspirituel.com/walletfobasdashboard.html";
      return;
    }

    // Ranpli nouvo chan ki egziste nan nouvo fòm lan
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

  }

  // ===================== INITIALISATION =====================
  if (typeof remplirAgentDepuisSession === "function") {
    remplirAgentDepuisSession();
  }

});


































document.addEventListener("DOMContentLoaded", () => {

  // ======= Bouton Express FOBAS Transfert =======
  const btnExpress = document.getElementById("expressfobastransfert");
  const loader = document.getElementById("transfertLoader"); // loader ou te deja mete nan HTML

  if (btnExpress && loader) {
    btnExpress.addEventListener("click", () => {

      // Montre loader vizyèl
      loader.style.display = "flex";
      btnExpress.disabled = true;

      // Rekipere enfòmasyon itilizatè nan dashboard
      const userRoleEl = document.getElementById("userAccountType");
      const userNameEl = document.getElementById("userName");
      const userEmailEl = document.getElementById("userEmail");

      if (!userRoleEl || !userNameEl || !userEmailEl) {
        alert("Erreur: impossible de récupérer les informations utilisateur.");
        loader.style.display = "none";
        btnExpress.disabled = false;
        return;
      }

      const roleText = userRoleEl.textContent.trim();
      const userName = userNameEl.textContent.trim();
      const userEmail = userEmailEl.textContent.trim();

      // Delè ti tan pou loader parèt
      setTimeout(() => {

        if (roleText === "Agent Autorise" || roleText === "FONDATEUR FOBAS") {

          // Redireksyon nan paj expressfobas.html avèk done itilizatè yo
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

  // ======= Paj expressfobas.html: Ranpli chan yo =======
  if (window.location.pathname.includes("expressfobas/expressfobas.html")) {

    const params = new URLSearchParams(window.location.search);
    const name = params.get("name");
    const email = params.get("email");
    const role = params.get("role");

    // Sekirite: verifye wòl itilizatè a
    if (!name || !email || (role !== "Agent Autorise" && role !== "FONDATEUR FOBAS")) {
      alert("Vous n'avez pas accès à cette page.");
      window.location.href = "https://fondationbackupspirituel.com/walletfobasdashboard.html";
      return;
    }

    // Ranpli chan ki deja egziste nan fòm lan
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

  }

});

    // ===================== INITIALISATION =====================
    remplirAgentDepuisSession();
});


    const form = document.getElementById("expressForm");
    const transferResult = document.getElementById("transferResult");
    const transferCodeInput = document.getElementById("transferCode");
    const createdDateInput = document.getElementById("createdDate");
    const expirationDateInput = document.getElementById("expirationDate");

    if (!form) return;

    // Fonksyon pou jenere code unique (FOB + timestamp)
    function generateTransferCode() {
        return "FOB-" + Date.now().toString().slice(-7);
    }

    // Fonksyon pou kalkile dat expiration (+21 jou)
    function calculateExpiration() {
        const today = new Date();
        const expiration = new Date();
        expiration.setDate(today.getDate() + 21);
        return expiration.toISOString().split("T")[0]; // YYYY-MM-DD
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        transferResult.innerHTML = "";

        // Récupération des champs
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

        // Calcul frais 15%
        const fees = data.amountHTG * 0.15;
        const totalDebit = data.amountHTG + fees;

        // Ajoute code, dat kreasyon ak expiration nan fòm
        const transferCode = generateTransferCode();
        const today = new Date().toISOString().split("T")[0];
        const expiration = calculateExpiration();

        transferCodeInput.value = transferCode;
        createdDateInput.value = today;
        expirationDateInput.value = expiration;

        // Ajoute infos detaye pou API
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
                transferResult.innerHTML = `<span style="color:red;font-weight:bold">${result.error}</span>`;
            } else {
                transferResult.innerHTML = `<span style="color:green;font-weight:bold">Transfert créé avec succès ! Code ExpressFOBAS : ${result.transferCode}</span>`;
            }
        } catch (err) {
            console.error("Erreur API ExpressFOBAS :", err);
            transferResult.innerHTML = `<span style="color:red;font-weight:bold">Erreur de communication avec le serveur. Veuillez réessayer.</span>`;
        }
    });

    // Bouton Back
    const backBtn = document.getElementById("backBtn");
    if (backBtn) {
        backBtn.addEventListener("click", () => {
            window.history.back();
        });
    }

    // Bouton ExpressRetrait (prepare pou nouvo paj)
    const retraitBtn = document.getElementById("retraitBtn");
    if (retraitBtn) {
        retraitBtn.addEventListener("click", () => {
            window.location.href = "expressretrait.html";
        });
    }

});
