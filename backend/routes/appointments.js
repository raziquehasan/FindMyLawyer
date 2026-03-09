// routes/appointments.js
const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const Appointment = require("../models/Appointment");
const Case = require("../models/Case");
const StateTransition = require("../models/StateTransition");
const AuditLog = require("../models/AuditLog");

// Create appointment for a case
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { case_id, appointment_datetime, user_id } = req.body;

    if (!case_id || !appointment_datetime) {
      return res.status(400).json({ error: "case_id and appointment_datetime are required" });
    }

    const caseDoc = await Case.findById(case_id);
    if (!caseDoc) return res.status(404).json({ error: "Case not found" });

    const appointment = await Appointment.create({
      case_id,
      consultation_type: "call",
      appointment_datetime,
      status: "scheduled",
      call_duration_minutes: 15 // Phase 1: Fixed 15 minutes
    });

    await AuditLog.create({
      entity_type: "appointment",
      entity_id: appointment._id,
      action: "created",
      performed_by: user_id,
      metadata: { case_id }
    });

    res.status(201).json(appointment);
  })
);

// Get appointments for a case
router.get(
  "/case/:caseId",
  asyncHandler(async (req, res) => {
    const { caseId } = req.params;
    const appointments = await Appointment.find({ case_id: caseId }).sort({ appointment_datetime: 1 });
    res.json(appointments);
  })
);

// Get appointment details
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const appointment = await Appointment.findById(id).populate("case_id");
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  })
);

// Update appointment status
router.put(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, user_id } = req.body;

    if (!status || !user_id) {
      return res.status(400).json({ error: "status and user_id are required" });
    }

    if (!["scheduled", "completed", "cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    const prevStatus = appointment.status;
    appointment.status = status;
    await appointment.save();

    await AuditLog.create({
      entity_type: "appointment",
      entity_id: appointment._id,
      action: "status_updated",
      performed_by: user_id,
      metadata: { from: prevStatus, to: status }
    });

    res.json({ message: "Appointment status updated", appointment });
  })
);

// Cancel appointment
router.post(
  "/:id/cancel",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    appointment.status = "cancelled";
    await appointment.save();

    await AuditLog.create({
      entity_type: "appointment",
      entity_id: appointment._id,
      action: "cancelled",
      performed_by: user_id
    });

    res.json({ message: "Appointment cancelled", appointment });
  })
);

module.exports = router;
