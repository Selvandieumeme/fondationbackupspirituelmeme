const mongoose = require("mongoose");
const { generateCodeUnique } = require("./transfer.utils");

const Wallet = mongoose.model("walletbalances");
const Transfert = mongoose.model("transferts", new mongoose.Schema({}, { strict:false }), "transferts");

async function createTransfer(data) {

  const agentEmail = data.agentEmail;
  const montant = Number(data.montant);

  const wallet = await Wallet.findOne({ email: agentEmail });

  if (!wallet) {
    throw new Error("Wallet agent introuvable");
  }

  if (wallet.balance < montant) {
    throw new Error("INSUFFICIENT_FUNDS");
  }

  // soustre lajan
  wallet.balance = wallet.balance - montant;
  await wallet.save();

  // ajoute code + dat
  data.codeUnique = generateCodeUnique();
  data.statut = "PENDING";
  data.dateCreation = new Date();

  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 21);
  data.dateExpiration = expiration;

  // sove tout champs fòm nan jan yo ye a
  const transfert = new Transfert(data);

  await transfert.save();

  return transfert;
}

module.exports = { createTransfer };
