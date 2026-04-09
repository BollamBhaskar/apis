var express = require("express")
const { getProfile, updateProfile } = require("../Controller/profileController")
const authMiddleware = require("../Middleware/authMiddleware")

var router = express.Router()


router.get("/profile/:id",getProfile)

router.put("/updateprofile/:id",updateProfile)


module.exports = router 