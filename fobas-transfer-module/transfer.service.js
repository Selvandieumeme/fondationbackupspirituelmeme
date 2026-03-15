// transfer.service.js
const mongoose = require("mongoose");
const { generateCodeUnique } = require("./transfer.utils");

const Wallet = mongoose.model("walletbalances");
const Transfert = mongoose.model(
  "transferts",
  new mongoose.Schema({}, { strict: false }),
  "transferts"
);

async function createTransfer(data) {
  const agentEmail = data.agentEmail;
  const montant = Number(data.montant);
  
  // Récupération wallet agent
  const wallet = await Wallet.findOne({ email: agentEmail });
  if (!wallet) {
    throw new Error("Wallet agent introuvable");
  }

  // Verify balance
  const frais = montant * 0.15; // 15%
  const total = montant + frais;
  if (wallet.balance < total) {
    throw new Error("INSUFFICIENT_FUNDS");
  }

  // Soustre montant + frais
  wallet.balance -= total;
  await wallet.save();

  // Ajoute code unique + dat
  data.codeUnique = generateCodeUnique();
  data.statut = "PENDING";
  data.dateCreation = new Date();
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 21);
  data.dateExpiration = expiration;

  // Sove tout champs fòm nan jan yo ye a
  const transfert = new Transfert(data);
  await transfert.save();

  return transfert;
}

module.exports = { createTransfer };
