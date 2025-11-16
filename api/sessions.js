const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = async (req, res) => {
  // ✅ CORS sèlman pou front-end presi
  const allowedOrigin = "https://selvandieumeme.github.io/fondationbackupspirituelmeme/";
  const origin = req.headers.origin;
  if (origin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ success: false, message: "Method Not Allowed" });

  try {
    await client.connect();
    const db = client.db("fobas-chat");
    const sessions = db.collection("sessions");

    const data = req.body;
    await sessions.insertOne({ ...data, createdAt: new Date() });

    return res.status(200).json({ success: true, message: "Données enregistrées avec succès !" });
  } catch (err) {
    console.error("Erreur MongoDB:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  } finally {
    await client.close();
  }
};
