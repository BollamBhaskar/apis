var Cart = require("../UserSchema/CartSchema")

// ===================
// GET CART
// ===================

var getCart = async (req, res) => {
    try {
        var userId = req.user.id
        var cart = await Cart.findOne({ userId })

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
        var userId = req.user.id
        var { productId } = req.body

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
    addToCart
}