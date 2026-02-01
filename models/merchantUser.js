// ----------------------- MERCHANT USERS SCHEMA -----------------------
const merchantUserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String },
  phone: { type: String },
  storeName: { type: String },
  storeAddress: { type: String },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, default: "pending" }
});

// 🔥 Koreksyon pou fè l konpatib ak koleksyon reyèl MongoDB ou
const MerchantUser = mongoose.models.MerchantUser || mongoose.model(
  "MerchantUser",       // Non model nan JS
  merchantUserSchema,   // Schema
  "merchantusers"       // Non collection reyèl nan MongoDB
);

module.exports = MerchantUser;
