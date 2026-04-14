var express = require("express")
var {
    getProductReviews,
    upsertMyReview,
    deleteMyReview
} = require("../Controller/reviewController")
var authMiddleware = require("../Middleware/authMiddleware")

var router = express.Router()

router.get("/products/:productId/reviews", getProductReviews)
router.post("/products/:productId/reviews", authMiddleware, upsertMyReview)
router.delete("/products/:productId/reviews", authMiddleware, deleteMyReview)

module.exports = router
