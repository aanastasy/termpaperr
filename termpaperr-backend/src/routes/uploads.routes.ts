import { Router } from "express";

import * as uploadsController from "../controllers/uploads.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  coverUploadMiddleware,
  handleCoverUploadErrors,
} from "../middleware/upload.middleware.js";
import { roleGuard } from "../middleware/role.guard.js";
import { UserRole } from "../models/user.entity.js";

const router = Router();

router.post(
  "/cover",
  authMiddleware,
  roleGuard(UserRole.Admin),
  (req, res, next) => {
    coverUploadMiddleware(req, res, (err) => {
      if (err) {
        handleCoverUploadErrors(err, req, res, next);
        return;
      }
      next();
    });
  },
  uploadsController.uploadCover,
);

export default router;
