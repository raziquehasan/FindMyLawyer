const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  saveProfile,
  savePhoto,
  acceptTerms,
  completeOnboarding,
  getLawyerProfile,
  getOnboardingStatus,
} = require("../controllers/lawyerController");

const { protect } = require("../middleware/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });

/* ================================
   ONBOARDING
================================ */

router.post("/profile", protect, saveProfile);
router.post("/photo", protect, upload.single("photo"), savePhoto);
router.post("/terms", protect, acceptTerms);
router.post("/complete", protect, completeOnboarding);

/* ================================
   DASHBOARD
================================ */

router.get("/profile", protect, getLawyerProfile);
router.get("/onboarding-status", protect, getOnboardingStatus);

module.exports = router;
