// /express/express.auth.js
// Stil menm jan ak merchant.auth.js

module.exports = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.user.role !== 'agent_autorise') {
    return res.status(403).json({ message: 'Access denied' });
  }

  next();
};
