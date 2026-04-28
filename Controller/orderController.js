const mongoose = require("mongoose");
const Order = require("../UserSchema/OrderSchema");

// ─── GET ALL ORDERS (for logged-in user) ─────────────────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.find({ userId })
      .populate("items.product", "title image price")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ orders });
  } catch (error) {
    console.error("getAllOrders error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── GET SINGLE ORDER ────────────────────────────────────────────────────────
const getSingleOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findOne({ _id: id, userId })
      .populate("items.product", "title image price")
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("getSingleOrder error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllOrders, getSingleOrder };