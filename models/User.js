import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: "VIP" },
  vipExpiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("User", UserSchema, "users");
