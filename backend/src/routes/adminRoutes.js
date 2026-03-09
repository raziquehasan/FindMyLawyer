const express = require("express");
const router = express.Router();

const {
  getPendingLawyers,
  reviewLawyer,
} = require("../controllers/adminController");

const { protect, isAdmin } = require("../middleware/authMiddleware");

// ==============================
// ADMIN ROUTES
// ==============================

// Get all pending lawyers
router.get(
  "/pending-lawyers",
  protect,
  isAdmin,
  getPendingLawyers
);

// Approve / Reject lawyer
router.put(
  "/review-lawyer",
  protect,
  isAdmin,
  reviewLawyer
);

module.exports = router;
