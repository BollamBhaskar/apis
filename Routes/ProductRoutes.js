const express = require("express");
const router = express.Router();

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

router.get("/products", getAllProducts);

router.get("/products/:id", getSingleProduct);

router.post(
  "/products",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  addNewProduct
);

router.put(
  "/products/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  updateProduct
);

router.delete(
  "/products/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

module.exports = router;