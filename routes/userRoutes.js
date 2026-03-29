// ─────────────────────────────────────────────
//  routes/userRoutes.js  –  Protected User Routes
// ─────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const { getProfile, getAllUsers, updateProfile } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * GET /api/user/profile
 * Headers: Authorization: Bearer <token>
 * Returns the profile of the currently authenticated user.
 */
router.get("/profile", protect, getProfile);

/**
 * PUT /api/user/profile
 * Headers: Authorization: Bearer <token>
 * Body: { username?, email? }
 * Updates the authenticated user's profile.
 */
router.put("/profile", protect, updateProfile);

/**
 * GET /api/user/all
 * Headers: Authorization: Bearer <token>  (admin role required)
 * Returns a list of all registered users.
 */
router.get("/all", protect, authorize("admin"), getAllUsers);

module.exports = router;