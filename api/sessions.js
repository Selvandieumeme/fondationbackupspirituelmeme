const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const dbName = "fobas-chat";
const collectionName = "sessions";

module.exports = async (req, res) => {
    // --- Ajoute CORS headers ---
    res.setHeader("Access-Control-Allow-Origin", "*"); // pèmèt tout domèn
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        // reponn rapid pou preflight requests
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

        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        const result = await collection.insertOne(data);

        res.status(200).json({ success: true, message: "Inscription réussie", insertedId: result.insertedId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Erreur serveur" });
    } finally {
        await client.close();
    }
};
