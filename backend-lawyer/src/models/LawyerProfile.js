const mongoose = require("mongoose");

const lawyerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    enrollmentNumber: {
      type: String,
      required: true,
    },

    certificateUrl: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LawyerProfile", lawyerProfileSchema);
