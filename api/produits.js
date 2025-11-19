const { MongoClient } = require("mongodb");

module.exports = async (req, res) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("fobas-chat");
    const collection = db.collection("produits");

    // POST → ajoute yon imaj
    if (req.method === "POST") {
      let body = req.body;

      // Vercel konn voye JSON an kòm string
      if (typeof body === "string") {
        body = JSON.parse(body);
      }

      // body.image dwe egziste
      if (!body.image) {
        return res.status(400).json({ error: "Missing 'image' field" });
      }

      const produit = {
        image: body.image,   // URL, Base64 oswa data:image/jpeg;base64...
        createdAt: new Date()
      };

      const result = await collection.insertOne(produit);

      return res.status(200).json({
        success: true,
        insertedId: result.insertedId
      });
    }

    // GET → retounen tout imaj yo
    if (req.method === "GET") {
      const produits = await collection
        .find({}, { projection: { _id: 1, image: 1, createdAt: 1 } })
        .sort({ createdAt: -1 })
        .toArray();

      return res.status(200).json(produits);
    }

    return res.status(405).json({ error: "Method not allowed" });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
};
