import React from "react";
import { useNavigate } from "react-router-dom";

export function HomePage() {
  const navigate = useNavigate();

  return (
    <div>
      {/* Header */}
      <header style={{ background: "#1f4f96", color: "#fff", padding: "16px" }}>
        <h2 style={{ margin: 0 }}>Find My Lawyer</h2>
        <small>Quick 15-min legal consultation</small>
      </header>

      {/* Main Card */}
      <section className="card" style={{ marginTop: 20 }}>
        <h2>Need Legal Advice?</h2>
        <p>Get connected with a lawyer in minutes</p>

        <div style={{ display: "flex", justifyContent: "space-around", margin: "20px 0" }}>
          <div>⏱️ 15 minutes</div>
          <div>📞 Quick call</div>
          <div>🛡️ Verified lawyers</div>
        </div>

        <button
          style={{ width: "100%", padding: 12 }}
          onClick={() => navigate("/new-request")}
        >
          Request Consultation
        </button>

        <p style={{ fontSize: 12, marginTop: 8 }}>
          Your contact details are shared only after a lawyer accepts
        </p>
      </section>

      {/* How it works */}
      <section className="card">
        <h3>How It Works</h3>

        <ol>
          <li>
            <b>Describe Your Legal Issue</b>
            <br />
            Tell us briefly what you need help with
          </li>
          <li>
            <b>Choose & Pre-book a Lawyer</b>
            <br />
            Review matched lawyers and pay to secure your slot
          </li>
          <li>
            <b>Wait for Acceptance & Connect</b>
            <br />
            Lawyer reviews and accepts, then contact details are shared
          </li>
        </ol>
      </section>

      {/* Bottom Nav (visual only for now) */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "space-around",
        padding: 10,
        background: "#fff",
        borderTop: "1px solid #ddd"
      }}>
        <span>🏠 Home</span>
        <span onClick={() => navigate("/my-requests")}>⏱️ Requests</span>
        <span onClick={() => navigate("/my-cases")}>📂 Cases</span>
        <span>💬 Feedback</span>
        <span>👤 Profile</span>
      </nav>
    </div>
  );
}

export default HomePage;