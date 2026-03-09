// models/LawyerPracticeForum.js
const mongoose = require("mongoose");

const lawyerPracticeForumSchema = new mongoose.Schema(
  {
    lawyer_id: { type: mongoose.Schema.Types.ObjectId, ref: "LawyerProfile", required: true },
    forum: {
      type: String,
      enum: ["district_court", "high_court", "supreme_court", "nclt", "consumer_forum", "family_court", "labour_court", "tribunal", "other"],
      required: true
    }
  },
  { timestamps: true }
);

lawyerPracticeForumSchema.index({ lawyer_id: 1, forum: 1 }, { unique: true });

module.exports = mongoose.model("LawyerPracticeForum", lawyerPracticeForumSchema);
