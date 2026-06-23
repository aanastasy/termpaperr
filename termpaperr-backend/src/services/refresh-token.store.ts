import { createHash } from "node:crypto";

import { getRedis } from "../config/redis.js";

const PREFIX = "auth:refresh:";

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function saveRefreshTokenMapping(
  plainToken: string,
  userId: string,
  ttlSec: number,
): Promise<void> {
  const key = PREFIX + hashRefreshToken(plainToken);
  await getRedis().set(key, userId, "EX", ttlSec);
}

export async function getUserIdByRefreshToken(
  plainToken: string,
): Promise<string | null> {
  const key = PREFIX + hashRefreshToken(plainToken);
  const value = await getRedis().get(key);
  return value;
}

export async function deleteRefreshTokenMapping(
  plainToken: string,
): Promise<void> {
  const key = PREFIX + hashRefreshToken(plainToken);
  await getRedis().del(key);
}
