// src/pages/ClientSignupPage.jsx
import React, { useState } from 'react';
import { api } from '../api.js';
import { useNavigate } from 'react-router-dom';

export default function ClientSignupPage() {
  const [form, setForm] = useState({
    full_name: '',
    phone_number: '',
    state: '',
    city: '',
    pincode: '',
    preferred_language: 'English',
    accept_terms: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.clientSignup(form);
      setUserId(res.user_id || res._id || '');
      // OTP is logged in backend console as per README
      navigate('/verify-otp', { state: { phone_number: form.phone_number } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h2>Client Signup</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Full name
          <input
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Phone number
          <input
            name="phone_number"
            value={form.phone_number}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          State
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          City
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Pincode
          <input
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Preferred language
          <select
            name="preferred_language"
            value={form.preferred_language}
            onChange={handleChange}
          >
            <option>English</option>
            <option>Hindi</option>
          </select>
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            name="accept_terms"
            checked={form.accept_terms}
            onChange={handleChange}
            required
          />
          I accept Terms & Privacy Policy
        </label>

        {error && <div className="error">{error}</div>}
        {userId && (
          <div className="info">
            User created with ID: <code>{userId}</code>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Sign up'}
        </button>
      </form>
    </section>
  );
}