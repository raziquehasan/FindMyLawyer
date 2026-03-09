// models/Settlement.js
const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema(
  {
    lawyer_id: { type: mongoose.Schema.Types.ObjectId, ref: "LawyerProfile", required: true },
    payment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Payment", required: true },
    gross_amount: { type: Number, required: true },
    platform_fee: { type: Number, required: true }, // typically 20% or configurable
    net_payout: { type: Number, required: true },
    payout_status: { type: String, enum: ["pending", "processed"], default: "pending" },
    payout_date: { type: Date },
    payout_method: { type: String, enum: ["bank_transfer", "upi"], default: "bank_transfer" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settlement", settlementSchema);
