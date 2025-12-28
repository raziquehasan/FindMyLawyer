// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true },
    phone_number: { type: String, required: true, unique: true, trim: true },
    role: { type: String, enum: ["client", "lawyer", "admin"], required: true },
    auth_provider: { type: String, enum: ["otp"], default: "otp" },
    account_status: { type: String, enum: ["active", "suspended", "deleted"], default: "active" },
    is_verified: { type: Boolean, default: false },
    last_login_at: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);