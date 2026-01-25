// routes/cases.js
const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");

const Case = require("../models/Case");
const StateTransition = require("../models/StateTransition");
const ClientProfile = require("../models/ClientProfile");
const LawyerProfile = require("../models/LawyerProfile");

// -----------------------------
// Case State Machine
// -----------------------------
const allowedTransitions = {
  open: ["in_progress"],
  in_progress: ["resolved"],
  resolved: ["closed"],
  closed: []
};

// -----------------------------
// Get all cases for a client
// -----------------------------
router.get(
  "/client/:userId",
  asyncHandler(async (req, res) => {
    const client = await ClientProfile.findOne({ user_id: req.params.userId });
    if (!client) {
      return res.status(404).json({ error: "Client profile not found" });
    }

    const cases = await Case.find({ client_id: client._id })
      .populate({
        path: "lawyer_id",
        populate: { path: "user_id", select: "full_name phone_number" }
      })
      .sort({ opened_at: -1 });

    res.json(cases);
  })
);

// -----------------------------
// Get all cases for a lawyer
// -----------------------------
router.get(
  "/lawyer/:userId",
  asyncHandler(async (req, res) => {
    const lawyer = await LawyerProfile.findOne({ user_id: req.params.userId });
    if (!lawyer) {
      return res.status(404).json({ error: "Lawyer profile not found" });
    }

    const cases = await Case.find({ lawyer_id: lawyer._id })
      .populate({
        path: "client_id",
        populate: { path: "user_id", select: "full_name phone_number" }
      })
      .sort({ opened_at: -1 });

    res.json(cases);
  })
);

// -----------------------------
// Get case details
// -----------------------------
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const caseDoc = await Case.findById(req.params.id)
      .populate({
        path: "lawyer_id",
        populate: { path: "user_id", select: "full_name phone_number email" }
      })
      .populate({
        path: "client_id",
        populate: { path: "user_id", select: "full_name phone_number email" }
      });

    if (!caseDoc) {
      return res.status(404).json({ error: "Case not found" });
    }

    res.json(caseDoc);
  })
);

// -----------------------------
// Update case status (LAWYER ONLY)
// -----------------------------
router.put(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { status, user_id } = req.body;

    if (!status || !user_id) {
      return res
        .status(400)
        .json({ error: "status and user_id are required" });
    }

    const lawyer = await LawyerProfile.findOne({ user_id });
    if (!lawyer) {
      return res.status(403).json({ error: "Only lawyers can update cases" });
    }

    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Ownership check
    if (caseDoc.lawyer_id.toString() !== lawyer._id.toString()) {
      return res.status(403).json({ error: "Not authorized for this case" });
    }

    const current = caseDoc.case_status;

    // Block illegal transitions
    if (!allowedTransitions[current]?.includes(status)) {
      return res.status(400).json({
        error: `Invalid case transition: ${current} → ${status}`
      });
    }

    caseDoc.case_status = status;
    if (status === "closed") {
      caseDoc.closed_at = new Date();
    }

    await caseDoc.save();

    await StateTransition.create({
      entity_type: "case",
      entity_id: caseDoc._id,
      from_state: current,
      to_state: status,
      triggered_by: user_id
    });

    res.json({
      message: "Case status updated successfully",
      case: caseDoc
    });
  })
);

module.exports = router;
