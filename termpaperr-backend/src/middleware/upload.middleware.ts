import type { NextFunction, Request, Response } from "express";
import multer from "multer";

import { getAllowedUploadMimeTypes, getUploadMaxBytes } from "../config/uploads.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: getUploadMaxBytes() },
  fileFilter: (_req, file, cb) => {
    const allowed = getAllowedUploadMimeTypes();
    if (!allowed.has(file.mimetype.toLowerCase())) {
      cb(new Error("Unsupported image type"));
      return;
    }
    cb(null, true);
  },
});

export const coverUploadMiddleware = upload.single("cover");

export function handleCoverUploadErrors(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!err) {
    next();
    return;
  }

  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large"
        : err.message || "Invalid upload";
    res.status(400).json({ message });
    return;
  }

  if (err instanceof Error && err.message === "Unsupported image type") {
    res.status(400).json({ message: err.message });
    return;
  }

  next(err);
}
