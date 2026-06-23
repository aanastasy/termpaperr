import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { verifyAccessToken } from "../config/auth.tokens.js";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  const token = header.slice("Bearer ".length).trim();
  if (!token) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    req.auth = verifyAccessToken(token);
    next();
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    throw err;
  }
}

// Backward-compatible alias for existing imports.
export const authenticate = authMiddleware;
