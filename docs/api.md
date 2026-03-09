# API Documentation

FindMyLawyer exposes multiple RESTful endpoints categorized by their target module.

## Backend (User API)
*Default Port: 5000*

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/otp/request` | Request an OTP for authentication. |
| POST | `/auth/otp/verify` | Verify OTP and authenticate user. |
| POST | `/onboarding` | Handle client onboarding data. |
| GET | `/requests` | Fetch consultation requests. |
| POST | `/payments/request/:id/pay` | Simulate payment for a request. |
| GET | `/lawyer` | Search and filter lawyers. |
| GET | `/health` | Check server health. |

## Backend Lawyer API
*Default Port: 5001*

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Authenticate lawyer. |
| GET | `/api/admin/requests` | Admin view of all requests. |
| POST | `/api/lawyer/verify` | Verify lawyer certificates. |
| GET | `/api/lawyer/profile` | Manage lawyer dashboard. |

## External Service Integrations

### Supabase
- Handles real-time database synchronization for lawyer modules.
- Provides authentication fallbacks.

### Cloudinary
- API for uploading and managing certificates and legal documents.

### Twilio
- API for sending SMS OTPs during the login/signup process.
