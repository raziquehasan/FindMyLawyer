// routes/requests.js
const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const ConsultationRequest = require("../models/ConsultationRequest");
const ClientProfile = require("../models/ClientProfile");
const LawyerProfile = require("../models/LawyerProfile");
const LawyerResponse = require("../models/LawyerResponse");
const StateTransition = require("../models/StateTransition");

// Create a new consultation request (User / New Request)
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      user_id, // frontend passes the authenticated user's id
      case_type,
      issue_description,
      budget_range,
      urgency,
      language,
      share_contact
    } = req.body;

    if (!user_id || !case_type || !issue_description) {
      return res.status(400).json({ error: "user_id, case_type, and issue_description are required" });
    }

    const client = await ClientProfile.findOne({ user_id });
    if (!client) return res.status(404).json({ error: "Client profile not found" });

    const request = await ConsultationRequest.create({
      client_id: client._id,
      case_type,
      issue_description,
      budget_range,
      urgency,
      language,
      share_contact,
      status: "submitted"
    });

    await StateTransition.create({
      entity_type: "request",
      entity_id: request._id,
      from_state: null,
      to_state: "submitted",
      triggered_by: user_id
    });

    res.status(201).json(request);
  })
);

// List consultation requests for a client (User / Requests)
router.get(
  "/client/:userId",
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const client = await ClientProfile.findOne({ user_id: userId });
    if (!client) return res.status(404).json({ error: "Client profile not found" });

    const requests = await ConsultationRequest.find({ client_id: client._id })
      .select("-issue_description") // list card friendly
      .sort({ createdAt: -1 });
    res.json(requests);
  })
);

// Suggested lawyers for a given case type (User / Suggested Lawyers)
router.get(
  "/:id/suggested-lawyers",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const reqDoc = await ConsultationRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ error: "Request not found" });

    // Basic matching: specialization contains case_type and is available
    const lawyers = await LawyerProfile.aggregate([
      { $match: { is_available: true, profile_status: "approved" } },
      {
        $lookup: {
          from: "lawyerspecializations",
          localField: "_id",
          foreignField: "lawyer_id",
          as: "specs"
        }
      },
      {
        $match: {
          "specs.specialization": reqDoc.case_type
        }
      },
      {
        $project: {
          _id: 1,
          user_id: 1,
          experience_years: 1,
          consultation_fee: 1,
          bio: 1,
          rating: 1,
          specs: 1
        }
      }
    ]);

    res.json(lawyers);
  })
);

// Save selected lawyer (User selects lawyer before payment)
router.post(
  "/:id/select-lawyer",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { lawyer_id, user_id } = req.body;
    if (!lawyer_id || !user_id) return res.status(400).json({ error: "lawyer_id and user_id are required" });

    const reqDoc = await ConsultationRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ error: "Request not found" });
    if (["accepted", "expired", "cancelled"].includes(reqDoc.status)) {
      return res.status(400).json({ error: "Request not selectable in current state" });
    }

    const prev = reqDoc.status;
    reqDoc.selected_lawyer_id = lawyer_id;
    reqDoc.status = "payment_pending";
    await reqDoc.save();

    await StateTransition.create({
      entity_type: "request",
      entity_id: reqDoc._id,
      from_state: prev,
      to_state: "payment_pending",
      triggered_by: user_id
    });

    res.json({ message: "Lawyer selected, proceed to payment", request_id: reqDoc._id });
  })
);

module.exports = router;