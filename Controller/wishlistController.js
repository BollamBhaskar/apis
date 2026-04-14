var mongoose = require("mongoose")
var Wishlist = require("../UserSchema/WishlistSchema")
require("../UserSchema/ProductSchema")

var getWishlist = async (req, res) => {
    try {
        var userId = String(req.user.userId)
        var wishlist = await Wishlist.findOne({ userId }).populate("products")

        res.status(200).json({ wishlist: wishlist || { userId, products: [] } })
    } catch (error) {
        console.log("error", error)
        res.status(500).json({ error: "server error" })
    }
}

var addToWishlist = async (req, res) => {
    try {
        var userId = String(req.user.userId)
        var productIdRaw = req.body.productId ?? req.body.product
        if (productIdRaw == null || String(productIdRaw).trim() === "") {
            return res.status(400).json({
                message:
                    'productId is required (send JSON body: { "productId": "<mongo id>" })'
            })
        }
        var productId = String(productIdRaw).trim()
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "productId must be a valid MongoDB ObjectId" })
        }

        var wishlist = await Wishlist.findOneAndUpdate(
            { userId },
            { $addToSet: { products: productId } },
            { new: true, upsert: true }
        ).populate("products")

        return res.status(200).json({
            message: "wishlist updated",
            data: wishlist
        })
    } catch (error) {
        console.log("error", error)
        res.status(500).json({ error: "server error" })
    }
}

var removeFromWishlist = async (req, res) => {
    try {
        var userId = String(req.user.userId)
        var productIdRaw = req.params.productId ?? req.body.productId ?? req.body.product
        if (productIdRaw == null || String(productIdRaw).trim() === "") {
            return res.status(400).json({ message: "productId is required" })
        }
        var productId = String(productIdRaw).trim()
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "productId must be a valid MongoDB ObjectId" })
        }

        var wishlist = await Wishlist.findOneAndUpdate(
            { userId },
            { $pull: { products: productId } },
            { new: true }
        ).populate("products")

        if (!wishlist) {
            return res.status(200).json({
                message: "wishlist empty",
                data: { userId, products: [] }
            })
        }

        return res.status(200).json({
            message: "removed from wishlist",
            data: wishlist
        })
    } catch (error) {
        console.log("error", error)
        res.status(500).json({ error: "server error" })
    }
}

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist
}
