const Cart = require("../UserSchema/CartSchema");
const razorpay = require("../config/razorpay");

const normalizeStock = (rawStock) => {
  const stock = Number(rawStock);
  return Number.isFinite(stock) ? Math.max(0, stock) : 0;
};

const checkout = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId }).populate("items.product", "price title stock");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const removedItems = [];
    const adjustedItems = [];
    const normalizedItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = item.product;
      const productId = item.product?._id?.toString() || item.product?.toString();

      const stock = normalizeStock(product?.stock);
      if (!product || stock <= 0) {
        removedItems.push({
          productId,
          title: product?.title || "Unavailable product",
        });
        continue;
      }

      const allowedQty = Math.min(item.quantity, stock);
      if (allowedQty < item.quantity) {
        adjustedItems.push({
          productId,
          title: product.title,
          requested: item.quantity,
          available: stock,
        });
      }

      normalizedItems.push({
        product: product._id,
        quantity: allowedQty,
      });
      totalAmount += product.price * allowedQty;
    }

    const cartChanged = removedItems.length > 0 || adjustedItems.length > 0;
    if (cartChanged) {
      cart.items = normalizedItems;
      await cart.save();
    }

    if (totalAmount <= 0) {
      return res.status(400).json({
        message: "All unavailable items were removed from cart. Please review your cart and try again.",
        cartUpdated: true,
        removedItems,
      });
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
      message: cartChanged
        ? "Checkout initiated after syncing cart with current stock"
        : "Checkout initiated",
      order,
      totalAmount,
      cartUpdated: cartChanged,
      removedItems,
      adjustedItems,
    });
  } catch (error) {
    console.error("checkout error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { checkout };