// ----------------------- MERCHANT USERS SCHEMA -----------------------
const mongoose = require('mongoose');
const validator = require('validator'); // Pou validasyon email

const merchantUserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Nom complet obligatwa"],
    trim: true
  },
  email: {
    type: String,
    required: [true, "Email obligatwa"],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Email pa valide']
  },
  passwordHash: {
    type: String,
    required: [true, "Mot de passe obligatwa"]
  },
  phone: {
    type: String,
    trim: true
  },
  storeName: {
    type: String,
    trim: true
  },
  storeAddress: {
    type: String,
    trim: true
  },

  // ========================
  // 💰 Balance ak tranzaksyon
  // ========================
  balance: {
    type: Number,
    default: 0
  },
  transactions: {
    type: Array, // chak tranzaksyon: { type: 'credit'|'debit', amount, from, to, createdAt }
    default: []
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ["pending", "active", "blocked"],
    default: "pending"
  }
});

// 🔥 Kreye model la, si li deja egziste pa kreye ankò
const MerchantUser = mongoose.models.MerchantUser || mongoose.model(
  "MerchantUser",       // Non model nan JS
  merchantUserSchema,   // Schema
  "merchantusers"       // Non collection reyèl nan MongoDB
);

module.exports = MerchantUser;
