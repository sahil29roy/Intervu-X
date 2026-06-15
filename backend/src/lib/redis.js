import { createClient } from "redis";
import { ENV } from "./env.js";

let redisClient;

try {
  redisClient = createClient({
    username: ENV.REDIS_USERNAME,
    password: ENV.REDIS_PASSWORD,
    socket: {
      host: ENV.REDIS_HOST,
      port: ENV.REDIS_PORT
    }
  });

  redisClient.on("error", (err) => console.error("Redis Client Error", err));
  redisClient.on("connect", () => console.log("Redis connected successfully."));

  // Connect to Redis asynchronously
  redisClient.connect().catch((err) => {
    console.error("Failed to connect to Redis database:", err.message);
  });
} catch (error) {
  console.error("Error creating Redis client:", error.message);
}

export { redisClient as redis };
