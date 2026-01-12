// models/Document.js
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    case_id: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    document_type: { type: String, required: true },
    document_url: { type: String, required: true },
    file_name: { type: String, required: true },
    file_size: { type: Number }, // in bytes
    description: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);
