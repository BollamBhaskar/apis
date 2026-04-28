const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default;
const { client } = require("../config/redisClient");

// ✅ wrap inside function
const createLimiters = () => {

  const productLimiter = rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => client.sendCommand(args),
    }),
    windowMs: 1* 60 * 1000,
    max: 50,
    message: {
      success: false,
      message: "Too many requests, please try again later",
    },
  });

  const adminLimiter = rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => client.sendCommand(args),
    }),
    windowMs: 1 * 60 * 1000,
    max: 50,
    message: {
      success: false,
      message: "Too many admin actions, slow down",
    },
  });

  return { productLimiter, adminLimiter };
};

module.exports = { createLimiters };