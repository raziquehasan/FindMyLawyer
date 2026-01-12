// models/LawyerSpecialization.js
const mongoose = require("mongoose");

const lawyerSpecializationSchema = new mongoose.Schema(
  {
    lawyer_id: { type: mongoose.Schema.Types.ObjectId, ref: "LawyerProfile", required: true },
    specialization: { type: String, required: true }
  },
  { timestamps: true }
);

lawyerSpecializationSchema.index({ lawyer_id: 1, specialization: 1 }, { unique: true });

module.exports = mongoose.model("LawyerSpecialization", lawyerSpecializationSchema);