// routes/cases.js
const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const Case = require("../models/Case");
const ConsultationRequest = require("../models/ConsultationRequest");
const StateTransition = require("../models/StateTransition");
const ClientProfile = require("../models/ClientProfile");
const LawyerProfile = require("../models/LawyerProfile");
const { matchLawyersForCase } = require("../services/caseMatchingService");

// Get all cases for a client
router.get(
  "/client/:userId",
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const client = await ClientProfile.findOne({ user_id: userId });
    if (!client) return res.status(404).json({ error: "Client profile not found" });

    const cases = await Case.find({ client_id: client._id })
      .populate("lawyer_id", "experience_years consultation_fee bio")
      .populate({
        path: "lawyer_id",
        populate: { path: "user_id", select: "full_name phone_number" }
      })
      .sort({ opened_at: -1 });

    res.json(cases);
  })
);

// Get all cases for a lawyer
router.get(
  "/lawyer/:userId",
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const lawyer = await LawyerProfile.findOne({ user_id: userId });
    if (!lawyer) return res.status(404).json({ error: "Lawyer profile not found" });

    const cases = await Case.find({ lawyer_id: lawyer._id })
      .populate({
        path: "client_id",
        populate: { path: "user_id", select: "full_name phone_number" }
      })
      .sort({ opened_at: -1 });

    res.json(cases);
  })
);

// Get case details
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const caseDoc = await Case.findById(id)
      .populate({
        path: "lawyer_id",
        populate: { path: "user_id", select: "full_name phone_number email" }
      })
      .populate({
        path: "client_id",
        populate: { path: "user_id", select: "full_name phone_number email" }
      })
      .populate("request_id");

    if (!caseDoc) return res.status(404).json({ error: "Case not found" });
    res.json(caseDoc);
  })
);

// Update case status
router.put(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status, user_id } = req.body;

    if (!status || !user_id) {
      return res.status(400).json({ error: "status and user_id are required" });
    }

    const validStatuses = ["open", "in_progress", "resolved", "closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${validStatuses.join(", ")}` });
    }

    const caseDoc = await Case.findById(id);
    if (!caseDoc) return res.status(404).json({ error: "Case not found" });

    const prevStatus = caseDoc.case_status;
    caseDoc.case_status = status;

    if (status === "closed") {
      caseDoc.closed_at = new Date();
    }

    await caseDoc.save();

    // Log state transition
    await StateTransition.create({
      entity_type: "case",
      entity_id: caseDoc._id,
      from_state: prevStatus,
      to_state: status,
      triggered_by: user_id
    });

    res.json({ message: "Case status updated", case: caseDoc });
  })
);

// Get matching lawyers for a case
router.post(
  "/:requestId/match-lawyers",
  asyncHandler(async (req, res) => {
    const { requestId } = req.params;

    const consultationRequest = await ConsultationRequest.findById(requestId);
    if (!consultationRequest) return res.status(404).json({ error: "Consultation request not found" });

    const clientProfile = await ClientProfile.findById(consultationRequest.client_id);
    if (!clientProfile) return res.status(404).json({ error: "Client profile not found" });

    const matchResult = await matchLawyersForCase(consultationRequest, clientProfile);

    if (!matchResult.success) {
      return res.status(400).json({ error: matchResult.message, lawyers: [] });
    }

    res.json({
      message: matchResult.message,
      lawyers: matchResult.lawyers.map((l) => ({
        _id: l._id,
        name: l.user_id?.full_name,
        phone: l.user_id?.phone_number,
        experience_years: l.experience_years,
        consultation_fee: l.consultation_fee,
        bio: l.bio,
        score: l.score,
        acceptanceRate: l.acceptanceRate
      }))
    });
  })
);

module.exports = router;
