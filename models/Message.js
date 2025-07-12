const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  eglise: { type: String, required: true },               // Nom de l'Église
  zone: { type: String, required: true },                 // Nom de la zone ou ville
  pasteur: { type: String, required: true },              // Nom du Pasteur Principal
  comite1: String,                                        // Nom du premier membre du comité
  comite2: String,                                        // Nom du deuxième membre du comité
  adresse: { type: String, required: true },              // Adresse de l'église
  tel: String,                                            // Téléphone
  email: String,                                          // Email de l'église
  whatsapp: String,                                       // Numéro WhatsApp du Pasteur
  programme: String,                                      // Programmes de la semaine
  activites: String,                                      // Autres activités
  membres: Number,                                        // Nombre de membres
  veye_nwi: String,                                       // Veillée de nuit ?
  le_veye: String,                                       // Jour / Heure veillée
  jeun: String,                                          // Jeûne de prière ?
  le_jeun: String,                                       // Jour / Heure jeûne
  facebook: String,                                      // Page Facebook
  youtube: String,                                       // Chaîne YouTube
  en_construction: String,                               // Église en construction ?
  photos: [String],                                      // Noms fichiers photos
  videos: [String],                                      // Noms fichiers vidéos
  date: {
    type: Date,
    default: Date.now,
    expires: 2592000 // 30 jou
  }
});

module.exports = mongoose.model('Message', messageSchema);
