const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: { type: String, required: true },

    phone: { type: String, required: true },

    role: {
      type: String,
      enum: ["client", "lawyer", "admin"],
      default: "client",
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    // LAWYER DETAILS
    state: String,
    city: String,
    languages: [String],
    practiceAreas: [String],
    caseTypes: [String],
    yearsOfExperience: String,
    courtsOfPractice: [String],

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },

    // ADMIN VERIFICATION
    verificationStatus: {
      type: String,
      enum: ["PENDING", "VERIFIED", "REJECTED"],
      default: "PENDING",
    },

    verificationRemark: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
