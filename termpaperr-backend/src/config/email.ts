import ms from "ms";
import type { StringValue } from "ms";

export function getPublicAppUrl(): string {
  const raw = process.env.APP_PUBLIC_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function getEmailVerificationTtlMs(): number {
  const raw = (process.env.EMAIL_VERIFICATION_EXPIRES_IN ?? "24h") as StringValue;
  const value = ms(raw);
  if (typeof value !== "number" || value <= 0) {
    throw new Error("Invalid EMAIL_VERIFICATION_EXPIRES_IN");
  }
  return value;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth?: { user: string; pass: string };
  from: string;
}

export function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const from = process.env.SMTP_FROM;
  if (!host || !from) {
    return null;
  }
  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure =
    process.env.SMTP_SECURE === "true" || String(port) === "465";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const auth =
    user && pass !== undefined ? { user, pass: pass ?? "" } : undefined;
  return { host, port, secure, auth, from };
}
