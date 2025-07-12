// models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  pasteur: String,
  legliz: String,
  mesaj: String,
  date: {
    type: Date,
    default: Date.now,
    expires: 2592000 // 30 jou (30j * 24h * 60m * 60s)
  }
});

module.exports = mongoose.model('Message', messageSchema);
