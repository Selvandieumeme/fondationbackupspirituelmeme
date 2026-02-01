const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const MerchantUser = require('../models/merchantUser'); // Schema komèsan yo
const multer = require('multer'); // Pou upload CIN

// 🔹 Config pou upload CIN nan server
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/cin'); // folder kote fichye yo pral sove
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ========================
// 📌 REGISTER MERCHANT
// ========================
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

    // ✅ Verifye si tout chan obligatwa ranpli
    if (!fullName || !email || !password || !business || !address || !whatsapp || !businessType || !birthDate || !cin) {
      return res.status(400).json({ success: false, message: 'Tout chan obligatwa yo dwe ranpli.' });
    }

    // ✅ Verifye si email deja egziste
    const existing = await MerchantUser.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email deja itilize.' });
    }

    // 🔒 Hash password
    const passwordHash = await bcryptjs.hash(password, 12);

    // 🔹 Rekipere fichye CIN si li egziste
    const cinFilePath = req.file ? req.file.path : null;

    // ✅ Kreye nouvo komèsan
    const newMerchant = new MerchantUser({
      fullName,
      email,
      passwordHash,
      business,
      address,
      whatsapp,
      businessType,
      birthDate,
      cin,
      cinFilePath // sove path fichye CIN nan DB
    });

    await newMerchant.save();

    res.json({
      success: true,
      message: '✅ Komèsan anrejistre avèk siksè',
      merchant: newMerchant
    });

  } catch (err) {
    console.error('REGISTER MERCHANT ERROR:', err);
    res.status(500).json({ success: false, message: 'Erè sèvè pandan enskripsyon' });
  }
});

module.exports = router;
