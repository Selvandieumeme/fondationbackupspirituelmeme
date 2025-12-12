const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "VIP" },
  vipExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema, "users");












const userSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  country: String,
  phone: String,
  dob: String,
  city: String,
  paymentMethod: String,
  depositAmount: String,
  password: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
