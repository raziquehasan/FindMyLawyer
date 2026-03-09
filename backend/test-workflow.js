// test-workflow.js
/**
 * Complete Integration Test & Demo Workflow
 * Run this file to test the entire legal platform workflow
 */

require("dotenv").config();
const mongoose = require("mongoose");

// Models
const User = require("./models/User");
const ClientProfile = require("./models/ClientProfile");
const LawyerProfile = require("./models/LawyerProfile");
const LawyerSpecialization = require("./models/LawyerSpecialization");
const ConsultationRequest = require("./models/ConsultationRequest");
const LawyerResponse = require("./models/LawyerResponse");
const Case = require("./models/Case");
const Payment = require("./models/Payment");
const StateTransition = require("./models/StateTransition");
const LegalDocument = require("./models/LegalDocument");
const UserConsent = require("./models/UserConsent");

// Services
const { seedDemoData } = require("./services/demoDataService");
const { matchLawyersForCase } = require("./services/caseMatchingService");

const log = (title, message) => console.log(`\n✓ ${title}: ${message}`);
const error = (title, err) => console.error(`\n✗ ${title}: ${err.message}`);

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/legal-platform");
    log("Database", "Connected successfully");
  } catch (err) {
    error("Database", err);
    process.exit(1);
  }
}

async function testWorkflow() {
  try {
    // Step 1: Seed Demo Data
    log("STEP 1: SEEDING DEMO DATA", "Starting...");
    const seedResult = await seedDemoData();
    if (!seedResult.success) throw new Error(seedResult.message);
    log("STEP 1: SEEDING DEMO DATA", "✓ Completed");

    // Get demo users
    const clients = await User.find({ role: "client", phone_number: { $regex: "^999" } });
    const lawyers = await User.find({ role: "lawyer", phone_number: { $regex: "^999" } });
    console.log(`  - Created ${clients.length} demo clients`);
    console.log(`  - Created ${lawyers.length} demo lawyers`);

    // Step 2: Create Consultation Request
    log("STEP 2: CREATE CONSULTATION REQUEST", "Starting...");
    const client = clients[0];
    const clientProfile = await ClientProfile.findOne({ user_id: client._id });

    const request = await ConsultationRequest.create({
      client_id: clientProfile._id,
      case_type: "Property Dispute",
      issue_description: "I have a property boundary dispute with my neighbor. Need legal advice.",
      budget_range: "medium",
      urgency: "high",
      language: "English",
      share_contact: true,
      status: "submitted"
    });

    await StateTransition.create({
      entity_type: "request",
      entity_id: request._id,
      from_state: null,
      to_state: "submitted",
      triggered_by: client._id
    });

    log("STEP 2: CREATE CONSULTATION REQUEST", `Request ID: ${request._id}`);

    // Step 3: Test Case-Lawyer Matching
    log("STEP 3: CASE-LAWYER MATCHING", "Starting...");
    const matchResult = await matchLawyersForCase(request, clientProfile);
    if (!matchResult.success) throw new Error(matchResult.message);
    console.log(`  - Found ${matchResult.lawyers.length} matching lawyers`);
    console.log(`  - Top 3 matches (sorted by: Verified → Available Today → Fee → Rating):`);
    matchResult.lawyers.slice(0, 3).forEach((lawyer, idx) => {
      const verified = lawyer.isVerified ? "✓ Verified" : "✗ Not Verified";
      const available = lawyer.availableToday ? "✓ Available Today" : "✗ Not Today";
      console.log(
        `    ${idx + 1}. ${lawyer.user_id.full_name} | Exp: ${lawyer.experience_years}yrs | Fee: ₹${lawyer.consultation_fee} | Rating: ${lawyer.rating || "N/A"} | ${verified} | ${available}`
      );
    });
    log("STEP 3: CASE-LAWYER MATCHING", "✓ Completed");

    // Step 4: Select Lawyer and Payment
    log("STEP 4: SELECT LAWYER & PAYMENT", "Starting...");
    const selectedLawyer = matchResult.lawyers[0];

    const reqDoc = await ConsultationRequest.findById(request._id);
    reqDoc.selected_lawyer_id = selectedLawyer._id;
    reqDoc.status = "payment_pending";
    await reqDoc.save();

    await StateTransition.create({
      entity_type: "request",
      entity_id: reqDoc._id,
      from_state: "submitted",
      to_state: "payment_pending",
      triggered_by: client._id
    });

    // Simulate Payment
    const payment = await Payment.create({
      request_id: reqDoc._id,
      amount: selectedLawyer.consultation_fee,
      payment_method: "upi",
      payment_status: "success",
      transaction_id: `TXN-${Date.now()}`,
      payment_date: new Date()
    });

    reqDoc.status = "awaiting_lawyer";
    await reqDoc.save();

    await StateTransition.create({
      entity_type: "request",
      entity_id: reqDoc._id,
      from_state: "payment_pending",
      to_state: "awaiting_lawyer",
      triggered_by: client._id
    });

    console.log(`  - Lawyer Selected: ${selectedLawyer.user_id.full_name}`);
    console.log(`  - Payment: ₹${payment.amount} (${payment.payment_method.toUpperCase()})`);
    console.log(`  - Transaction ID: ${payment.transaction_id}`);
    log("STEP 4: SELECT LAWYER & PAYMENT", "✓ Completed");

    // Step 5: Lawyer Response
    log("STEP 5: LAWYER RESPONSE", "Starting...");
    const lawyerUser = selectedLawyer.user_id;
    const lawyerProfile = await LawyerProfile.findOne({ user_id: lawyerUser._id });

    const response = await LawyerResponse.create({
      request_id: reqDoc._id,
      lawyer_id: lawyerProfile._id,
      response: "accepted",
      responded_at: new Date()
    });

    log("STEP 5: LAWYER RESPONSE", `Lawyer ${lawyerUser.full_name} ACCEPTED the request`);

    // Step 6: Create Case
    log("STEP 6: CREATE CASE", "Starting...");
    const caseDoc = await Case.create({
      request_id: reqDoc._id,
      client_id: clientProfile._id,
      lawyer_id: lawyerProfile._id,
      case_status: "open",
      opened_at: new Date()
    });

    reqDoc.status = "accepted";
    await reqDoc.save();

    await StateTransition.create({
      entity_type: "request",
      entity_id: reqDoc._id,
      from_state: "awaiting_lawyer",
      to_state: "accepted",
      triggered_by: lawyerUser._id
    });

    await StateTransition.create({
      entity_type: "case",
      entity_id: caseDoc._id,
      from_state: null,
      to_state: "open",
      triggered_by: lawyerUser._id
    });

    console.log(`  - Case ID: ${caseDoc._id}`);
    console.log(`  - Client: ${client.full_name} (${clientProfile.state})`);
    console.log(`  - Lawyer: ${lawyerUser.full_name}`);
    console.log(`  - Case Type: ${request.case_type}`);
    console.log(`  - Status: OPEN`);
    log("STEP 6: CREATE CASE", "✓ Completed");

    // Step 7: Case Status Updates
    log("STEP 7: CASE STATUS UPDATE", "Starting...");
    caseDoc.case_status = "in_progress";
    await caseDoc.save();

    await StateTransition.create({
      entity_type: "case",
      entity_id: caseDoc._id,
      from_state: "open",
      to_state: "in_progress",
      triggered_by: lawyerUser._id
    });

    console.log(`  - Case Status Updated: open → in_progress`);
    log("STEP 7: CASE STATUS UPDATE", "✓ Completed");

    // Step 8: Statistics
    log("STEP 8: SYSTEM STATISTICS", "Generating...");
    const stats = {
      totalUsers: await User.countDocuments(),
      totalClients: await ClientProfile.countDocuments(),
      totalLawyers: await LawyerProfile.countDocuments(),
      totalRequests: await ConsultationRequest.countDocuments(),
      totalCases: await Case.countDocuments(),
      totalPayments: await Payment.countDocuments(),
      totalResponses: await LawyerResponse.countDocuments(),
      requestsByStatus: await ConsultationRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      casesByStatus: await Case.aggregate([{ $group: { _id: "$case_status", count: { $sum: 1 } } }])
    };

    console.log(`\n  SYSTEM STATISTICS:`);
    console.log(`  - Total Users: ${stats.totalUsers}`);
    console.log(`  - Total Clients: ${stats.totalClients}`);
    console.log(`  - Total Lawyers: ${stats.totalLawyers}`);
    console.log(`  - Total Consultation Requests: ${stats.totalRequests}`);
    console.log(`  - Total Cases: ${stats.totalCases}`);
    console.log(`  - Total Payments: ${stats.totalPayments}`);
    console.log(`  - Total Lawyer Responses: ${stats.totalResponses}`);
    console.log(`  - Requests by Status:`, stats.requestsByStatus);
    console.log(`  - Cases by Status:`, stats.casesByStatus);
    log("STEP 8: SYSTEM STATISTICS", "✓ Completed");

    console.log("\n" + "=".repeat(70));
    console.log("✓ ALL TESTS PASSED SUCCESSFULLY!");
    console.log("=".repeat(70));

    console.log("\n📋 API ENDPOINTS TO TEST:");
    console.log("  POST   /demo/seed                     - Seed demo data");
    console.log("  GET    /demo/overview                 - Get system overview");
    console.log("  POST   /demo/clear                    - Clear demo data");
    console.log("  GET    /health                        - Health check");
    console.log("  GET    /cases/:id                     - Get case details");
    console.log("  POST   /cases/:requestId/match-lawyers - Match lawyers for case");
    console.log("  PUT    /cases/:id/status              - Update case status");
    console.log("  GET    /requests/:id/suggested-lawyers - Get suggested lawyers");
    console.log("  POST   /requests/:id/select-lawyer    - Select a lawyer");
    console.log("  POST   /payments/request/:id/pay      - Process payment");
    console.log("  POST   /lawyer/requests/:userId/respond - Lawyer response");

  } catch (err) {
    error("WORKFLOW", err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    log("Database", "Disconnected");
  }
}

// Run workflow
connectToDB().then(() => testWorkflow());
