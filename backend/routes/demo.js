// routes/demo.js
const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const { seedDemoData } = require("../services/demoDataService");
const ConsultationRequest = require("../models/ConsultationRequest");
const LawyerResponse = require("../models/LawyerResponse");
const Case = require("../models/Case");
const Payment = require("../models/Payment");

// Seed demo data
router.post(
  "/seed",
  asyncHandler(async (req, res) => {
    const result = await seedDemoData();
    res.json(result);
  })
);

// Get demo data overview
router.get(
  "/overview",
  asyncHandler(async (req, res) => {
    const totalConsultations = await ConsultationRequest.countDocuments();
    const totalCases = await Case.countDocuments();
    const totalLawyerResponses = await LawyerResponse.countDocuments();
    const totalPayments = await Payment.countDocuments();

    const consultationsByStatus = await ConsultationRequest.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const casesByStatus = await Case.aggregate([{ $group: { _id: "$case_status", count: { $sum: 1 } } }]);

    const lawyerResponsesByType = await LawyerResponse.aggregate([
      { $group: { _id: "$response", count: { $sum: 1 } } }
    ]);

    const paymentsByStatus = await Payment.aggregate([{ $group: { _id: "$payment_status", count: { $sum: 1 } } }]);

    res.json({
      totals: {
        consultations: totalConsultations,
        cases: totalCases,
        lawyerResponses: totalLawyerResponses,
        payments: totalPayments
      },
      consultationsByStatus,
      casesByStatus,
      lawyerResponsesByType,
      paymentsByStatus
    });
  })
);

// Clear all demo data
router.post(
  "/clear",
  asyncHandler(async (req, res) => {
    const phoneRegex = "^999";

    const User = require("../models/User");
    const ClientProfile = require("../models/ClientProfile");
    const LawyerProfile = require("../models/LawyerProfile");
    const LawyerSpecialization = require("../models/LawyerSpecialization");

    const users = await User.find({ phone_number: { $regex: phoneRegex } });
    const userIds = users.map((u) => u._id);

    await ConsultationRequest.deleteMany({ client_id: { $in: userIds } });
    await Case.deleteMany({ client_id: { $in: userIds } });
    await LawyerResponse.deleteMany({ lawyer_id: { $in: userIds } });
    await Payment.deleteMany({ request_id: { $in: userIds } });
    await ClientProfile.deleteMany({ user_id: { $in: userIds } });
    await LawyerProfile.deleteMany({ user_id: { $in: userIds } });
    await LawyerSpecialization.deleteMany({ lawyer_id: { $in: userIds } });
    await User.deleteMany({ phone_number: { $regex: phoneRegex } });

    res.json({ message: "Demo data cleared", deletedUsers: userIds.length });
  })
);

module.exports = router;
