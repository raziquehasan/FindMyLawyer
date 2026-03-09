import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

// Helper function to normalize phone number to E.164 format
const normalizePhoneNumber = (phone: string): string => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");
  
  // If it starts with 0, remove it
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  
  // If it doesn't start with country code, assume India (+91)
  if (!cleaned.startsWith("91") && cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  
  // Add + prefix
  return "+" + cleaned;
};

export default function RegisterLawyer() {
  const navigate = useNavigate();

  const [step, setStep] = useState<"form" | "otp">("form");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    enrollment: "",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Clear error when user types
  };

  const sendOTP = async () => {
    if (
      !form.name ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.enrollment
    ) {
      setError("Please fill all fields");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate phone number (should have at least 10 digits)
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setError("Please enter a valid phone number (at least 10 digits)");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Normalize phone number for Twilio
      const normalizedPhone = normalizePhoneNumber(form.phone);

      const response = await api.post("/auth/send-otp", {
        phone: normalizedPhone,
      });

      if (response.data.success) {
        // Store normalized phone in form state
        setForm({ ...form, phone: normalizedPhone });
        setStep("otp");
      }
    } catch (err: any) {
      console.error("Send OTP error:", err);
      const errorMessage = err.response?.data?.message || "Failed to send OTP. Please check your phone number and try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Verify OTP
      const verifyResponse = await api.post("/auth/verify-otp", {
        phone: form.phone,
        otp,
      });

      if (verifyResponse.data.success) {
        // After OTP verification, register the lawyer
        try {
          const registerResponse = await api.post("/auth/register", {
            name: form.name,
            email: form.email,
            password: form.password,
            phone: form.phone,
            enrollmentNumber: form.enrollment, // Fix: use enrollmentNumber instead of enrollment
          });

          if (registerResponse.data.success) {
            alert("Registration successful! Please login.");
            navigate("/login");
          }
        } catch (regErr: any) {
          console.error("Registration error:", regErr);
          const errorMessage = regErr.response?.data?.message || "Registration failed. Please try again.";
          setError(errorMessage);
        }
      } else {
        setError("Invalid OTP");
      }
    } catch (err: any) {
      console.error("OTP verification error:", err);
      const errorMessage = err.response?.data?.message || "OTP verification failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-md">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-6">
          Lawyer Registration
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {step === "form" && (
          <>
            <input
              className="input mb-3"
              placeholder="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              className="input mb-3"
              type="email"
              placeholder="Email (Username)"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              className="input mb-3"
              type="tel"
              placeholder="Phone Number (e.g., 9876543210 or +919876543210)"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />

            <input
              className="input mb-3"
              type="password"
              placeholder="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <input
              className="input mb-3"
              placeholder="Bar Council Enrollment Number"
              name="enrollment"
              value={form.enrollment}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              onClick={sendOTP}
              disabled={loading}
              className="w-full bg-indigo-700 text-white py-3 rounded-lg font-semibold hover:bg-indigo-800 transition disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {step === "otp" && (
          <>
            <p className="mb-4 text-gray-600 text-sm">
              OTP has been sent to {form.phone}. Please enter the 6-digit code.
            </p>
            
            <input
              className="input mb-3"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                setError("");
              }}
              maxLength={6}
              required
            />

            <button
              onClick={verifyOTP}
              disabled={loading || otp.length !== 6}
              className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify OTP & Register"}
            </button>

            <button
              onClick={() => {
                setStep("form");
                setOtp("");
                setError("");
              }}
              className="w-full mt-2 text-gray-600 hover:text-gray-800"
            >
              ← Back to form
            </button>
          </>
        )}
      </div>
    </div>
  );
}
