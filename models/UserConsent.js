// models/UserConsent.js
const mongoose = require("mongoose");

const userConsentSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    document_id: { type: mongoose.Schema.Types.ObjectId, ref: "LegalDocument", required: true },
    accepted_at: { type: Date, default: Date.now },
    ip_address: { type: String },
    user_agent: { type: String },
    source: { type: String, enum: ["signup", "request", "payment", "appointment"], required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserConsent", userConsentSchema);