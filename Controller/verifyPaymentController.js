const crypto = require("crypto");
const Cart = require("../UserSchema/CartSchema");
const Order = require("../UserSchema/OrderSchema");

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification fields" });
    }

    // ─── Verify signature ────────────────────────────────────────────────────
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(401).json({ message: "Payment verification failed: invalid signature" });
    }

    // ─── Create order & clear cart ───────────────────────────────────────────
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId }).populate("items.product", "price");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or already processed" });
    }

    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    const order = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      status: "paid",
      razorpayOrderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
    });

    // clear cart after successful order
    cart.items = [];
    await cart.save();

    return res.status(200).json({
      message: "Payment verified and order placed",
      orderId: order._id,
    });
  } catch (error) {
    console.error("verifyPayment error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { verifyPayment };