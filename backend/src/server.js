require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const lawyerRoutes = require("./routes/lawyerRoutes");

const app = express();

// ✅ CORS Configuration - MUST BE BEFORE OTHER MIDDLEWARE
app.use(cors({
  origin: "http://localhost:5173", // Your frontend URL
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body parser middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/lawyer", lawyerRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("Find My Lawyer API running 🚀");
});

// Start server (for local development)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});