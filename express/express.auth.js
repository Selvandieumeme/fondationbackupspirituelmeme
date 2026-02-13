// /express/express.auth.js
module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // ⚠️ Egzakteman jan li nan baz ou a: walletAccountType
  if (req.user.walletAccountType !== 'Agent Autorise') {
    return res.status(403).json({ message: 'Access denied' });
  }

  next();
};
