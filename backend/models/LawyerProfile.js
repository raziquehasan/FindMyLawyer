// models/LawyerProfile.js
const mongoose = require("mongoose");

const lawyerProfileSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    license_number: { type: String, unique: true, sparse: true },
    enrollment_number: { type: String, unique: true, sparse: true },
    bar_number: { type: String, unique: true, sparse: true },
    state_bar_council: { type: String },
    lawyer_category: { type: String, enum: ["advocate", "senior_advocate", "advocate_on_record", "aor_high_court", "aor_supreme_court"], default: "advocate" },
    experience_years: { type: Number, default: 0 },
    consultation_fee: { type: Number },
    bio: { type: String },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    total_reviews: { type: Number, default: 0 },
    profile_status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    is_available: { type: Boolean, default: true },
    total_cases_handled: { type: Number, default: 0 },
    success_rate: { type: Number, default: 0 } // percentage
  },
  { timestamps: true }
);

module.exports = mongoose.model("LawyerProfile", lawyerProfileSchema);