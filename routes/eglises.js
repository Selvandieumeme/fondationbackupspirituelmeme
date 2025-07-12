// routes/eglises.js
const express = require("express");
const router = express.Router();
const Eglise = require("../models/Eglise");

router.post("/", async (req, res) => {
  try {
    const eg = new Eglise(req.body);
    await eg.save();
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erè pandan anrejistreman." });
  }
});

module.exports = router;
