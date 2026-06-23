import {
  getEmailVerificationTtlMs,
  getPublicAppUrl,
  getSmtpConfig,
} from "../config/email.js";
import {
  generateRawVerificationToken,
  hashVerificationToken,
} from "../utils/verification-token.js";

import { sendTransactionalEmail } from "./mailer.service.js";

export interface EmailVerificationTokenPair {
  rawToken: string;
  tokenHash: string;
  expiresAt: Date;
}

export function createEmailVerificationToken(): EmailVerificationTokenPair {
  const rawToken = generateRawVerificationToken();
  const ttlMs = getEmailVerificationTtlMs();
  return {
    rawToken,
    tokenHash: hashVerificationToken(rawToken),
    expiresAt: new Date(Date.now() + ttlMs),
  };
}

export function buildEmailVerificationUrl(rawToken: string): string {
  const base = getPublicAppUrl();
  const url = new URL("/auth/verify-email", base);
  url.searchParams.set("token", rawToken);
  return url.toString();
}

export async function sendRegistrationVerificationEmail(
  to: string,
  rawToken: string,
): Promise<void> {
  const link = buildEmailVerificationUrl(rawToken);
  const subject = "Confirm your email";
  const text = `Welcome! Open this link to confirm your email (valid until the time we set in the app):\n\n${link}\n\nIf you did not register, ignore this message.`;
  const html = `<p>Welcome!</p><p><a href="${escapeHtml(
    link,
  )}">Confirm your email</a></p><p>If you did not register, ignore this message.</p>`;
  await sendTransactionalEmail({ to, subject, text, html });
  if (!getSmtpConfig()) {
    console.warn(`[email-verification] Verification link for ${to}: ${link}`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}
