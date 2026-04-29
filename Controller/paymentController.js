const Cart = require("../UserSchema/CartSchema");
const razorpay = require("../config/razorpay");

const checkout = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId }).populate("items.product", "price title stock");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.product;

      if (!product) {
        return res.status(400).json({ message: "One or more products no longer exist" });
      }

      if (item.quantity > product.stock) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.title}". Only ${product.stock} left in stock.`,
        });
      }

      totalAmount += product.price * item.quantity;
    }

    if (totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid cart total" });
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Payment gateway is not configured" });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // paise, must be integer
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      notes: { userId: String(userId) },
    });

    return res.status(200).json({
      message: "Checkout initiated",
      order,
      totalAmount,
    });
  } catch (error) {
    console.error("checkout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { checkout };