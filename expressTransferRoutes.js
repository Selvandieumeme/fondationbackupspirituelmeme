// expressTransferRoutes.js
// =======================================
// Routes Transfert Express Haiti
// =======================================
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid"); // pou jenere uniqueCode

// POST /api/express-transfer → kreye nouvo transfert
router.post("/api/express-transfer", async (req, res) => {
  try {
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
      senderAgentName,
      senderAgentEmail
    } = req.body;

    // Validasyon minimal
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
      !senderAgentEmail
    ) {
      return res.status(400).json({ success: false, message: "Champs manquants" });
    }

    // Kalkil fre 1.5%
    const fee = (parseFloat(amount) * 1.5) / 100;
    const agentBonus = (fee * 0.7);  // 0.7% pou Agent
    const adminShare = (fee * 0.8);  // 0.8% pou Admin
    const totalAmount = parseFloat(amount);

    const uniqueCode = uuidv4(); // jenere unique code

    // Dokiman pou koleksyon expressTransfers
    const transfertDoc = {
      senderName,
      senderCIN,
      senderPhone,
      senderCountry,
      senderAddress,
      receiverName,
      receiverPhone,
      receiverCountry,
      receiverAddress,
      amount: totalAmount,
      fee: fee,
      agentBonus: agentBonus,
      adminShare: adminShare,
      senderAgentName,
      senderAgentEmail,
      uniqueCode,
      status: "En attente", // default
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 jou
    };

    const result = await req.app.locals.db
      .collection("expressTransfers")
      .insertOne(transfertDoc);

    // Tou depan de audit, ou ka tou ajoute nan istorik (historique) si vle
    await req.app.locals.db
      .collection("expressTransfersHistory")
      .insertOne({ ...transfertDoc, recordedAt: new Date() });

    res.json({
      success: true,
      message: "Transfert créé avec succès",
      uniqueCode
    });

  } catch (err) {
    console.error("ERROR /api/express-transfer:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// POST /api/validate-withdrawal → verifye uniqueCode e chanje statut
router.post("/api/validate-withdrawal", async (req, res) => {
  try {
    const { uniqueCode } = req.body;

    if (!uniqueCode) {
      return res.status(400).json({ success: false, message: "Code manquant" });
    }

    const transfert = await req.app.locals.db
      .collection("expressTransfers")
      .findOne({ uniqueCode });

    if (!transfert) {
      return res.status(404).json({ success: false, message: "Transfert introuvable" });
    }

    if (transfert.status !== "En attente") {
      return res.status(400).json({ success: false, message: "Transfert déjà validé" });
    }

    // Chanje statut → Retirer
    const updateResult = await req.app.locals.db
      .collection("expressTransfers")
      .updateOne(
        { uniqueCode },
        { $set: { status: "Retirer", retraitAt: new Date() } }
      );

    // Distribisyon fre otomatik
    // Agent Bonus
    await req.app.locals.db
      .collection("walletbalances")
      .updateOne(
        { email: transfert.senderAgentEmail },
        { $inc: { bonus: transfert.agentBonus } }
      );

    // Admin share
    await req.app.locals.db
      .collection("walletbalances")
      .updateOne(
        { email: "memeselvandieu@fobas.com" },
        { $inc: { balance: transfert.adminShare } }
      );

    res.json({ success: true, message: "Retrait validé avec succès" });

  } catch (err) {
    console.error("ERROR /api/validate-withdrawal:", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

// GET /api/express-transfers/:email → liste transferts selon email
router.get("/api/express-transfers/:email", async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const transfers = await req.app.locals.db
      .collection("expressTransfers")
      .find({ senderAgentEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ success: true, transfers });
  } catch (err) {
    console.error("ERROR /api/express-transfers/:email", err);
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});

module.exports = router;
