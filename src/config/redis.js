const { createClient } = require("redis");

let redisClient;

const connectRedis = async () => {
  redisClient = createClient({
    url: process.env.REDIS_URL, // production url
  });

  redisClient.on("error", (err) => console.error("Redis Client Error", err));

  await redisClient.connect();
  console.log("Redis connected");
};

const getRedis = () => {
  if (!redisClient) throw new Error("Redis not initialized");
  return redisClient;
};

module.exports = { connectRedis, getRedis };
