// models/ClientProfile.js
const mongoose = require("mongoose");

const clientProfileSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    city: { type: String },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    preferred_language: { type: String, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ClientProfile", clientProfileSchema);