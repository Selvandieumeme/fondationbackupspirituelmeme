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
    if (!form) return;

    function generateTransferCode() {
      return "FOB-" + Date.now().toString().slice(-7);
    }

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
        montant: data.amountHTG,
        devise: "HTG"
      };

      try {

        const res = await fetch(
          "https://api.fondationbackupspirituel.com/api/fobasinternational",
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
          transferResult.innerHTML =
            `<span style="color:green;font-weight:bold">
            Transfert créé avec succès ! Code : ${result.codeUnique}
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


























(function(){

// EVITE POLLUTION GLOBAL SCOPE

const EXPRESSFOBAS_API =
"https://api.fondationbackupspirituel.com/expressfobas";


// VERIFYE SI FORM EXISTE AVAN ATAKE EVENT

const form = document.getElementById("expressfobasForm");

if(!form) return;


// ATAKE EVENT SAN MANYEN LOT SCRIPTS

form.addEventListener("submit", async function(e){

try{

// KOLEKTE DONE FORM SAN BLOKE LOT HANDLERS

const formData = new FormData(form);

const data = Object.fromEntries(formData.entries());


// VOYE DONE API

const response = await fetch(EXPRESSFOBAS_API,{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body: JSON.stringify(data)

});


const result = await response.json();


// SI SUCCESS

if(response.ok){

// AFICHE CODE SAN ALERT OBLIGATWA

const codeBox =
document.getElementById("expressfobasCodeBox");

if(codeBox){

codeBox.innerText =
result.expressfobasCode;

}else{

alert(
"ExpressFobas créé avec succès\nCode: "
+ result.expressfobasCode
);

}


// RESET FORM OPTIONAL

form.reset();

}


// SI ERROR

else{

console.warn("ExpressFobas erreur:",result);

alert(
result.message ||
"Erreur ExpressFobas"
);

}


}catch(error){

console.error(
"ExpressFobas connexion erreur:",
error
);

alert(
"Erreur connexion serveur ExpressFobas"
);

}

});

})();

















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
