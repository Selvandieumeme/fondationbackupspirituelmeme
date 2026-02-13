const express = require("express");
const router = express.Router();
const Transaction = require("../models/ExpressTransaction");
const History = require("../models/ExpressHistory");
const authMiddleware = require("../middlewares/authMiddleware"); // ⚠️ ENPÒTAN

function generateTransferCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

router.post("/create", authMiddleware, async (req, res) => {

  try {

    // 🔒 BLOKAJ SEKIRITE POU ROLE
    if (!req.user || req.user.role !== "Agent Autorise") {
      return res.status(403).json({ message: "Accès refusé." });
    }

    // Validation obligatwa minimòm
    const {
      sender_name,
      receiver_name,
      amount,
      agent_name,
      agent_email,
      sender_cin,
      sender_address
    } = req.body;

    if (
      !sender_name ||
      !receiver_name ||
      !amount ||
      !agent_name ||
      !agent_email ||
      !sender_cin ||
      !sender_address
    ) {
      return res.status(400).json({ message: "Champs obligatoires manquants." });
    }

    const transferCode = generateTransferCode();

    const transaction = new Transaction({
      ...req.body,
      transferCode,
      createdBy: req.user._id,
      status: "pending",
      createdAt: new Date()
    });

    await transaction.save();

    await History.create({
      transactionId: transaction._id,
      action: "created",
      performedBy: req.user._id,
      timestamp: new Date()
    });

    res.status(200).json({
      message: "Transfert enregistré.",
      transferCode
    });

  } catch (error) {
    console.error("Erreur create transfer:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }

});

module.exports = router;
