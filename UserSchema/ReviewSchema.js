var mongoose = require("mongoose")

var reviewSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "products",
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
)

reviewSchema.index({ userId: 1, product: 1 }, { unique: true })

var Review = mongoose.model("Review", reviewSchema)

module.exports = Review
