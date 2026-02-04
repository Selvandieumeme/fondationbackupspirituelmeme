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
  // --------- CHAN EXISTING (pa touche yo) ---------
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
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now },

  // --------- NOUVO CHAN TRACE / AUDIT / RISK / KYC ---------
  lastAction: { type: String, default: "CREATION" },       // premye aksyon default
  lastActionAt: { type: Date, default: Date.now },          // imedyat
  lastActionBy: { type: String, default: "SYSTEM" },        // SYSTEM kòm default
  adminIp: { type: String, default: "0.0.0.0" },            // placeholder pou trace
  ipAddress: { type: String, default: "0.0.0.0" },

  createdBy: { type: String, enum: ["Self",  "Agent Terrain", "Agent Autorise", "Utilisateur", "FONDATEUR FOBAS"], default: "Self" },
  registrationChannel: { type: String, enum: ["app", "Utilisateur", "Agent Terrain", "Agent Autorise", "FONDATEUR FOBAS"], default: "app" },
  geoZone: { type: String, default: "undefined" },
  deviceId: { type: String, default: "unknown" },
  createdFromDevice: { type: String, default: "unknown" },

  kycLevel: { type: Number, default: 0 },
  riskScore: { type: Number, default: 0 },
  riskFlags: { type: [String], default: [] },

  auditVersion: { type: Number, default: 1 }

}, { timestamps: true });


const WalletUser = mongoose.models.WalletUser || mongoose.model(
  "WalletUser",
  WalletUserSchema
);

// ----------------------- EXPORT -----------------------
module.exports = { User, WalletUser };

