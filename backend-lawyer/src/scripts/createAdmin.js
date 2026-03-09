const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
require("dotenv").config();

const createAdmin = async () => {
  try {
    console.log("Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Connected to MongoDB");

    const existingAdmin = await User.findOne({
      email: "admin@findmylawyer.com",
    });

    if (existingAdmin) {
      console.log("❗ Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "Super Admin",
      email: "admin@findmylawyer.com",
      password: hashedPassword,
      phone: "9999999999",
      role: "admin",
      isPhoneVerified: true,
    });

    console.log("✅ Admin created successfully");
    console.log("📧 Email: admin@findmylawyer.com");
    console.log("🔑 Password: admin123");

    process.exit(0);
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    process.exit(1);
  }
};

createAdmin();
