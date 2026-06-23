import { z } from "zod";

/** Letters (any script), marks, spaces, apostrophe, period, hyphen. */
export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(255, "Name must be at most 255 characters")
  .regex(/^[\p{L}\p{M}\s'.-]+$/u, {
    message:
      "Name may only contain letters, spaces, apostrophe, period, or hyphen",
  });
