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
    const db = client.db("fobas-chat");        // <== DB ou vle a
    const sessions = db.collection("sessions"); // <== Koleksyon an

    const data = req.body;

    await sessions.insertOne({
      ...data,
      createdAt: new Date()
    });

    res.status(200).json({ message: "Données enregistrées avec succès !" });

  } catch (err) {
    console.error("Erreur MongoDB:", err);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
