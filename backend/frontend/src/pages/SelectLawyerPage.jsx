import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

export default function SelectLawyerPage() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const data = await api.getSuggestedLawyers(requestId);
        setLawyers(data);
      } catch (err) {
        setError(err.message || "Failed to load lawyers");
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, [requestId]);

  const handleSelectLawyer = async (lawyerId) => {
    try {
      const user_id = localStorage.getItem("user_id");
      if (!user_id) {
        throw new Error("User not authenticated");
      }

      await api.selectLawyerForRequest(requestId, {
        lawyer_id: lawyerId,
        user_id
      });

      // Redirect to payment page
      navigate(`/requests/${requestId}/payment`);
    } catch (err) {
      alert(err.message || "Failed to select lawyer");
    }
  };

  if (loading) {
    return <div className="card">Loading lawyers...</div>;
  }

  if (error) {
    return <div className="card error">{error}</div>;
  }

  return (
    <section className="card">
      <h2>Select a Lawyer</h2>

      {lawyers.length === 0 ? (
        <p>No matching lawyers found</p>
      ) : (
        <ul className="list">
          {lawyers.map((lawyer) => (
            <li key={lawyer._id} className="list-item">
              <div>
                <strong>{lawyer.user_id?.full_name || "Lawyer"}</strong>
              </div>

              <div>Experience: {lawyer.experience_years} years</div>
              <div>Fee: ₹{lawyer.consultation_fee}</div>

              {lawyer.rating && (
                <div>Rating: ⭐ {lawyer.rating}</div>
              )}

              <button
                onClick={() => handleSelectLawyer(lawyer._id)}
                style={{ marginTop: "0.5rem" }}
              >
                Select Lawyer
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
