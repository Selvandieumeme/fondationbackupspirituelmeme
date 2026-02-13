// /express/transferts_express.model.js

const mongoose = require('mongoose');

const transfertsExpressSchema = new mongoose.Schema({
  sender_name: { type: String, required: true },
  sender_id: { type: String, required: true },
  sender_department: { type: String, required: true },
  sender_whatsapp: { type: String, required: true },

  receiver_name: { type: String, required: true },
  receiver_id: { type: String, required: true },
  receiver_department: { type: String, required: true },
  receiver_whatsapp: { type: String, required: true },

  amount: { type: Number, required: true },

  transfer_code: { type: String, required: true, unique: true },

  otp_hash: { type: String },
  otp_expires_at: { type: Date },
  otp_attempts: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ['pending', 'otp_verified', 'paid', 'cancelled', 'expired'],
    default: 'pending'
  },

  agent_id: { type: mongoose.Schema.Types.ObjectId, required: true }

}, { timestamps: true });

transfertsExpressSchema.index({ transfer_code: 1 });
transfertsExpressSchema.index({ agent_id: 1 });
transfertsExpressSchema.index({ status: 1 });

module.exports = mongoose.model('transferts_express', transfertsExpressSchema);
