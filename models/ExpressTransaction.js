const mongoose = require("mongoose");

const ExpressTransactionSchema = new mongoose.Schema({
  transferCode: { type: String, unique: true },

  agent_name: String,
  agent_email: String,

  sender_name: String,
  sender_cin: String,
  sender_address: String,
  sender_id: String,
  sender_department: String,
  sender_whatsapp: String,

  receiver_name: String,
  receiver_id: String,
  receiver_department: String,
  receiver_whatsapp: String,

  amount: Number,
  fee: Number,
  netAmount: Number,

  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model(
  "express_transfer_transactions",
  ExpressTransactionSchema
);
