const mongoose = require('mongoose');

const walletBalanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  fullName: { type: String },
  walletAccountType: { type: String, default: "Utilisateur" }, // "Agent Autorise" ou "Utilisateur"
  accountStatus: { type: String, default: "ACTIF" }, // ACTIF | INACTIF | BLOCKED
  balance: { type: Number, default: 0 },
  currency: { type: String, default: "Gourdes" },
  lastOperation: { type: String }, // deposit | withdraw | transfer
  lastAmount: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('WalletBalance', walletBalanceSchema);
