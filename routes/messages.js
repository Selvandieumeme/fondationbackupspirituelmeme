const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Upload setup multer
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/'); // Katab uploads nan rasin pwojè a
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Route POST ak multer pou jere foto + videyo
router.post('/', upload.fields([
  { name: 'photos', maxCount: 5 },
  { name: 'videos', maxCount: 5 }
]), async (req, res) => {
  try {
    const {
      eglise, zone, pasteur, comite1, comite2, adresse, tel, email, whatsapp,
      programme, activites, membres, veye_nwi, le_veye, jeun, le_jeun,
      facebook, youtube, en_construction
    } = req.body;

    const photos = req.files['photos'] ? req.files['photos'].map(file => file.filename) : [];
    const videos = req.files['videos'] ? req.files['videos'].map(file => file.filename) : [];

    const newMsg = new Message({
      eglise,
      zone,
      pasteur,
      comite1,
      comite2,
      adresse,
      tel,
      email,
      whatsapp,
      programme,
      activites,
      membres,
      veye_nwi,
      le_veye,
      jeun,
      le_jeun,
      facebook,
      youtube,
      en_construction,
      photos,
      videos
    });

    await newMsg.save();

    res.status(201).json({ message: 'Donnés sauvegardés avec succès!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde.' });
  }
});

// Route GET pou tout mesaj (legliz)
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ date: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des messages.' });
  }
});

module.exports = router;
