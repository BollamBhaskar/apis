const rateLimit = require("express-rate-limit");
const RedisStore = require("rate-limit-redis").default;
const { client } = require("../config/redisClient");

const createLimiters = () => {
  const productLimiter = rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => client.sendCommand(args),
    }),
    windowMs: 5 * 60 * 1000, // 1 minute
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many requests, please try again later" },
  });

  const adminLimiter = rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => client.sendCommand(args),
    }),
    windowMs: 1 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many admin actions, slow down" },
  });

  const authLimiter = rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => client.sendCommand(args),
    }),
    windowMs: 5 * 60 * 1000, // 15 minutes
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Too many login attempts, please try again later" },
  });

  return { productLimiter, adminLimiter, authLimiter };
};

module.exports = { createLimiters };