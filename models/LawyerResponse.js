// models/LawyerResponse.js
const mongoose = require("mongoose");

const lawyerResponseSchema = new mongoose.Schema(
  {
    request_id: { type: mongoose.Schema.Types.ObjectId, ref: "ConsultationRequest", required: true },
    lawyer_id: { type: mongoose.Schema.Types.ObjectId, ref: "LawyerProfile", required: true },
    response: { type: String, enum: ["accepted", "declined"], required: true },
    decline_reason: { type: String },
    responded_at: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

lawyerResponseSchema.index({ request_id: 1, lawyer_id: 1 }, { unique: true });

module.exports = mongoose.model("LawyerResponse", lawyerResponseSchema);