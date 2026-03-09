const express = require("express");
const router = express.Router();

const authRoutes = require("./authRoutes");
const adminRoutes = require("./adminRoutes");
const lawyerRoutes = require("./lawyerRoutes");

// Mount routes
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/lawyer", lawyerRoutes);

module.exports = router;
