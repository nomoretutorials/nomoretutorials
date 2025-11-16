import { TechStack } from "@/types/project";
import Redis from "ioredis";

export const redis = new Redis(process.env.UPSTASH_REDIS_URL!, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times: number) => {
    if (times > 10) {
      console.error("Redis: Too many reconnection attempts");
      return null; // Stop retrying
    }
    // Exponential backoff: 50ms, 100ms, 200ms, etc.
    return Math.min(times * 50, 3000);
  },
  reconnectOnError: (err: Error) => {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) {
      // Only reconnect when the error contains "READONLY"
      return true;
    }
    return false;
  },
});

redis.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redis.on("connect", () => {
  console.log("✅ Redis connecting...");
});

redis.on("ready", () => {
  console.log("✅ Redis ready");
});

redis.on("close", () => {
  console.log("❌ Redis connection closed");
});

redis.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

redis.on("end", () => {
  console.log("❌ Redis connection ended");
});

export async function setCache(key: string, value: TechStack[], ttlSeconds: number) {
  await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function getCache(key: string) {
  const cached = await redis.get(key);

  if (!cached) return null;
  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
}
