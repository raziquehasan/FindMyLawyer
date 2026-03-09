import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

export default function NewRequestPage() {
  const navigate = useNavigate();

  const userId = localStorage.getItem("user_id");

  const [form, setForm] = useState({
    case_type: "",
    state: "",
    city: "",
    language: "",
    urgency: "flexible",
    issue_description: "",
    share_contact: false,
    accept_terms: false,
    phone_number: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.share_contact || !form.accept_terms) {
      setError("Please accept both required consents");
      return;
    }

    try {
      setLoading(true);

      await api.createConsultationRequest({
        user_id: userId,
        case_type: form.case_type,
        issue_description: form.issue_description,
        urgency: form.urgency,
        language: form.language,
        share_contact: form.share_contact
      });

      navigate("/my-requests");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h2>Request Legal Help</h2>
      <p>Tell us about your legal issue</p>

      <form onSubmit={handleSubmit} className="request-form">

  {/* Case Details */}
  <div className="card-section">
    <h3>Case Details</h3>

    <label>
      Case Type *
      <select name="case_type" value={form.case_type} onChange={handleChange} required>
        <option value="">Select case type</option>
        <option value="family">Family</option>
        <option value="criminal">Criminal</option>
        <option value="corporate">Corporate</option>
        <option value="property">Property</option>
        <option value="civil">Civil</option>
      </select>
    </label>

    <div className="two-col">
      <label>
        State *
        <input placeholder="Select state" disabled />
      </label>

      <label>
        City *
        <input placeholder="Select city" disabled />
      </label>
    </div>

    <label>
      Preferred Language
      <select name="language" value={form.language} onChange={handleChange}>
        <option value="">Select language (optional)</option>
        <option value="English">English</option>
        <option value="Hindi">Hindi</option>
      </select>
    </label>

    <label>
      How urgent is this? *
      <select name="urgency" value={form.urgency} onChange={handleChange}>
        <option value="flexible">Flexible</option>
        <option value="urgent">Urgent</option>
      </select>
    </label>
  </div>

  {/* Issue */}
  <div className="card-section">
    <h3>Your Legal Issue</h3>

    <label>
      <textarea
        name="issue_description"
        placeholder="Describe your legal situation..."
        minLength={10}
        value={form.issue_description}
        onChange={handleChange}
        required
      />
    </label>

    <small>Min. 10 characters</small>
  </div>

  {/* Contact */}
  <div className="card-section">
    <h3>Contact Information</h3>

    <label>
      Your Contact Number *
      <input
        name="phone_number"
        placeholder="Phone number"
        value={form.phone_number}
        onChange={handleChange}
        required
      />
    </label>

    <small>This will be shared only after a lawyer accepts your request</small>
  </div>

  {/* Consents */}
  <div className="card-section">
    <label className="radio">
      <input
        type="checkbox"
        name="share_contact"
        checked={form.share_contact}
        onChange={handleChange}
      />
      I consent to share my contact after acceptance *
    </label>

    <label className="radio">
      <input
        type="checkbox"
        name="accept_terms"
        checked={form.accept_terms}
        onChange={handleChange}
      />
      I agree to the Terms and Privacy Policy *
    </label>
  </div>

  {error && <div className="error">{error}</div>}

  <button className="primary-btn" type="submit" disabled={loading}>
    Find My Lawyer
  </button>
</form>

    </section>
  );
}
