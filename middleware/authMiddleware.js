// ─────────────────────────────────────────────
//  middleware/authMiddleware.js  –  JWT Guard
// ─────────────────────────────────────────────
const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * protect
 * Express middleware that:
 *  1. Reads the Authorization header (expects "Bearer <token>")
 *  2. Verifies the JWT using the secret from .env
 *  3. Looks up the matching user in MongoDB
 *  4. Attaches the user document to req.user for downstream handlers
 *
 * If any step fails the request is rejected with 401 Unauthorized.
 */
const protect = async (req, res, next) => {
  let token;

  // ── Step 1: Extract token from Authorization header ──
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    // Header format: "Bearer eyJhbGci..."
    token = authHeader.split(" ")[1];
  }

  // No token found → reject immediately
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided. Please log in.",
    });
  }

  try {
    // ── Step 2: Verify & decode the token ───────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: "...", iat: ..., exp: ... }

    // ── Step 3: Fetch the user from DB (exclude password) ─
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    // ── Step 4: Attach user to request object ────────────
    req.user = user;
    next(); // Hand off to the next middleware / route handler
  } catch (error) {
    // jwt.verify throws on expiry or invalid signature
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please log in again.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Invalid token. Authorization denied.",
    });
  }
};

/**
 * authorize
 * Factory middleware for role-based access control.
 * Usage: router.get('/admin', protect, authorize('admin'), handler)
 *
 * @param {...string} roles – allowed roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };