// ─────────────────────────────────────────────
//  controllers/userController.js
//  Handles: Get profile, Update profile
// ─────────────────────────────────────────────
const User = require("../models/User");

// ─────────────────────────────────────────────
//  @route  GET /api/user/profile
//  @desc   Get currently logged-in user's info
//  @access Private (requires valid JWT)
// ─────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    // req.user is populated by the protect middleware
    // We do a fresh DB fetch to ensure data is current
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Server error fetching profile." });
  }
};

// ─────────────────────────────────────────────
//  @route  GET /api/user/all
//  @desc   Get all users (admin only)
//  @access Private + Admin
// ─────────────────────────────────────────────
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({ success: false, message: "Server error fetching users." });
  }
};

// ─────────────────────────────────────────────
//  @route  PUT /api/user/profile
//  @desc   Update currently logged-in user's info
//  @access Private (requires valid JWT)
// ─────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { username, email } = req.body;

    // Build update object with only provided fields
    const updateFields = {};
    if (username) updateFields.username = username;
    if (email) updateFields.email = email;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update (username or email).",
      });
    }

    // Check for conflicts with other users
    if (email || username) {
      const conflict = await User.findOne({
        $or: [
          ...(email ? [{ email }] : []),
          ...(username ? [{ username }] : []),
        ],
        _id: { $ne: req.user.id }, // Exclude the current user
      });

      if (conflict) {
        const field = conflict.email === email ? "Email" : "Username";
        return res.status(409).json({
          success: false,
          message: `${field} is already taken.`,
        });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true } // Return updated doc & run schema validators
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Server error updating profile." });
  }
};

module.exports = { getProfile, getAllUsers, updateProfile };