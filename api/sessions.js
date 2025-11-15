const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = async (req, res) => {
  // --- CORS ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const db = client.db("fobas-chat");
    const sessions = db.collection("sessions");

    const userData = req.body;

    await sessions.insertOne({
      ...userData,
      createdAt: new Date()
    });

    return res.status(200).json({ message: "Enregistré avec succès !" });
  } catch (err) {
    console.error("Erreur:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
