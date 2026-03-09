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

    if (!amount || !payment_method || !user_id) {
      return res
        .status(400)
        .json({ error: "amount, payment_method, and user_id are required" });
    }

    const request = await ConsultationRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    // ✅ Request must be payable
    if (request.status !== "submitted") {
      return res
        .status(400)
        .json({ error: "Request is not payable in current state" });
    }

    // ✅ Lawyer must be selected before payment
    if (!request.selected_lawyer_id) {
      return res
        .status(400)
        .json({ error: "No lawyer selected for this request" });
    }

    // ✅ Prevent double payment
    const existingPayment = await Payment.findOne({
      request_id: request._id,
      payment_status: "success"
    });

    if (existingPayment) {
      return res
        .status(400)
        .json({ error: "Payment already completed for this request" });
    }

    // 1️⃣ Create payment in pending state
    const payment = await Payment.create({
      request_id: request._id,
      amount,
      payment_method,
      payment_status: "pending",
      transaction_id: `TXN-${Date.now()}`,
      payment_date: new Date()
    });

    // 2️⃣ Simulate payment gateway success
    const previousPaymentState = payment.payment_status;
    payment.payment_status = "success";
    await payment.save();

    await StateTransition.create({
      entity_type: "payment",
      entity_id: payment._id,
      from_state: previousPaymentState,
      to_state: "success",
      triggered_by: user_id
    });

    // 3️⃣ Move request → awaiting_lawyer
    const previousRequestState = request.status;
    request.status = "awaiting_lawyer";
    await request.save();

    await StateTransition.create({
      entity_type: "request",
      entity_id: request._id,
      from_state: previousRequestState,
      to_state: "awaiting_lawyer",
      triggered_by: user_id
    });

    res.json({
      message: "Payment successful. Request is now visible to the selected lawyer.",
      request_id: request._id,
      payment_id: payment._id
    });
  })
);

module.exports = router;
