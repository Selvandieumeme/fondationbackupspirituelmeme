const express = require("express");
const router = express.Router();
const Transaction = require("../models/ExpressTransaction");
const History = require("../models/ExpressHistory");
const WalletBalance = require("../models/WalletBalance"); // Nou itilize pou verifye Agent Autorise
const authMiddleware = require("../middlewares/authMiddleware");

// ------------------ GENERATE TRANSFER CODE ------------------
function generateTransferCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ------------------ CREATE EXPRESS TRANSFER ------------------
router.post("/create", authMiddleware, async (req, res) => {
  try {
    // ------------------ VERIFY USER ROLE ------------------
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non identifié." });
    }

    // Fetch wallet balance pou verifye si se yon Agent Autorise
    const wallet = await WalletBalance.findOne({ userId: req.user._id });
    if (!wallet || wallet.walletAccountType !== "Agent Autorise") {
      return res.status(403).json({ message: "Accès refusé: Agent Autorise uniquement." });
    }

    // ------------------ VALIDATE REQUIRED FIELDS ------------------
    const {
      sender_name,
      sender_cin,
      sender_address,
      receiver_name,
      agent_name,
      agent_email,
      amount
    } = req.body;

    if (!sender_name || !sender_cin || !sender_address || !receiver_name || !agent_name || !agent_email || !amount) {
      return res.status(400).json({ message: "Tous les champs obligatoires ne sont pas remplis." });
    }

    // ------------------ GENERATE TRANSFER CODE ------------------
    const transferCode = generateTransferCode();

    // ------------------ CREATE TRANSACTION ------------------
    const transaction = new Transaction({
      ...req.body,
      transferCode,
      createdBy: req.user._id,
      status: "pending",
      createdAt: new Date()
    });

    await transaction.save();

    // ------------------ CREATE HISTORY ------------------
    await History.create({
      transactionId: transaction._id,
      action: "created",
      performedBy: req.user._id,
      timestamp: new Date()
    });

    // ------------------ RESPONSE ------------------
    res.status(200).json({
      message: "Transfert créé avec succès.",
      transferCode
    });

  } catch (error) {
    console.error("Erreur create transfer:", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
});

module.exports = router;
