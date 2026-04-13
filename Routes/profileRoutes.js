var express = require("express")
const { getProfile, updateProfile } = require("../Controller/profileController")
const authMiddleware = require("../Middleware/authMiddleware")

var router = express.Router()

// Get current logged-in user's profile (id comes from token, not params)
router.get("/profile", authMiddleware, getProfile)

// Update current logged-in user's profile
router.put("/updateprofile", authMiddleware, updateProfile)

module.exports = router 