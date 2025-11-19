const { MongoClient, ObjectId } = require("mongodb");

module.exports = async (req, res) => {
  const uri = process.env.MONGODB_URI;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db("fobas-chat");
    const collection = db.collection("produits");

    const productId = req.query.id;
    if (!ObjectId.isValid(productId)) return res.status(400).json({ error: "Invalid ID" });

    if (req.method === "DELETE") {
      const result = await collection.deleteOne({ _id: new ObjectId(productId) });
      if (result.deletedCount === 0) return res.status(404).json({ error: "Product not found" });

      return res.status(200).json({ success: true, deletedId: productId });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
};
