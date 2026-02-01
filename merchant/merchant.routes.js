const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const MerchantUser = require('../models/merchantUser'); // Schema ou pou komèsan yo
const controller = require('./merchant.controller');   // Si gen lòt fonksyonalite nan controller

// ========================
// 📌 REGISTER MERCHANT
// ========================
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, phone, storeName, storeAddress } = req.body;

    // ✅ Verifye si tout chan obligatwa ranpli
    if (!fullName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Champs obligatwa manke.' });
    }

    // ✅ Verifye si email deja egziste
    const existing = await MerchantUser.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email deja itilize.' });
    }

    // 🔒 Hash password
    const passwordHash = await bcryptjs.hash(password, 10);

    // ✅ Kreye nouvo komèsan
    const newMerchant = new MerchantUser({
      fullName,
      email,
      passwordHash,
      phone,
      storeName,
      storeAddress
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

// ✅ Si gen lòt fonksyonalite nan controller (tankou login, update, delete, etc.)
router.post('/register-controller', controller.registerMerchant);

module.exports = router;
