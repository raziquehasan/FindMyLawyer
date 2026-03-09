const supabase = require("../config/supabase");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const twilioService = require("../utils/twilio");

// Temporary in-memory store
global.verifiedPhones = global.verifiedPhones || {};

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

// ===========================
// SEND OTP
// ===========================
exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone number required" });
    }

    await twilioService.sendOTP(phone);

    res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ===========================
// VERIFY OTP
// ===========================
exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP required" });
    }

    const valid = await twilioService.verifyOTP(phone, otp);

    if (!valid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Normalize and mark phone as verified
    const normalizedPhone = normalizePhoneNumber(phone);
    global.verifiedPhones[normalizedPhone] = true;

    res.json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ===========================
// REGISTER LAWYER
// ===========================
exports.registerLawyer = async (req, res) => {
  try {
    const { name, email, password, phone, enrollmentNumber } = req.body;

    if (!name || !email || !password || !phone || !enrollmentNumber) {
      return res.status(400).json({ message: "All fields required" });
    }

    // Normalize phone number for OTP check
    const normalizedPhone = normalizePhoneNumber(phone);
    
    // OTP CHECK
    if (!global.verifiedPhones[normalizedPhone]) {
      return res.status(400).json({
        message: "Phone number not verified via OTP. Please verify your phone number first.",
      });
    }

    // Check existing user
    const { data: existing } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Insert user (store normalized phone)
    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([
        {
          name,
          email,
          phone: normalizedPhone, // Store normalized phone
          password: hashed,
          role: "lawyer",
        },
      ])
      .select()
      .single();

    if (userError) {
      console.error("User creation error:", userError);
      
      // Provide helpful error message for missing column
      if (userError.message && userError.message.includes("password")) {
        return res.status(500).json({ 
          message: "Database schema error: password column missing. Please run the migration script to add the password column to the users table.",
          error: userError.message 
        });
      }
      
      throw userError;
    }

    // Insert lawyer profile
    const { error: profileError } = await supabase
      .from("lawyer_profiles")
      .insert([
        {
          user_id: user.id,
          enrollment_number: enrollmentNumber,
          status: "PENDING",
        },
      ]);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      throw profileError;
    }

    // Remove OTP verification
    delete global.verifiedPhones[normalizedPhone];

    res.status(201).json({
      success: true,
      message: "Lawyer registered successfully",
      userId: user.id,
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: err.message });
  }
};

// ===========================
// LOGIN
// ===========================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message });
  }
};