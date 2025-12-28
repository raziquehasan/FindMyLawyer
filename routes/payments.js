// routes/payments.js
const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const Payment = require("../models/Payment");
const ConsultationRequest = require("../models/ConsultationRequest");
const StateTransition = require("../models/StateTransition");

// Simulate payment success (User / Payment screen)
router.post(
  "/request/:id/pay",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, payment_method, user_id } = req.body;

    if (!amount || !payment_method) {
      return res.status(400).json({ error: "amount and payment_method are required" });
    }

    const reqDoc = await ConsultationRequest.findById(id);
    if (!reqDoc) return res.status(404).json({ error: "Request not found" });
    if (reqDoc.status !== "payment_pending") {
      return res.status(400).json({ error: "Request is not in payment_pending state" });
    }

    const payment = await Payment.create({
      request_id: reqDoc._id,
      amount,
      payment_method,
      payment_status: "success",
      transaction_id: `TXN-${Date.now()}`,
      payment_date: new Date()
    });

    const prev = reqDoc.status;
    reqDoc.status = "awaiting_lawyer";
    await reqDoc.save();

    await StateTransition.create({
      entity_type: "request",
      entity_id: reqDoc._id,
      from_state: prev,
      to_state: "awaiting_lawyer",
      triggered_by: user_id
    });

    await StateTransition.create({
      entity_type: "payment",
      entity_id: payment._id,
      from_state: "pending",
      to_state: "success",
      triggered_by: user_id
    });

    res.json({ message: "Payment success; request visible to lawyers", request_id: reqDoc._id });
  })
);

module.exports = router;