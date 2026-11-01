import { redis } from "../config/redis";

const TTL = 60;

export async function getCache(key: string) {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Redis get error:", err);
  }
}

export async function setCache(key: string, value: unknown) {
  try {
    await redis.setex(key, TTL, JSON.stringify(value));
  } catch (err) {
    console.error("Redis setex error:", err);
  }
}

export function meKey(userId: string | number | bigint): string {
  return `me:${userId}`;
}

export async function invalidUserMe(userId: string | number | bigint) {
  try {
    await redis.del(`me:${userId}`);
  } catch (err) {
    console.error("Redis del me error:", err);
  }
}
