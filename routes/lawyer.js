// routes/lawyer.js
const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");

const ConsultationRequest = require("../models/ConsultationRequest");
const LawyerProfile = require("../models/LawyerProfile");
const LawyerResponse = require("../models/LawyerResponse");
const Case = require("../models/Case");
const StateTransition = require("../models/StateTransition");
const LawyerSpecialization = require("../models/LawyerSpecialization");

/**
 * Lawyer: List requests visible to THIS lawyer only
 * Rules:
 * - request must be awaiting_lawyer
 * - lawyer must be the selected lawyer
 */
router.get(
  "/requests/:userId",
  asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const lawyer = await LawyerProfile.findOne({ user_id: userId });
    if (!lawyer) {
      return res.status(404).json({ error: "Lawyer profile not found" });
    }

    const requests = await ConsultationRequest.find({
      status: "awaiting_lawyer",
      selected_lawyer_id: lawyer._id
    }).sort({ createdAt: -1 });

    res.json(requests);
  })
);

/**
 * Lawyer: Accept or Decline a request
 */
router.post(
  "/requests/:id/respond",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_id, response, decline_reason } = req.body;

    if (!user_id || !response) {
      return res
        .status(400)
        .json({ error: "user_id and response are required" });
    }

    if (!["accepted", "declined"].includes(response)) {
      return res
        .status(400)
        .json({ error: "response must be 'accepted' or 'declined'" });
    }

    const lawyer = await LawyerProfile.findOne({ user_id });
    if (!lawyer) {
      return res.status(404).json({ error: "Lawyer profile not found" });
    }

    const request = await ConsultationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // ✅ Request must be in correct state
    if (request.status !== "awaiting_lawyer") {
      return res
        .status(400)
        .json({ error: "Request not open for response" });
    }

    // ✅ Only selected lawyer can respond
    if (request.selected_lawyer_id.toString() !== lawyer._id.toString()) {
      return res
        .status(403)
        .json({ error: "You are not authorized to respond to this request" });
    }

    // ✅ Prevent double response
    const existingResponse = await LawyerResponse.findOne({
      request_id: request._id,
      lawyer_id: lawyer._id
    });

    if (existingResponse) {
      return res
        .status(400)
        .json({ error: "You have already responded to this request" });
    }

    // Record lawyer response
    await LawyerResponse.create({
      request_id: request._id,
      lawyer_id: lawyer._id,
      response,
      decline_reason
    });

    // --------------------
    // DECLINE FLOW
    // --------------------
    if (response === "declined") {
      return res.json({ message: "Request declined successfully" });
    }

    // --------------------
    // ACCEPT FLOW
    // --------------------

    // 1️⃣ Transition request → accepted
    const previousRequestState = request.status;
    request.status = "accepted";
    await request.save();

    await StateTransition.create({
      entity_type: "request",
      entity_id: request._id,
      from_state: previousRequestState,
      to_state: "accepted",
      triggered_by: user_id
    });

    // 2️⃣ Create case (ONLY here)
    const caseDoc = await Case.create({
      request_id: request._id,
      client_id: request.client_id,
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

    res.json({
      message: "Request accepted and case created",
      case_id: caseDoc._id
    });
  })
);

module.exports = router;
