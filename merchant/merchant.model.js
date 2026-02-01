const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  businessName: String,
  ownerName: String,
  email: { type: String, unique: true },
  phone: String,

  merchantId: { type: String, unique: true },
  apiKey: { type: String, unique: true },

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

module.exports = mongoose.model('merchants', merchantSchema);
