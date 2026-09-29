import Redis from 'ioredis';
import { env } from './env';

export const redis = new Redis(env.REDIS_URL); // dari .env

redis.on('connect', () => console.log('Redis connected'));
redis.on('error', (e) => console.error('Redis error:', e));