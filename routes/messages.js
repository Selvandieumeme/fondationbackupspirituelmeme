const express = require('express');
const router = express.Router();
const Message = require('../models/Message');  // Modèl ou dwe ajiste tou (m ap eksplike anba)
const multer = require('multer');
const path = require('path');

// Setup multer pou upload fichye
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// POST route pou resevwa fòm legliz la
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

    const photos = req.files['photos'] ? req.files['photos'].map(f => f.filename) : [];
    const videos = req.files['videos'] ? req.files['videos'].map(f => f.filename) : [];

    const newEntry = new Message({
      eglise, zone, pasteur, comite1, comite2, adresse, tel, email, whatsapp,
      programme, activites, membres, veye_nwi, le_veye, jeun, le_jeun,
      facebook, youtube, en_construction, photos, videos
    });

    await newEntry.save();
    res.status(201).json({ message: "Données sauvegardées avec succès !" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur lors de la sauvegarde des données." });
  }
});

// GET route pou li tout legliz yo nan baz la
router.get('/', async (req, res) => {
  try {
    const entries = await Message.find().sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des données." });
  }
});

module.exports = router;
