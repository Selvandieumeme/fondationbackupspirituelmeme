const mongoose = require("mongoose");

const ExpressHistorySchema = new mongoose.Schema({
  transactionId: String,
  action: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model(
  "express_transfer_history",
  ExpressHistorySchema
);
