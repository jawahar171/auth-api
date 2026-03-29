// ─────────────────────────────────────────────
//  routes/authRoutes.js  –  Auth Routes
// ─────────────────────────────────────────────
const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

/**
 * POST /api/auth/register
 * Body: { username, email, password }
 * Returns: { success, message, token, user }
 */
router.post("/register", register);

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { success, message, token, user }
 */
router.post("/login", login);

module.exports = router;