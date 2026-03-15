// transfer.routes.js
const express = require("express");
const router = express.Router();
const { createTransfer } = require("./transfer.service");

router.post("/transferer", async (req, res) => {
  try {
    const transfert = await createTransfer(req.body);
    res.json({
      success: true,
      codeUnique: transfert.codeUnique,
      message: "Transfert créé avec succès",
    });
  } catch (err) {
    if (err.message === "INSUFFICIENT_FUNDS") {
      return res.json({
        success: false,
        message: "Ou pa gen ase fon pou w fè transfè sa. Rechaje kont ou dabò.",
      });
    }
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
    });
  }
});

module.exports = router;
