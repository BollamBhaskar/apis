const User = require("../UserSchema/UserSchema");
const bcrypt = require("bcrypt");

// ─── GET PROFILE ─────────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user }); // password excluded via select: false
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── UPDATE PROFILE ──────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email, password } = req.body;

    const updates = {};

    if (name) {
      if (name.trim().length < 2) {
        return res.status(400).json({ message: "Name must be at least 2 characters" });
      }
      updates.name = name.trim();
    }

    if (email) {
      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      // check if email is taken by another user
      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing && existing._id.toString() !== userId) {
        return res.status(409).json({ message: "Email already in use" });
      }
      updates.email = email.toLowerCase().trim();
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      updates.password = await bcrypt.hash(password, 12);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided to update" });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }); // password excluded via select: false

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getProfile, updateProfile };