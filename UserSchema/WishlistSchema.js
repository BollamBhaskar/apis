var mongoose = require("mongoose")

var wishlistSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    products: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products"
        }
    ]
})

wishlistSchema.index({ userId: 1 }, { unique: true })

var Wishlist = mongoose.model("wishlist", wishlistSchema)

module.exports = Wishlist
