import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: 1,           // Command: coba 1×, gagal = error
    enableOfflineQueue: false,         // Jangan queue command saat disconnect
    retryStrategy: (times) => Math.min(times * 100, 3000),
    connectTimeout: 2000,              // 2 detik max connect
    commandTimeout: 1000,              // 1 detik max per command
});

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (e) => console.error('Redis error:', e));