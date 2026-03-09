const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const otpStore = new Map();

// Helper function to normalize phone number to E.164 format
const normalizePhoneNumber = (phone) => {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, "");
  
  // If it starts with 0, remove it
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  
  // If it doesn't start with country code, assume India (+91)
  if (!cleaned.startsWith("91") && cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  
  // Add + prefix
  return "+" + cleaned;
};

exports.sendOTP = async (phone) => {
  try {
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phone);
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await client.messages.create({
      body: `Your FindMyLawyer OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: normalizedPhone,
    });

    // Store OTP with normalized phone as key
    otpStore.set(normalizedPhone, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min
    });

    console.log(`OTP sent to ${normalizedPhone}`);
    return true;
  } catch (error) {
    console.error("Twilio error:", error);
    throw new Error(`Failed to send OTP: ${error.message}`);
  }
};

exports.verifyOTP = (phone, otp) => {
  // Normalize phone number for lookup
  const normalizedPhone = normalizePhoneNumber(phone);
  const record = otpStore.get(normalizedPhone);

  if (!record) {
    console.log(`No OTP record found for ${normalizedPhone}`);
    return false;
  }
  
  if (Date.now() > record.expiresAt) {
    otpStore.delete(normalizedPhone);
    console.log(`OTP expired for ${normalizedPhone}`);
    return false;
  }

  if (record.otp !== otp) {
    console.log(`Invalid OTP for ${normalizedPhone}`);
    return false;
  }

  otpStore.delete(normalizedPhone);
  console.log(`OTP verified successfully for ${normalizedPhone}`);
  return true;
};
