const express = require("express");
const router = express.Router();
const { createTransfer } = require("./transfer.service");

router.post("/transferer", async (req, res) => {
  try {
    const result = await createTransfer(req.body);

    if (result.error) {
      return res.json({ success: false, message: result.error });
    }

    res.json(result);
  } catch (e) {
    console.error("TRANSFER SERVICE ERROR:", e);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
