var mongoose = require("mongoose")

var cartSchema = new mongoose.Schema({
    userId: {
        type: String
    },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId, // ✅ FIXED
                ref: "product" // ✅ IMPORTANT for populate
            },
            quantity: {
                type: Number
            }
        }
    ]
})

var cart = mongoose.model("cart", cartSchema)

module.exports = cart
