module.exports = async (req, res) => {
  // Sèl metòd POST ki aksepte
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Parse body la si li se string
  let body = req.body;
  if (typeof body === "string") body = JSON.parse(body);

  const { key } = body;
  if (!key) return res.status(400).json({ success: false, error: "Missing key" });

  // Sèl sous modpas la: varyab anviwònman ADMIN_PASSWORD
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ success: false, error: "Admin password not configured" });
  }

  if (key === ADMIN_PASSWORD) {
    return res.status(200).json({ success: true });
  } else {
    return res.status(200).json({ success: false });
  }
};
