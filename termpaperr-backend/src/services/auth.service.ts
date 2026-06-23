import { randomBytes } from "node:crypto";

import bcrypt from "bcrypt";

import {
  getAccessExpiresInSeconds,
  getRefreshTtlSeconds,
  signAccessToken,
} from "../config/auth.tokens.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  findUserByVerificationTokenHash,
  markUserEmailVerified,
  setUserEmailVerificationToken,
  updateUserName,
} from "../repositories/user.repository.js";
import type { User } from "../models/user.entity.js";
import {
  createEmailVerificationToken,
  sendRegistrationVerificationEmail,
} from "./email-verification.service.js";
import {
  deleteRefreshTokenMapping,
  getUserIdByRefreshToken,
  saveRefreshTokenMapping,
} from "./refresh-token.store.js";
import { hashVerificationToken } from "../utils/verification-token.js";

const BCRYPT_ROUNDS = 10;

export class AuthConflictError extends Error {
  readonly statusCode = 409;
}

export class AuthUnauthorizedError extends Error {
  readonly statusCode = 401;
}

export class AuthForbiddenError extends Error {
  readonly statusCode = 403;
}

export class AuthInvalidVerificationTokenError extends Error {
  readonly statusCode = 400;
}

export class UserNotFoundError extends Error {
  readonly statusCode = 404;
}

export class AuthValidationError extends Error {
  readonly statusCode = 400;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

async function issueAuthTokens(user: User): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const refreshTtlSec = getRefreshTtlSeconds();
  const refreshToken = randomBytes(32).toString("base64url");
  await saveRefreshTokenMapping(refreshToken, user.id, refreshTtlSec);
  return {
    accessToken: signAccessToken(user.id, user.role, user.name),
    refreshToken,
    expiresIn: getAccessExpiresInSeconds(),
  };
}

export async function register(
  name: string,
  email: string,
  password: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const normalizedName = name.trim();
  const normalized = normalizeEmail(email);
  const existing = await findUserByEmail(normalized);
  if (existing) {
    throw new AuthConflictError("Email already registered");
  }
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await createUser(normalizedName, normalized, passwordHash, {
    emailVerified: true,
  });
  return issueAuthTokens(user);
}

export async function login(
  email: string,
  password: string,
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const normalized = normalizeEmail(email);
  const user = await findUserByEmail(normalized);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AuthUnauthorizedError("Invalid credentials");
  }
  if (!user.emailVerifiedAt) {
    throw new AuthForbiddenError(
      "Email not verified. Check your inbox or request a new confirmation link.",
    );
  }
  return issueAuthTokens(user);
}

export async function refreshTokens(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const userId = await getUserIdByRefreshToken(refreshToken);
  if (!userId) {
    throw new AuthUnauthorizedError("Invalid refresh token");
  }
  await deleteRefreshTokenMapping(refreshToken);
  const user = await findUserById(userId);
  if (!user) {
    throw new AuthUnauthorizedError("Invalid refresh token");
  }
  if (!user.emailVerifiedAt) {
    throw new AuthForbiddenError("Email not verified");
  }
  const refreshTtlSec = getRefreshTtlSeconds();
  const newRefresh = randomBytes(32).toString("base64url");
  await saveRefreshTokenMapping(newRefresh, user.id, refreshTtlSec);
  return {
    accessToken: signAccessToken(user.id, user.role, user.name),
    refreshToken: newRefresh,
    expiresIn: getAccessExpiresInSeconds(),
  };
}

export async function updateProfile(
  userId: string,
  name: string,
): Promise<{ accessToken: string; expiresIn: number }> {
  const normalizedName = name.trim();
  if (!normalizedName) {
    throw new AuthValidationError("Name is required");
  }
  const user = await findUserById(userId);
  if (!user) {
    throw new UserNotFoundError("User not found");
  }
  await updateUserName(userId, normalizedName);
  const updated = await findUserById(userId);
  if (!updated) {
    throw new UserNotFoundError("User not found");
  }
  return {
    accessToken: signAccessToken(updated.id, updated.role, updated.name),
    expiresIn: getAccessExpiresInSeconds(),
  };
}

export async function verifyEmailFromToken(rawToken: string): Promise<
  | { message: string; alreadyVerified: true }
  | {
      alreadyVerified: false;
      accessToken: string;
      refreshToken: string;
      expiresIn: number;
    }
> {
  const trimmed = rawToken.trim();
  if (!trimmed) {
    throw new AuthInvalidVerificationTokenError("Invalid verification link");
  }
  const tokenHash = hashVerificationToken(trimmed);
  const user = await findUserByVerificationTokenHash(tokenHash);
  if (!user) {
    throw new AuthInvalidVerificationTokenError("Invalid verification link");
  }
  if (user.emailVerifiedAt) {
    return {
      message: "Email was already confirmed. You can sign in.",
      alreadyVerified: true,
    };
  }
  const expiresAt = user.emailVerificationTokenExpiresAt;
  if (!expiresAt || expiresAt.getTime() < Date.now()) {
    throw new AuthInvalidVerificationTokenError(
      "Verification link expired. Request a new one.",
    );
  }
  await markUserEmailVerified(user.id);
  const verified = await findUserById(user.id);
  if (!verified) {
    throw new AuthInvalidVerificationTokenError("Invalid verification link");
  }
  const tokens = await issueAuthTokens(verified);
  return { alreadyVerified: false, ...tokens };
}

export async function resendVerificationEmail(email: string): Promise<void> {
  const normalized = normalizeEmail(email);
  const user = await findUserByEmail(normalized);
  if (!user || user.emailVerifiedAt) {
    return;
  }
  const verification = createEmailVerificationToken();
  await setUserEmailVerificationToken(
    user.id,
    verification.tokenHash,
    verification.expiresAt,
  );
  await sendRegistrationVerificationEmail(user.email, verification.rawToken);
}
