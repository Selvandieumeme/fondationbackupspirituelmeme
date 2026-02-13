// /express/transactions_express.model.js

const mongoose = require('mongoose');

const transactionsExpressSchema = new mongoose.Schema({
  transfer_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  action_type: { type: String, required: true },
  performed_by: { type: mongoose.Schema.Types.ObjectId, required: true },
  ip_address: { type: String },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('transactions_express', transactionsExpressSchema);
