const mongoose = require("mongoose");

// ----------------------- MODÈL VIP USER -----------------------
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "VIP" },
  vipExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// ⚡ Evite OverwriteModelError
const User = mongoose.models.User || mongoose.model("User", UserSchema, "users");

// ----------------------- MODÈL WALLET USER -----------------------
const WalletUserSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  recoveryEmail: String,
  whatsapp: String,
  birthDate: String,
  birthPlace: String,
  passwordHash: String,
  sponsorName: { type: String },
  sponsorEmail: { type: String },
  accountType: { type: String, required: true },
  hasDepositedBefore: { type: Boolean, default: false },
  status: {
    type: String,
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const WalletUser = mongoose.models.WalletUser || mongoose.model(
  "WalletUser",
  WalletUserSchema
);

// ----------------------- EXPORT -----------------------
module.exports = { User, WalletUser };

