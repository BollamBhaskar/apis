const express = require("express");
const { getProfile, updateProfile } = require("../Controller/profileController");
const authMiddleware = require("../Middleware/authMiddleware");

const router = express.Router();

router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;