// routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Sove nouvo mesaj
router.post('/', async (req, res) => {
  try {
    const { pasteur, legliz, mesaj } = req.body;
    const newMsg = new Message({ pasteur, legliz, mesaj });
    await newMsg.save();
    res.status(201).json({ message: 'Mesaj sove ak siksè!' });
  } catch (error) {
    res.status(500).json({ error: 'Erè pandan sove mesaj la.' });
  }
});

// Jwenn tout mesaj
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort({ date: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Erè pandan lekti mesaj yo.' });
  }
});

module.exports = router;
