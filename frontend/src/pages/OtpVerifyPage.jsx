// src/pages/OtpVerifyPage.jsx
import React, { useState } from 'react';
import { api } from '../api.js';
import { useLocation } from 'react-router-dom';

export default function OtpVerifyPage() {
  const location = useLocation();
  const [phone, setPhone] = useState(location.state?.phone_number || '');
  const [otp, setOtp] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.verifyOtp({
        phone_number: phone,
        otp_code: otp,
      });
      setResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card">
      <h2>Verify OTP</h2>
      <form onSubmit={handleSubmit} className="form">
        <label>
          Phone number
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </label>
        <label>
          OTP code
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </label>

        {error && <div className="error">{error}</div>}
        {result && (
          <div className="success">
            Logged in as <strong>{result.role}</strong>, user ID:{' '}
            <code>{result.user_id}</code>
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </section>
  );
}