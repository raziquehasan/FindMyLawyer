// models/ConsultationRequest.js
const mongoose = require("mongoose");

const consultationRequestSchema = new mongoose.Schema(
  {
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: "ClientProfile", required: true },
    case_type: { type: String, enum: ["Property Dispute", "Family & Divorce"], required: true },
    case_category: { type: String }, // Sub-category if any
    issue_description: { type: String, required: true },
    budget_range: { type: String },
    urgency: { type: String, enum: ["low", "medium", "high"], default: "low" },
    language: { type: String },
    share_contact: { type: Boolean, default: false },
    status: {
      type: String,
      enum: [
        "submitted",
        "payment_pending",
        "awaiting_lawyer",
        "accepted",
        "expired",
        "cancelled"
      ],
      default: "submitted"
    },
    selected_lawyer_id: { type: mongoose.Schema.Types.ObjectId, ref: "LawyerProfile" },
    expires_at: { type: Date, default: () => Date.now() + 48 * 60 * 60 * 1000 }
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

module.exports = mongoose.model("ConsultationRequest", consultationRequestSchema);