// src/config/env.ts
import dotenv from 'dotenv'

dotenv.config()

const required = ["JWT_SECRET", "CSRF_SECRET", "DATABASE_URL", "REDIS_URL"] as const;

for (const key of required) {
  if (!process.env[key]?.trim()) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
}

export const env = {
  PORT: Number(process.env.PORT || 3001),
  JWT_SECRET: process.env.JWT_SECRET!,
  CSRF_SECRET: process.env.CSRF_SECRET!,
  DATABASE_URL: process.env.DATABASE_URL!,
  REDIS_URL: process.env.REDIS_URL!,      // ← TAMBAH INI
} as const;