// db.js
const mongoose = require('mongoose');
require('dotenv').config();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Koneksyon ak MongoDB Atlas reyalize avèk siksè!');
  } catch (err) {
    console.error('❌ Erè pandan koneksyon ak MongoDB:', err.message);
  }
}

module.exports = connectDB;
