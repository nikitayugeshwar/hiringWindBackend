const { getRedis } = require("../config/redis");

const DEFAULT_TTL = 300; // 5 minutes (set once here)

const autoCache = async (req, res, next) => {
  try {
    // Only cache GET requests
    if (req.method !== "GET") return next();

    const redis = getRedis();

    // Key = full URL including query params
    const key = req.originalUrl;

    const cached = await redis.get(key);

    if (cached) {
      return res.status(200).json(JSON.parse(cached));
    }

    // Override res.json to store response
    const originalJson = res.json.bind(res);

    res.json = async (data) => {
      try {
        await redis.setEx(key, DEFAULT_TTL, JSON.stringify(data));
      } catch (err) {
        console.error("Redis SET error:", err);
      }

      return originalJson(data);
    };

    next();
  } catch (error) {
    console.error("AutoCache Error:", error);
    next();
  }
};

module.exports = autoCache;
