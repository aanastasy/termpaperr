import { createHash, randomBytes } from "node:crypto";

export function generateRawVerificationToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashVerificationToken(raw: string): string {
  return createHash("sha256").update(raw, "utf8").digest("hex");
}
