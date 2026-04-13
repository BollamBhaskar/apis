var Cart = require("../UserSchema/CartSchema")
var Product = require("../UserSchema/ProductSchema")
var { sanitizeCartItems } = require("./cartController")
var razorpay = require("../config/razorpay")

function unitPrice(product) {
    if (!product) return null
    const n = Number(product.price)
    if (!Number.isFinite(n) || n < 0) return null
    return n
}

var checkout = async (req, res) => {
    try {
        const userId = String(req.user.userId)

        // =========================
        // 1. GET CART (manual product lookup avoids populate/ref mismatches)
        // =========================
        const cart = await Cart.findOne({ userId })

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" })
        }

        if (sanitizeCartItems(cart)) {
            await cart.save()
        }
        if (!cart.items.length) {
            return res.status(400).json({
                message:
                    "Cart had no valid product references. Add items with POST /addcart and JSON body { \"productId\": \"<id>\" } (field name must be productId or product)."
            })
        }

        const productIds = cart.items.map((line) => line.product).filter(Boolean)
        const products = await Product.find({ _id: { $in: productIds } })
        const productById = new Map(products.map((p) => [String(p._id), p]))

        // =========================
        // 2. BUILD LINES WITH RESOLVED PRODUCTS + PRICE
        // =========================
        const validItems = []
        for (const line of cart.items) {
            if (!line.product) continue
            const product = productById.get(String(line.product))
            if (!product) continue
            const price = unitPrice(product)
            if (price == null) continue
            validItems.push({
                quantity: line.quantity,
                product
            })
        }

        if (validItems.length === 0) {
            return res.status(400).json({ message: "No valid products in cart" })
        }

        // =========================
        // 3. CALCULATE TOTAL
        // =========================
        let totalAmount = 0

        validItems.forEach((row) => {
            totalAmount += unitPrice(row.product) * row.quantity
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
                userId: String(userId)
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
            items: validItems.map((row) => ({
                productId: row.product._id,
                title: row.product.title,
                price: unitPrice(row.product),
                quantity: row.quantity
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
