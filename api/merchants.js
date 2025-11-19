const { MongoClient, ObjectId } = require("mongodb");

module.exports = async (req, res) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("fobas-chat");
    const collection = db.collection("merchants");

    if (req.method === "GET") {
      const merchants = await collection.find({}).toArray();
      return res.status(200).json({ merchants });
    }

    if (req.method === "POST") {
      let body = req.body;
      if (typeof body === "string") body = JSON.parse(body);

      const { storeName, description } = body;
      if (!storeName || !description) return res.status(400).json({ error: "Missing fields" });

      const result = await collection.insertOne({
        storeName,
        description,
        createdAt: new Date()
      });

      return res.status(201).json({ success: true, insertedId: result.insertedId });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
};
