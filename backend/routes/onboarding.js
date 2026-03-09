// routes/onboarding.js
const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");
const ClientProfile = require("../models/ClientProfile");
const LawyerProfile = require("../models/LawyerProfile");
const LegalDocument = require("../models/LegalDocument");
const UserConsent = require("../models/UserConsent");
const { sendOtp } = require("../services/otpService");

// Helper: latest active legal doc by type
async function getActiveDoc(document_type) {
  return LegalDocument.findOne({ document_type, is_active: true }).sort({ createdAt: -1 });
}

// Seed minimal legal documents
router.post(
  "/seed-legal-docs",
  asyncHandler(async (req, res) => {
    const docs = [
      { document_type: "terms_of_service", version: "v1", document_url: "https://example.com/terms", applicable_to: "both", is_active: true },
      { document_type: "privacy_policy", version: "v1", document_url: "https://example.com/privacy", applicable_to: "both", is_active: true },
      { document_type: "lawyer_platform_terms", version: "v1", document_url: "https://example.com/lawyer-terms", applicable_to: "lawyer", is_active: true }
    ];

    for (const d of docs) {
      await LegalDocument.updateOne(
        { document_type: d.document_type, version: d.version },
        { $setOnInsert: d },
        { upsert: true }
      );
    }
    res.json({ message: "Legal documents seeded" });
  })
);

// Client sign-up
router.post(
  "/client/signup",
  asyncHandler(async (req, res) => {
    const { full_name, phone_number, state, city, preferred_language, pincode, accept_terms } = req.body;

    // Required fields
    if (!full_name || !phone_number || !state || !preferred_language || !pincode) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!accept_terms) return res.status(400).json({ error: "Must accept Terms & Privacy" });

    // Invariant: one role per phone
    let user = await User.findOne({ phone_number });
    if (user && user.role !== "client") {
      return res.status(409).json({ error: "Phone already registered as lawyer" });
    }

    if (!user) {
      user = await User.create({
        full_name,
        phone_number,
        role: "client",
        is_verified: false
      });
    }

    // One client profile per user
    const existingProfile = await ClientProfile.findOne({ user_id: user._id });
    if (!existingProfile) {
      await ClientProfile.create({
        user_id: user._id,
        state,
        city,
        preferred_language,
        pincode
      });
    }

    // Consents to active docs
    const tos = await getActiveDoc("terms_of_service");
    const privacy = await getActiveDoc("privacy_policy");
    if (!tos || !privacy) return res.status(500).json({ error: "Legal documents not seeded" });

    const ip = req.ip;
    const ua = req.headers["user-agent"] || "";
    await UserConsent.create({ user_id: user._id, document_id: tos._id, source: "signup", ip_address: ip, user_agent: ua });
    await UserConsent.create({ user_id: user._id, document_id: privacy._id, source: "signup", ip_address: ip, user_agent: ua });

    // Send OTP
    sendOtp(phone_number);

    res.json({ user_id: user._id, role: "client", is_verified: false, redirect: "auth/otp" });
  })
);

// Lawyer sign-up (basic)
router.post(
  "/lawyer/signup-basic",
  asyncHandler(async (req, res) => {
    const { full_name, phone_number, state, city, experience_years, accept_terms } = req.body;

    // Required fields
    if (!full_name || !phone_number || !state || !city || experience_years === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (!accept_terms) return res.status(400).json({ error: "Must accept Lawyer Terms & Privacy" });

    // Invariant: one role per phone
    let user = await User.findOne({ phone_number });
    if (user && user.role !== "lawyer") {
      return res.status(409).json({ error: "Phone already registered as client" });
    }

    if (!user) {
      user = await User.create({
        full_name,
        phone_number,
        role: "lawyer",
        is_verified: false
      });
    }

    // Create or update lawyer profile (pending)
    const existingProfile = await LawyerProfile.findOne({ user_id: user._id });
    if (!existingProfile) {
      await LawyerProfile.create({
        user_id: user._id,
        experience_years,
        profile_status: "pending",
        is_available: true
      });
    } else {
      existingProfile.experience_years = experience_years;
      existingProfile.profile_status = "pending";
      await existingProfile.save();
    }

    // Consents to active docs
    const lawyerTerms = await getActiveDoc("lawyer_platform_terms");
    const privacy = await getActiveDoc("privacy_policy");
    if (!lawyerTerms || !privacy) return res.status(500).json({ error: "Legal documents not seeded" });

    const ip = req.ip;
    const ua = req.headers["user-agent"] || "";
    await UserConsent.create({ user_id: user._id, document_id: lawyerTerms._id, source: "signup", ip_address: ip, user_agent: ua });
    await UserConsent.create({ user_id: user._id, document_id: privacy._id, source: "signup", ip_address: ip, user_agent: ua });

    // Send OTP
    sendOtp(phone_number);

    res.json({ user_id: user._id, role: "lawyer", is_verified: false, redirect: "auth/otp" });
  })
);

module.exports = router;