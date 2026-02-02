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

  phone: whatsapp,        // whatsapp ➜ phone
  storeName: business,    // business ➜ storeName
  storeAddress: address, // address ➜ storeAddress

  status: "active",
  createdAt: new Date()
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




// ======================== LOGIN MERCHANT ========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Tout chan obligatwa." });
    }

    const merchant = await MerchantUser.findOne({ email });
    if (!merchant) {
      return res.status(404).json({ success: false, message: "Commerçant pa egziste." });
    }

    if (merchant.status !== "active") {
  return res.status(403).json({
    success: false,
    message: "Compte commerçant non actif."
  });
}

    const isMatch = await bcryptjs.compare(password, merchant.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Mot de passe incorrect." });
    }

    // ------------------- REKOMANDE: Retounen sèlman enfòmasyon ki nesesè -------------------
    return res.json({
      success: true,
      message: "Connexion commerçant réussie ✔️",
      merchant: {
        fullName: merchant.fullName,
        email: merchant.email,
        status: merchant.status,
        createdAt: merchant.createdAt
      }
    });

  } catch (err) {
    console.error("MERCHANT LOGIN ERROR:", err);
    res.status(500).json({ success: false, message: "Erreur serveur connexion commerçant" });
  }
});








// nan merchant.routes.js
router.get('/dashboard', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email manke" });
    }

    const merchant = await MerchantUser.findOne({ email });
    if (!merchant) {
      return res.status(404).json({ success: false, message: "Commerçant pa egziste" });
    }

    // Si balance/payments pa egziste, kreye default
    const balance = merchant.balance !== undefined ? merchant.balance : 0;
    const payments = Array.isArray(merchant.payments) ? merchant.payments : [];

    return res.json({
      success: true,
      balance,
      payments,
      fullName: merchant.fullName
    });

  } catch (err) {
    console.error("DASHBOARD MERCHANT ERROR:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur dashboard" });
  }
});





// ========================
// 📷 GENERATE QR PAIEMENT
// ========================
router.get("/generate-qr", async (req, res) => {
  try {
    const { email, amount } = req.query;

    // ✅ Vérification paramètres
    if (!email || !amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Email ou montant invalide"
      });
    }

    // ✅ Vérifier que le merchant existe
    const merchant = await MerchantUser.findOne({ email });
    if (!merchant) {
      return res.status(404).json({
        success: false,
        message: "Commerçant introuvable"
      });
    }

    // ✅ Payload QR (simple & valide)
    const payload = JSON.stringify({
      merchantEmail: merchant.email,
      amount: Number(amount),
      currency: "HTG",
      reference: "TX-" + Date.now()
    });

    // ✅ Génération QR
    const qrUrl =
      "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=" +
      encodeURIComponent(payload);

    return res.json({
      success: true,
      qrUrl
    });

  } catch (err) {
    console.error("GENERATE QR ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur génération QR"
    });
  }
});
module.exports = router;
