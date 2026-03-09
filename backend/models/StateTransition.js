// models/StateTransition.js
const mongoose = require("mongoose");

const stateTransitionSchema = new mongoose.Schema(
  {
    entity_type: { type: String, enum: ["request", "case", "appointment", "payment"], required: true },
    entity_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    from_state: { type: String },
    to_state: { type: String, required: true },
    triggered_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("StateTransition", stateTransitionSchema);