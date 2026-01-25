import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function UserRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) {
          throw new Error("User not authenticated");
        }

        const data = await api.getClientRequests(user_id);
        setRequests(data);
      } catch (err) {
        setError(err.message || "Failed to load requests");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) {
    return <div className="card">Loading requests...</div>;
  }

  if (error) {
    return <div className="card error">{error}</div>;
  }

  return (
    <section className="card">
      <h2>My Requests</h2>

      <button
        style={{ marginBottom: "1rem" }}
        onClick={() => navigate("/new-request")}
      >
        + New Request
      </button>

      {requests.length === 0 ? (
        <p>No active requests</p>
      ) : (
        <ul className="list">
          {requests.map((req) => (
            <li key={req._id} className="list-item">
              <div>
                <strong>{req.case_type}</strong>
              </div>

              <div>Status: <b>{formatStatus(req.status)}</b></div>

              <div>
                Created: {new Date(req.createdAt).toLocaleDateString()}
              </div>

              {/* ACTIONS */}
              {req.status === "submitted" && (
                <button
                  onClick={() =>
                    navigate(`/requests/${req._id}/select-lawyer`)
                  }
                >
                  Select Lawyer
                </button>
              )}

              {req.status === "awaiting_lawyer" && (
                <span style={{ color: "green" }}>
                  Waiting for lawyer response
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatStatus(status) {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "awaiting_lawyer":
      return "Awaiting Lawyer";
    default:
      return status;
  }
}
