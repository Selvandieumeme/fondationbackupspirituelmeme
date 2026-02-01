const crypto = require('crypto');
const Merchant = require('./merchant.model');

exports.registerMerchant = async (req, res) => {
  try {
    const { businessName, ownerName, email, phone } = req.body;

    const merchantId = 'MER-' + crypto.randomBytes(4).toString('hex');
    const apiKey = crypto.randomBytes(32).toString('hex');

    const merchant = await Merchant.create({
      businessName,
      ownerName,
      email,
      phone,
      merchantId,
      apiKey
    });

    res.json({
      message: 'Commerçant créé',
      merchantId,
      apiKey
    });

  } catch (e) {
    res.status(500).json({ message: 'Erreur création commerçant' });
  }
};
