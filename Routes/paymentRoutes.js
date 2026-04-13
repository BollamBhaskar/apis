var express = require("express")

var authMiddleware = require("../Middleware/authMiddleware")
var { checkout } = require("../Controller/paymentController")
var { verifyPayment } = require("../Controller/verifyPaymentController")

var router = express.Router()

router.get("/checkout", authMiddleware, checkout)
router.post("/verifypayment", authMiddleware, verifyPayment)

module.exports = router