// routes/documents.js
const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const Document = require("../models/Document");
const Case = require("../models/Case");
const AuditLog = require("../models/AuditLog");

// Upload document for a case
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { case_id, uploaded_by, document_type, document_url, file_name, file_size, description } = req.body;

    if (!case_id || !uploaded_by || !document_type || !document_url || !file_name) {
      return res.status(400).json({ error: "Required fields: case_id, uploaded_by, document_type, document_url, file_name" });
    }

    const caseDoc = await Case.findById(case_id);
    if (!caseDoc) return res.status(404).json({ error: "Case not found" });

    const document = await Document.create({
      case_id,
      uploaded_by,
      document_type,
      document_url,
      file_name,
      file_size,
      description
    });

    await AuditLog.create({
      entity_type: "case",
      entity_id: case_id,
      action: "document_uploaded",
      performed_by: uploaded_by,
      metadata: { document_id: document._id, file_name }
    });

    res.status(201).json(document);
  })
);

// Get documents for a case
router.get(
  "/case/:caseId",
  asyncHandler(async (req, res) => {
    const { caseId } = req.params;
    const documents = await Document.find({ case_id: caseId })
      .populate("uploaded_by", "full_name phone_number")
      .sort({ createdAt: -1 });
    res.json(documents);
  })
);

// Get document details
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const document = await Document.findById(id).populate("uploaded_by", "full_name phone_number");
    if (!document) return res.status(404).json({ error: "Document not found" });
    res.json(document);
  })
);

// Delete document
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { user_id } = req.body;

    const document = await Document.findById(id);
    if (!document) return res.status(404).json({ error: "Document not found" });

    await Document.findByIdAndDelete(id);

    await AuditLog.create({
      entity_type: "case",
      entity_id: document.case_id,
      action: "document_deleted",
      performed_by: user_id,
      metadata: { document_id: id, file_name: document.file_name }
    });

    res.json({ message: "Document deleted" });
  })
);

module.exports = router;
