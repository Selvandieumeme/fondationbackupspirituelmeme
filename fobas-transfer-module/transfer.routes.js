const express = require("express");
const router = express.Router();

const { createTransferExpress } = require("./transfer.service");

// Route izole pou bouton TRANSFERER express
router.post("/express", async (req, res) => {
  try {
    const transfert = await createTransferExpress(req.body);

    res.json({
      success: true,
      codeUnique: transfert.codeUnique,
      message: "Transfert créé avec succès"
    });
  } catch (err) {
    if (err.message === "INSUFFICIENT_FUNDS") {
      return res.json({
        success: false,
        message: "Ou pa gen ase fon pou w fè transfè sa. Rechaje kont ou dabò."
      });
    }

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Erreur serveur"
    });
  }
});

module.exports = router;
