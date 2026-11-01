import Redis from "ioredis";
import { env } from "./env";

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 1,
  enableOffLineQueue: false,
  retryStrategy: (times) => Math.min(times * 100, 3000),
  connectTimeout: 2000,
  commandTimeout: 1000,
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (e) => console.error("Redis error:", e));
