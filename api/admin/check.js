module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  let body = req.body;
  if (typeof body === "string") body = JSON.parse(body);

  const { key } = body;
  if (!key) return res.status(400).json({ success: false, error: "Missing key" });

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "fobas123"; // mete modpas ou nan .env

  if (key === ADMIN_PASSWORD) return res.status(200).json({ success: true });
  return res.status(200).json({ success: false });
};
