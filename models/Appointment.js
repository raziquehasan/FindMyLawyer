// models/Appointment.js
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    case_id: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
    consultation_type: { type: String, enum: ["call"], default: "call" },
    appointment_datetime: { type: Date, required: true },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    call_duration_minutes: { type: Number }, // 15 minutes for Phase 1
    notes: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
