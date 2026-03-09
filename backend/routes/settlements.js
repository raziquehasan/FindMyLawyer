// routes/settlements.js
const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const Settlement = require("../models/Settlement");
const Payment = require("../models/Payment");
const LawyerProfile = require("../models/LawyerProfile");
const AuditLog = require("../models/AuditLog");

const PLATFORM_FEE_PERCENT = 20; // 20% platform fee

// Create settlement from payment
router.post(
  "/from-payment",
  asyncHandler(async (req, res) => {
    const { payment_id, lawyer_id, user_id } = req.body;

    if (!payment_id || !lawyer_id) {
      return res.status(400).json({ error: "payment_id and lawyer_id are required" });
    }

    const payment = await Payment.findById(payment_id);
    if (!payment) return res.status(404).json({ error: "Payment not found" });

    if (payment.payment_status !== "success") {
      return res.status(400).json({ error: "Can only settle successful payments" });
    }

    const existingSettlement = await Settlement.findOne({ payment_id });
    if (existingSettlement) {
      return res.status(400).json({ error: "Settlement already exists for this payment" });
    }

    const gross_amount = payment.amount;
    const platform_fee = Math.round((gross_amount * PLATFORM_FEE_PERCENT) / 100);
    const net_payout = gross_amount - platform_fee;

    const settlement = await Settlement.create({
      lawyer_id,
      payment_id,
      gross_amount,
      platform_fee,
      net_payout,
      payout_status: "pending"
    });

    await AuditLog.create({
      entity_type: "payment",
      entity_id: payment_id,
      action: "settlement_created",
      performed_by: user_id,
      metadata: { gross: gross_amount, fee: platform_fee, net: net_payout }
    });

    res.status(201).json(settlement);
  })
);

// Get settlements for lawyer
router.get(
  "/lawyer/:lawyerId",
  asyncHandler(async (req, res) => {
    const { lawyerId } = req.params;
    const settlements = await Settlement.find({ lawyer_id: lawyerId })
      .populate("payment_id")
      .sort({ createdAt: -1 });

    const totalGross = settlements.reduce((sum, s) => sum + s.gross_amount, 0);
    const totalFee = settlements.reduce((sum, s) => sum + s.platform_fee, 0);
    const totalNet = settlements.reduce((sum, s) => sum + s.net_payout, 0);
    const pendingPayout = settlements
      .filter((s) => s.payout_status === "pending")
      .reduce((sum, s) => sum + s.net_payout, 0);

    res.json({
      lawyer_id: lawyerId,
      summary: {
        total_gross: totalGross,
        total_platform_fee: totalFee,
        total_net: totalNet,
        pending_payout: pendingPayout,
        processed_count: settlements.filter((s) => s.payout_status === "processed").length
      },
      settlements
    });
  })
);

// Get settlement details
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const settlement = await Settlement.findById(id)
      .populate("lawyer_id", "user_id experience_years")
      .populate("payment_id");

    if (!settlement) return res.status(404).json({ error: "Settlement not found" });
    res.json(settlement);
  })
);

// Process payout (Admin only)
router.put(
  "/:id/process",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_id, payout_method } = req.body;

    const settlement = await Settlement.findById(id);
    if (!settlement) return res.status(404).json({ error: "Settlement not found" });

    if (settlement.payout_status === "processed") {
      return res.status(400).json({ error: "Settlement already processed" });
    }

    settlement.payout_status = "processed";
    settlement.payout_date = new Date();
    settlement.payout_method = payout_method || "bank_transfer";
    await settlement.save();

    await AuditLog.create({
      entity_type: "settlement",
      entity_id: settlement._id,
      action: "payout_processed",
      performed_by: user_id,
      metadata: { amount: settlement.net_payout, method: payout_method }
    });

    res.json({ message: "Settlement processed", settlement });
  })
);

module.exports = router;
