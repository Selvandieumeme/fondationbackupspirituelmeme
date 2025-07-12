// db.js
const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB konekte avèk siksè!');
  } catch (error) {
    console.error('❌ Erè koneksyon MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = connectDB;
