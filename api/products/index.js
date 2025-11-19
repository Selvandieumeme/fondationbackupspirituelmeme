const { MongoClient } = require("mongodb");

module.exports = async (req, res) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("fobas-chat");
    const collection = db.collection("produits");

    if (req.method === "GET") {
      const produits = await collection
        .find({}, { projection: { _id: 1, name: 1, price: 1, image: 1, createdAt: 1 } })
        .sort({ createdAt: -1 })
        .toArray();
      return res.status(200).json(produits);
    }

    if (req.method === "POST") {
      let body = req.body;

      if (typeof body === "string") body = JSON.parse(body);

      const { name, price, image } = body;
      if (!name || !price || !image) {
        return res.status(400).json({ error: "Missing fields" });
      }

      const result = await collection.insertOne({
        name,
        price,
        image,
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
