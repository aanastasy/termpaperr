import "dotenv/config";
import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

let client: Redis | null = null;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(redisUrl);
  }
  return client;
}

export async function connectRedis(): Promise<Redis> {
  const redis = getRedis();
  await redis.ping();
  return redis;
}

export async function disconnectRedis(): Promise<void> {
  if (client) {
    await client.quit();
    client = null;
  }
}
