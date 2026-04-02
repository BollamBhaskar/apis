var express = require("express")
const { getProfile, updateProfile } = require("../Controller/profileController")
const authMiddleware = require("../Middleware/authMiddleware")
const adminMiddleware = require("../Middleware/adminMiddleware")

var router = express.Router()


router.get("/profile/:id",getProfile)

router.put("/updateprofile/:id",authMiddleware,adminMiddleware,updateProfile)


module.exports = router