const mongoose = require("mongoose");
const { generateCodeUnique } = require("./transfer.utils");

// Chaje model MongoDB
const Wallet = mongoose.model("walletbalances");
const Transfert = mongoose.model(
  "transferts",
  new mongoose.Schema({}, { strict: false }),
  "transferts"
);

async function createTransferExpress(data) {
  const agentEmail = data.agentEmail;
  const montant = Number(data.montant);

  // Chèche wallet agent la
  const wallet = await Wallet.findOne({ email: agentEmail });
  if (!wallet) throw new Error("Wallet agent introuvable");

  if (wallet.balance < montant) {
    throw new Error("INSUFFICIENT_FUNDS");
  }

  // Soustre lajan + frais 15%
  const frais = montant * 0.15;
  wallet.balance -= montant + frais;
  await wallet.save();

  // Mete kòd inik + dat
  data.codeUnique = generateCodeUnique();
  data.statut = "PENDING";
  data.dateCreation = new Date();

  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 21);
  data.dateExpiration = expiration;

  // Sove tout done fòm nan jan li ye a nan collection transferts
  const transfert = new Transfert(data);
  await transfert.save();

  return transfert;
}

module.exports = { createTransferExpress };
