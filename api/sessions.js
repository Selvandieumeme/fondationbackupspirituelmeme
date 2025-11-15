const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

module.exports = async (req, res) => {
    // --- CORS ---
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.status(200).end();
    }

    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Méthode non autorisée" });
    }

    try {
        const data = req.body;

        if (!data.nom || !data.email || !data.password) {
            return res.status(400).json({ success: false, message: "Champs requis manquants" });
        }

        const client = await clientPromise;
        const db = client.db("fobas-chat");
        const collection = db.collection("sessions");

        const result = await collection.insertOne(data);

        res.status(200).json({
            success: true,
            message: "Inscription réussie",
            insertedId: result.insertedId
        });

    } catch (err) {
        console.error("🔥 SERVER ERROR:", err);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
};
