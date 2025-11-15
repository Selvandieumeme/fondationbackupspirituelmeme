const mongoose = require("mongoose");

const VipSessionSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  dateNaissance: { type: Date, required: true },
  ville: { type: String, required: true },
  pays: { type: String, required: true },
  whatsapp: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true }, // pa chifre
  emailRecup: { type: String, required: true },
  methodePaiement: { type: String, required: true },
  montant: { type: Number, required: true },
  statut: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("VipSession", VipSessionSchema, "sessions");
