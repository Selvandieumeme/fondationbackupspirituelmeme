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
// BOUTON EXPRESS FOBAS
// =========================
if (btnExpress && loader) {
  btnExpress.addEventListener("click", (e) => {
    e.preventDefault();

    // itilize loader sèlman si li egziste
    if (loader) loader.style.display = "flex";

    btnExpress.disabled = true;

    if (!userRoleEl || !userNameEl || !userEmailEl) {
      if (loader) loader.style.display = "none";
      btnExpress.disabled = false;
      alert("Erreur récupération informations utilisateur.");
      return;
    }

    let roleText = userRoleEl.textContent.trim();
    if (roleText.includes(":")) roleText = roleText.split(":")[1].trim();

    const userName = userNameEl.textContent.trim();
    const userEmail = userEmailEl.textContent.trim();

    setTimeout(() => {
      if (rolesAutorises.includes(roleText)) {
        window.location.href =
          "expressfobas.html" +
          "?name=" + encodeURIComponent(userName) +
          "&email=" + encodeURIComponent(userEmail) +
          "&role=" + encodeURIComponent(roleText);
      } else {
        if (loader) loader.style.display = "none";
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
    if (agentNameInput) { agentNameInput.value = name; agentNameInput.readOnly = true; }
    if (agentEmailInput) { agentEmailInput.value = email; agentEmailInput.readOnly = true; }

    // =========================
    // FORMULAIRE EXPRESSFOBAS
    // =========================
    const form = document.getElementById("expressForm");
    const transferResult = document.getElementById("transferResult");
    const transferCodeInput = document.getElementById("transferCode");
    const createdDateInput = document.getElementById("createdDate");
    const expirationDateInput = document.getElementById("expirationDate");
    const btnSubmit = form.querySelector("button[type='submit']");
    if (!form) return;



// =========================
// AUTO DATE DU JOUR
// =========================
const now = new Date();

// fòma bèl: 22/03/2026
const formattedDate = now.toLocaleDateString("fr-FR");

if (createdDateInput) {
  createdDateInput.value = formattedDate;
}

// =========================
// AUTO DATE EXPIRATION (+21 jours)
// =========================
const expiration = new Date();
expiration.setDate(expiration.getDate() + 21);

const formattedExpiration = expiration.toLocaleDateString("fr-FR");

if (expirationDateInput) {
  expirationDateInput.value = formattedExpiration;
}


    
    // =========================
    // SUBMIT FORM
    // =========================
    form.addEventListener("submit", async (e) => {

  e.preventDefault();

  if (btnSubmit) btnSubmit.disabled = true; // 🔒 bloke rapid

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
        amountHTG: Number(document.getElementById("amountHTG").value),
        frais: { type: Number, default: 0 },
        totalDebit: { type: Number, default: 0 }
      };

      if (data.amountHTG <= 0) {
        alert("Montant doit être supérieur à 0");
        return;
      }

      const fees = data.amountHTG * 0.15;
      const totalDebit = data.amountHTG + fees;

      // =========================
      // FETCH ANSYEN METOD (RESTAURE)
      // =========================
      const payload = {
        agentNom: data.agentName,
        agentEmail: data.agentEmail,
        expediteurNom: data.senderName,
        expediteurDocumentType: "",
        expediteurDocumentNumero: data.senderId,
        expediteurPays: data.senderCountry,
        expediteurVille: data.senderCity,
        expediteurAdresse: data.senderAddress,
        expediteurTelephone: data.senderWhatsapp,
        beneficiaireNom: data.receiverName,
        beneficiairePays: data.receiverCountry,
        beneficiaireVille: data.receiverCity,
        beneficiaireAdresse: data.receiverAddress,
        beneficiaireTelephone: data.receiverWhatsapp,
        montant: data.amountHTG
      };

      try {

        const res = await fetch(
          "https://api.fondationbackupspirituel.com/api/expressfobas",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }
        );

        const result = await res.json();

if (!res.ok) {
  transferResult.innerHTML =
    `<span style="color:red;font-weight:bold">${result.message || "Erreur serveur"}</span>`;
} else {

  if (transferCodeInput) {
    transferCodeInput.value = result.codeUnique;
  }

  transferResult.innerHTML =
    `<span style="color:green;font-weight:bold">
    Transfert créé avec succès ! Code : ${result.codeUnique}
    </span>`;


  // =========================
  // AFFICHAGE FRAIS + TOTAL (FAZ 2)
  // =========================
  if (result.frais && result.totalDebit) {

    const fraisInput = document.getElementById("frais");
    const totalInput = document.getElementById("totalDebit");

    if (fraisInput) fraisInput.value = result.frais + " HTG";
    if (totalInput) totalInput.value = result.totalDebit + " HTG";

  }

  // 🔒 BLOKE BOUTON AN APRE SIKSÈ
  if (btnSubmit) {
    btnSubmit.disabled = true;
  }

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
document.addEventListener("DOMContentLoaded", () => {
  // Chèche bouton ki deja ouvri paj retrè a
  const btnExpressRetrait = document.querySelector(
    "button[onclick*='expressretraitfobas.html']"
  );

  if (!btnExpressRetrait) return;

  btnExpressRetrait.addEventListener("click", () => {
    // Pran done agent ki deja ranpli nan fòm la
    const agentNameInput = document.getElementById("agentName");
    const agentEmailInput = document.getElementById("agentEmail");

    if (agentNameInput && agentEmailInput) {
      const agentName = agentNameInput.value.trim();
      const agentEmail = agentEmailInput.value.trim();

      if (!agentName || !agentEmail) {
        alert("Veuillez remplir le Nom et Email de l'agent avant de continuer.");
        return;
      }

      // Sove yo nan localStorage pou nouvo paj la ka li yo
      localStorage.setItem("agentName", agentName);
      localStorage.setItem("agentEmail", agentEmail);
  });
}
}

});




// =========================
// BOUTON EXPRESSIMPRIMER
// =========================
document.addEventListener("DOMContentLoaded", () => {
  const printBtn = document.getElementById("printBtn");

  // bouton rete kache okòmansman
  if (printBtn) printBtn.style.display = "none";

  // montre bouton sèlman apre fòm fin reyisi
  const observer = new MutationObserver(() => {
    const transferResult = document.getElementById("transferResult");
    if (transferResult && transferResult.textContent.includes("Transfert créé avec succès")) {
      printBtn.style.display = "inline-block";
    }
  });

  const transferResultEl = document.getElementById("transferResult");
  if (transferResultEl) {
    observer.observe(transferResultEl, { childList: true, subtree: true });
  }

  // ajoute fonksyon print
  if (printBtn) {
    printBtn.addEventListener("click", () => {
      window.print(); // enprime tout paj la jan li ye
    });
  }
});












































// ===============================
// SCRIPT IZOLÉ: AFICHE DONE NAN FÒM EXPRESSFOBAS SOTI NAN LOCALSTORAGE
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  try {
    // ==== Sèlman sou paj ExpressFOBAS ====
    if (!window.location.pathname.includes("expressfobas.html")) return;

    // Récupère done itilizatè depi localStorage
    const nom = localStorage.getItem("userName") || "";
    const email = localStorage.getItem("userEmail") || "";

    // Récupère eleman fòm
    const agentNameInput = document.getElementById("agentName");
    const agentEmailInput = document.getElementById("agentEmail");

    if (agentNameInput) {
      agentNameInput.value = nom;
      agentNameInput.readOnly = true;
    }

    if (agentEmailInput) {
      agentEmailInput.value = email;
      agentEmailInput.readOnly = true;
    }

    console.log("Fòm ExpressFOBAS afiche done otomatikman soti nan localStorage:", nom, email);
  } catch (err) {
    console.error("Erreur script isolé ExpressFOBAS (affichage):", err);
  }
});
