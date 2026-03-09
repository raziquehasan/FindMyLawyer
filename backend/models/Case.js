// models/Case.js
const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    request_id: { type: mongoose.Schema.Types.ObjectId, ref: "ConsultationRequest", required: true },
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: "ClientProfile", required: true },
    lawyer_id: { type: mongoose.Schema.Types.ObjectId, ref: "LawyerProfile", required: true },
    case_status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
    opened_at: { type: Date, default: Date.now },
    closed_at: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Case", caseSchema);