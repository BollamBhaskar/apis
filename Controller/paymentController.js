var Cart = require("../UserSchema/CartSchema")
var razorpay = require("../config/razorpay")

var checkout = async (req, res) => {
    try {
        const userId = req.user.userId

        // =========================
        // 1. GET CART + POPULATE
        // =========================
        const cart = await Cart.findOne({ userId })
            .populate("items.product")

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" })
        }

        // =========================
        // 2. FILTER INVALID PRODUCTS
        // =========================
        const validItems = cart.items.filter(item => item.product !== null)

        if (validItems.length === 0) {
            return res.status(400).json({ message: "No valid products in cart" })
        }

        // =========================
        // 3. CALCULATE TOTAL
        // =========================
        let totalAmount = 0

        validItems.forEach(item => {
            totalAmount += item.product.price * item.quantity
        })

        // =========================
        // 4. SAFETY CHECK
        // =========================
        if (totalAmount <= 0) {
            return res.status(400).json({ message: "Invalid total amount" })
        }

        // =========================
        // 5. CREATE RAZORPAY ORDER
        // =========================
        const order = await razorpay.orders.create({
            amount: totalAmount * 100, // convert to paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
            notes: {
                userId: userId
            }
        })

        // =========================
        // 6. RESPONSE (FRONTEND READY)
        // =========================
        res.status(200).json({
            success: true,
            message: "Order created successfully",
            orderId: order.id,
            currency: order.currency,
            amount: totalAmount,

            // Optional: send cart items also
            items: validItems.map(item => ({
                productId: item.product._id,
                title: item.product.title,
                price: item.product.price,
                quantity: item.quantity
            }))
        })

    } catch (error) {
        console.log("CHECKOUT ERROR:", error)

        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }
}

module.exports = { checkout }
