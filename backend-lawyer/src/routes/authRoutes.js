const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

// Check if all functions exist
if (!authController.sendOtp) {
  console.error("❌ sendOtp is undefined!");
}
if (!authController.verifyOtp) {
  console.error("❌ verifyOtp is undefined!");
}
if (!authController.registerLawyer) {
  console.error("❌ registerLawyer is undefined!");
}
if (!authController.loginUser) {
  console.error("❌ loginUser is undefined!");
}

// Routes
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/register", authController.registerLawyer);
router.post("/login", authController.loginUser);

module.exports = router;