// ================= TRANSFERT SERVICE (API FOBAS REYEL, HTG SELMAN) =================
const fetch = require("node-fetch"); // si Node v18+, fetch deja disponib
const { generateCode, calculateFee } = require("./transfer.utils");

async function createTransfer(data) {
  try {
    // Montant deja an HTG
    const montant_htg = Number(data.montant_htg);

    // Kalkile frais
    const frais = calculateFee(montant_htg);

    const total_client = montant_htg + frais;

    // Jenere yon kòd inik pou transfè a
    const code = generateCode();

    // Prepare payload pou API FOBAS
    const payload = {
      agent_email: data.agent_email,
      expediteur_nom: data.expediteur_nom,
      recepteur_nom: data.recepteur_nom,
      telephone_recepteur: data.telephone_recepteur,
      montant_htg: montant_htg,
      frais_transfert: frais,
      total_client: total_client,
      code: code
      // Status, date_creation, expiration ap jere pa API FOBAS otomatikman
    };

    // Voye request POST sou API FOBAS reyèl la
    const response = await fetch("https://api.fondationbackupspirituel.com/api/transferts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return { error: result.message || "Erreur transfert API FOBAS" };
    }

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
