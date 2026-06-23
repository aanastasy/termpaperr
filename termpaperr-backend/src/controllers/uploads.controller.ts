import type { NextFunction, Request, Response } from "express";

import {
  saveCoverFile,
  UploadValidationError,
} from "../services/upload.service.js";

export async function uploadCover(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Cover image file is required" });
      return;
    }

    const coverUrl = await saveCoverFile(req.file.buffer, req.file.mimetype);
    res.status(201).json({ coverUrl });
  } catch (err) {
    if (err instanceof UploadValidationError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    }
    next(err);
  }
}
