const { MongoClient } = require("mongodb");
const multiparty = require("multiparty");
const fs = require("fs");

module.exports = async (req, res) => {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    await client.connect();
    const db = client.db("fobas-chat");
    const produits = db.collection("produits");

    // -----------------------------
    // GET → Retounen lis pwodwi yo
    // -----------------------------
    if (req.method === "GET") {
        const data = await produits.find({}).toArray();
        return res.status(200).json(data);
    }

    // -----------------------------
    // POST → Ajoute nouvo pwodwi (FormData)
    // -----------------------------
    if (req.method === "POST") {
        const form = new multiparty.Form();

        form.parse(req, async (err, fields, files) => {
            if (err) return res.status(500).json({ error: err.message });

            const name = fields.name?.[0];
            const price = parseFloat(fields.price?.[0]);
            const imageFile = files.image?.[0];

            if (!name || !price || !imageFile) {
                return res.status(400).json({ error: "Missing fields" });
            }

            // Li imaj la an Base64
            const fileData = fs.readFileSync(imageFile.path);
            const base64Image = `data:image/jpeg;base64,${fileData.toString("base64")}`;

            const produit = {
                name,
                price,
                image: base64Image,
                createdAt: new Date()
            };

            const result = await produits.insertOne(produit);

            return res.status(201).json({
                success: true,
                insertedId: result.insertedId
            });
        });

        return;
    }

    return res.status(405).json({ error: "Method not allowed" });
};
