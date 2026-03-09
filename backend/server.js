// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const onboardingRoutes = require("./routes/onboarding");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const requestRoutes = require("./routes/requests");
const paymentRoutes = require("./routes/payments");
const lawyerRoutes = require("./routes/lawyer");
const caseRoutes = require("./routes/cases");
const demoRoutes = require("./routes/demo");
const appointmentRoutes = require("./routes/appointments");
const documentRoutes = require("./routes/documents");
const reviewRoutes = require("./routes/reviews");
const settlementRoutes = require("./routes/settlements");


const app = express();
app.use(cors());
app.use(express.json());

// DB
connectDB();

// Health
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Routes
app.use("/auth", authRoutes);
app.use("/onboarding", onboardingRoutes);
app.use("/requests", requestRoutes);
app.use("/payments", paymentRoutes);
app.use("/lawyer", lawyerRoutes);
app.use("/cases", caseRoutes);
app.use("/demo", demoRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/documents", documentRoutes);
app.use("/reviews", reviewRoutes);
app.use("/settlements", settlementRoutes);


// 404 + error
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));