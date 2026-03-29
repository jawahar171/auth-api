// ─────────────────────────────────────────────
//  controllers/authController.js
//  Handles: Register & Login
// ─────────────────────────────────────────────
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ── Helper: Generate JWT ──────────────────────
/**
 * generateToken
 * Signs a JWT containing the user's MongoDB _id.
 * Expiry is read from .env (default 7d).
 *
 * @param {string} id – MongoDB ObjectId of the user
 * @returns {string} signed JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// ─────────────────────────────────────────────
//  @route  POST /api/auth/register
//  @desc   Register a new user
//  @access Public
// ─────────────────────────────────────────────
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // ── Validate required fields ──────────────
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide username, email, and password.",
      });
    }

    // ── Check for duplicate email or username ─
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      const field = existingUser.email === email ? "Email" : "Username";
      return res.status(409).json({
        success: false,
        message: `${field} is already registered.`,
      });
    }

    // ── Create user (password hashed via pre-save hook) ─
    const user = await User.create({ username, email, password });

    // ── Generate token for immediate login after register ─
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    // Mongoose validation errors (e.g., minlength, regex)
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Server error during registration." });
  }
};

// ─────────────────────────────────────────────
//  @route  POST /api/auth/login
//  @desc   Authenticate user & return JWT
//  @access Public
// ─────────────────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ── Validate inputs ───────────────────────
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password.",
      });
    }

    // ── Find user (re-include password for comparison) ─
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      // Use a generic message to avoid leaking whether the email exists
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // ── Verify password ───────────────────────
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials.",
      });
    }

    // ── Issue JWT ─────────────────────────────
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error during login." });
  }
};

module.exports = { register, login };