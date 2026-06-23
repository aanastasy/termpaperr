import type { NextFunction, Request, Response } from "express";

import { UserRole } from "../models/user.entity.js";

export function roleGuard(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    if (req.auth.role !== role) {
      res.status(403).json({ message: "Forbidden" });
      return;
    }
    next();
  };
}
