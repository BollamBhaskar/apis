const express = require("express");
const {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} = require("../Controller/cartController");
const authMiddleware = require("../Middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware); // all cart routes require auth

router.get("/cart", getCart);
router.post("/cart", addToCart);
router.delete("/cart/item", removeFromCart);
router.patch("/cart/quantity", updateQuantity);
router.delete("/cart", clearCart);

module.exports = router;