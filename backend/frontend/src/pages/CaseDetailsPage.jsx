import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";

function CaseDetailsPage() {
  const { caseId } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const data = await api.getCaseDetails(caseId);
        setCaseData(data);
      } catch (err) {
        setError(err.message || "Failed to load case details");
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [caseId]);

  if (loading) {
    return <div className="card">Loading case details...</div>;
  }

  if (error) {
    return <div className="card error">{error}</div>;
  }

  if (!caseData) {
    return <div className="card">Case not found</div>;
  }

  const lawyer = caseData.lawyer_id?.user_id;
  const request = caseData.request_id;

  return (
    <section className="card">
      <h2>Case Details</h2>

      {/* Case Overview */}
      <div className="section">
        <h3>Overview</h3>
        <p><strong>Case Type:</strong> {request?.case_type || "—"}</p>
        <p><strong>Status:</strong> {formatStatus(caseData.case_status)}</p>
        <p>
          <strong>Opened On:</strong>{" "}
          {new Date(caseData.opened_at).toLocaleDateString()}
        </p>
        {caseData.closed_at && (
          <p>
            <strong>Closed On:</strong>{" "}
            {new Date(caseData.closed_at).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Lawyer Info */}
      <div className="section">
        <h3>Your Lawyer</h3>
        <p><strong>Name:</strong> {lawyer?.full_name || "—"}</p>
        <p><strong>Phone:</strong> {lawyer?.phone_number || "—"}</p>
        <p><strong>Email:</strong> {lawyer?.email || "—"}</p>
      </div>

      {/* Issue Description */}
      <div className="section">
        <h3>Your Issue</h3>
        <p>{request?.issue_description || "—"}</p>
      </div>

      {/* Navigation */}
      <button onClick={() => navigate("/my-cases")}>
        ← Back to My Cases
      </button>
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

export default CaseDetailsPage;


