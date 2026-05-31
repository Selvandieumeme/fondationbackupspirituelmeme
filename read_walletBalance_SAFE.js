const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017", {
  dbName: "walletfobasmeme", // ✅ BON DATABASE
})
.then(() => console.log("✅ MongoDB CONNECTED (READ ONLY – REAL DB)"))
.catch(err => {
  console.error("❌ MongoDB CONNECTION ERROR", err);
  process.exit(1);
});

// schema ouvert, lecture seule
const walletSchema = new mongoose.Schema({}, { strict: false });

// ⚠️ BON COLLECTION : walletbalances (avec s)
const WalletBalance = mongoose.model(
  "walletbalances",
  walletSchema,
  "walletbalances"
);

(async () => {
  const count = await WalletBalance.countDocuments();
  console.log("👥 Total REAL wallets:", count);

  const sample = await WalletBalance.find().limit(3);
  console.log("📄 Sample REAL wallets:", sample);

  await mongoose.connection.close();
  console.log("🔒 Connection closed safely");
})();
