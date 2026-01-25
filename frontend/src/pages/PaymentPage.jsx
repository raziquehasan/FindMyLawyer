import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function PaymentPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePayment = async () => {
    setError("");
    setLoading(true);

    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        throw new Error("User not authenticated");
      }

      // Simulated fixed payment for MVP
      await api.payForRequest(requestId, {
        amount: 500,
        payment_method: "upi",
        user_id
      });

      // After successful payment
      navigate("/my-requests");
    } catch (err) {
      setError(err.message || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h2>Payment</h2>

      <div className="summary">
        <p><strong>Consultation Fee:</strong> ₹500</p>
        <p><strong>Duration:</strong> 15 minutes</p>
        <p><strong>Mode:</strong> Phone Call</p>
      </div>

      {error && <div className="error">{error}</div>}

      <button onClick={handlePayment} disabled={loading}>
        {loading ? "Processing..." : "Pay ₹500"}
      </button>
    </section>
  );
}
