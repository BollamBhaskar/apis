// const mongoose = require("mongoose");
// const Cart = require("../UserSchema/CartSchema");
// const Product = require("../UserSchema/ProductSchema");

// // ─── GET CART ────────────────────────────────────────────────────────────────
// const getCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     const cart = await Cart.findOne({ userId }).populate("items.product", "title price image stock");

//     if (!cart) {
//       return res.status(200).json({ cart: { items: [], total: 0 } });
//     }

//     const syncedItems = [];
//     let cartUpdated = false;

//     for (const item of cart.items) {
//       if (!item.product || item.product.stock <= 0) {
//         cartUpdated = true;
//         continue;
//       }

//       const allowedQty = Math.min(item.quantity, item.product.stock);
//       if (allowedQty !== item.quantity) {
//         cartUpdated = true;
//       }

//       syncedItems.push({
//         product: item.product._id,
//         quantity: allowedQty,
//       });
//     }

//     if (cartUpdated) {
//       cart.items = syncedItems;
//       await cart.save();
//       await cart.populate("items.product", "title price image stock");
//     }

//     // compute total on the fly
//     const total = cart.items.reduce((sum, item) => {
//       const price = item.product?.price || 0;
//       return sum + price * item.quantity;
//     }, 0);

//     return res.status(200).json({ cart, total, cartUpdated });
//   } catch (error) {
//     console.error("getCart error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── ADD TO CART ─────────────────────────────────────────────────────────────
// const addToCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { productId } = req.body;

//     if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ message: "Valid product ID is required" });
//     }

//     const product = await Product.findById(productId).select("stock");
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     let cart = await Cart.findOne({ userId });

//     if (!cart) {
//       if (product.stock < 1) {
//         return res.status(400).json({ message: "Insufficient stock" });
//       }

//       cart = await Cart.create({
//         userId,
//         items: [{ product: productId, quantity: 1 }],
//       });
//       return res.status(201).json({ message: "Cart created", cart });
//     }

//     const item = cart.items.find((i) => i.product.toString() === productId);

//     if (item) {
//       if (item.quantity + 1 > product.stock) {
//         return res.status(400).json({
//           message: `Insufficient stock. Only ${product.stock} item(s) available`,
//         });
//       }
//       item.quantity += 1;
//     } else {
//       if (product.stock < 1) {
//         return res.status(400).json({ message: "Insufficient stock" });
//       }
//       cart.items.push({ product: productId, quantity: 1 });
//     }

//     await cart.save();
//     return res.status(200).json({ message: "Cart updated", cart });
//   } catch (error) {
//     console.error("addToCart error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── REMOVE FROM CART ────────────────────────────────────────────────────────
// const removeFromCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { productId } = req.body;

//     if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ message: "Valid product ID is required" });
//     }

//     const cart = await Cart.findOne({ userId });
//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }

//     const initialLength = cart.items.length;
//     cart.items = cart.items.filter((item) => item.product.toString() !== productId);

//     if (cart.items.length === initialLength) {
//       return res.status(404).json({ message: "Item not found in cart" });
//     }

//     await cart.save();
//     return res.status(200).json({ message: "Item removed", cart });
//   } catch (error) {
//     console.error("removeFromCart error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── UPDATE QUANTITY ─────────────────────────────────────────────────────────
// const updateQuantity = async (req, res) => {
//   try {
//     const userId = req.user.userId;
//     const { productId, action } = req.body;

//     if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ message: "Valid product ID is required" });
//     }

//     if (!["inc", "dec"].includes(action)) {
//       return res.status(400).json({ message: "Action must be 'inc' or 'dec'" });
//     }

//     const cart = await Cart.findOne({ userId });
//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }

//     const item = cart.items.find((i) => i.product.toString() === productId);
//     if (!item) {
//       return res.status(404).json({ message: "Item not in cart" });
//     }

//     if (action === "inc") {
//       const product = await Product.findById(productId).select("stock");
//       if (!product) {
//         return res.status(404).json({ message: "Product not found" });
//       }
//       if (item.quantity + 1 > product.stock) {
//         return res.status(400).json({
//           message: `Insufficient stock. Only ${product.stock} item(s) available`,
//         });
//       }
//       item.quantity += 1;
//     } else {
//       item.quantity -= 1;
//       if (item.quantity <= 0) {
//         cart.items = cart.items.filter((i) => i.product.toString() !== productId);
//       }
//     }

//     await cart.save();
//     return res.status(200).json({ message: "Quantity updated", cart });
//   } catch (error) {
//     console.error("updateQuantity error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── CLEAR CART ──────────────────────────────────────────────────────────────
// const clearCart = async (req, res) => {
//   try {
//     const userId = req.user.userId;

//     const cart = await Cart.findOne({ userId });
//     if (!cart) {
//       return res.status(404).json({ message: "Cart not found" });
//     }

//     cart.items = [];
//     await cart.save();

//     return res.status(200).json({ message: "Cart cleared" });
//   } catch (error) {
//     console.error("clearCart error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports = { getCart, addToCart, removeFromCart, updateQuantity, clearCart };






const mongoose = require("mongoose");
const Cart = require("../UserSchema/CartSchema");
const Product = require("../UserSchema/ProductSchema");

const normalizeStock = (rawStock) => {
  const stock = Number(rawStock);
  return Number.isFinite(stock) ? Math.max(0, stock) : 0;
};

// ─── GET CART ────────────────────────────────────────────────────────────────
const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId }).populate("items.product", "title price image stock");

    if (!cart) {
      return res.status(200).json({ cart: { items: [], total: 0 } });
    }

    const syncedItems = [];
    let cartUpdated = false;

    for (const item of cart.items) {
      const stock = normalizeStock(item.product?.stock);
      if (!item.product || stock <= 0) {
        cartUpdated = true;
        continue;
      }
      const allowedQty = Math.min(item.quantity, stock);
      if (allowedQty !== item.quantity) {
        cartUpdated = true;
      }
      syncedItems.push({
        product: item.product._id,
        quantity: allowedQty,
      });
    }

    if (cartUpdated) {
      cart.items = syncedItems;
      await cart.save();
      await cart.populate("items.product", "title price image stock");
    }

    const total = cart.items.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    return res.status(200).json({ cart, total, cartUpdated });
  } catch (error) {
    console.error("getCart error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── ADD TO CART ─────────────────────────────────────────────────────────────
const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Valid product ID is required" });
    }

    const product = await Product.findById(productId).select("stock");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const stock = normalizeStock(product.stock);

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      if (stock < 1) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      cart = await Cart.create({
        userId,
        items: [{ product: productId, quantity: 1 }],
      });
      return res.status(201).json({ message: "Cart created", cart });
    }

    const item = cart.items.find((i) => i.product.toString() === productId);

    if (item) {
      const remaining = stock - item.quantity;
      if (remaining < 1) {
        return res.status(400).json({
          message: `Insufficient stock. Only ${stock} item(s) available`,
        });
      }
      item.quantity += 1;
    } else {
      if (stock < 1) {
        return res.status(400).json({ message: "Insufficient stock" });
      }
      cart.items.push({ product: productId, quantity: 1 });
    }

    await cart.save();
    return res.status(200).json({ message: "Cart updated", cart });
  } catch (error) {
    console.error("addToCart error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── REMOVE FROM CART ────────────────────────────────────────────────────────
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Valid product ID is required" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const initialLength = cart.items.length;
    cart.items = cart.items.filter((item) => item.product.toString() !== productId);

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    await cart.save();
    return res.status(200).json({ message: "Item removed", cart });
  } catch (error) {
    console.error("removeFromCart error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── UPDATE QUANTITY ─────────────────────────────────────────────────────────
const updateQuantity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, action } = req.body;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Valid product ID is required" });
    }

    if (!["inc", "dec"].includes(action)) {
      return res.status(400).json({ message: "Action must be 'inc' or 'dec'" });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find((i) => i.product.toString() === productId);
    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    if (action === "inc") {
      const product = await Product.findById(productId).select("stock");
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const stock = normalizeStock(product.stock);
      const remaining = stock - item.quantity;
      if (remaining < 1) {
        return res.status(400).json({
          message: `Insufficient stock. Only ${stock} item(s) available`,
        });
      }
      item.quantity += 1;
    } else {
      item.quantity -= 1;
      if (item.quantity <= 0) {
        cart.items = cart.items.filter((i) => i.product.toString() !== productId);
      }
    }

    await cart.save();
    return res.status(200).json({ message: "Quantity updated", cart });
  } catch (error) {
    console.error("updateQuantity error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── CLEAR CART ──────────────────────────────────────────────────────────────
const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();
    return res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    console.error("clearCart error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getCart, addToCart, removeFromCart, updateQuantity, clearCart };
