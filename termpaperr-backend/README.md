# Termpaperr Backend

Express + TypeScript API for book clubs.

## Cover image uploads

Uploaded covers are stored on disk (default: `uploads/covers/` under the backend root) and served at `/uploads/covers/<filename>`.

| Variable | Default | Description |
|----------|---------|-------------|
| `UPLOAD_DIR` | `uploads/covers` | Directory for stored cover files (relative to backend root or absolute path) |
| `PUBLIC_API_URL` | `http://localhost:${PORT}` | Base URL used in upload responses (`coverUrl`) and local URL validation |
| `UPLOAD_MAX_BYTES` | `5242880` | Max upload size in bytes (5 MB) |
| `UPLOAD_ALLOWED_MIME` | `image/jpeg,image/png,image/webp` | Comma-separated allowed MIME types |

**Endpoint:** `POST /uploads/cover` (multipart field `cover`, admin JWT required) returns `{ "coverUrl": "..." }`.

Books accept either an uploaded `coverUrl` from this API or an external `https://` URL.

The `uploads/` directory is gitignored.
