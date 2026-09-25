// src/config/env.ts
import dotenv from 'dotenv'

dotenv.config()

const required = ["JWT_SECRET", "CSRF_SECRET", "DATABASE_URL"] as const;

for (const key of required) {
  if (!process.env[key]?.trim()) {
    throw new Error(`❌ Missing required environment variable: ${key}`);
  }
}

export const env = {
  JWT_SECRET: process.env.JWT_SECRET!,
  CSRF_SECRET: process.env.CSRF_SECRET!,
  DATABASE_URL: process.env.DATABASE_URL!,
} as const;