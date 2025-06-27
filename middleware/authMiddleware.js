const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token obligatwa.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // ajoute itilizatè a nan req
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token pa valab.' });
  }
};
