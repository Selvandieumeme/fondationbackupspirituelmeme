const express = require("express"); 
const router = express.Router();
const WalletBalance = require("../models/walletBalance");
const MerchantUser = require("../models/merchantUser");

// -------------------------
// 💳 Transfert Wallet ➜ Merchant
// -------------------------
router.post("/transfer-to-merchant", async (req, res) => {
  try {
    const { email, amount, userEmail } = req.body;

    if (!email || !amount || Number(amount) <= 0 || !userEmail) {
      return res.status(400).json({ success: false, message: "Email ou montant invalide" });
    }

    // ------------------- Wallet user
    const walletUser = await WalletBalance.findOne({ email: userEmail });
    if (!walletUser) return res.status(404).json({ success: false, message: "Kont wallet pa egziste" });
    if (walletUser.balance < amount) return res.status(400).json({ success: false, message: "Pa gen ase lajan sou kont ou" });

    // ------------------- Merchant
    const merchant = await MerchantUser.findOne({ email });
    if (!merchant) return res.status(404).json({ success: false, message: "Commerçant pa egziste" });

    // ------------------- Fè transfè a
    walletUser.balance -= Number(amount);
    merchant.balance += Number(amount);

    // Ajoute istorisite
    if (!Array.isArray(walletUser.payments)) walletUser.payments = [];
    walletUser.payments.push({ type: "transferToMerchant", amount, to: merchant.email, date: new Date() });

    if (!Array.isArray(merchant.payments)) merchant.payments = [];
    merchant.payments.push({ type: "receivedFromWallet", amount, from: walletUser.email, date: new Date() });

    await walletUser.save();
    await merchant.save();

    return res.json({
      success: true,
      newMerchantBalance: merchant.balance,
      message: `Transfert fini avèk siksè!`
    });

  } catch (err) {
    console.error("TRANSFER TO MERCHANT ERROR:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur transfert" });
  }
});

module.exports = router;
