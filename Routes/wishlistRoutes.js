var express = require("express")
var {
    getWishlist,
    addToWishlist,
    removeFromWishlist
} = require("../Controller/wishlistController")
var authMiddleware = require("../Middleware/authMiddleware")

var router = express.Router()

router.get("/wishlist", authMiddleware, getWishlist)
router.post("/wishlist", authMiddleware, addToWishlist)
router.delete("/wishlist/:productId", authMiddleware, removeFromWishlist)

module.exports = router
