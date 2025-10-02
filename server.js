// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors'); // 🔑 ajoute CORS
const app = express();

app.use(cors()); // 🔑 pèmèt tout domèn fè request
app.use(express.json());

// 🔑 Password verification route
app.post('/api/verify-password', (req, res) => {
  const { password } = req.body;
  const PASSWORD = process.env.PASSWORD; // soti nan Render

  if (!PASSWORD) {
    return res.status(500).json({ error: 'Server misconfigured: PASSWORD missing' });
  }

  if (password === PASSWORD) {
    return res.json({ success: true, message: 'Password correct' });
  } else {
    return res.status(401).json({ success: false, message: 'Invalid password' });
  }
});

// Route tès pou verifye app la kouri
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
