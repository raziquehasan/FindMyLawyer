// services/otpService.js
const otpStore = new Map();

function sendOtp(phone) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000 });
  console.log(`[DEBUG] OTP for ${phone}: ${code}`);
  return code;
}

function verifyOtp(phone, code) {
  const entry = otpStore.get(phone);
  if (!entry) return false;
  if (Date.now() > entry.expiresAt) return false;
  if (entry.code !== code) return false;
  otpStore.delete(phone);
  return true;
}

module.exports = { sendOtp, verifyOtp };