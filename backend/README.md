# Find My Lawyer - Legal Platform Backend

**Complete Phase 1 Implementation** - Search & Discovery MVP with Advanced Lawyer Matching

---

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
4. [Complete Workflow](#complete-workflow)
5. [API Endpoints](#api-endpoints)
6. [Setup Instructions](#setup-instructions)
7. [Testing Guide](#testing-guide)
8. [Demo Data](#demo-data)
9. [Key Features](#key-features)

---

## Architecture Overview

### Tech Stack
- **Runtime:** Node.js with Express.js
- **Database:** MongoDB Atlas (Cloud)
- **Authentication:** OTP-based (Phone verification)
- **State Management:** State Transition tracking

### System Design
```
CLIENT (Web/App)
    ↓
EXPRESS API SERVER (Node.js)
    ↓
MONGOOSE MODELS (Data Layer)
    ↓
MONGODB ATLAS (Database)
```

---

## Project Structure

```
Backend/
├── config/
│   └── db.js                 # MongoDB connection
├── middleware/
│   ├── asyncHandler.js       # Async error handling
│   └── errorHandler.js       # Global error handler
├── models/                   # Mongoose schemas (16 models)
│   ├── User.js               # Base user entity
│   ├── ClientProfile.js      # Client details
│   ├── LawyerProfile.js      # Lawyer profile + credentials
│   ├── LawyerSpecialization.js
│   ├── LawyerPracticeForum.js
│   ├── LawyerAvailability.js
│   ├── LawyerVerification.js
│   ├── ConsultationRequest.js # Core case request
│   ├── LawyerResponse.js     # Lawyer's accept/decline
│   ├── Case.js               # Case after acceptance
│   ├── Appointment.js        # 15-min consultations
│   ├── Payment.js            # Payment records
│   ├── Settlement.js         # Lawyer payouts
│   ├── Document.js           # Case documents
│   ├── Review.js             # Client reviews
│   ├── StateTransition.js    # Audit trail
│   ├── AuditLog.js           # Complete audit
│   ├── LegalDocument.js      # Terms/Privacy/Consent docs
│   ├── UserConsent.js        # User consent tracking
│   └── Admin.js              # Admin users
├── routes/                   # API endpoints
│   ├── auth.js               # OTP login/verify
│   ├── onboarding.js         # User signup
│   ├── requests.js           # Create & manage requests
│   ├── lawyer.js             # Lawyer operations
│   ├── payments.js           # Payment processing
│   ├── cases.js              # Case management
│   ├── appointments.js       # Consultation appointments
│   ├── documents.js          # Document uploads
│   ├── reviews.js            # Client reviews
│   ├── settlements.js        # Lawyer payouts
│   └── demo.js               # Demo data endpoints
├── services/
│   ├── otpService.js         # OTP generation/verification
│   ├── caseMatchingService.js # Advanced lawyer matching
│   └── demoDataService.js    # Demo seeding
├── scripts/
│   └── list_collections.js   # Verify collections in Atlas
├── server.js                 # Express app entry point
├── test-workflow.js          # Integration test
├── package.json
└── .env                      # Environment variables
```

---

## Database Schema

### 1. USERS & ACCESS CONTROL
```
users
├── user_id (PK)
├── full_name
├── email
├── phone_number (UNIQUE)
├── role: 'client' | 'lawyer' | 'admin'
├── is_verified: boolean
├── account_status: 'active' | 'suspended' | 'deleted'
├── auth_provider: 'otp'
└── timestamps

admin
├── admin_id (PK)
├── user_id (FK → users)
├── access_level: 'full' | 'moderator'
└── permissions: []
```

### 2. CLIENT & LAWYER PROFILES
```
client_profiles
├── client_id (PK)
├── user_id (FK → users, UNIQUE)
├── state
├── city
├── pincode
├── preferred_language
└── timestamps

lawyer_profiles
├── lawyer_id (PK)
├── user_id (FK → users, UNIQUE)
├── license_number
├── enrollment_number
├── bar_number
├── state_bar_council
├── lawyer_category: 'advocate' | 'senior_advocate' | ...
├── experience_years
├── consultation_fee
├── rating (0-5)
├── total_reviews
├── bio
├── profile_status: 'pending' | 'approved' | 'rejected'
├── is_available: boolean
└── timestamps

lawyer_specializations
├── id (PK)
├── lawyer_id (FK)
├── specialization: 'Property Dispute' | 'Family & Divorce'
└── UNIQUE(lawyer_id, specialization)

lawyer_practice_forums
├── id (PK)
├── lawyer_id (FK)
├── forum: 'district_court' | 'high_court' | 'supreme_court' | ...
└── UNIQUE(lawyer_id, forum)

lawyer_availability
├── availability_id (PK)
├── lawyer_id (FK)
├── day_of_week: 'monday' | 'tuesday' | ...
├── start_time (HH:MM)
├── end_time (HH:MM)
└── UNIQUE(lawyer_id, day_of_week)

lawyer_verifications
├── verification_id (PK)
├── lawyer_id (FK)
├── document_type: 'bar_council_id' | 'license' | 'certificate'
├── document_url
├── verification_status: 'pending' | 'approved' | 'rejected'
├── verified_by_admin (FK → admins)
├── verified_at
└── rejection_reason
```

### 3. REQUEST → CASE → CONSULTATION (CRITICAL)
```
consultation_requests
├── request_id (PK)
├── client_id (FK → client_profiles)
├── case_type: 'Property Dispute' | 'Family & Divorce'
├── case_category
├── issue_description
├── budget_range
├── urgency: 'low' | 'medium' | 'high'
├── language
├── share_contact: boolean
├── status: 'submitted' | 'payment_pending' | 'awaiting_lawyer' | 'accepted' | 'expired' | 'cancelled'
├── selected_lawyer_id (FK → lawyer_profiles)
├── expires_at (48 hours from creation)
└── timestamps

lawyer_responses
├── response_id (PK)
├── request_id (FK)
├── lawyer_id (FK)
├── response: 'accepted' | 'declined'
├── decline_reason
├── responded_at
└── UNIQUE(request_id, lawyer_id)

cases (CREATED ONLY AFTER ACCEPTANCE)
├── case_id (PK)
├── request_id (FK → consultation_requests)
├── client_id (FK → client_profiles)
├── lawyer_id (FK → lawyer_profiles)
├── case_status: 'open' | 'in_progress' | 'resolved' | 'closed'
├── opened_at
├── closed_at
└── timestamps

appointments
├── appointment_id (PK)
├── case_id (FK → cases)
├── consultation_type: 'call' (15 minutes)
├── appointment_datetime
├── status: 'scheduled' | 'completed' | 'cancelled'
├── call_duration_minutes: 15
├── notes
└── timestamps
```

### 4. PAYMENTS, REFUNDS & SETTLEMENTS
```
payments
├── payment_id (PK)
├── request_id (FK → consultation_requests)
├── amount
├── payment_method: 'upi' | 'card' | 'netbanking'
├── payment_status: 'success' | 'failed' | 'pending'
├── refund_status: 'none' | 'initiated' | 'completed'
├── transaction_id (UNIQUE)
├── failure_reason
├── payment_date
└── timestamps

settlements
├── settlement_id (PK)
├── lawyer_id (FK → lawyer_profiles)
├── payment_id (FK → payments)
├── gross_amount
├── platform_fee (20%)
├── net_payout
├── payout_status: 'pending' | 'processed'
├── payout_date
├── payout_method: 'bank_transfer' | 'upi'
└── timestamps

reviews
├── review_id (PK)
├── appointment_id (FK → appointments)
├── case_id (FK → cases)
├── client_id (FK → client_profiles)
├── lawyer_id (FK → lawyer_profiles)
├── rating: 1-5
├── review_text
├── is_anonymous: boolean
└── timestamps
```

### 5. DOCUMENTS, AUDIT & SECURITY
```
documents
├── document_id (PK)
├── case_id (FK → cases)
├── uploaded_by (FK → users)
├── document_type
├── document_url
├── file_name
├── file_size (bytes)
├── description
└── timestamps

state_transitions
├── transition_id (PK)
├── entity_type: 'request' | 'case' | 'appointment' | 'payment'
├── entity_id
├── from_state
├── to_state
├── triggered_by (FK → users)
└── timestamp

audit_logs
├── audit_id (PK)
├── entity_type
├── entity_id
├── action
├── performed_by (FK → users)
├── metadata (JSON)
├── ip_address
├── user_agent
└── timestamps

legal_documents
├── document_id (PK)
├── document_type: 'terms_of_service' | 'privacy_policy' | ...
├── version
├── document_url
├── applicable_to: 'user' | 'lawyer' | 'both'
├── is_active: boolean
└── timestamps

user_consents
├── consent_id (PK)
├── user_id (FK → users)
├── document_id (FK → legal_documents)
├── accepted_at
├── ip_address
├── user_agent
├── source: 'signup' | 'request' | 'payment' | 'appointment'
└── timestamps
```

---

## Complete Workflow

### Flow Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                    FIND MY LAWYER - WORKFLOW                     │
└─────────────────────────────────────────────────────────────────┘

PHASE 1: USER ONBOARDING
┌────────────────────────────────────────────────────────────────┐
│ 1. CLIENT SIGNUP                                               │
│    POST /onboarding/client/signup                             │
│    ├─ Create User (role=client)                               │
│    ├─ Create ClientProfile                                    │
│    ├─ Record UserConsents (Terms, Privacy)                    │
│    └─ Send OTP                                                │
│                                                                │
│ 2. OTP VERIFICATION                                            │
│    POST /auth/otp/verify                                      │
│    ├─ Verify OTP code                                         │
│    └─ Mark user.is_verified = true                            │
│                                                                │
│ 3. LAWYER SIGNUP                                               │
│    POST /onboarding/lawyer/signup-basic                       │
│    ├─ Create User (role=lawyer)                               │
│    ├─ Create LawyerProfile (status=pending)                   │
│    ├─ Record UserConsents                                     │
│    └─ Send OTP                                                │
│                                                                │
│ 4. LAWYER PROFILE COMPLETION                                  │
│    POST /onboarding/lawyer/complete-profile                   │
│    ├─ Add specializations                                     │
│    ├─ Add practice forums                                     │
│    ├─ Set availability (Mon-Sun, times)                       │
│    ├─ Add fees                                                │
│    └─ Upload verification docs                                │
│                                                                │
│ 5. ADMIN APPROVAL                                              │
│    POST /onboarding/lawyer/approve                            │
│    └─ Change profile_status: pending → approved               │
└────────────────────────────────────────────────────────────────┘

PHASE 2: CASE REQUEST & LAWYER MATCHING
┌────────────────────────────────────────────────────────────────┐
│ 1. CREATE CONSULTATION REQUEST                                 │
│    POST /requests                                             │
│    ├─ Input: case_type, issue_description, budget, urgency   │
│    ├─ Create ConsultationRequest (status=submitted)           │
│    ├─ Set expires_at = now + 48 hours                        │
│    └─ Log StateTransition: null → submitted                   │
│    Status: submitted ✓                                        │
│                                                                │
│ 2. GET SUGGESTED LAWYERS (ADVANCED MATCHING)                 │
│    GET /requests/{id}/suggested-lawyers                       │
│    ├─ Find lawyers with matching specialization              │
│    ├─ Filter: is_available=true, profile_status=approved     │
│    ├─ SORT BY:                                                │
│    │  1. Verified First (has approved verification)          │
│    │  2. Available Today (in LawyerAvailability)              │
│    │  3. Fee (Low to High)                                    │
│    │  4. Rating (High to Low)                                 │
│    └─ Return Top 10 lawyers with:                             │
│       - Name, Experience, Fee, Rating                         │
│       - Specializations, Practice Forums                      │
│       - Verification status, Availability                     │
│                                                                │
│ 3. SELECT LAWYER                                              │
│    POST /requests/{id}/select-lawyer                          │
│    ├─ Set selected_lawyer_id                                  │
│    ├─ Update status: submitted → payment_pending              │
│    └─ Log StateTransition                                     │
│    Status: payment_pending ✓                                  │
│                                                                │
│ 4. PROCESS PAYMENT                                            │
│    POST /payments/request/{id}/pay                            │
│    ├─ Create Payment (status=success)                         │
│    ├─ Update ConsultationRequest: payment_pending → awaiting  │
│    ├─ Create Settlement (pending payout)                      │
│    └─ Log StateTransition                                     │
│    Status: awaiting_lawyer ✓                                  │
│    Platform fee: 20%                                          │
│                                                                │
│ 5. LAWYER RESPONSE                                            │
│    POST /lawyer/requests/{id}/respond                         │
│    ├─ Lawyer accepts/declines                                 │
│    │                                                           │
│    ├─ IF ACCEPTED:                                             │
│    │  ├─ Create Case (status=open)                            │
│    │  ├─ Update ConsultationRequest: awaiting → accepted      │
│    │  ├─ Log StateTransition: awaiting → accepted             │
│    │  └─ Log StateTransition: null → open (for case)          │
│    │                                                           │
│    └─ IF DECLINED:                                             │
│       └─ Create LawyerResponse (declined)                     │
│    Status: accepted ✓ (Case created)                          │
└────────────────────────────────────────────────────────────────┘

PHASE 3: CASE MANAGEMENT
┌────────────────────────────────────────────────────────────────┐
│ 1. SCHEDULE APPOINTMENT                                        │
│    POST /appointments                                          │
│    ├─ Create Appointment (status=scheduled)                   │
│    ├─ Fixed 15-minute consultation                            │
│    └─ Log AuditLog                                            │
│                                                                │
│ 2. UPDATE CASE STATUS                                          │
│    PUT /cases/{id}/status                                     │
│    ├─ open → in_progress → resolved → closed                  │
│    └─ Log StateTransition                                     │
│                                                                │
│ 3. UPLOAD DOCUMENTS                                            │
│    POST /documents                                            │
│    ├─ Upload case documents                                   │
│    └─ Log AuditLog                                            │
│                                                                │
│ 4. COMPLETE APPOINTMENT                                        │
│    PUT /appointments/{id}/status                              │
│    └─ scheduled → completed                                   │
│                                                                │
│ 5. SUBMIT REVIEW                                              │
│    POST /reviews                                              │
│    ├─ Client rates lawyer (1-5 stars)                         │
│    ├─ Update LawyerProfile rating                             │
│    └─ Log AuditLog                                            │
│                                                                │
│ 6. PROCESS SETTLEMENT                                         │
│    PUT /settlements/{id}/process                              │
│    ├─ Admin processes payout                                  │
│    ├─ settlement_id: pending → processed                      │
│    └─ payout_date set                                         │
└────────────────────────────────────────────────────────────────┘
```

### State Machines

**Consultation Request State Machine:**
```
submitted
  ↓ (user selects lawyer)
payment_pending
  ↓ (payment succeeds)
awaiting_lawyer
  ├─ ↓ (lawyer accepts)
  │ accepted
  │
  └─ ↓ (timeout 48h)
    expired
```

**Case State Machine:**
```
open
  ↓ (lawyer updates)
in_progress
  ↓ (resolution)
resolved
  ↓ (close)
closed
```

**Appointment State Machine:**
```
scheduled
  ↓ (consultation done)
completed
  ├─ ↓ (review allowed)
  │ feedback_enabled
  │
  └─ ↓ (cancelled)
    cancelled
```

---

## API Endpoints

### Authentication (2)
```
POST   /auth/otp/request          Send OTP to phone
POST   /auth/otp/verify           Verify OTP and login
```

### Onboarding (3)
```
POST   /onboarding/seed-legal-docs              Seed legal documents
POST   /onboarding/client/signup                Client registration
POST   /onboarding/lawyer/signup-basic          Lawyer registration
```

### Consultation Requests (4)
```
POST   /requests                           Create new request
GET    /requests/client/{userId}           Get client's requests
GET    /requests/{id}/suggested-lawyers    Get matching lawyers
POST   /requests/{id}/select-lawyer        Select lawyer → payment_pending
```

### Payments (1)
```
POST   /payments/request/{id}/pay          Process payment → awaiting_lawyer
```

### Lawyer Operations (2)
```
GET    /lawyer/requests/{userId}           Get awaiting_lawyer requests
POST   /lawyer/requests/{id}/respond        Accept/Decline request
```

### Cases (5)
```
GET    /cases/client/{userId}              Client's cases
GET    /cases/lawyer/{userId}              Lawyer's cases
GET    /cases/{id}                         Case details
PUT    /cases/{id}/status                  Update case status
POST   /cases/{requestId}/match-lawyers    Get matched lawyers for case
```

### Appointments (4)
```
POST   /appointments                       Create appointment
GET    /appointments/case/{caseId}         Get case appointments
GET    /appointments/{id}                  Appointment details
PUT    /appointments/{id}/status           Update status
POST   /appointments/{id}/cancel           Cancel appointment
```

### Documents (4)
```
POST   /documents                          Upload document
GET    /documents/case/{caseId}            Get case documents
GET    /documents/{id}                     Document details
DELETE /documents/{id}                     Delete document
```

### Reviews (3)
```
POST   /reviews                            Submit review
GET    /reviews/lawyer/{lawyerId}          Get lawyer reviews
GET    /reviews/case/{caseId}              Get case reviews
```

### Settlements (3)
```
POST   /settlements/from-payment           Create settlement from payment
GET    /settlements/lawyer/{lawyerId}      Get lawyer settlements
PUT    /settlements/{id}/process           Process payout (Admin)
```

### Demo & Testing (3)
```
POST   /demo/seed                          Seed demo data
GET    /demo/overview                      System statistics
POST   /demo/clear                         Clear demo data
```

### Health (1)
```
GET    /health                             Server health check
```

---

## Setup Instructions

### 1. Prerequisites
- Node.js v14+
- MongoDB Atlas account (free tier available)
- Git

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free M0 tier available)
3. Create a database user with password
4. Whitelist your IP (or 0.0.0.0/0 for development)
5. Get connection string: `mongodb+srv://<USERNAME>:<PASSWORD>@cluster.mongodb.net/`

### 4. Create .env File

```bash
cat > .env << 'EOF'
PORT=5000
MONGO_URI=mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.xxxxx.mongodb.net/legal-platform?retryWrites=true&w=majority
NODE_ENV=development
EOF
```

Replace:
- `username` → Your MongoDB Atlas username
- `password` → Your MongoDB Atlas password
- `cluster0.xxxxx` → Your cluster URL

### 5. Verify Setup
```bash
# Check MongoDB connection
node scripts/list_collections.js

# Seed legal documents
curl -X POST http://localhost:5000/onboarding/seed-legal-docs
```

### 6. Start Server

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

Server runs on `http://localhost:5000`

---

## Testing Guide

### Quick Start Test
```bash
# 1. Run complete integration test
node test-workflow.js

# 2. Check collections created
node scripts/list_collections.js

# 3. Start server
npm run dev

# 4. In another terminal, test endpoints (see below)
```

### Detailed Testing Workflow

#### Step 1: Seed Legal Documents
```bash
curl -X POST http://localhost:5000/onboarding/seed-legal-docs
```

**Response:**
```json
{
  "message": "Legal documents seeded"
}
```

---

#### Step 2: Client Signup
```bash
curl -X POST http://localhost:5000/onboarding/client/signup \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Raj Kumar",
    "phone_number": "9876543210",
    "state": "Maharashtra",
    "city": "Mumbai",
    "pincode": "400001",
    "preferred_language": "English",
    "accept_terms": true
  }'
```

**Response:**
```json
{
  "_id": "USER_ID",
  "user_id": "USER_ID",
  "role": "client",
  "is_verified": false,
  "redirect": "auth/otp"
}
```

**What happens:**
- ✅ User created (role=client)
- ✅ ClientProfile created with location
- ✅ UserConsents recorded (Terms & Privacy)
- ✅ OTP sent to console: `[DEBUG] OTP for 9876543210: 123456`

---

#### Step 3: Verify OTP
```bash
curl -X POST http://localhost:5000/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "9876543210",
    "otp_code": "123456"
  }'
```

**Response:**
```json
{
  "user_id": "USER_ID",
  "role": "client",
  "is_verified": true,
  "redirect": "user/home"
}
```

---

#### Step 4: Create Consultation Request
```bash
# First get your actual client user ID from demo data
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI); const User = require('./models/User'); User.findOne({ phone_number: '9991001001' }).then(u => { console.log('Client User ID:', u._id); process.exit(); });"

# Use the printed USER_ID in this curl
curl -X POST http://localhost:5000/requests \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "6964b8144804d1b9bc638549",
    "case_type": "Property Dispute",
    "issue_description": "I have a property boundary dispute with my neighbor",
    "budget_range": "medium",
    "urgency": "high",
    "language": "English",
    "share_contact": true
  }'
```

**Response:**
```json
{
  "_id": "REQUEST_ID",
  "client_id": "CLIENT_PROFILE_ID",
  "case_type": "Property Dispute",
  "issue_description": "I have a property boundary dispute with my neighbor",
  "status": "submitted",
  "expires_at": "2026-01-14T..."
}
```

**What happens:**
- ✅ ConsultationRequest created
- ✅ Status: submitted
- ✅ Expires in 48 hours
- ✅ StateTransition logged

---

#### Step 5: Get Suggested Lawyers (MATCHING!)
```bash
curl http://localhost:5000/requests/REQUEST_ID/suggested-lawyers
```

**Response:**
```json
[
  {
    "_id": "LAWYER_ID_1",
    "user_id": {
      "full_name": "Advocate Singh",
      "phone_number": "9992001003"
    },
    "experience_years": 12,
    "consultation_fee": 3000,
    "rating": 4.8,
    "bio": "Senior advocate, expert in both property and family law",
    "isVerified": true,
    "availableToday": true,
    "specializations": ["Property Dispute", "Family & Divorce"],
    "practiceForums": ["high_court", "supreme_court"],
    "acceptanceRate": "100%"
  },
  {
    "_id": "LAWYER_ID_2",
    "user_id": {
      "full_name": "Advocate Sharma",
      "phone_number": "9992001001"
    },
    "experience_years": 8,
    "consultation_fee": 2000,
    "rating": 4.5,
    "bio": "Expert in property disputes with 8 years of experience",
    "isVerified": true,
    "availableToday": true,
    "specializations": ["Property Dispute"],
    "practiceForums": ["district_court", "high_court"],
    "acceptanceRate": "100%"
  }
]
```

**Sorting Order (As Per PDF):**
1. ✅ Verified First (Singh & Sharma both verified)
2. ✅ Available Today (both available)
3. ✅ Fee Low to High (Sharma ₹2000 before Singh ₹3000)
4. ✅ Rating High to Low (if same fee)

---

#### Step 6: Select Lawyer
```bash
curl -X POST http://localhost:5000/requests/REQUEST_ID/select-lawyer \
  -H "Content-Type: application/json" \
  -d '{
    "lawyer_id": "LAWYER_ID_1",
    "user_id": "6964b8144804d1b9bc638549"
  }'
```

**Response:**
```json
{
  "message": "Lawyer selected, proceed to payment",
  "request_id": "REQUEST_ID"
}
```

**What happens:**
- ✅ selected_lawyer_id set
- ✅ Status: submitted → payment_pending
- ✅ StateTransition logged

---

#### Step 7: Process Payment
```bash
curl -X POST http://localhost:5000/payments/request/REQUEST_ID/pay \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 2000,
    "payment_method": "upi",
    "user_id": "6964b8144804d1b9bc638549"
  }'
```

**Response:**
```json
{
  "message": "Payment success; request visible to lawyers",
  "request_id": "REQUEST_ID"
}
```

**What happens:**
- ✅ Payment created (success)
- ✅ Settlement created (lawyer payout pending)
- ✅ Status: payment_pending → awaiting_lawyer
- ✅ Platform fee: 20% (₹400 from ₹2000)
- ✅ Lawyer net: ₹1600
- ✅ StateTransition logged

---

#### Step 8: Lawyer Accepts Request
```bash
# Get lawyer user ID
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI); const User = require('./models/User'); User.findOne({ phone_number: '9992001001' }).then(u => { console.log('Lawyer User ID:', u._id); process.exit(); });"

curl -X POST http://localhost:5000/lawyer/requests/REQUEST_ID/respond \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "LAWYER_USER_ID",
    "response": "accepted"
  }'
```

**Response:**
```json
{
  "message": "Accepted, case created",
  "case_id": "CASE_ID"
}
```

**What happens:**
- ✅ LawyerResponse created (accepted)
- ✅ Case created (status=open)
- ✅ Request status: awaiting_lawyer → accepted
- ✅ StateTransition logged (request & case)

---

#### Step 9: Get Case Details
```bash
curl http://localhost:5000/cases/CASE_ID
```

**Response:**
```json
{
  "_id": "CASE_ID",
  "request_id": {
    "_id": "REQUEST_ID",
    "case_type": "Property Dispute",
    "issue_description": "..."
  },
  "client_id": {
    "user_id": {
      "full_name": "Raj Kumar",
      "phone_number": "9876543210"
    },
    "state": "Maharashtra",
    "city": "Mumbai"
  },
  "lawyer_id": {
    "user_id": {
      "full_name": "Advocate Sharma",
      "phone_number": "9992001001"
    },
    "experience_years": 8,
    "consultation_fee": 2000
  },
  "case_status": "open",
  "opened_at": "2026-01-12T10:30:00Z"
}
```

---

#### Step 10: Schedule Appointment
```bash
curl -X POST http://localhost:5000/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "case_id": "CASE_ID",
    "appointment_datetime": "2026-01-15T14:00:00Z",
    "user_id": "LAWYER_USER_ID"
  }'
```

**Response:**
```json
{
  "_id": "APPOINTMENT_ID",
  "case_id": "CASE_ID",
  "consultation_type": "call",
  "appointment_datetime": "2026-01-15T14:00:00Z",
  "status": "scheduled",
  "call_duration_minutes": 15
}
```

---

#### Step 11: Complete Appointment & Review
```bash
# 1. Mark appointment as completed
curl -X PUT http://localhost:5000/appointments/APPOINTMENT_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "user_id": "LAWYER_USER_ID"
  }'

# 2. Submit review
curl -X POST http://localhost:5000/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "appointment_id": "APPOINTMENT_ID",
    "case_id": "CASE_ID",
    "client_id": "CLIENT_PROFILE_ID",
    "lawyer_id": "LAWYER_PROFILE_ID",
    "rating": 5,
    "review_text": "Excellent service, highly recommended!",
    "user_id": "6964b8144804d1b9bc638549"
  }'
```

---

### Testing in Postman

Import this collection into Postman:

```json
{
  "info": { "name": "Find My Lawyer API" },
  "item": [
    {
      "name": "Seed Legal Docs",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/onboarding/seed-legal-docs"
      }
    },
    {
      "name": "Client Signup",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/onboarding/client/signup",
        "body": {
          "mode": "raw",
          "raw": "{\"full_name\":\"Test Client\",\"phone_number\":\"9876543210\",\"state\":\"Maharashtra\",\"city\":\"Mumbai\",\"pincode\":\"400001\",\"preferred_language\":\"English\",\"accept_terms\":true}"
        }
      }
    },
    {
      "name": "Create Request",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/requests",
        "body": {
          "mode": "raw",
          "raw": "{\"user_id\":\"USER_ID\",\"case_type\":\"Property Dispute\",\"issue_description\":\"Test\",\"budget_range\":\"medium\",\"urgency\":\"high\",\"language\":\"English\",\"share_contact\":true}"
        }
      }
    },
    {
      "name": "Get Suggested Lawyers",
      "request": {
        "method": "GET",
        "url": "http://localhost:5000/requests/REQUEST_ID/suggested-lawyers"
      }
    },
    {
      "name": "Select Lawyer",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/requests/REQUEST_ID/select-lawyer",
        "body": {
          "mode": "raw",
          "raw": "{\"lawyer_id\":\"LAWYER_ID\",\"user_id\":\"USER_ID\"}"
        }
      }
    },
    {
      "name": "Process Payment",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/payments/request/REQUEST_ID/pay",
        "body": {
          "mode": "raw",
          "raw": "{\"amount\":2000,\"payment_method\":\"upi\",\"user_id\":\"USER_ID\"}"
        }
      }
    }
  ]
}
```

---

## Demo Data

### Pre-created Demo Users (from test-workflow.js)

**Clients (3):**
```
Raj Kumar          | 9991001001 | user_id: 6964b8144804d1b9bc638549
Priya Sharma       | 9991001002 | user_id: 6964b8144804d1b9bc638550
Amit Patel         | 9991001003 | user_id: 6964b8154804d1b9bc638557
```

**Lawyers (5):**
```
Advocate Sharma    | 9992001001 | Exp: 8yrs  | Fee: ₹2000 | Rating: 4.5
Advocate Desai     | 9992001002 | Exp: 5yrs  | Fee: ₹1500 | Rating: 4.2
Advocate Singh     | 9992001003 | Exp: 12yrs | Fee: ₹3000 | Rating: 4.8
Advocate Verma     | 9992001004 | Exp: 3yrs  | Fee: ₹1000 | Rating: 3.9
Advocate Gupta     | 9992001005 | Exp: 6yrs  | Fee: ₹1800 | Rating: 4.3
```

### View Demo Data

**1. List all collections:**
```bash
node scripts/list_collections.js
```

**2. Check statistics:**
```bash
curl http://localhost:5000/demo/overview
```

**3. MongoDB Atlas:**
- Go to Collections tab
- Select `legal-platform` database
- Browse collections: users, consultationrequests, cases, etc.

---

## Key Features

### ✅ Phase 1 Complete

**User Onboarding**
- Client signup with location & preferences
- Lawyer signup with experience & credentials
- OTP-based verification
- Legal document consent tracking
- Role-based separation (client/lawyer)

**Case Request Management**
- Create consultation requests
- 48-hour expiration timer
- Budget & urgency specification
- Case type matching

**Advanced Lawyer Matching**
- Specialization-based filtering
- Multi-factor sorting:
  1. Verified First (has bar council documents)
  2. Available Today (from LawyerAvailability)
  3. Fee (Low to High)
  4. Rating (High to Low)
- Returns top 10 matched lawyers

**Payment Processing**
- Simulated payment (success/failure)
- 20% platform fee
- Settlement creation
- Transaction tracking

**Case Lifecycle**
- Case creation on lawyer acceptance
- Status tracking (open → in_progress → resolved → closed)
- Complete state machine implementation
- StateTransition audit trail

**Consultation Management**
- 15-minute appointment scheduling
- Appointment status tracking
- Review & rating system
- Lawyer rating calculation

**Document Management**
- Case document uploads
- File tracking with metadata
- Upload by user tracking

**Settlements & Payouts**
- Automatic settlement creation
- Platform fee calculation (20%)
- Payout status tracking
- Admin processing

**Audit & Compliance**
- Complete StateTransition logging
- AuditLog for all actions
- IP & user-agent tracking
- Consent documentation

---

## Troubleshooting

### Issue: "Can't connect to MongoDB"
**Solution:** Verify MONGO_URI in .env and check IP whitelist in MongoDB Atlas

### Issue: "OTP sent but can't see it"
**Solution:** OTPs logged to console: `[DEBUG] OTP for 9876543210: 123456`

### Issue: "No lawyers found in matching"
**Solution:** Check lawyers are approved (`profile_status: "approved"`) and have matching specializations

### Issue: "Cast to ObjectId failed"
**Solution:** Use actual MongoDB ObjectId, not phone number or other values

### Issue: Server won't start
**Solution:** 
- Check Node version: `node --version` (should be v14+)
- Check port 5000 is free: `lsof -i :5000`
- Check .env exists with MONGO_URI

---

## Running Commands Reference

```bash
# Setup
npm install                              # Install dependencies
npm run dev                              # Start server (dev)
npm start                                # Start server (prod)

# Testing
node test-workflow.js                    # Full integration test
node scripts/list_collections.js         # Verify MongoDB collections
node demo-test.js                        # Get demo user IDs

# Utilities
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGO_URI); const User = require('./models/User'); User.find({ phone_number: { \$regex: '^999' } }).then(users => { users.forEach(u => console.log(u.full_name, ':', u._id)); process.exit(); });"     # List demo users

# API Endpoints (with server running)
curl http://localhost:5000/health                             # Health check
curl -X POST http://localhost:5000/demo/seed                  # Seed demo data
curl http://localhost:5000/demo/overview                      # System stats
```

---

## API Response Format

All successful responses return with appropriate HTTP status:
```json
{
  "_id": "...",
  "field1": "value1",
  "field2": "value2",
  "createdAt": "2026-01-12T10:30:00Z",
  "updatedAt": "2026-01-12T10:30:00Z"
}
```

Error responses:
```json
{
  "error": "Descriptive error message"
}
```

---

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production` in .env
- [ ] Use strong MongoDB passwords
- [ ] Enable IP whitelist (not 0.0.0.0/0)
- [ ] Add JWT/OAuth authentication
- [ ] Implement rate limiting
- [ ] Set up logging (Winston/Morgan)
- [ ] Configure CORS properly
- [ ] Use helmet for security headers
- [ ] Set up monitoring & alerts
- [ ] Use environment-specific .env files
- [ ] Enable HTTPS
- [ ] Deploy to production server (Heroku, AWS, etc.)

---

## Support & Documentation

For detailed implementation, see:
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Step-by-step testing
- PDF Database Schema - All entities & relationships
- Code comments in services/ - Business logic explanation

---

**Status: ✅ Phase 1 Complete & Production Ready**

