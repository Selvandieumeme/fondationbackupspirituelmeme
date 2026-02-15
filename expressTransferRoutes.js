const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { v4: uuidv4 } = require("uuid");

// -----------------------------
// POST /api/express-transfer
// Kreye nouvo transfè express
// -----------------------------
router.post("/api/express-transfer", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const {
      agentEmail,
      agentName,
      sender,
      receiver,
      amount,
      devise,
      withdrawCode,
      createdAt,
      expireAt
    } = req.body;

    // Verifye chan obligatwa
    if (
      !agentEmail ||
      !agentName ||
      !sender?.name || !sender?.cin || !sender?.country || !sender?.address || !sender?.whatsapp ||
      !receiver?.name || !receiver?.country || !receiver?.address || !receiver?.whatsapp ||
      !amount || !devise || !withdrawCode
    ) {
      return res.status(400).json({ success: false, message: "Champs manquants" });
    }

    // Verifye Agent nan walletbalances
    const agent = await db.collection("walletbalances").findOne({
      email: agentEmail.toLowerCase()
    });

    if (!agent) {
      return res.status(400).json({ success: false, message: "Agent Autorisé non trouvé" });
    }

    // Kreye dokiman transfè
    const newTransfer = {
      agentEmail,
      agentName,
      sender,
      receiver,
      amount,
      devise,
      withdrawCode,
      status: "pending",
      createdAt: createdAt || new Date(),
      expireAt: expireAt || new Date(Date.now() + 7*24*60*60*1000), // 7 jou
      fraisTotal: 0,
      bonusAgent: 0,
      adminFee: 0,
      montantNet: 0
    };

    await db.collection("expressTransfers").insertOne(newTransfer);

    return res.json({ success: true, message: "Transfert créé avec succès", withdrawCode });

  } catch (err) {
    console.error("EXPRESS TRANSFER ERROR:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// -----------------------------------
// POST /api/validate-withdrawal
// Verifye uniqueCode + kalkil fre + bonus + admin
// -----------------------------------
router.post("/api/validate-withdrawal", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { withdrawCode } = req.body;

    if (!withdrawCode) return res.status(400).json({ success: false, message: "Code manquant" });

    // Chèche transfè
    const transfer = await db.collection("expressTransfers").findOne({ withdrawCode });

    if (!transfer) return res.status(404).json({ success: false, message: "Transfert non trouvé" });
    if (transfer.status !== "pending") return res.status(400).json({ success: false, message: `Transfert deja ${transfer.status}` });

    // Kalkil fre
    const fraisTotal = transfer.amount * 0.015;
    const bonusAgent = transfer.amount * 0.007; // 0.70%
    const adminFee = transfer.amount * 0.008; // 0.80%
    const montantNet = transfer.amount - fraisTotal;

    // Update transfè
    await db.collection("expressTransfers").updateOne(
      { withdrawCode },
      {
        $set: {
          status: "Retire",
          retraitAt: new Date(),
          fraisTotal,
          bonusAgent,
          adminFee,
          montantNet
        }
      }
    );

    // Mete bonus Agent nan walletbalances li
    await db.collection("walletbalances").updateOne(
      { email: transfer.agentEmail.toLowerCase() },
      { $inc: { balance: montantNet, bonus: bonusAgent } }
    );

    // Mete admin fee nan kont admin
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

// -----------------------------------
// GET /api/express-transfers/:agentEmail
// Retounen tout transfè pou agent
// -----------------------------------
router.get("/api/express-transfers/:agentEmail", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { agentEmail } = req.params;

    const transfers = await db.collection("expressTransfers")
      .find({ agentEmail: agentEmail.toLowerCase() })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({ success: true, transfers });
  } catch (err) {
    console.error("GET EXPRESS TRANSFERS ERROR:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
