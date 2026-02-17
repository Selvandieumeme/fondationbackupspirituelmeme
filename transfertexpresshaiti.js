// ================= TRANSFERT EXPRESS FINAL =================
document.addEventListener("DOMContentLoaded", () => {

  // -------------------- Elements fòm yo --------------------
  const btnTransfertExpress = document.getElementById("btnTransfertExpress");
  const loaderDiv = document.getElementById("transfertLoader");

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
  const expirationInput = document.getElementById("expiration");
  const btnTransferer = document.getElementById("btn-transferer");

  const userNameEl = document.getElementById("userName");
  const userEmailEl = document.getElementById("userEmail");
  const userAccountTypeEl = document.getElementById("userAccountType");

  const titresAutorises = ["Agent Autorise", "FONDATEUR FOBAS"];

  // -------------------- Fonksyon utilitaires --------------------
  function genererCodeUnique(length = 12) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async function obtenirTauxDuJour() {
    return 132; // taux fiks pou konvèsyon
  }

  function remplirAgentAutomatique() {
    const userName = userNameEl?.innerText?.trim() || "";
    const userEmail = userEmailEl?.innerText?.trim() || "";

    if (agentNomInput) agentNomInput.value = userName;
    if (agentEmailInput) agentEmailInput.value = userEmail;
  }

  function validerFormulaire() {
    const champs = [
      expNom, expDocument, expPays, expVille, expAdresse, expWhatsapp,
      benNom, benVille, benAdresse, benWhatsapp,
      montantInput, deviseSelect
    ];
    return champs.every(c => c && c.value.trim() !== "");
  }

  function majBouton() {
    btnTransferer.disabled = !validerFormulaire();
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

  // -------------------- Bouton Transfert Express --------------------
  btnTransfertExpress?.addEventListener("click", (e) => {
    e.preventDefault();

    const titreUtilisateur = userAccountTypeEl?.innerText?.replace("Tit / Statut:", "").trim() || "";

    if (!titresAutorises.includes(titreUtilisateur)) {
      alert("Ou pa gen otorizasyon pou antre nan espas sa");
      return; // blokaj total, rete sou dashboard
    }

    // Loader vizib pandan ranpli otomatik
    if (loaderDiv) loaderDiv.style.display = "flex";

    setTimeout(() => {
      if (loaderDiv) loaderDiv.style.display = "none";

      // Ranpli otomatik agent + code + dat
      remplirAgentAutomatique();
      if (codeUniqueInput) codeUniqueInput.value = genererCodeUnique();
      if (statutInput) statutInput.value = "PENDING";

      const datAktyel = new Date();
      if (expirationInput) {
        const datExp = new Date(datAktyel.getTime() + 21 * 24 * 60 * 60 * 1000);
        expirationInput.value = datExp.toISOString().split("T")[0];
      }

      alert("Acces Transfert Express FOBAS autorise avec succes");

      // Redirije nan paj fòm final la
      window.location.href = "transfertexpresshaiti.html";
    }, 800);
  });

  // -------------------- Bouton Transferer --------------------
  btnTransferer?.addEventListener("click", async () => {
    if (!validerFormulaire()) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const codeUnique = genererCodeUnique();
    if (codeUniqueInput) codeUniqueInput.value = codeUnique;
    if (statutInput) statutInput.value = "PENDING";

    const montant = parseFloat(montantInput.value);
    const devise = deviseSelect.value;
    const taux = await obtenirTauxDuJour();
    const montantHTG = (devise === "USD" || devise === "EUR") ? montant * taux : montant;
    const fraisHTG = Math.round(montantHTG * 0.08);
    const totalHTG = montantHTG + fraisHTG;

    const transfertData = {
      agent: { nom_prenom: agentNomInput.value, email: agentEmailInput.value },
      expediteur: {
        nom_prenom: expNom.value,
        document: expDocument.value,
        pays: expPays.value,
        ville: expVille.value,
        adresse: expAdresse.value,
        whatsapp: expWhatsapp.value
      },
      beneficiaire: {
        nom_prenom: benNom.value,
        pays: benPays.value,
        ville: benVille.value,
        adresse: benAdresse.value,
        whatsapp: benWhatsapp.value
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
        expiration: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
      }
    };

    try {
      const response = await fetch("https://api.fondationbackupspirituel.com/api/transfert-express", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transfertData)
      });

      const result = await response.json();

      if (response.ok) {
        alert("Transfert enregistré avec succès ! Code unique: " + codeUnique);
        document.querySelector("form")?.reset();
        statutInput.value = "PENDING";
        majBouton();
      } else {
        alert("Erreur lors de l'enregistrement: " + result.message);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur réseau ou serveur.");
    }
  });
});
