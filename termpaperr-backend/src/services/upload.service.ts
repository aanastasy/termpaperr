import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import {
  getAllowedUploadMimeTypes,
  getPublicApiUrl,
  resolveUploadDir,
} from "../config/uploads.js";
import { resolveLocalCoverPath } from "../utils/cover-url.js";

const MIME_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export class UploadValidationError extends Error {
  readonly statusCode = 400;
}

export function buildPublicCoverUrl(filename: string): string {
  return `${getPublicApiUrl()}/uploads/covers/${filename}`;
}

function extensionForMime(mimetype: string): string {
  const extension = MIME_TO_EXTENSION[mimetype.toLowerCase()];
  if (!extension) {
    throw new UploadValidationError("Unsupported image type");
  }
  return extension;
}

export async function saveCoverFile(
  buffer: Buffer,
  mimetype: string,
): Promise<string> {
  const allowed = getAllowedUploadMimeTypes();
  const normalizedMime = mimetype.toLowerCase();

  if (!allowed.has(normalizedMime)) {
    throw new UploadValidationError("Unsupported image type");
  }

  const filename = `${randomUUID()}${extensionForMime(normalizedMime)}`;
  const filePath = path.join(resolveUploadDir(), filename);
  await fs.writeFile(filePath, buffer);

  return buildPublicCoverUrl(filename);
}

export async function deleteCoverFileIfLocal(coverUrl: string): Promise<void> {
  const filePath = resolveLocalCoverPath(coverUrl);
  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") {
      console.warn(`Failed to delete cover file ${filePath}:`, err);
    }
  }
}
