const mongoose = require("mongoose");
const { generateCode, convertUsdToHtg, calculateFee } = require("./transfer.utils");

const Transferts = mongoose.model("transferts");
const WalletBalances = mongoose.model("walletbalances");

async function createTransfer(data) {
  const taux = 132; // to di jou, ou ka modifye si bezwen dinamik

  // Montant HTG + frais + total
  const montant_htg = convertUsdToHtg(Number(data.montant_usd), taux);
  const frais = calculateFee(montant_htg);
  const total_client = montant_htg + frais;

  // Jere balans agent via email
  const agent = await WalletBalances.findOne({ email: data.agent_email });

  if (!agent) return { error: "Agent introuvable" };

  if (agent.balance < montant_htg) return { error: "Fonds insuffisants" };

  const code = generateCode();
  const balance_avant = agent.balance;

  // Soustraksyon sou balans agent
  agent.balance -= montant_htg;
  await agent.save();

  // Kreye tranzaksyon nan collection transferts
  const transfert = await Transferts.create({
    code: code,
    agent_email: data.agent_email,
    expediteur_nom: data.expediteur_nom,
    recepteur_nom: data.recepteur_nom,
    telephone_recepteur: data.telephone_recepteur,
    montant_usd: Number(data.montant_usd),
    taux: taux,
    montant_htg: montant_htg,
    frais_transfert: frais,
    total_client: total_client,
    status: "Pending",
    date_creation: new Date(),
    expiration: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) // 21 jou
  });

  return {
    success: true,
    code: code,
    montant_reception: montant_htg,
    frais: frais,
    total_client: total_client
  };
}

module.exports = { createTransfer };
