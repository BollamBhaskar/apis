var mongoose = require("mongoose")
var Review = require("../UserSchema/ReviewSchema")
var Product = require("../UserSchema/ProductSchema")
var User = require("../UserSchema/UserSchema")

function parseUserId(req) {
    var raw = req.user && req.user.userId
    if (raw == null) return null
    var s = String(raw)
    if (!mongoose.Types.ObjectId.isValid(s)) return null
    return new mongoose.Types.ObjectId(s)
}

async function reviewSummaryForProduct(productId) {
    var agg = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(String(productId)) } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: "$rating" },
                count: { $sum: 1 }
            }
        }
    ])
    if (!agg.length) {
        return { averageRating: null, count: 0 }
    }
    return {
        averageRating: Math.round(agg[0].averageRating * 10) / 10,
        count: agg[0].count
    }
}

var getProductReviews = async (req, res) => {
    try {
        var productId = String(req.params.productId || "").trim()
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product id" })
        }

        var exists = await Product.findById(productId).select("_id")
        if (!exists) {
            return res.status(404).json({ message: "Product not found" })
        }

        var limit = Math.min(parseInt(req.query.limit, 10) || 20, 100)
        var page = Math.max(parseInt(req.query.page, 10) || 1, 1)
        var skip = (page - 1) * limit

        var [items, total, summary] = await Promise.all([
            Review.find({ product: productId })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Review.countDocuments({ product: productId }),
            reviewSummaryForProduct(productId)
        ])

        var userIds = [...new Set(items.map((r) => String(r.userId)))]
        var users = await User.find({ _id: { $in: userIds } })
            .select("name email")
            .lean()
        var userById = new Map(users.map((u) => [String(u._id), u]))

        var reviews = items.map((r) => ({
            _id: r._id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            user: userById.get(String(r.userId)) || { _id: r.userId }
        }))

        res.status(200).json({
            summary,
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit) || 0
            }
        })
    } catch (error) {
        console.log("error", error)
        res.status(500).json({ error: "server error" })
    }
}

var upsertMyReview = async (req, res) => {
    try {
        var userId = parseUserId(req)
        if (!userId) {
            return res.status(400).json({ message: "Invalid user in token" })
        }

        var productId = String(req.params.productId || "").trim()
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product id" })
        }

        var product = await Product.findById(productId).select("_id")
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }

        var ratingRaw = req.body.rating
        var rating = Number(ratingRaw)
        if (!Number.isFinite(rating) || rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return res.status(400).json({ message: "rating must be an integer from 1 to 5" })
        }

        var comment =
            req.body.comment != null && req.body.comment !== undefined
                ? String(req.body.comment)
                : ""

        var review = await Review.findOneAndUpdate(
            { userId, product: productId },
            { $set: { rating, comment } },
            { new: true, upsert: true, runValidators: true }
        )

        var summary = await reviewSummaryForProduct(productId)

        res.status(200).json({
            message: "review saved",
            review,
            summary
        })
    } catch (error) {
        console.log("error", error)
        res.status(500).json({ error: "server error" })
    }
}

var deleteMyReview = async (req, res) => {
    try {
        var userId = parseUserId(req)
        if (!userId) {
            return res.status(400).json({ message: "Invalid user in token" })
        }

        var productId = String(req.params.productId || "").trim()
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: "Invalid product id" })
        }

        var deleted = await Review.findOneAndDelete({ userId, product: productId })
        var summary = await reviewSummaryForProduct(productId)

        if (!deleted) {
            return res.status(404).json({ message: "No review found for this product", summary })
        }

        res.status(200).json({ message: "review deleted", summary })
    } catch (error) {
        console.log("error", error)
        res.status(500).json({ error: "server error" })
    }
}

module.exports = {
    getProductReviews,
    upsertMyReview,
    deleteMyReview,
    reviewSummaryForProduct
}
