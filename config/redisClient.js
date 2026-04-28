const { createClient } = require("redis");

const client = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
  },
});

client.on("error", (err) => {
  console.error("Redis error:", err.message);
});

client.on("reconnecting", () => {
  console.warn("Redis reconnecting...");
});

const connectRedis = async () => {
  try {
    await client.connect();
    console.log("✅ Redis connected");
  } catch (error) {
    console.error("❌ Redis connection error:", error.message);
    process.exit(1);
  }
};

module.exports = { client, connectRedis };