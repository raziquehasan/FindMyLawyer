import React, { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export function MyCasesPage() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const user_id = localStorage.getItem("user_id");
        if (!user_id) {
          throw new Error("User not authenticated");
        }

        const data = await api.getClientCases(user_id);
        setCases(data);
      } catch (err) {
        setError(err.message || "Failed to load cases");
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  if (loading) {
    return <div className="card">Loading cases...</div>;
  }

  if (error) {
    return <div className="card error">{error}</div>;
  }

  return (
    <section className="card">
      <h2>My Cases</h2>

      {cases.length === 0 ? (
        <p>No active cases yet</p>
      ) : (
        <ul className="list">
          {cases.map((c) => (
            <li key={c._id} className="list-item">
              <div>
                <strong>Case Type:</strong>{" "}
                {c.request_id?.case_type || "—"}
              </div>

              <div>
                <strong>Status:</strong>{" "}
                <span>{formatStatus(c.case_status)}</span>
              </div>

              <div>
                <strong>Lawyer:</strong>{" "}
                {c.lawyer_id?.user_id?.full_name || "—"}
              </div>

              <div>
                <strong>Opened:</strong>{" "}
                {new Date(c.opened_at).toLocaleDateString()}
              </div>

              <button
                onClick={() => navigate(`/cases/${c._id}`)}
                style={{ marginTop: "0.5rem" }}
              >
                View Case
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function formatStatus(status) {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Resolved";
    case "closed":
      return "Closed";
    default:
      return status;
  }
}

export default MyCasesPage;