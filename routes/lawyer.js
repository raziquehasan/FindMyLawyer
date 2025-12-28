// routes/lawyer.js
const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const ConsultationRequest = require("../models/ConsultationRequest");
const LawyerProfile = require("../models/LawyerProfile");
const LawyerResponse = require("../models/LawyerResponse");
const Case = require("../models/Case");
const StateTransition = require("../models/StateTransition");

// List awaiting_lawyer requests filtered by lawyer specialization
router.get(
  "/requests/:userId",
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const lawyer = await LawyerProfile.findOne({ user_id: userId });
    if (!lawyer) return res.status(404).json({ error: "Lawyer profile not found" });

    // Find specializations for the lawyer
    const specs = await require("../models/LawyerSpecialization").find({ lawyer_id: lawyer._id });
    const specSet = specs.map((s) => s.specialization);

    const requests = await ConsultationRequest.find({
      status: "awaiting_lawyer",
      case_type: { $in: specSet }
    }).sort({ createdAt: -1 });

    res.json(requests);
  })
);

// Respond to a request (accept/decline)
router.post(
  "/requests/:id/respond",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_id, response, decline_reason } = req.body;

    if (!user_id || !response) {
      return res.status(400).json({ error: "user_id and response are required" });
    }
    if (!["accepted", "declined"].includes(response)) {
      return res.status(400).json({ error: "response must be 'accepted' or 'declined'" });
    }

    const lawyer = await LawyerProfile.findOne({ user_id });
    if (!lawyer) return res.status(404).json({ error: "Lawyer profile not found" });

    const reqDoc = await ConsultationRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ error: "Request not found" });
    if (reqDoc.status !== "awaiting_lawyer") return res.status(400).json({ error: "Not open for response" });

    await LawyerResponse.create({
      request_id: reqDoc._id,
      lawyer_id: lawyer._id,
      response,
      decline_reason
    });

    if (response === "declined") {
      return res.json({ message: "Declined" });
    }

    // Accept: create case, transition request
    const prev = reqDoc.status;
    reqDoc.status = "accepted";
    await reqDoc.save();

    await StateTransition.create({
      entity_type: "request",
      entity_id: reqDoc._id,
      from_state: prev,
      to_state: "accepted",
      triggered_by: user_id
    });

    const caseDoc = await Case.create({
      request_id: reqDoc._id,
      client_id: reqDoc.client_id,
      lawyer_id: lawyer._id,
      case_status: "open",
      opened_at: new Date()
    });

    await StateTransition.create({
      entity_type: "case",
      entity_id: caseDoc._id,
      from_state: null,
      to_state: "open",
      triggered_by: user_id
    });

    res.json({ message: "Accepted, case created", case_id: caseDoc._id });
  })
);

module.exports = router;