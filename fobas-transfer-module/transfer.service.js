const mongoose = require("mongoose");
const { generateCodeUnique } = require("./transfer.utils");

const Wallet = mongoose.model("walletbalances");
const Transfert = mongoose.model(
  "transferts",
  new mongoose.Schema({}, { strict: false }),
  "transferts"
);

async function createTransfer(data) {
  try {
    const agentEmail = data.agentEmail;
    const montant = Number(data.montant);

    // jwenn wallet agent lan
    const wallet = await Wallet.findOne({ email: agentEmail });
    if (!wallet) {
      // pa jete erè fatal, voye mesaj klè
      throw new Error("WALLET_NOT_FOUND");
    }

    // verifye si gen ase fon
    if (wallet.balance < montant) {
      throw new Error("INSUFFICIENT_FUNDS");
    }

    // soustre lajan nan wallet
    wallet.balance -= montant;
    await wallet.save();

    // ajoute codeUnique + dat
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
  } catch (err) {
    console.error("Erreur createTransfer:", err.message || err);
    throw err; // route API pral voye mesaj klè, pa kite crash server
  }
}

module.exports = { createTransfer };
