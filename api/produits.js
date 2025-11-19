const { MongoClient } = require("mongodb");

module.exports = async (req, res) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("fobas-chat");
    const collection = db.collection("produits");

    // POST → ajoute yon nouvo pwodwi
    if (req.method === "POST") {
      let body = req.body;

      // Vercel konn voye JSON an enkapsile nan string
      if (typeof body === "string") {
        body = JSON.parse(body);
      }

      const result = await collection.insertOne(body);
      return res.status(200).json({
        success: true,
        insertedId: result.insertedId,
      });
    }

    // GET → retounen tout pwodwi yo
    if (req.method === "GET") {
      const produits = await collection.find().toArray();
      return res.status(200).json(produits);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
};
