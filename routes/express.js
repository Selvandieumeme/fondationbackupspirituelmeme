const express = require("express");
const router = express.Router();
const Transaction = require("../models/ExpressTransaction");
const History = require("../models/ExpressHistory");

function generateTransferCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

router.post("/create", async (req, res) => {

  try {

    const transferCode = generateTransferCode();

    const transaction = new Transaction({
      ...req.body,
      transferCode
    });

    await transaction.save();

    await History.create({
      transactionId: transaction._id,
      action: "created"
    });

    res.status(200).json({
      message: "Transfert enregistré.",
      transferCode
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur." });
  }

});

module.exports = router;
