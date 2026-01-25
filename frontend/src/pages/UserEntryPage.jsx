import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function UserEntryPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    phone: "",
    alternate: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // TEMPORARY: simulate login
    //localStorage.setItem("user_id", "demo-user-123");

    navigate("/home");
  };

  return (
    <section className="card" style={{ maxWidth: 420, margin: "40px auto" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 32 }}>⚖️</div>
        <h2>Find My Lawyer</h2>
        <p style={{ color: "#555" }}>Quick Login · No OTP Required</p>
      </div>

      <form onSubmit={handleSubmit} className="form">
        <label>
          Phone Number *
          <input
            name="phone"
            placeholder="+91 XXXXXXXXXX"
            value={form.phone}
            onChange={handleChange}
            required
          />
        </label>

        <small>New? We’ll create your account automatically</small>

        <label>
          Alternative Contact
          <input
            name="alternate"
            placeholder="Optional backup number"
            value={form.alternate}
            onChange={handleChange}
          />
        </label>

        <label>
          Email (recommended)
          <input
            name="email"
            placeholder="your@email.com"
            value={form.email}
            onChange={handleChange}
          />
        </label>

        <label>
          Password *
          <input
            type="password"
            name="password"
            placeholder="Minimum 8 characters"
            value={form.password}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit">Continue</button>

        <div style={{ textAlign: "center", marginTop: 12 }}>
          <a href="#">Forgot Password?</a>
        </div>
      </form>
    </section>
  );
}

export default UserEntryPage;
