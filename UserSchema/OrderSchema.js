var mongoose = require("mongoose")

var orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },

    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId, // ✅ FIXED
                ref: "product", // ✅ IMPORTANT
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],

    totalAmount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["pending", "paid", "failed"],
        default: "pending"
    },

    paymentId: String,
    orderId: String,
    signature: String

}, { timestamps: true })

module.exports = mongoose.model("Order", orderSchema)
