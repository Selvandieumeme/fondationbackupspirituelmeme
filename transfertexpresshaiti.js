// transfertexpresshaiti.js

// -----------------------------
// CONFIGURATION INITIALE
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
    // Ici on peut remplacer par une API ou collection serveur
    return 132; // Exemple USD -> HTG pour phase 1
  }

  // -----------------------------
  // REMPLIR CHAN AGENT (SIMULATION)
  // -----------------------------
  function remplirAgent() {
    // À remplacer par info session serveur réel
    agentNom.value = "Jean Pierre";
    agentEmail.value = "agent@fobas.com";
  }
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
      deviseSelect.value
    ];
    return champsObligatoires.every(champ => champ !== "");
  }

  // -----------------------------
  // ACTIVER/DESACTIVER BOUTON TRANSFERER
  // -----------------------------
  function majBouton() {
    btnTransferer.disabled = !validerFormulaire();
  }

  const inputsObligatoires = [
    expNom, expDocument, expPays, expVille, expAdresse, expWhatsapp,
    benNom, benVille, benAdresse, benWhatsapp,
    montantInput, deviseSelect
  ];

  inputsObligatoires.forEach(input => {
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

    // Génération code unique
    const codeUnique = genererCodeUnique();
    codeUniqueInput.value = codeUnique;

    // Calcul frais et montant HTG
    const montant = parseFloat(montantInput.value);
    const devise = deviseSelect.value;
    const taux = await obtenirTauxDuJour();
    let montantHTG = montant;

    if (devise === "USD" || devise === "EUR") {
      montantHTG = montant * taux;
    }

    const fraisHTG = Math.round(montantHTG * 0.08); // 8% frais retrait
    const totalHTG = montantHTG + fraisHTG;

    // Préparer objet transfert
    const transfertData = {
      agent: {
        nom_prenom: agentNom.value,
        email: agentEmail.value
      },
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
        expiration: new Date(Date.now() + 21*24*60*60*1000) // 21 jours
      }
    };

    try {
      // -----------------------------
      // APPEL AU SERVER (API)
      // -----------------------------
      const response = await fetch("/api/transfert-express", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(transfertData)
      });

      const result = await response.json();

      if (response.ok) {
        alert("Transfert enregistré avec succès ! Code unique: " + codeUnique);
        // Reset formulaire sauf agent
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
