const Merchant = require('./merchant.model');

module.exports = async function merchantAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({ message: 'API Key manquant' });
  }

  const merchant = await Merchant.findOne({
    apiKey,
    subscriptionStatus: 'ACTIVE'
  });

  if (!merchant) {
    return res.status(403).json({ message: 'API Key invalide ou abonnement inactif' });
  }

  req.merchant = merchant;
  next();
};
