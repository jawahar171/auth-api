// ─────────────────────────────────────────────
//  models/User.js  –  User Schema & Model
// ─────────────────────────────────────────────
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * UserSchema
 * Defines the shape of User documents stored in MongoDB.
 *
 * Fields:
 *  username  – unique display name (3-30 chars)
 *  email     – unique, lowercase email address
 *  password  – bcrypt-hashed password (never returned in queries by default)
 *  role      – "user" | "admin" (for future role-based access control)
 *  createdAt – auto-managed by Mongoose timestamps option
 */
const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Never return password in query results by default
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ── Pre-save hook: Hash password before saving ─
UserSchema.pre("save", async function (next) {
  // Only hash if the password field was actually modified
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10); // 10 salt rounds is the recommended default
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * matchPassword
 * Instance method to compare a plain-text password against the stored hash.
 * Called during login to verify credentials.
 *
 * @param {string} enteredPassword – plain-text password from the login request
 * @returns {boolean}
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);