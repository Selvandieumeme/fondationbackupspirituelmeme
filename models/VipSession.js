import mongoose from "mongoose";

const VipSessionSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  dateNaissance: { type: Date, required: true },
  ville: { type: String, required: true },
  pays: { type: String, required: true },
  whatsapp: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  emailRecup: { type: String, required: true },
  methodePaiement: { type: String, required: true },
  montant: { type: Number, required: true },
  statut: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("VipSession", VipSessionSchema, "sessions");
