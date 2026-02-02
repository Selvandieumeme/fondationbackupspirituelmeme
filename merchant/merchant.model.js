// ----------------------- MERCHANT USERS SCHEMA -----------------------
const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  fullName: { type: String, required: true },       // Non pwopriyetè a
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },   // Hashe password

  business: { type: String, required: true },      // Non biznis
  address: { type: String, required: true },
  whatsapp: { type: String, required: true },
  businessType: { type: String, required: true },  // Commerce / Service / Autre
  birthDate: { type: Date, required: true },
  cin: { type: String, required: true },           // Nimewo CIN
  cinFilePath: { type: String },                   // Path fichye CIN si upload

  merchantId: { type: String, unique: true },      // ID otomatik si bezwen
  apiKey: { type: String, unique: true },          // API key si bezwen

  subscriptionStatus: {
    type: String,
    enum: ['INACTIVE', 'ACTIVE', 'SUSPENDED'],
    default: 'INACTIVE'
  },

  commissionRate: {
    type: Number,
    default: 0.02 // 2% par transaction
  },

  // ✅ Chan pou dashboard (rezoud mesaj "Erreur serveur")
  balance: { type: Number, default: 0 },
  payments: { type: Array, default: [] },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 🔹 Export model la san kraze okenn chan ki egziste deja
const MerchantUser = mongoose.models.MerchantUser || mongoose.model('merchantusers', merchantSchema);

// ========================
// 🔄 Migrasyon dokiman ki deja egziste
// ========================
// Fason pou mete default balance/payments pou dokiman ki pa gen yo
async function migrateMerchantDefaults() {
  try {
    await mongoose.connect('mongodb://localhost:27017/walletfobas', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const merchants = await MerchantUser.find({});
    for (let merchant of merchants) {
      let changed = false;

      if (merchant.balance === undefined) {
        merchant.balance = 0;
        changed = true;
      }

      if (!Array.isArray(merchant.payments)) {
        merchant.payments = [];
        changed = true;
      }

      if (changed) {
        await merchant.save();
        console.log(`Dokiman ${merchant.email} mete default balance/payments`);
      }
    }

    console.log("Migrate fini ✅");
    mongoose.disconnect();
  } catch (err) {
    console.error("Migrasyon ERROR:", err);
  }
}

// ✅ Opsyon: dekomante pou lanse migrasyon an
// migrateMerchantDefaults();

module.exports = MerchantUser;
