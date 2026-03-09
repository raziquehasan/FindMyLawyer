// routes/auth.js
const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const { sendOtp, verifyOtp } = require("../services/otpService");
const User = require("../models/User");

// Request OTP (login or post-signup verification)
router.post(
  "/otp/request",
  asyncHandler(async (req, res) => {
    const { phone_number } = req.body;
    if (!phone_number) return res.status(400).json({ error: "phone_number is required" });
    sendOtp(phone_number);
    res.json({ message: "OTP sent" });
  })
);

// Verify OTP and return redirect by role
router.post(
  "/otp/verify",
  asyncHandler(async (req, res) => {
    const { phone_number, otp_code } = req.body;
    if (!phone_number || !otp_code) return res.status(400).json({ error: "phone_number and otp_code are required" });

    const valid = verifyOtp(phone_number, otp_code);
    if (!valid) return res.status(400).json({ error: "Invalid or expired OTP" });

    const user = await User.findOne({ phone_number });
    if (!user) return res.status(404).json({ error: "User not found. Complete sign-up first." });

    user.is_verified = true;
    user.last_login_at = new Date();
    await user.save();

    const redirect = user.role === "client" ? "user/home" : "lawyer/onboarding";
    res.json({ user_id: user._id, role: user.role, is_verified: user.is_verified, redirect });
  })
);

module.exports = router;