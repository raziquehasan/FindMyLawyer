// services/caseMatchingService.js
const LawyerProfile = require("../models/LawyerProfile");
const LawyerSpecialization = require("../models/LawyerSpecialization");
const LawyerResponse = require("../models/LawyerResponse");
const LawyerVerification = require("../models/LawyerVerification");
const LawyerAvailability = require("../models/LawyerAvailability");
const LawyerPracticeForum = require("../models/LawyerPracticeForum");

/**
 * Advanced case-lawyer matching algorithm (Phase 1)
 * Sorting order (as per PDF):
 * 1. Verified First (has bar council verification)
 * 2. Availability Today
 * 3. Fee (Low to High)
 * 4. Rating (High to Low)
 */
async function matchLawyersForCase(consultationRequest, clientProfile) {
  try {
    // Step 1: Find lawyers with matching specialization
    const matchingSpecs = await LawyerSpecialization.find({
      specialization: consultationRequest.case_type
    }).select("lawyer_id");

    if (matchingSpecs.length === 0) {
      return { success: false, lawyers: [], message: "No lawyers found with required specialization" };
    }

    const lawyerIds = matchingSpecs.map((spec) => spec.lawyer_id);

    // Step 2: Get lawyer profiles with filters
    const lawyers = await LawyerProfile.find({
      _id: { $in: lawyerIds },
      is_available: true,
      profile_status: "approved"
    }).populate("user_id", "full_name phone_number");

    if (lawyers.length === 0) {
      return { success: false, lawyers: [], message: "No available lawyers found" };
    }

    // Step 3: Enrich lawyers with additional data
    const enrichedLawyers = await Promise.all(
      lawyers.map(async (lawyer) => {
        // Check if verified
        const verification = await LawyerVerification.findOne({
          lawyer_id: lawyer._id,
          verification_status: "approved"
        });

        // Check availability today - map day of week correctly
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const today = days[new Date().getDay()];
        const availability = await LawyerAvailability.findOne({
          lawyer_id: lawyer._id,
          day_of_week: today
        });

        // Get practice forums
        const forums = await LawyerPracticeForum.find({ lawyer_id: lawyer._id }).select("forum");

        // Get specializations
        const specs = await LawyerSpecialization.find({ lawyer_id: lawyer._id }).select("specialization");

        // Check recent acceptance rate
        const recentResponses = await LawyerResponse.find({
          lawyer_id: lawyer._id,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        const acceptedCount = recentResponses.filter((r) => r.response === "accepted").length;
        const responseRate = recentResponses.length > 0 ? acceptedCount / recentResponses.length : 0.5;

        return {
          ...lawyer.toObject(),
          isVerified: !!verification,
          availableToday: !!availability,
          practiceForums: forums.map((f) => f.forum),
          specializations: specs.map((s) => s.specialization),
          acceptanceRate: (responseRate * 100).toFixed(0) + "%"
        };
      })
    );

    // Step 4: Sort by: Verified → Availability → Fee (Low) → Rating (High)
    const sortedLawyers = enrichedLawyers.sort((a, b) => {
      // 1. Verified first
      if (a.isVerified !== b.isVerified) {
        return a.isVerified ? -1 : 1;
      }

      // 2. Available today
      if (a.availableToday !== b.availableToday) {
        return a.availableToday ? -1 : 1;
      }

      // 3. Fee (low to high)
      const feeA = a.consultation_fee || 0;
      const feeB = b.consultation_fee || 0;
      if (feeA !== feeB) {
        return feeA - feeB;
      }

      // 4. Rating (high to low)
      return (b.rating || 0) - (a.rating || 0);
    });

    return {
      success: true,
      lawyers: sortedLawyers.slice(0, 10), // Return top 10
      message: "Lawyers matched and sorted successfully"
    };
  } catch (error) {
    console.error("Error in case matching:", error);
    return { success: false, lawyers: [], message: error.message };
  }
}

/**
 * Get matched lawyers for a case with enhanced filtering
 */
async function getMatchedLawyers(requestId, consultationRequest, clientProfile) {
  const matchResult = await matchLawyersForCase(consultationRequest, clientProfile);
  return matchResult;
}

module.exports = {
  matchLawyersForCase,
  getMatchedLawyers
};
