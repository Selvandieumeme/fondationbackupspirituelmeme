// api/sessions.js
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
let client;

async function connectToMongo() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  return client.db("fobas-chat").collection("sessions");
}

module.exports = async (req, res) => {
  // ✅ CORS headers toujou nan tout repons
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }

  try {
    const sessions = await connectToMongo();
    const data = req.body;

    // Insert san okenn chifreman, jan ou vle
    await sessions.insertOne({ ...data, createdAt: new Date() });

    return res.status(200).json({
      success: true,
      message: "Données enregistrées avec succès !"
    });
  } catch (err) {
    console.error("Erreur MongoDB:", err);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
