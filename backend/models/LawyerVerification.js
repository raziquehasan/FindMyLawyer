// models/LawyerVerification.js
const mongoose = require("mongoose");

const lawyerVerificationSchema = new mongoose.Schema(
  {
    lawyer_id: { type: mongoose.Schema.Types.ObjectId, ref: "LawyerProfile", required: true },
    document_type: { type: String, enum: ["bar_council_id", "license", "certificate"], required: true },
    document_url: { type: String, required: true },
    verification_status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    verified_by_admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    verified_at: { type: Date },
    rejection_reason: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LawyerVerification", lawyerVerificationSchema);
