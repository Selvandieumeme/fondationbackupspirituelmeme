const express = require("express");
const router = express.Router();
const Transaction = require("../models/ExpressTransaction");
const History = require("../models/ExpressHistory");

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
router.post("/create", async (req, res) => {
  try {
    // ------------------ VERIFY AGENT AUTORISE ------------------
    const { walletAccountType } = req.body;

    if (walletAccountType !== "Agent Autorise") {
      return res.status(403).json({
        message: "Accès refusé: Se sèlman yon Agent Autorise ki ka effectuer ce transfert."
      });
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
      return res.status(400).json({
        message: "Tous les champs obligatoires ne sont pas remplis."
      });
    }

    // ------------------ GENERATE TRANSFER CODE ------------------
    const transferCode = generateTransferCode();

    // ------------------ CREATE TRANSACTION ------------------
    const transaction = new Transaction({
      ...req.body,
      transferCode,
      status: "pending",
      createdAt: new Date()
    });

    await transaction.save();

    // ------------------ CREATE HISTORY ------------------
    await History.create({
      transactionId: transaction._id,
      action: "created",
      performedBy: agent_email, // nou itilize email agent pou istwa
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
