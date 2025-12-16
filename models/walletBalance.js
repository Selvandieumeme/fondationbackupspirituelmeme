const mongoose = require("mongoose");

const walletBalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true
  },

  balance: {
    type: Number,
    default: 0
  },

  currency: {
    type: String,
    default: "HTG"
  },

  status: {
    type: String,
    default: "active" // active | blocked | suspended
  },

  lastOperation: {
    type: String // deposit | withdraw | transfer
  },

  lastAmount: {
    type: Number
  }

}, { timestamps: true });

module.exports = mongoose.model("walletBalance", walletBalanceSchema);
