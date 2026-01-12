// models/Admin.js
const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    access_level: { type: String, enum: ["full", "moderator"], default: "moderator" },
    permissions: [{ type: String }] // e.g., "approve_lawyers", "process_refunds", etc.
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
