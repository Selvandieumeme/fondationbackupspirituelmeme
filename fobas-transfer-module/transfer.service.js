// ================= TRANSFERT SERVICE (API FOBAS REYEL, HTG SELMAN) =================
const fetch = require("node-fetch"); // si Node v18+, fetch deja disponib
const { generateCode, calculateFee } = require("./transfer.utils");

async function createTransfer(data) {
  try {

    // ================= MONTANT =================
    const montant_htg = Number(data.montant);

    if (!montant_htg || montant_htg <= 0) {
      return { error: "Montant invalide" };
    }

    // ================= CALCUL FRAIS =================
    const frais = calculateFee(montant_htg);
    const total_client = montant_htg + frais;

    // ================= GENERATION CODE UNIQUE =================
    const code = generateCode();

    // ================= PAYLOAD POUR API FOBAS =================
    const payload = {

      agent_nom: data.agentNom,
      agent_email: data.agentEmail,

      expediteur_nom: data.expediteurNom,
      expediteur_document_numero: data.expediteurDocumentNumero,
      expediteur_pays: data.expediteurPays,
      expediteur_ville: data.expediteurVille,
      expediteur_adresse: data.expediteurAdresse,
      expediteur_telephone: data.expediteurTelephone,

      beneficiaire_nom: data.beneficiaireNom,
      beneficiaire_pays: data.beneficiairePays,
      beneficiaire_ville: data.beneficiaireVille,
      beneficiaire_adresse: data.beneficiaireAdresse,
      beneficiaire_telephone: data.beneficiaireTelephone,

      montant_htg: montant_htg,
      devise: data.devise,

      frais_transfert: frais,
      total_client: total_client,
      code: code

      // statut, dateCreation, dateExpiration ap jere pa API FOBAS
    };

    // ================= APPEL API FOBAS =================
    const response = await fetch(
      "https://api.fondationbackupspirituel.com/api/transferts",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!response.ok || !result.success) {
      return { error: result.message || "Erreur transfert API FOBAS" };
    }

    // ================= RETOUR FRONTEND =================
    return {
      success: true,
      code: code,
      montant_reception: montant_htg,
      frais: frais,
      total_client: total_client
    };

  } catch (err) {
    console.error("CREATE TRANSFER ERROR:", err);
    return { error: "Erreur serveur API FOBAS" };
  }
}

module.exports = { createTransfer };
