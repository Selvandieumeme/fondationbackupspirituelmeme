const mongoose = require("mongoose");
const VipSession = require("../models/VipSession");

const MONGODB_URI = process.env.MONGODB_URI;

// Koneksyon san repete
if (!mongoose.connection.readyState) {
  mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB konekte avèk siksè!"))
    .catch(err => console.error("❌ Erè koneksyon MongoDB:", err));
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const data = req.body;

    // Kreye nouvo VIP session
    const newSession = new VipSession(data);
    await newSession.save();

    return res.status(200).json({
      success: true,
      message: "Données enregistrées avec succès !"
    });

  } catch (err) {
    console.error("Erreur MongoDB:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

