// models/Eglise.js
const mongoose = require("mongoose");

const EgliseSchema = new mongoose.Schema({
  pasteur: String,
  legliz: String,
  mesaj: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Eglise", EgliseSchema);
