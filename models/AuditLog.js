// models/AuditLog.js
const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    entity_type: { type: String, enum: ["request", "case", "appointment", "payment", "user", "lawyer"], required: true },
    entity_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    action: { type: String, required: true },
    performed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
    ip_address: { type: String },
    user_agent: { type: String }
  },
  { timestamps: true }
);

auditLogSchema.index({ entity_type: 1, entity_id: 1 });
auditLogSchema.index({ performed_by: 1 });
auditLogSchema.index({ createdAt: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
