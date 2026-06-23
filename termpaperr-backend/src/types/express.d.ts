import type { UserRole } from "../models/user.entity.js";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        userId: string;
        role: UserRole;
        name: string;
      };
    }
  }
}

export {};
