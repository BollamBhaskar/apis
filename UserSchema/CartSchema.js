var mongoose = require("mongoose")

var cartSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "products",
                required: true
            },
            quantity: {
                type: Number
            }
        }
    ]
})

var cart = mongoose.model("cart", cartSchema)

module.exports = cart
