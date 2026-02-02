const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const MerchantUser = require('../models/merchantUser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

/**
 * ========================
 * 📂 CONFIG UPLOAD CIN
 * ========================
 */
const uploadDir = path.join(__dirname, '../uploads/cin');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});

const upload = multer({ storage });

/**
 * ========================
 * 📝 REGISTER MERCHANT
 * ========================
 */
router.post('/register', upload.single('cinFile'), async (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      business,
      address,
      whatsapp,
      businessType,
      birthDate,
      cin
    } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Champs obligatoires manquants'
      });
    }

    const existing = await MerchantUser.findOne({ email });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email déjà utilisé'
      });
    }

    const passwordHash = await bcryptjs.hash(password, 12);

    const merchant = new MerchantUser({
      fullName,
      email,
      passwordHash,
      business,
      address,
      whatsapp,
      businessType,
      birthDate,
      cin,
      cinFilePath: req.file ? req.file.path : null,
      status: "ACTIVE"
    });

    await merchant.save();

    res.json({
      success: true,
      message: "Commerçant créé avec succès"
    });

  } catch (err) {
    console.error("REGISTER MERCHANT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur inscription"
    });
  }
});

/**
 * ========================
 * 🔐 LOGIN MERCHANT
 * ========================
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email ou mot de passe manquant"
      });
    }

    const merchant = await MerchantUser.findOne({ email });

    if (!merchant) {
      return res.status(401).json({
        success: false,
        message: "Compte introuvable"
      });
    }

    if (merchant.status !== "ACTIVE") {
      return res.status(403).json({
        success: false,
        message: "Compte non actif"
      });
    }

    const ok = await bcryptjs.compare(password, merchant.passwordHash);
    if (!ok) {
      return res.status(401).json({
        success: false,
        message: "Mot de passe incorrect"
      });
    }

    res.json({
      success: true,
      message: "Connexion réussie",
      merchant: {
        fullName: merchant.fullName,
        email: merchant.email
      }
    });

  } catch (err) {
    console.error("LOGIN MERCHANT ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur connexion"
    });
  }
});

module.exports = router;
