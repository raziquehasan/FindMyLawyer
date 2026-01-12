// services/demoDataService.js
const User = require("../models/User");
const ClientProfile = require("../models/ClientProfile");
const LawyerProfile = require("../models/LawyerProfile");
const LawyerSpecialization = require("../models/LawyerSpecialization");
const LawyerPracticeForum = require("../models/LawyerPracticeForum");
const LawyerAvailability = require("../models/LawyerAvailability");
const LegalDocument = require("../models/LegalDocument");
const UserConsent = require("../models/UserConsent");

/**
 * Create comprehensive demo dataset matching PDF requirements
 */
async function seedDemoData() {
  try {
    console.log("[DEMO] Starting demo data seeding...");

    // 1. Seed Legal Documents
    const legalDocs = [
      {
        document_type: "terms_of_service",
        version: "v1",
        document_url: "https://example.com/terms",
        applicable_to: "both",
        is_active: true
      },
      {
        document_type: "privacy_policy",
        version: "v1",
        document_url: "https://example.com/privacy",
        applicable_to: "both",
        is_active: true
      },
      {
        document_type: "consultation_consent",
        version: "v1",
        document_url: "https://example.com/consent",
        applicable_to: "both",
        is_active: true
      },
      {
        document_type: "lawyer_platform_terms",
        version: "v1",
        document_url: "https://example.com/lawyer-terms",
        applicable_to: "lawyer",
        is_active: true
      }
    ];

    for (const doc of legalDocs) {
      await LegalDocument.updateOne({ document_type: doc.document_type, version: doc.version }, { $setOnInsert: doc }, { upsert: true });
    }
    console.log("[DEMO] Legal documents seeded");

    // 2. Create Demo Clients
    const clients = [
      {
        full_name: "Raj Kumar",
        phone_number: "9991001001",
        role: "client",
        is_verified: true
      },
      {
        full_name: "Priya Sharma",
        phone_number: "9991001002",
        role: "client",
        is_verified: true
      },
      {
        full_name: "Amit Patel",
        phone_number: "9991001003",
        role: "client",
        is_verified: true
      }
    ];

    const createdClients = [];
    for (const clientData of clients) {
      let user = await User.findOne({ phone_number: clientData.phone_number });
      if (!user) {
        user = await User.create(clientData);
      }
      createdClients.push(user);

      // Create client profile
      let profile = await ClientProfile.findOne({ user_id: user._id });
      if (!profile) {
        profile = await ClientProfile.create({
          user_id: user._id,
          state: "Maharashtra",
          city: "Mumbai",
          pincode: "400001",
          preferred_language: "English"
        });
      }
    }
    console.log("[DEMO] Demo clients created:", createdClients.map((c) => c.phone_number));

    // 3. Create Demo Lawyers with specializations, forums, and availability
    const lawyers = [
      {
        full_name: "Advocate Sharma",
        phone_number: "9992001001",
        experience_years: 8,
        consultation_fee: 2000,
        bio: "Expert in property disputes with 8 years of experience",
        specializations: ["Property Dispute"],
        forums: ["district_court", "high_court"],
        rating: 4.5
      },
      {
        full_name: "Advocate Desai",
        phone_number: "9992001002",
        experience_years: 5,
        consultation_fee: 1500,
        bio: "Family law specialist with 5 years of experience",
        specializations: ["Family & Divorce"],
        forums: ["family_court", "district_court"],
        rating: 4.2
      },
      {
        full_name: "Advocate Singh",
        phone_number: "9992001003",
        experience_years: 12,
        consultation_fee: 3000,
        bio: "Senior advocate, expert in both property and family law",
        specializations: ["Property Dispute", "Family & Divorce"],
        forums: ["high_court", "supreme_court"],
        rating: 4.8
      },
      {
        full_name: "Advocate Verma",
        phone_number: "9992001004",
        experience_years: 3,
        consultation_fee: 1000,
        bio: "Junior advocate specializing in property law",
        specializations: ["Property Dispute"],
        forums: ["district_court", "consumer_forum"],
        rating: 3.9
      },
      {
        full_name: "Advocate Gupta",
        phone_number: "9992001005",
        experience_years: 6,
        consultation_fee: 1800,
        bio: "Experienced family law advocate",
        specializations: ["Family & Divorce"],
        forums: ["family_court", "high_court"],
        rating: 4.3
      }
    ];

    const createdLawyers = [];
    const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday"];

    for (const lawyerData of lawyers) {
      let user = await User.findOne({ phone_number: lawyerData.phone_number });
      if (!user) {
        user = await User.create({
          full_name: lawyerData.full_name,
          phone_number: lawyerData.phone_number,
          role: "lawyer",
          is_verified: true
        });
      }

      let profile = await LawyerProfile.findOne({ user_id: user._id });
      if (!profile) {
        profile = await LawyerProfile.create({
          user_id: user._id,
          experience_years: lawyerData.experience_years,
          consultation_fee: lawyerData.consultation_fee,
          bio: lawyerData.bio,
          rating: lawyerData.rating,
          lawyer_category: "advocate",
          profile_status: "approved",
          is_available: true
        });
      }
      createdLawyers.push({ user, profile });

      // Add specializations
      for (const spec of lawyerData.specializations) {
        const existing = await LawyerSpecialization.findOne({
          lawyer_id: profile._id,
          specialization: spec
        });
        if (!existing) {
          await LawyerSpecialization.create({
            lawyer_id: profile._id,
            specialization: spec
          });
        }
      }

      // Add practice forums
      for (const forum of lawyerData.forums) {
        const existing = await LawyerPracticeForum.findOne({
          lawyer_id: profile._id,
          forum
        });
        if (!existing) {
          await LawyerPracticeForum.create({
            lawyer_id: profile._id,
            forum
          });
        }
      }

      // Add availability (Monday-Friday, 10 AM - 6 PM)
      for (const day of daysOfWeek) {
        const existing = await LawyerAvailability.findOne({
          lawyer_id: profile._id,
          day_of_week: day
        });
        if (!existing) {
          await LawyerAvailability.create({
            lawyer_id: profile._id,
            day_of_week: day,
            start_time: "10:00",
            end_time: "18:00"
          });
        }
      }
    }
    console.log("[DEMO] Demo lawyers created:", createdLawyers.map((l) => l.user.phone_number));

    // 4. Create consents for all demo users
    const allDocs = await LegalDocument.find({ is_active: true });
    for (const user of [...createdClients, ...createdLawyers.map((l) => l.user)]) {
      for (const doc of allDocs) {
        const existing = await UserConsent.findOne({ user_id: user._id, document_id: doc._id });
        if (!existing) {
          await UserConsent.create({
            user_id: user._id,
            document_id: doc._id,
            source: "signup",
            ip_address: "192.168.1.1",
            user_agent: "Demo"
          });
        }
      }
    }
    console.log("[DEMO] User consents created");

    return {
      success: true,
      message: "Demo data seeded successfully",
      clients: createdClients.map((c) => ({ _id: c._id, name: c.full_name, phone: c.phone_number })),
      lawyers: createdLawyers.map((l) => ({ _id: l.user._id, name: l.user.full_name, phone: l.user.phone_number }))
    };
  } catch (error) {
    console.error("[DEMO] Error seeding data:", error);
    return { success: false, message: error.message };
  }
}

module.exports = { seedDemoData };
