// const mongoose = require("mongoose");
// const Product = require("../UserSchema/ProductSchema");
// const { uploadToCloudinary } = require("../helper/cloudinaryhelper");
// const { client } = require("../config/redisClient");
// const fs = require("fs");

// const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 3600;

// // helper: safely delete a local temp file
// const deleteTempFile = (filePath) => {
//   try {
//     if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
//   } catch (err) {
//     console.error("Failed to delete temp file:", err.message);
//   }
// };

// // helper: invalidate all paginated product cache keys
// const invalidateProductCache = async (productId = null) => {
//   try {
//     const keys = await client.keys("allproducts:*");
//     if (keys.length > 0) await client.del(keys);
//     if (productId) await client.del(`product:${productId}`);
//   } catch (err) {
//     console.error("Cache invalidation error:", err.message);
//   }
// };

// // ─── GET ALL PRODUCTS ────────────────────────────────────────────────────────
// const getAllProducts = async (req, res) => {
//   try {
//     let page = parseInt(req.query.page) || 1;
//     let limit = parseInt(req.query.limit) || 10;

//     if (page < 1) page = 1;
//     if (limit < 1 || limit > 100) limit = 10;

//     const skip = (page - 1) * limit;
//     const cacheKey = `allproducts:${page}:${limit}`;

//     const cached = await client.get(cacheKey);
//     if (cached) {
//       return res.status(200).json({ source: "cache", ...JSON.parse(cached) });
//     }

//     const [products, total] = await Promise.all([
//       Product.find().skip(skip).limit(limit).lean(),
//       Product.countDocuments(),
//     ]);

//     const payload = {
//       products,
//       pagination: { page, limit, total, pages: Math.ceil(total / limit) },
//     };

//     await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(payload));

//     return res.status(200).json({ source: "db", ...payload });
//   } catch (error) {
//     console.error("getAllProducts error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── GET SINGLE PRODUCT ──────────────────────────────────────────────────────
// const getSingleProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid product ID" });
//     }

//     const cacheKey = `product:${id}`;
//     const cached = await client.get(cacheKey);
//     if (cached) {
//       return res.status(200).json({ source: "cache", product: JSON.parse(cached) });
//     }

//     const product = await Product.findById(id).lean();
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(product));

//     return res.status(200).json({ source: "db", product });
//   } catch (error) {
//     console.error("getSingleProduct error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── ADD PRODUCT ─────────────────────────────────────────────────────────────
// const addNewProduct = async (req, res) => {
//   let filePath = req.file?.path;
//   try {
//     const { title, description, price, stock } = req.body;

//     if (!title || !description || price === undefined) {
//       deleteTempFile(filePath);
//       return res.status(400).json({ message: "Title, description, and price are required" });
//     }

//     const parsedPrice = parseFloat(price);
//     if (isNaN(parsedPrice) || parsedPrice < 0) {
//       deleteTempFile(filePath);
//       return res.status(400).json({ message: "Price must be a non-negative number" });
//     }

//     if (!req.file) {
//       return res.status(400).json({ message: "Product image is required" });
//     }

//     const result = await uploadToCloudinary(filePath);
//     deleteTempFile(filePath);
//     filePath = null;

//     const product = await Product.create({
//       title: title.trim(),
//       description: description.trim(),
//       price: parsedPrice,
//       stock: parseInt(stock) || 0,
//       image: { publicId: result.publicId, url: result.url },
//     });

//     await invalidateProductCache();

//     return res.status(201).json({ message: "Product added", product });
//   } catch (error) {
//     deleteTempFile(filePath);
//     console.error("addNewProduct error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── UPDATE PRODUCT ──────────────────────────────────────────────────────────
// const updateProduct = async (req, res) => {
//   let filePath = req.file?.path;
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       deleteTempFile(filePath);
//       return res.status(400).json({ message: "Invalid product ID" });
//     }

//     const { title, description, price, stock } = req.body;
//     const updates = {};

//     if (title) updates.title = title.trim();
//     if (description) updates.description = description.trim();
//     if (price !== undefined) {
//       const parsedPrice = parseFloat(price);
//       if (isNaN(parsedPrice) || parsedPrice < 0) {
//         deleteTempFile(filePath);
//         return res.status(400).json({ message: "Price must be a non-negative number" });
//       }
//       updates.price = parsedPrice;
//     }
//     if (stock !== undefined) updates.stock = parseInt(stock) || 0;

//     if (req.file) {
//       const result = await uploadToCloudinary(filePath);
//       deleteTempFile(filePath);
//       filePath = null;
//       updates.image = { publicId: result.publicId, url: result.url };
//     }

//     if (Object.keys(updates).length === 0) {
//       return res.status(400).json({ message: "No valid fields provided to update" });
//     }

//     const updated = await Product.findByIdAndUpdate(id, updates, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updated) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     await invalidateProductCache(id);

//     return res.status(200).json({ message: "Product updated", product: updated });
//   } catch (error) {
//     deleteTempFile(filePath);
//     console.error("updateProduct error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// // ─── DELETE PRODUCT ──────────────────────────────────────────────────────────
// const deleteProduct = async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid product ID" });
//     }

//     const deleted = await Product.findByIdAndDelete(id);
//     if (!deleted) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     await invalidateProductCache(id);

//     return res.status(200).json({ message: "Product deleted" });
//   } catch (error) {
//     console.error("deleteProduct error:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports = { getAllProducts, getSingleProduct, addNewProduct, updateProduct, deleteProduct };








const mongoose = require("mongoose");
const Product = require("../UserSchema/ProductSchema");
const { uploadToCloudinary } = require("../helper/cloudinaryhelper");
const { client } = require("../config/redisClient");
const fs = require("fs");

const CACHE_TTL = parseInt(process.env.CACHE_TTL) || 3600;

const parseStockValue = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return NaN;
  }
  return parsed;
};

// helper: safely delete a local temp file
const deleteTempFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Failed to delete temp file:", err.message);
  }
};

// helper: invalidate all paginated product cache keys
const invalidateProductCache = async (productId = null) => {
  try {
    const keys = await client.keys("allproducts:*");
    if (keys.length > 0) await client.del(keys);
    if (productId) await client.del(`product:${productId}`);
  } catch (err) {
    console.error("Cache invalidation error:", err.message);
  }
};

// ─── GET ALL PRODUCTS ────────────────────────────────────────────────────────
const getAllProducts = async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 10;
    const skip = (page - 1) * limit;

    const cacheKey = `allproducts:${page}:${limit}`;
    const cached = await client.get(cacheKey);
    if (cached) {
      return res.status(200).json({ source: "cache", ...JSON.parse(cached) });
    }

    const [products, total] = await Promise.all([
      Product.find().skip(skip).limit(limit).lean(),
      Product.countDocuments(),
    ]);

    const payload = {
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };

    await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(payload));
    return res.status(200).json({ source: "db", ...payload });
  } catch (error) {
    console.error("getAllProducts error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── GET SINGLE PRODUCT ──────────────────────────────────────────────────────
const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const cacheKey = `product:${id}`;
    const cached = await client.get(cacheKey);
    if (cached) {
      return res.status(200).json({ source: "cache", product: JSON.parse(cached) });
    }

    const product = await Product.findById(id).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await client.setEx(cacheKey, CACHE_TTL, JSON.stringify(product));
    return res.status(200).json({ source: "db", product });
  } catch (error) {
    console.error("getSingleProduct error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── ADD PRODUCT ─────────────────────────────────────────────────────────────
const addNewProduct = async (req, res) => {
  let filePath = req.file?.path;
  try {
    const { title, description, price, stock } = req.body;

    if (!title || !description || price === undefined) {
      deleteTempFile(filePath);
      return res.status(400).json({ message: "Title, description, and price are required" });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      deleteTempFile(filePath);
      return res.status(400).json({ message: "Price must be a non-negative number" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Product image is required" });
    }

    const result = await uploadToCloudinary(filePath);
    deleteTempFile(filePath);
    filePath = null;

    const parsedStock = parseStockValue(stock);
    if (Number.isNaN(parsedStock)) {
      return res.status(400).json({ message: "Stock must be a non-negative integer" });
    }

    const product = await Product.create({
      title: title.trim(),
      description: description.trim(),
      price: parsedPrice,
      stock: parsedStock === null ? 100 : parsedStock,
      image: { publicId: result.publicId, url: result.url },
    });

    await invalidateProductCache();
    return res.status(201).json({ message: "Product added", product });
  } catch (error) {
    deleteTempFile(filePath);
    console.error("addNewProduct error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── UPDATE PRODUCT ──────────────────────────────────────────────────────────
const updateProduct = async (req, res) => {
  let filePath = req.file?.path;
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      deleteTempFile(filePath);
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const { title, description, price, stock } = req.body;
    const updates = {};

    if (title) updates.title = title.trim();
    if (description) updates.description = description.trim();
    if (price !== undefined) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        deleteTempFile(filePath);
        return res.status(400).json({ message: "Price must be a non-negative number" });
      }
      updates.price = parsedPrice;
    }
    if (stock !== undefined) {
      const parsedStock = parseStockValue(stock);
      if (Number.isNaN(parsedStock)) {
        deleteTempFile(filePath);
        return res.status(400).json({ message: "Stock must be a non-negative integer" });
      }
      if (parsedStock !== null) {
        updates.stock = parsedStock;
      }
    }

    if (req.file) {
      const result = await uploadToCloudinary(filePath);
      deleteTempFile(filePath);
      filePath = null;
      updates.image = { publicId: result.publicId, url: result.url };
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided to update" });
    }

    const updated = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    await invalidateProductCache(id);
    return res.status(200).json({ message: "Product updated", product: updated });
  } catch (error) {
    deleteTempFile(filePath);
    console.error("updateProduct error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// ─── DELETE PRODUCT ──────────────────────────────────────────────────────────
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    await invalidateProductCache(id);
    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    console.error("deleteProduct error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllProducts, getSingleProduct, addNewProduct, updateProduct, deleteProduct };
