const { getRedis } = require("../config/redis");

const invalidateCache = (pattern) => {
  return async (req, res, next) => {
    try {
      const redis = getRedis();

      const keys = await redis.keys(pattern);

      if (keys.length) {
        await redis.del(keys);
      }

      next();
    } catch (err) {
      console.error("Cache Invalidate Error:", err);
      next();
    }
  };
};

module.exports = invalidateCache;
