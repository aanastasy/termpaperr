import { z } from "zod";
import { isLocalCoverUrl } from "../utils/cover-url.js";

export const coverUrlSchema = z
  .string()
  .url()
  .max(2048)
  .refine(
    (url) => {
      if (isLocalCoverUrl(url)) {
        return true;
      }
      try {
        const parsed = new URL(url);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    {
      message:
        "coverUrl must be a valid http(s) URL or an uploaded cover from this API",
    },
  );
