import jwt from "jsonwebtoken";
import ms from "ms";
import type { StringValue } from "ms";

import { UserRole } from "../models/user.entity.js";

export interface AccessTokenPayload {
  userId: string;
  role: UserRole;
  name: string;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  return secret;
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, getJwtSecret()) as jwt.JwtPayload & {
    role?: unknown;
    name?: unknown;
  };
  const sub = decoded.sub;
  if (typeof sub !== "string" || sub.length === 0) {
    throw new jwt.JsonWebTokenError("Invalid subject");
  }
  const roleRaw = decoded.role;
  if (
    typeof roleRaw !== "string" ||
    !Object.values(UserRole).includes(roleRaw as UserRole)
  ) {
    throw new jwt.JsonWebTokenError("Invalid role");
  }
  const nameRaw = decoded.name;
  if (typeof nameRaw !== "string" || nameRaw.length > 255) {
    throw new jwt.JsonWebTokenError("Invalid name");
  }
  return { userId: sub, role: roleRaw as UserRole, name: nameRaw };
}

export function signAccessToken(
  userId: string,
  role: UserRole,
  name: string,
): string {
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ??
    "15m") as StringValue;
  return jwt.sign({ sub: userId, role, name }, getJwtSecret(), { expiresIn });
}

export function getAccessExpiresInSeconds(): number {
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN ??
    "15m") as StringValue;
  const value = ms(expiresIn);
  if (typeof value !== "number" || value <= 0) {
    throw new Error("Invalid JWT_ACCESS_EXPIRES_IN");
  }
  return Math.floor(value / 1000);
}

export function getRefreshTtlSeconds(): number {
  const raw = (process.env.JWT_REFRESH_EXPIRES_IN ?? "7d") as StringValue;
  const value = ms(raw);
  if (typeof value !== "number" || value <= 0) {
    throw new Error("Invalid JWT_REFRESH_EXPIRES_IN");
  }
  return Math.floor(value / 1000);
}
