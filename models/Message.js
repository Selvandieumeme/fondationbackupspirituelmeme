const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  eglise: String,
  zone: String,
  pasteur: String,
  comite1: String,
  comite2: String,
  adresse: String,
  tel: String,
  email: String,
  whatsapp: String,
  programme: String,
  activites: String,
  membres: Number,
  veye_nwi: String,
  le_veye: String,
  jeun: String,
  le_jeun: String,
  facebook: String,
  youtube: String,
  en_construction: String,
  photos: [String],  // lis non fichye
  videos: [String],  // lis non fichye
  date: {
    type: Date,
    default: Date.now,
    expires: 2592000 // 30 jou
  }
});

module.exports = mongoose.model('Message', messageSchema);
