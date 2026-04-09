const express = require("express");

const {
  getAllProducts,
  getSingleProduct,
  addNewProduct,
  updateProduct,
  deleteProduct
} = require("../Controller/ProductController");

const authMiddleware = require("../Middleware/authMiddleware");
const adminMiddleware = require("../Middleware/adminMiddleware");
const upload = require("../Middleware/imageMiddleware");

const router = express.Router();

/**
 * @route   GET /products
 * @desc    Get all products
 * @access  Private
 */
router.get("/products", authMiddleware, getAllProducts);

/**
 * @route   GET /products/:id
 * @desc    Get single product
 * @access  Private (Admin)
 */
router.get("/products/:id", authMiddleware, getSingleProduct);

/**
 * @route   POST /products
 * @desc    Add new product
 * @access  Private (Admin)
 */
router.post(
  "/products",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  addNewProduct
);

/**
 * @route   PUT /products/:id
 * @desc    Update product
 * @access  Private (Admin)
 */
router.put(
  "/products/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"), // allows image update
  updateProduct
);

/**
 * @route   DELETE /products/:id
 * @desc    Delete product
 * @access  Private (Admin)
 */
router.delete(
  "/products/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

module.exports = router;