import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import * as authService from "../services/auth.service.js";
import { displayNameSchema } from "../validation/display-name.schema.js";

const credentialsSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

const registerSchema = credentialsSchema.extend({
  name: displayNameSchema,
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        issues: parsed.error.flatten(),
      });
      return;
    }
    const tokens = await authService.register(
      parsed.data.name,
      parsed.data.email,
      parsed.data.password,
    );
    res.status(201).json(tokens);
  } catch (err) {
    if (err instanceof authService.AuthConflictError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = credentialsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        issues: parsed.error.flatten(),
      });
      return;
    }
    const tokens = await authService.login(
      parsed.data.email,
      parsed.data.password,
    );
    res.status(200).json(tokens);
  } catch (err) {
    if (err instanceof authService.AuthUnauthorizedError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    if (err instanceof authService.AuthForbiddenError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    next(err);
  }
}

export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = refreshSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        issues: parsed.error.flatten(),
      });
      return;
    }
    const tokens = await authService.refreshTokens(parsed.data.refreshToken);
    res.status(200).json(tokens);
  } catch (err) {
    if (err instanceof authService.AuthUnauthorizedError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    if (err instanceof authService.AuthForbiddenError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    next(err);
  }
}

const verifyEmailQuerySchema = z.object({
  token: z.preprocess(
    (v) => (Array.isArray(v) ? v[0] : v),
    z.string().min(1),
  ),
});

export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = verifyEmailQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        issues: parsed.error.flatten(),
      });
      return;
    }
    const result = await authService.verifyEmailFromToken(parsed.data.token);
    res.status(200).json(result);
  } catch (err) {
    if (err instanceof authService.AuthInvalidVerificationTokenError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    next(err);
  }
}

const resendVerificationSchema = z.object({
  email: z.string().email().max(255),
});

export async function resendVerification(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = resendVerificationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        issues: parsed.error.flatten(),
      });
      return;
    }
    await authService.resendVerificationEmail(parsed.data.email);
    res.status(200).json({
      message:
        "If an account exists and is awaiting confirmation, a new verification email was sent.",
    });
  } catch (err) {
    next(err);
  }
}
