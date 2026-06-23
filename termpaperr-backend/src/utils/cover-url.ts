import path from "node:path";
import { getPublicApiUrl, resolveUploadDir } from "../config/uploads.js";

export function getLocalCoversUrlPrefix(): string {
  return `${getPublicApiUrl()}/uploads/covers/`;
}

export function isLocalCoverUrl(coverUrl: string): boolean {
  const prefix = getLocalCoversUrlPrefix();
  return coverUrl.startsWith(prefix);
}

export function getLocalCoverFilename(coverUrl: string): string | null {
  if (!isLocalCoverUrl(coverUrl)) {
    return null;
  }
  const prefix = getLocalCoversUrlPrefix();
  const filename = coverUrl.slice(prefix.length);
  if (!filename || filename.includes("/") || filename.includes("..")) {
    return null;
  }
  return filename;
}

export function resolveLocalCoverPath(coverUrl: string): string | null {
  const filename = getLocalCoverFilename(coverUrl);
  if (!filename) {
    return null;
  }
  const uploadDir = resolveUploadDir();
  const resolved = path.resolve(uploadDir, filename);
  if (!resolved.startsWith(`${uploadDir}${path.sep}`)) {
    return null;
  }
  return resolved;
}
