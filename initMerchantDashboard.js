// 🔹 Fichye: initMerchantDashboard.js
const mongoose = require('mongoose');
const MerchantUser = require('./models/merchantUser'); // chimen shema ou

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/fobas';

async function initDashboardFields() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB konekte');

    // 🔹 Update tout merchants ki pa gen balance oswa payments
    const result = await MerchantUser.updateMany(
      { $or: [ { balance: { $exists: false } }, { payments: { $exists: false } } ] },
      { 
        $set: { balance: 0, payments: [] } 
      }
    );

    console.log(`✅ Initialisation fini: ${result.modifiedCount} merchants modifye`);
    process.exit(0);

  } catch (err) {
    console.error('❌ Erè pandan initialisation:', err);
    process.exit(1);
  }
}

initDashboardFields();
