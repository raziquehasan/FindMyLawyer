// routes/reviews.js
const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const Review = require("../models/Review");
const Appointment = require("../models/Appointment");
const Case = require("../models/Case");
const LawyerProfile = require("../models/LawyerProfile");
const AuditLog = require("../models/AuditLog");

// Create review for appointment
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { appointment_id, case_id, client_id, lawyer_id, rating, review_text, user_id, is_anonymous } = req.body;

    if (!appointment_id || !rating) {
      return res.status(400).json({ error: "appointment_id and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const appointment = await Appointment.findById(appointment_id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });

    if (appointment.status !== "completed") {
      return res.status(400).json({ error: "Can only review completed appointments" });
    }

    const review = await Review.create({
      appointment_id,
      case_id,
      client_id,
      lawyer_id,
      rating,
      review_text,
      is_anonymous
    });

    // Update lawyer's rating
    const reviews = await Review.find({ lawyer_id });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await LawyerProfile.findByIdAndUpdate(lawyer_id, {
      rating: avgRating.toFixed(1),
      total_reviews: reviews.length
    });

    await AuditLog.create({
      entity_type: "appointment",
      entity_id: appointment_id,
      action: "review_submitted",
      performed_by: user_id,
      metadata: { rating, is_anonymous }
    });

    res.status(201).json(review);
  })
);

// Get reviews for lawyer
router.get(
  "/lawyer/:lawyerId",
  asyncHandler(async (req, res) => {
    const { lawyerId } = req.params;
    const reviews = await Review.find({ lawyer_id: lawyerId })
      .populate("case_id", "case_type")
      .sort({ createdAt: -1 });

    const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

    res.json({
      lawyer_id: lawyerId,
      total_reviews: reviews.length,
      average_rating: avgRating,
      reviews
    });
  })
);

// Get reviews for case
router.get(
  "/case/:caseId",
  asyncHandler(async (req, res) => {
    const { caseId } = req.params;
    const reviews = await Review.find({ case_id: caseId }).populate("lawyer_id", "user_id");
    res.json(reviews);
  })
);

// Get review details
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const review = await Review.findById(id)
      .populate("appointment_id")
      .populate("lawyer_id", "user_id")
      .populate("case_id");

    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  })
);

module.exports = router;
