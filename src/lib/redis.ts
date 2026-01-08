// src/lib/redis.ts
import { TechStack } from "@/types/project";
import { Redis as UpstashRedis } from "@upstash/redis";

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("Upstash Redis environment variables are missing!");
}

// ✅ HTTP-based Redis for caching (stateless, fast, serverless-friendly)
export const redis = new UpstashRedis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Your existing cache functions (using HTTP Redis)
export async function setCache(key: string, value: TechStack[], ttlSeconds: number) {
  await redis.set(key, value, { ex: ttlSeconds });
}

export async function getCache(key: string): Promise<TechStack[] | null> {
  try {
    const cached = await redis.get<TechStack[]>(key);
    return cached;
  } catch (error) {
    console.error("Redis Get Error:", error);
    return null;
  }
}
