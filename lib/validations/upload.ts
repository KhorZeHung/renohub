import { z } from "zod";

// Upload type schema
export const uploadSchema = z.object({
  type: z.enum(["avatar", "logo", "item", "lead", "quotation"] as const, {
    message: "Type must be 'avatar', 'logo', 'item', 'lead', or 'quotation'",
  }),
});

export type UploadInput = z.infer<typeof uploadSchema>;

// Delete upload schema
export const deleteUploadSchema = z.object({
  url: z.string().min(1, "URL is required"),
});

export type DeleteUploadInput = z.infer<typeof deleteUploadSchema>;

// Allowed MIME types
export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number];

// File extension mapping
export const MIME_TO_EXT: Record<AllowedImageType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
