// models/Payment.js
const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    request_id: { type: mongoose.Schema.Types.ObjectId, ref: "ConsultationRequest", required: true },
    amount: { type: Number, required: true },
    payment_method: { type: String, enum: ["upi", "card", "netbanking"], required: true },
    payment_status: { type: String, enum: ["success", "failed", "pending"], default: "pending" },
    refund_status: { type: String, enum: ["none", "initiated", "completed"], default: "none" },
    transaction_id: { type: String, unique: true, required: true },
    failure_reason: { type: String },
    payment_date: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);