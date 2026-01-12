// models/LawyerAvailability.js
const mongoose = require("mongoose");

const lawyerAvailabilitySchema = new mongoose.Schema(
  {
    lawyer_id: { type: mongoose.Schema.Types.ObjectId, ref: "LawyerProfile", required: true },
    day_of_week: { type: String, enum: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"], required: true },
    start_time: { type: String, required: true }, // HH:MM format
    end_time: { type: String, required: true } // HH:MM format
  },
  { timestamps: true }
);

lawyerAvailabilitySchema.index({ lawyer_id: 1, day_of_week: 1 }, { unique: true });

module.exports = mongoose.model("LawyerAvailability", lawyerAvailabilitySchema);
