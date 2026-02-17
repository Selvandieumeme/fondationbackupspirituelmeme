// ================= TRANSFERT EXPRESS FINAL (FRONTEND ONLY) =================
document.addEventListener("DOMContentLoaded", () => {

  // ===================== ELEMENTS DASHBOARD =====================
  const btnTransfertExpress = document.getElementById("btnTransfertExpress");
  const loaderDiv = document.getElementById("transfertLoader");

  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");
  const userAccountTypeEl = document.getElementById("userAccountType");

  const titresAutorises = ["Agent Autorise", "FONDATEUR FOBAS"];

  // ===================== ELEMENTS FORMULAIRE =====================
  const agentNomInput = document.getElementById("agent_nom");
  const agentEmailInput = document.getElementById("agent_email");

  const expNom = document.getElementById("exp_nom");
  const expDocument = document.getElementById("exp_document");
  const expPays = document.getElementById("exp_pays");
  const expVille = document.getElementById("exp_ville");
  const expAdresse = document.getElementById("exp_adresse");
  const expWhatsapp = document.getElementById("exp_whatsapp");

  const benNom = document.getElementById("ben_nom");
  const benPays = document.getElementById("ben_pays");
  const benVille = document.getElementById("ben_ville");
  const benAdresse = document.getElementById("ben_adresse");
  const benWhatsapp = document.getElementById("ben_whatsapp");

  const montantInput = document.getElementById("montant");
  const deviseSelect = document.getElementById("devise");

  const codeUniqueInput = document.getElementById("code_unique");
  const statutInput = document.getElementById("statut");
  const dateDuJourInput = document.getElementById("date_du_jour");
  const expirationInput = document.getElementById("expiration");

  const btnTransferer = document.getElementById("btn-transferer");

  // ===================== OUTILS =====================
  function genererCodeUnique(length = 12) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  function remplirAgentDepuisSession() {
    const nom = sessionStorage.getItem("fobas_agent_nom") || "";
    const email = sessionStorage.getItem("fobas_agent_email") || "";

    if (agentNomInput) agentNomInput.value = nom;
    if (agentEmailInput) agentEmailInput.value = email;
  }

  function initialiserDonneesSysteme() {
    if (codeUniqueInput) codeUniqueInput.value = genererCodeUnique();
    if (statutInput) statutInput.value = "PENDING";

    if (expirationInput) {
      const exp = new Date();
      exp.setDate(exp.getDate() + 21);
      expirationInput.value = exp.toISOString().split("T")[0];
    }
  }

  function validerFormulaire() {
    const champs = [
      expNom, expDocument, expPays, expVille, expAdresse, expWhatsapp,
      benNom, benVille, benAdresse, benWhatsapp,
      montantInput, deviseSelect
    ];
    return champs.every(c => c && c.value.trim() !== "");
  }


function initialiserDonneesSysteme() {
  const today = new Date();

  // ===== Date du jour (FORMAT HTML5) =====
  const todayISO = today.toISOString().split("T")[0];

  const dateDuJourInput = document.getElementById("date_du_jour");
  if (dateDuJourInput) {
    dateDuJourInput.value = todayISO;
  }

  // ===== Code unique =====
  if (codeUniqueInput) {
    codeUniqueInput.value = genererCodeUnique();
  }

  // ===== Statut =====
  if (statutInput) {
    statutInput.value = "PENDING";
  }

  // ===== Date expiration +21 jours =====
  if (expirationInput) {
    const exp = new Date(today);
    exp.setDate(exp.getDate() + 21);
    expirationInput.value = exp.toISOString().split("T")[0];
  }
}

  
  function majBouton() {
    if (btnTransferer) {
      btnTransferer.disabled = !validerFormulaire();
    }
  }

  [
    expNom, expDocument, expPays, expVille, expAdresse, expWhatsapp,
    benNom, benVille, benAdresse, benWhatsapp,
    montantInput, deviseSelect
  ].forEach(el => {
    el?.addEventListener("input", majBouton);
    el?.addEventListener("change", majBouton);
  });

  majBouton();

  // ===================== BOUTON TRANSFERT EXPRESS (VERIF TIT) =====================
  if (btnTransfertExpress) {
    btnTransfertExpress.addEventListener("click", (e) => {
      e.preventDefault();

      const titreUtilisateur =
        userAccountTypeEl?.innerText.replace("Tit / Statut:", "").trim() || "";

      // ⛔ BLOKAJ TOTAL SI PA OTORIZE
      if (!titresAutorises.includes(titreUtilisateur)) {
        alert("Ou pa gen otorizasyon pou antre nan espas sa");
        return;
      }

      // ✅ OTORIZE
      if (loaderDiv) loaderDiv.style.display = "flex";

      setTimeout(() => {
        if (loaderDiv) loaderDiv.style.display = "none";

        // Stockage frontend seulement
        sessionStorage.setItem(
          "fobas_agent_nom",
          userNameEl?.innerText.trim() || ""
        );
        sessionStorage.setItem(
          "fobas_agent_email",
          userEmailEl?.innerText.trim() || ""
        );

        alert("Acces Transfert Express FOBAS autorise avec succes");

        window.location.href = "transfertexpresshaiti.html";
      }, 800);
    });
  }

  // ===================== INITIALISATION PAGE TRANSFERT =====================
  remplirAgentDepuisSession();
  initialiserDonneesSysteme();
});
