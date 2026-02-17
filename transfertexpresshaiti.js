// -----------------------------
// ACCES TRANSFERT EXPRESS FOBAS + VERIFICATION + FORMULAIRE
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  // -----------------------------
  // 1️⃣ Bouton Transfert Express FOBAS sou dashboard
  // -----------------------------
  const btnTransfertExpress = document.querySelector(
    "button[onclick=\"window.location.href='transfertexpresshaiti.html'\"]"
  );
  if (!btnTransfertExpress) return;

  // -----------------------------
  // 2️⃣ Créer div loader/verif si li pa deja egziste
  // -----------------------------
  let loaderDiv = document.getElementById("transfertLoader");
  if (!loaderDiv) {
    loaderDiv = document.createElement("div");
    loaderDiv.id = "transfertLoader";
    loaderDiv.style.cssText = `
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      margin-top: 5px;
      padding: 5px 10px;
      background: #f0f8ff;
      border: 1px solid #004080;
      border-radius: 5px;
      font-size: 0.9em;
      color: #004080;
      white-space: nowrap;
      z-index: 100;
      display: flex;
      align-items: center;
      gap: 5px;
    `;
    loaderDiv.innerHTML = `
      <span class="loader" style="
        width: 12px;
        height: 12px;
        border: 2px solid #004080;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></span>
      <span>Utilisateur en cours de verification...</span>
    `;
    btnTransfertExpress.parentNode.style.position = "relative";
    btnTransfertExpress.parentNode.appendChild(loaderDiv);

    // Animation spinner
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes spin {
        0% { transform: rotate(0deg);}
        100% { transform: rotate(360deg);}
      }
    `;
    document.head.appendChild(style);
  }

  // -----------------------------
  // 3️⃣ Récupération info utilisateur
  // -----------------------------
  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");
  const userAccountTypeEl = document.getElementById("userAccountType");
  const titresAutorises = ["Agent Autorise", "FONDATEUR FOBAS"];

  btnTransfertExpress.addEventListener("click", async (e) => {
    e.preventDefault();
    loaderDiv.style.display = "flex"; // montre loader

    // Simuler petite attente verif (si gen API verification ou db)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const titreUtilisateur = userAccountTypeEl?.innerText?.trim() || "";
    const userNomPrenom = userNameEl?.innerText?.trim() || "";
    const userEmail = userEmailEl?.innerText?.trim() || "";

    if (titresAutorises.includes(titreUtilisateur)) {
      // ✅ Acces autorise
      loaderDiv.style.display = "none";
      alert("Acces Transfert Express FOBAS autorise avec succes");

      // -----------------------------
      // Remplissage automatique formulaire si fòm deja chaje
      // -----------------------------
      const agentNomInput = document.getElementById("agent_nom");
      const agentEmailInput = document.getElementById("agent_email");
      const codeUniqueInput = document.getElementById("code_unique");
      const statutInput = document.getElementById("statut");
      const expirationInput = document.getElementById("expiration");

      if (agentNomInput) agentNomInput.value = userNomPrenom;
      if (agentEmailInput) agentEmailInput.value = userEmail;
      if (codeUniqueInput) codeUniqueInput.value = genererCodeUnique();
      if (statutInput) statutInput.value = "PENDING";

      // Dat ekspirasyon 21 jou
      const expiration = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000);
      if (expirationInput) expirationInput.value = expiration.toISOString().split("T")[0];

      // Final: ouvri paj transfert la
      window.location.href = "transfertexpresshaiti.html";
    } else {
      // ❌ Acces refize
      loaderDiv.style.display = "none";
      alert("Ou pa gen otorizasyon pou w antre nan espas sa");
      btnTransfertExpress.disabled = true;
    }
  });
});

// -----------------------------
// TRANSFERT EXPRESS FONCTIONS EXISTANTES
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Récupération des éléments du DOM
  const agentNom = document.getElementById("agent_nom");
  const agentEmail = document.getElementById("agent_email");
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
  const btnTransferer = document.getElementById("btn-transferer");
  const btnRetrait = document.getElementById("btn-retrait");

  // -----------------------------
  // FONCTION GENERER CODE UNIQUE
  // -----------------------------
  function genererCodeUnique(length = 12) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // -----------------------------
  // FONCTION POUR OBTENIR TAUX DU JOUR
  // -----------------------------
  async function obtenirTauxDuJour() {
    return 132; // Exemple USD -> HTG
  }

  // -----------------------------
// REMPLIR CHAN AGENT (DINAMIK)
// -----------------------------
function remplirAgent() {
  // Sèvi ak done ki deja sou dashboard la
  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");

  if (agentNom && userNameEl) agentNom.value = userNameEl.innerText.trim();
  if (agentEmail && userEmailEl) agentEmail.value = userEmailEl.innerText.trim();
}

// Lè paj la chaje, ranpli chan agent otomatikman
remplirAgent();

  // -----------------------------
  // VALIDATION FORMULAIRE
  // -----------------------------
  function validerFormulaire() {
    const champsObligatoires = [
      expNom.value.trim(),
      expDocument.value.trim(),
      expPays.value.trim(),
      expVille.value.trim(),
      expAdresse.value.trim(),
      expWhatsapp.value.trim(),
      benNom.value.trim(),
      benVille.value.trim(),
      benAdresse.value.trim(),
      benWhatsapp.value.trim(),
      montantInput.value,
      deviseSelect.value,
    ];
    return champsObligatoires.every((champ) => champ !== "");
  }

  // -----------------------------
  // ACTIVER/DESACTIVER BOUTON TRANSFERER
  // -----------------------------
  function majBouton() {
    btnTransferer.disabled = !validerFormulaire();
  }

  const inputsObligatoires = [
    expNom,
    expDocument,
    expPays,
    expVille,
    expAdresse,
    expWhatsapp,
    benNom,
    benVille,
    benAdresse,
    benWhatsapp,
    montantInput,
    deviseSelect,
  ];

  inputsObligatoires.forEach((input) => {
    input.addEventListener("input", majBouton);
    input.addEventListener("change", majBouton);
  });
  majBouton();

  // -----------------------------
  // BOUTON TRANSFERER CLICK
  // -----------------------------
  btnTransferer.addEventListener("click", async () => {
    if (!validerFormulaire()) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const codeUnique = genererCodeUnique();
    codeUniqueInput.value = codeUnique;

    const montant = parseFloat(montantInput.value);
    const devise = deviseSelect.value;
    const taux = await obtenirTauxDuJour();
    let montantHTG = montant;
    if (devise === "USD" || devise === "EUR") {
      montantHTG = montant * taux;
    }

    const fraisHTG = Math.round(montantHTG * 0.08);
    const totalHTG = montantHTG + fraisHTG;

    const transfertData = {
      agent: {
        nom_prenom: agentNom.value,
        email: agentEmail.value,
      },
      expediteur: {
        nom_prenom: expNom.value,
        document: expDocument.value,
        pays: expPays.value,
        ville: expVille.value,
        adresse: expAdresse.value,
        whatsapp: expWhatsapp.value,
      },
      beneficiaire: {
        nom_prenom: benNom.value,
        pays: benPays.value,
        ville: benVille.value,
        adresse: benAdresse.value,
        whatsapp: benWhatsapp.value,
      },
      transfert: {
        montant_original: montant,
        devise_originale: devise,
        taux_du_jour: taux,
        montant_htg: montantHTG,
        frais_htg: fraisHTG,
        total_htg: totalHTG,
        code_unique: codeUnique,
        statut: "PENDING",
        expiration: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      },
    };

    try {
      const response = await fetch("/api/transfert-express", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transfertData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("Transfert enregistré avec succès ! Code unique: " + codeUnique);
        expNom.value = expDocument.value = expPays.value = "";
        expVille.value = expAdresse.value = expWhatsapp.value = "";
        benNom.value = benVille.value = benAdresse.value = benWhatsapp.value = "";
        montantInput.value = "";
        deviseSelect.value = "";
        codeUniqueInput.value = "";
        statutInput.value = "PENDING";
        majBouton();
      } else {
        alert("Erreur lors de l'enregistrement: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau ou serveur, veuillez réessayer.");
    }
  });
});
