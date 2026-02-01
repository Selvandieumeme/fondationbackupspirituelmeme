const crypto = require('crypto');
const bcryptjs = require('bcryptjs');
const Merchant = require('./merchant.model'); // schema final nou an

exports.registerMerchant = async (req, res) => {
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

    // ✅ Verifye tout chan obligatwa
    if (!fullName || !email || !password || !business || !address || !whatsapp || !businessType || !birthDate || !cin) {
      return res.status(400).json({ success: false, message: 'Champs obligatwa manke.' });
    }

    // ✅ Verifye si email deja egziste
    const existing = await Merchant.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email deja itilize.' });
    }

    // 🔒 Hash password
    const passwordHash = await bcryptjs.hash(password, 10);

    // 🔹 Jenere merchantId ak apiKey
    const merchantId = 'MER-' + crypto.randomBytes(4).toString('hex');
    const apiKey = crypto.randomBytes(32).toString('hex');

    // ✅ Kreye nouvo komèsan
    const newMerchant = await Merchant.create({
      fullName,
      email,
      passwordHash,
      business,
      address,
      whatsapp,
      businessType,
      birthDate,
      cin,
      merchantId,
      apiKey
    });

    res.json({
      success: true,
      message: 'Commerçant créé avec succès ✔️',
      merchantId,
      apiKey
    });

  } catch (e) {
    console.error('REGISTER MERCHANT ERROR:', e);
    res.status(500).json({ success: false, message: 'Erreur création commerçant' });
  }
};
