import type { Request, Response } from "express";

import { AppDataSource } from "../config/data-source.js";
import { getRedis } from "../config/redis.js";

export async function health(_req: Request, res: Response): Promise<void> {
  const checks: Record<string, "ok" | "error"> = {};

  try {
    await AppDataSource.query("SELECT 1");
    checks.postgres = "ok";
  } catch {
    checks.postgres = "error";
  }

  try {
    await getRedis().ping();
    checks.redis = "ok";
  } catch {
    checks.redis = "error";
  }

  const allOk = Object.values(checks).every((v) => v === "ok");
  res.status(allOk ? 200 : 503).json({ ok: allOk, checks });
}
