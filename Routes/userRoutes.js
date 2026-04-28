const express = require("express");
const { registerUser, login } = require("../Controller/userController");

const router = express.Router();

// auth limiter applied in index.js via startServer
router.post("/register", registerUser);
router.post("/login", login);

module.exports = router;