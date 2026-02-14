// expressTransferRoutes.js
const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { v4: uuidv4 } = require("uuid");

// POST /api/express-transfer
// Kreye nouvo transfè express
router.post("/api/express-transfer", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const {
      senderName,
      senderCIN,
      senderPhone,
      senderCountry,
      senderAddress,
      receiverName,
      receiverPhone,
      receiverCountry,
      receiverAddress,
      amount,
      devise, // HTG, USD, Euro
      senderAgentName,
      senderAgentEmail
    } = req.body;

    // Verifye tout chan obligatwa
    if (
      !senderName ||
      !senderCIN ||
      !senderPhone ||
      !senderCountry ||
      !senderAddress ||
      !receiverName ||
      !receiverPhone ||
      !receiverCountry ||
      !receiverAddress ||
      !amount ||
      !senderAgentName ||
      !senderAgentEmail ||
      !devise
    ) {
      return res.status(400).json({ success: false, message: "Champs manquants" });
    }

    // Verifye Agent nan walletbalances pou garanti
    const agent = await db.collection("walletbalances").findOne({
      email: senderAgentEmail.toLowerCase()
    });

    if (!agent) {
      return res.status(400).json({ success: false, message: "Agent Autorisé non trouvé" });
    }

    // Kreye unique code pou transfè a
    const uniqueCode = uuidv4();

    // Kreye dokiman transfè
    const newTransfer = {
      senderName,
      senderCIN,
      senderPhone,
      senderCountry,
      senderAddress,
      receiverName,
      receiverPhone,
      receiverCountry,
      receiverAddress,
      amount,
      devise,
      senderAgentName,
      senderAgentEmail,
      status: "pending",
      uniqueCode,
      createdAt: new Date()
    };

    // Mete li nan MongoDB
    await db.collection("expressTransfers").insertOne(newTransfer);

    return res.json({ success: true, message: "Transfert créé avec succès", uniqueCode });
  } catch (err) {
    console.error("EXPRESS TRANSFER ERROR:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// POST /api/validate-withdrawal
// Verifye uniqueCode epi chanje statut + kalkil fre
router.post("/api/validate-withdrawal", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { uniqueCode } = req.body;

    if (!uniqueCode) {
      return res.status(400).json({ success: false, message: "Code manquant" });
    }

    // Chèche transfè nan collection
    const transfer = await db.collection("expressTransfers").findOne({ uniqueCode });

    if (!transfer) {
      return res.status(404).json({ success: false, message: "Transfert non trouvé" });
    }

    if (transfer.status !== "pending") {
      return res.status(400).json({ success: false, message: `Transfert deja ${transfer.status}` });
    }

    // Kalkil fre
    const fraisTotal = transfer.amount * 0.015;
    const bonusAgent = transfer.amount * 0.007; // 0.70%
    const adminFee = transfer.amount * 0.008; // 0.80%
    const montantNet = transfer.amount - fraisTotal;

    // Update transfè
    await db.collection("expressTransfers").updateOne(
      { uniqueCode },
      {
        $set: {
          status: "Retire",
          retraitAt: new Date(),
          montantNet,
          fraisTotal,
          bonusAgent,
          adminFee
        }
      }
    );

    // Mete bonus Agent nan walletbalances li
    await db.collection("walletbalances").updateOne(
      { email: transfer.senderAgentEmail.toLowerCase() },
      {
        $inc: { balance: montantNet, bonus: bonusAgent } // Net transfè + bonus
      }
    );

    // Mete admin fee nan kont admin (imajine yon email admin)
    await db.collection("walletbalances").updateOne(
      { email: "memeselvandieu@fobas.com" },
      { $inc: { balance: adminFee } }
    );

    return res.json({ success: true, message: "Retrait validé", montantNet, fraisTotal });
  } catch (err) {
    console.error("VALIDATE WITHDRAWAL ERROR:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// GET /api/express-transfers/:email
// Retounen tout transfè pou yon agent
router.get("/api/express-transfers/:email", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { email } = req.params;

    const transfers = await db
      .collection("expressTransfers")
      .find({ senderAgentEmail: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({ success: true, transfers });
  } catch (err) {
    console.error("GET EXPRESS TRANSFERS ERROR:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
