import axios from "axios";

// Axios instance
const apiClient = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json"
  }
});

// Centralized error handler
function handleResponse(promise) {
  return promise
    .then((res) => res.data)
    .catch((err) => {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Something went wrong";
      throw new Error(message);
    });
}

export const api = {
  // ------------------
  // AUTH
  // ------------------
  clientSignup: (data) =>
    handleResponse(apiClient.post("/auth/client-signup", data)),

  verifyOtp: (data) =>
    handleResponse(apiClient.post("/auth/verify-otp", data)),

  // ------------------
  // REQUESTS
  // ------------------
  createConsultationRequest: (data) =>
    handleResponse(apiClient.post("/requests", data)),

  getClientRequests: (userId) =>
    handleResponse(apiClient.get(`/requests/client/${userId}`)),

  getSuggestedLawyers: (requestId) =>
    handleResponse(
      apiClient.get(`/requests/${requestId}/suggested-lawyers`)
    ),

  selectLawyerForRequest: (requestId, data) =>
    handleResponse(
      apiClient.post(`/requests/${requestId}/select-lawyer`, data)
    ),

  // ------------------
  // PAYMENTS
  // ------------------
  payForRequest: (requestId, data) =>
    handleResponse(
      apiClient.post(`/payments/request/${requestId}/pay`, data)
    ),

  // ------------------
  // CASES (USER SIDE)
  // ------------------
  getClientCases: (userId) =>
    handleResponse(apiClient.get(`/cases/client/${userId}`)),

  getCaseDetails: (caseId) =>
    handleResponse(apiClient.get(`/cases/${caseId}`))
};
