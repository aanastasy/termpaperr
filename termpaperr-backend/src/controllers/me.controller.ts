import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { findUserById } from "../repositories/user.repository.js";
import * as authService from "../services/auth.service.js";
import { displayNameSchema } from "../validation/display-name.schema.js";

const updateProfileSchema = z.object({
  name: displayNameSchema,
});

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const auth = req.auth;
    if (!auth) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const user = await findUserById(auth.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const auth = req.auth;
    if (!auth) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        message: "Validation error",
        issues: parsed.error.flatten(),
      });
      return;
    }
    const tokens = await authService.updateProfile(
      auth.userId,
      parsed.data.name,
    );
    res.status(200).json(tokens);
  } catch (err) {
    if (err instanceof authService.UserNotFoundError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    if (err instanceof authService.AuthValidationError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    next(err);
  }
}
