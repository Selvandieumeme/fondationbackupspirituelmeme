const Merchant = require('./merchant.model');

module.exports = async function merchantAuth(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({ success: false, message: 'API Key manquant' });
    }

    const merchant = await Merchant.findOne({
      apiKey,
      subscriptionStatus: 'ACTIVE'
    });

    if (!merchant) {
      return res.status(403).json({ success: false, message: 'API Key invalide ou abonnement inactif' });
    }

    req.merchant = merchant;
    next();
  } catch (err) {
    console.error('MERCHANT AUTH ERROR:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur lors de l\'authentification' });
  }
};
