require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectToDatabase = require("./database/db.js");
const { connectRedis } = require("./config/redisClient.js");
const { createLimiters } = require("./Middleware/rateLimiter");

const userRoutes = require("./Routes/userRoutes.js");
const productRoutes = require("./Routes/ProductRoutes.js");
const profileRoutes = require("./Routes/profileRoutes.js");
const cartRoutes = require("./Routes/CartRoutes.js");
const paymentRoutes = require("./Routes/paymentRoutes.js");
const orderRoutes = require("./Routes/orderRoutes.js");

const app = express();

// ─── ✅ CORS FIX (IMPORTANT) ─────────────────────────────────────
app.use(
  cors({
    origin: "*", // allow all (safe for development)
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── BODY PARSING ────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── HEALTH CHECK ────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

// ─── START SERVER ────────────────────────────────────────────────
const startServer = async () => {
  const required = [
    "MONGO_URL",
    "JWT_TOKEN",
    "RAZORPAY_KEY_ID",
    "RAZORPAY_KEY_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "REDIS_URL",
    "PORT",
  ];

  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`❌ Missing env vars: ${missing.join(", ")}`);
    process.exit(1);
  }

  // connect services
  await connectRedis();
  await connectToDatabase();

  const { productLimiter, authLimiter } = createLimiters();

  // ─── ROUTES ───────────────────────────────────────────────────
  app.use("/", authLimiter, userRoutes);
  app.use("/", productLimiter, productRoutes);
  app.use("/", profileRoutes);
  app.use("/", cartRoutes);
  app.use("/", paymentRoutes);
  app.use("/", orderRoutes);

  // ─── 404 HANDLER ──────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
  });

  // ─── GLOBAL ERROR HANDLER ─────────────────────────────────────
  app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
      message: err.message || "Internal server error",
    });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});