// models/Review.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    appointment_id: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
    case_id: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
    client_id: { type: mongoose.Schema.Types.ObjectId, ref: "ClientProfile", required: true },
    lawyer_id: { type: mongoose.Schema.Types.ObjectId, ref: "LawyerProfile", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    review_text: { type: String },
    is_anonymous: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
