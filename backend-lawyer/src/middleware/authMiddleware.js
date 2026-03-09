const jwt = require("jsonwebtoken");

// ===============================
// AUTH MIDDLEWARE
// ===============================
exports.protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// ===============================
// ADMIN ROLE CHECK
// ===============================
exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

// ===============================
// LAWYER ROLE CHECK
// ===============================
exports.isLawyer = (req, res, next) => {
  if (!req.user || req.user.role !== "lawyer") {
    return res.status(403).json({ message: "Lawyer access only" });
  }
  next();
};
