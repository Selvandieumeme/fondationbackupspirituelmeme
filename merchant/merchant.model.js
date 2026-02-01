const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  fullName: { type: String, required: true },       // Non pwopriyetè a
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },   // Hashe password

  business: { type: String, required: true },      // Non biznis
  address: { type: String, required: true },
  whatsapp: { type: String, required: true },
  businessType: { type: String, required: true },  // Commerce / Service / Autre
  birthDate: { type: Date, required: true },
  cin: { type: String, required: true },           // Nimewo CIN
  cinFilePath: { type: String },                   // Path fichye CIN si upload

  merchantId: { type: String, unique: true },      // Si w vle jenere ID otomatik
  apiKey: { type: String, unique: true },          // Si w bezwen API key

  subscriptionStatus: {
    type: String,
    enum: ['INACTIVE', 'ACTIVE', 'SUSPENDED'],
    default: 'INACTIVE'
  },

  commissionRate: {
    type: Number,
    default: 0.02 // 2% par transaction
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('merchantusers', merchantSchema);
