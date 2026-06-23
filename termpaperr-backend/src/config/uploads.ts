import fs from "node:fs";
import path from "node:path";

const backendRoot = process.cwd();

const DEFAULT_UPLOAD_DIR = "uploads/covers";
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;
const DEFAULT_ALLOWED_MIME = "image/jpeg,image/png,image/webp";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function resolveUploadDir(): string {
  const configured = process.env.UPLOAD_DIR?.trim();
  return path.isAbsolute(configured ?? "")
    ? (configured as string)
    : path.resolve(backendRoot, configured || DEFAULT_UPLOAD_DIR);
}

export function getPublicApiUrl(): string {
  const configured = process.env.PUBLIC_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  const port = Number(process.env.PORT) || 3000;
  return `http://localhost:${port}`;
}

export function getUploadMaxBytes(): number {
  return parsePositiveInt(process.env.UPLOAD_MAX_BYTES, DEFAULT_MAX_BYTES);
}

export function getAllowedUploadMimeTypes(): Set<string> {
  const raw = process.env.UPLOAD_ALLOWED_MIME?.trim() || DEFAULT_ALLOWED_MIME;
  return new Set(
    raw
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function ensureUploadDir(): void {
  fs.mkdirSync(resolveUploadDir(), { recursive: true });
}
