# Testing Guide: User Onboarding & Case Requests

This guide shows you exactly how to test user onboarding and case requests in your legal platform.

---

## 1. START THE SERVER

```bash
npm install
node server.js
```

The server will run on `http://localhost:3000`

---

## 2. SEED LEGAL DOCUMENTS (First Time Only)

Before onboarding users, seed the legal documents:

**Endpoint:** `POST http://localhost:3000/onboarding/seed-legal-docs`

**Request Body:** (No body required)

**Expected Response:**
```json
{
  "message": "Legal documents seeded"
}
```

---

## 3. TEST CLIENT ONBOARDING

### Step 3.1: Client Sign-Up

**Endpoint:** `POST http://localhost:3000/onboarding/client/signup`

**Request Body:**
```json
{
  "full_name": "Rajesh Kumar",
  "phone_number": "9876543210",
  "state": "Maharashtra",
  "city": "Mumbai",
  "pincode": "400001",
  "preferred_language": "English",
  "accept_terms": true
}
```

**Expected Response:**
```json
{
  "_id": "user_id_here",
  "user_id": "user_id_here",
  "role": "client",
  "is_verified": false,
  "redirect": "auth/otp"
}
```

**What happens:**
- ✓ User created with role "client"
- ✓ Client profile created with location details
- ✓ User consents to Terms & Privacy Policy recorded
- ✓ OTP sent to phone number (logged in console)

---

### Step 3.2: Verify OTP

**Endpoint:** `POST http://localhost:3000/auth/verify-otp`

**Request Body:**
```json
{
  "phone_number": "9876543210",
  "otp": "123456"
}
```

**Expected Response:**
```json
{
  "user_id": "user_id_here",
  "role": "client",
  "is_verified": true,
  "message": "OTP verified successfully"
}
```

**What happens:**
- ✓ User marked as verified (is_verified = true)
- ✓ Client profile status confirmed

---

## 4. TEST LAWYER ONBOARDING

### Step 4.1: Lawyer Sign-Up (Basic)

**Endpoint:** `POST http://localhost:3000/onboarding/lawyer/signup-basic`

**Request Body:**
```json
{
  "full_name": "Adv. Priya Sharma",
  "phone_number": "9876543211",
  "state": "Maharashtra",
  "city": "Mumbai",
  "experience_years": 8,
  "accept_terms": true
}
```

**Expected Response:**
```json
{
  "_id": "lawyer_id_here",
  "user_id": "user_id_here",
  "role": "lawyer",
  "is_verified": false,
  "redirect": "auth/otp"
}
```

**What happens:**
- ✓ Lawyer user created with role "lawyer"
- ✓ Lawyer profile created with experience_years and status "pending"
- ✓ User consents to Lawyer Terms & Privacy recorded
- ✓ OTP sent

---

### Step 4.2: Complete Lawyer Profile

**Endpoint:** `POST http://localhost:3000/onboarding/lawyer/complete-profile`

**Request Body:**
```json
{
  "user_id": "lawyer_user_id_here",
  "state_council_registration": "MC/1234/2018",
  "state_council_name": "Bar Council of Maharashtra",
  "consultation_fee": 1000,
  "bio": "Expert in property and real estate law with 8 years of experience",
  "languages": ["English", "Marathi", "Hindi"],
  "specializations": ["Property Dispute", "Real Estate", "Contract Law"]
}
```

**Expected Response:**
```json
{
  "_id": "profile_id_here",
  "user_id": "lawyer_user_id_here",
  "profile_status": "pending",
  "specializations": ["Property Dispute", "Real Estate", "Contract Law"],
  "message": "Lawyer profile updated"
}
```

**What happens:**
- ✓ Lawyer profile updated with credentials
- ✓ Specializations created/linked
- ✓ Profile remains in "pending" status (awaiting admin approval)

---

### Step 4.3: Admin Approves Lawyer Profile

**Endpoint:** `POST http://localhost:3000/onboarding/lawyer/approve`

**Request Body:**
```json
{
  "lawyer_user_id": "lawyer_user_id_here",
  "admin_id": "admin_user_id_here"
}
```

**Expected Response:**
```json
{
  "message": "Lawyer profile approved",
  "profile_status": "approved"
}
```

**What happens:**
- ✓ Lawyer profile status changed from "pending" to "approved"
- ✓ Lawyer now appears in matching results

---

## 5. TEST USER CASE REQUEST

### Step 5.1: Create Consultation Request

**Endpoint:** `POST http://localhost:3000/requests`

**Request Body:**
```json
{
  "user_id": "client_user_id_here",
  "case_type": "Property Dispute",
  "issue_description": "I have a property boundary dispute with my neighbor. Need legal advice.",
  "budget_range": "medium",
  "urgency": "high",
  "language": "English",
  "share_contact": true
}
```

**Expected Response:**
```json
{
  "_id": "request_id_here",
  "client_id": "client_profile_id_here",
  "case_type": "Property Dispute",
  "status": "submitted",
  "created_at": "2025-01-12T10:30:00Z",
  "createdAt": "2025-01-12T10:30:00Z",
  "updatedAt": "2025-01-12T10:30:00Z"
}
```

**What happens:**
- ✓ Consultation request created with status "submitted"
- ✓ State transition recorded (null → submitted)
- ✓ Request ready for lawyer matching

**Check DB:**
```bash
db.consultationrequests.findOne()
# Should show:
# - status: "submitted"
# - case_type: "Property Dispute"
# - issue_description: (filled)
```

---

### Step 5.2: List Client's Requests

**Endpoint:** `GET http://localhost:3000/requests/client/{user_id}`

**Example:** `GET http://localhost:3000/requests/client/66f123abc456def789gh0000`

**Expected Response:**
```json
[
  {
    "_id": "request_id_here",
    "client_id": "client_profile_id_here",
    "case_type": "Property Dispute",
    "budget_range": "medium",
    "urgency": "high",
    "language": "English",
    "status": "submitted",
    "createdAt": "2025-01-12T10:30:00Z"
  }
]
```

**What happens:**
- ✓ Shows all requests for this client
- ✓ Sorted by newest first
- ✓ Does NOT include issue_description (privacy)

---

## 6. TEST CASE-LAWYER MATCHING

### Step 6.1: Get Suggested Lawyers for Request

**Endpoint:** `GET http://localhost:3000/requests/{request_id}/suggested-lawyers`

**Example:** `GET http://localhost:3000/requests/66f456xyz123abc456def/suggested-lawyers`

**Expected Response:**
```json
[
  {
    "_id": "lawyer_profile_id_1",
    "user_id": "lawyer_user_id_1",
    "experience_years": 8,
    "consultation_fee": 1000,
    "bio": "Expert in property law",
    "rating": 4.5,
    "specs": [
      {
        "specialization": "Property Dispute"
      }
    ]
  },
  {
    "_id": "lawyer_profile_id_2",
    "user_id": "lawyer_user_id_2",
    "experience_years": 5,
    "consultation_fee": 800,
    "bio": "Real estate specialist",
    "rating": 4.2,
    "specs": [
      {
        "specialization": "Property Dispute"
      }
    ]
  }
]
```

**What happens:**
- ✓ Lawyers are matched by case_type specialization
- ✓ Only approved & available lawyers shown
- ✓ Ranked by score, experience, rating

**Matching Algorithm:**
- Case type must match lawyer specialization
- Lawyer must have `is_available: true`
- Lawyer must have `profile_status: "approved"`

---

### Step 6.2: Select Lawyer & Move to Payment

**Endpoint:** `POST http://localhost:3000/requests/{request_id}/select-lawyer`

**Example:** `POST http://localhost:3000/requests/66f456xyz123abc456def/select-lawyer`

**Request Body:**
```json
{
  "lawyer_id": "lawyer_profile_id_1",
  "user_id": "client_user_id_here"
}
```

**Expected Response:**
```json
{
  "message": "Lawyer selected, proceed to payment",
  "request_id": "request_id_here"
}
```

**What happens:**
- ✓ Request status changes: "submitted" → "payment_pending"
- ✓ selected_lawyer_id field is set
- ✓ State transition recorded
- ✓ Client can now proceed to payment

**Check DB:**
```bash
db.consultationrequests.findOne()
# Should show:
# - status: "payment_pending"
# - selected_lawyer_id: (populated)
```

---

## 7. TEST COMPLETE WORKFLOW (Automated)

Run the complete integration test:

```bash
node test-workflow.js
```

**This will:**
1. ✓ Seed demo data (clients, lawyers, specializations)
2. ✓ Create a consultation request
3. ✓ Test case-lawyer matching
4. ✓ Select a lawyer
5. ✓ Create a payment
6. ✓ Complete the case
7. ✓ Generate report showing all steps

**Expected Output:**
```
✓ Database: Connected successfully
✓ STEP 1: SEEDING DEMO DATA: ✓ Completed
  - Created 3 demo clients
  - Created 3 demo lawyers
✓ STEP 2: CREATE CONSULTATION REQUEST: Request ID: 66f456xyz...
✓ STEP 3: CASE-LAWYER MATCHING: ✓ Completed
  - Found 3 matching lawyers
  - Top 3 matches:
    1. Adv. Priya Sharma (Score: 850, Exp: 8yrs, Fee: ₹1000)
    2. Adv. Arjun Patel (Score: 720, Exp: 5yrs, Fee: ₹800)
    3. Adv. Neha Desai (Score: 680, Exp: 4yrs, Fee: ₹700)
✓ STEP 4: SELECT LAWYER & PAYMENT: ✓ Completed
...
```

---

## 8. VERIFY IN MONGODB

Use MongoDB Compass or mongo shell to verify data:

```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/legal-platform

# Check user onboarding
db.users.find({ role: "client" })
db.users.find({ role: "lawyer" })

# Check consultation requests
db.consultationrequests.find()

# Check state transitions
db.statetransitions.find()

# Check user consents
db.userconsents.find()

# Check lawyer specializations
db.lawyerspecializations.find()

# Check payments
db.payments.find()
```

---

## 9. TROUBLESHOOTING

### Issue: "OTP sent" but can't see it

**Solution:** OTPs are logged to console. Check terminal output:
```
OTP sent to 9876543210: 123456
```

### Issue: Legal documents not found

**Solution:** Run seed-legal-docs first:
```bash
curl -X POST http://localhost:3000/onboarding/seed-legal-docs
```

### Issue: No lawyers found in matching

**Possible Causes:**
1. Lawyers not approved (profile_status != "approved")
2. Lawyers not marked as available (is_available != true)
3. No specializations matching case_type
4. Wrong specialization spelled differently

**Solution:** Check in MongoDB:
```bash
db.lawyerprofiles.find()
# Should show: profile_status: "approved", is_available: true

db.lawyerspecializations.find()
# Should show matching specialization for case_type
```

### Issue: "Phone already registered"

**Solution:** Use unique phone numbers for each test

---

## 10. POSTMAN COLLECTION

You can also use Postman to test. Here's the collection:

**Import this into Postman:**

```json
{
  "info": { "name": "Legal Platform Testing" },
  "item": [
    {
      "name": "Seed Legal Docs",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/onboarding/seed-legal-docs"
      }
    },
    {
      "name": "Client Signup",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/onboarding/client/signup",
        "body": {
          "mode": "raw",
          "raw": "{\"full_name\":\"Test Client\",\"phone_number\":\"9876543210\",\"state\":\"Maharashtra\",\"city\":\"Mumbai\",\"pincode\":\"400001\",\"preferred_language\":\"English\",\"accept_terms\":true}"
        }
      }
    },
    {
      "name": "Lawyer Signup",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/onboarding/lawyer/signup-basic",
        "body": {
          "mode": "raw",
          "raw": "{\"full_name\":\"Test Lawyer\",\"phone_number\":\"9876543211\",\"state\":\"Maharashtra\",\"city\":\"Mumbai\",\"experience_years\":8,\"accept_terms\":true}"
        }
      }
    },
    {
      "name": "Create Case Request",
      "request": {
        "method": "POST",
        "url": "http://localhost:3000/requests",
        "body": {
          "mode": "raw",
          "raw": "{\"user_id\":\"<client_user_id>\",\"case_type\":\"Property Dispute\",\"issue_description\":\"Test issue\",\"budget_range\":\"medium\",\"urgency\":\"high\",\"language\":\"English\",\"share_contact\":true}"
        }
      }
    },
    {
      "name": "Get Suggested Lawyers",
      "request": {
        "method": "GET",
        "url": "http://localhost:3000/requests/<request_id>/suggested-lawyers"
      }
    }
  ]
}
```

---

## Summary Checklist

- [ ] Start server with `npm install && node server.js`
- [ ] Seed legal documents first
- [ ] Test client signup & OTP verification
- [ ] Test lawyer signup & profile completion
- [ ] Get admin approval for lawyer
- [ ] Create consultation request
- [ ] Verify request in database
- [ ] Get suggested lawyers
- [ ] Select lawyer
- [ ] Verify status changed to "payment_pending"
- [ ] Run complete workflow test
- [ ] Check all data in MongoDB

Once all checks pass ✓, your platform is ready for production!
