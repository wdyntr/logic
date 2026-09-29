import { redis } from '../config/redis';

const TTL = 60; // detik

export async function todoKey(userId: string | number | bigint, page: number, limit: number) {
    try {
        const ver = await redis.get(`ver:todos:${userId}`) || '0';
        return `todos:v${ver}:${userId}:${page}:${limit}`;
    } catch (error) {
        console.error('Redis GET version error:', error);
        return `todos:v0:${userId}:${page}:${limit}`;
    }
}

export async function getCache(key: string) {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Redis get error:', error)
    }
}

export async function setCache(key: string, value: unknown) {
    try {
        await redis.setex(key, TTL, JSON.stringify(value));
    } catch (error) {
        console.error('Redis setex error:', error)
    }
}

export async function invalidateUserTodos(userId: string | number | bigint) {
    try {
        await redis.incr(`ver:todos:${userId}`); // O(1), semua key lama jadi unreachable
    } catch (error) {
        console.error('Redis incr error:', error)
    }
}

// Me

export function meKey(userId: string | number | bigint): string {
  return `me:${userId}`;
}

export async function invalidateUserMe(userId: string | number | bigint) {
    try {
        await redis.del(`me:${userId}`);
    } catch (error) {
        console.error('Redis del me error:', error)
    }
}