// models/LawyerProfile.js
const mongoose = require("mongoose");

const lawyerProfileSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    experience_years: { type: Number, default: 0 },
    consultation_fee: { type: Number },
    bio: { type: String },
    profile_status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    is_available: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LawyerProfile", lawyerProfileSchema);