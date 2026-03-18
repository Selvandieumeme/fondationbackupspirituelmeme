// =========================
// COLLECTIONS
// =========================
const WalletBalance = mongoose.models.walletbalances || mongoose.model("walletbalances", new mongoose.Schema({}, { strict: false }));
const Transfert = mongoose.models.transferts || mongoose.model("transferts", new mongoose.Schema({}, { strict: false }));

// =========================
// UTIL FUNCTIONS
// =========================
function generateTransferCode() {
  return "FOB-" + Date.now().toString().slice(-7);
}

function calculateExpiration() {
  const today = new Date();
  const expiration = new Date();
  expiration.setDate(today.getDate() + 21);
  return expiration.toISOString().split("T")[0]; // YYYY-MM-DD
}

// =========================
// POST /api/expressfobas
// =========================
router.post("/expressfobas", async (req, res) => {
  try {
    const {
      agentName,
      agentEmail,
      senderName,
      senderId,
      senderCountry,
      senderCity,
      senderAddress,
      senderWhatsapp,
      receiverName,
      receiverCountry,
      receiverCity,
      receiverAddress,
      receiverWhatsapp,
      amountHTG
    } = req.body;

    if (!amountHTG || amountHTG <= 0) {
      return res.status(400).json({ error: "Montant doit être supérieur à 0" });
    }

    const agent = await WalletBalance.findOne({ email: agentEmail });
    if (!agent) return res.status(404).json({ error: "Agent non trouvé" });

    const fees = amountHTG * 0.15;
    const totalDebit = amountHTG + fees;

    if ((agent.balance || 0) < totalDebit) {
      return res.status(400).json({ error: "Pas assez de fonds dans le compte de l'agent" });
    }

    // Debi agent la
    agent.balance -= totalDebit;
    await agent.save();

    // Kreye dokiman nan transferts
    const transferCode = generateTransferCode();
    const today = new Date().toISOString().split("T")[0];
    const expirationDate = calculateExpiration();

    const transfert = new Transfert({
      agentName,
      agentEmail,
      senderName,
      senderId,
      senderCountry,
      senderCity,
      senderAddress,
      senderWhatsapp,
      receiverName,
      receiverCountry,
      receiverCity,
      receiverAddress,
      receiverWhatsapp,
      amountHTG,
      feesHTG: fees,
      totalDebitHTG: totalDebit,
      transferCode,
      createdAt: today,
      expirationDate,
      status: "Pending"
    });

    await transfert.save();

    return res.status(201).json({ transferCode });

  } catch (err) {
    console.error("Erreur serveur Express FOBAS:", err);
    return res.status(500).json({ error: "Erreur serveur, veuillez réessayer." });
  }
});

// =========================
// CRON JOB - Retounen fon apre 21 jou
// =========================
cron.schedule("0 0 * * *", async () => { // chak jou 00:00
  try {
    const today = new Date().toISOString().split("T")[0];

    const expiredTransfers = await Transfert.find({
      status: "Pending",
      expirationDate: { $lt: today }
    });

    for (const t of expiredTransfers) {
      const agent = await WalletBalance.findOne({ email: t.agentEmail });
      if (agent) {
        agent.balance += t.totalDebitHTG;
        await agent.save();
      }

      t.status = "Express Fobas Annule";
      await t.save();
    }

    console.log(`[CRON EXPRESS FOBAS] ${expiredTransfers.length} transferts annulés et fonds retournés.`);

  } catch (err) {
    console.error("Erreur cron job Express FOBAS:", err);
  }
});

module.exports = router;
