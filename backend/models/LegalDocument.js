// models/LegalDocument.js
const mongoose = require("mongoose");

const legalDocumentSchema = new mongoose.Schema(
  {
    document_type: {
      type: String,
      enum: [
        "terms_of_service",
        "privacy_policy",
        "consultation_consent",
        "ai_processing_consent",
        "lawyer_platform_terms"
      ],
      required: true
    },
    version: { type: String, required: true },
    document_url: { type: String, required: true },
    applicable_to: { type: String, enum: ["user", "lawyer", "both"], required: true },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

legalDocumentSchema.index({ document_type: 1, version: 1 }, { unique: true });

module.exports = mongoose.model("LegalDocument", legalDocumentSchema);