var mongoose = require("mongoose")
var Cart = require("../UserSchema/CartSchema")
require("../UserSchema/ProductSchema")

function sanitizeCartItems(cart) {
    if (!cart || !cart.items || cart.items.length === 0) return false
    const before = cart.items.length
    cart.items = cart.items.filter((line) => line.product != null)
    return cart.items.length !== before
}

// ===================
// GET CART
// ===================

var getCart = async (req, res) => {
    try {
        var userId = String(req.user.userId)
        var cart = await Cart.findOne({ userId }).populate("items.product")

        if (cart && sanitizeCartItems(cart)) {
            await cart.save()
        }

        res.status(200).json({ cart })

    } catch (error) {
        console.log("error", error)
        res.status(500).json({ error: "server error" })
    }
}


// ===================
// ADD TO CART
// ===================
var addToCart = async (req, res) => {
    try {
        var userId = String(req.user.userId)
        var productIdRaw = req.body.productId ?? req.body.product
        if (productIdRaw == null || String(productIdRaw).trim() === "") {
            return res.status(400).json({
                message: "productId is required (send JSON body: { \"productId\": \"<mongo id>\" })"
            })
        }
        var productId = String(productIdRaw).trim()
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "productId must be a valid MongoDB ObjectId" })
        }

        var cart = await Cart.findOne({ userId })

        // 🟢 If cart does not exist → create & return
        if (!cart) {
            cart = await Cart.create({
                userId,
                items: [
                    {
                        product: productId,
                        quantity: 1
                    }
                ]
            })

            return res.status(201).json({
                message: "cart created",
                data: cart
            })
        }

        // 🟢 If cart exists → update
        var existingItem = cart.items.find(
            item => item.product == productId
        )

        if (existingItem) {
            existingItem.quantity += 1
        } else {
            cart.items.push({
                product: productId,
                quantity: 1
            })
        }

        await cart.save()

        return res.status(200).json({
            message: "cart updated",
            data: cart
        })

    } catch (error) {
        console.log("error", error)
        res.status(500).json({ error: "server error" })
    }
}

module.exports = {
    getCart,
    addToCart,
    sanitizeCartItems
}