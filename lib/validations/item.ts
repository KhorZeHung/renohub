import { z } from "zod";

// Predefined categories
export const ITEM_CATEGORIES = [
  "Flooring",
  "Paint",
  "Tiles",
  "Carpentry",
  "Electrical",
  "Plumbing",
  "Ceiling",
  "Hacking",
  "Other",
] as const;

// Common units (users can still type custom)
export const ITEM_UNITS = [
  "sqft",
  "piece",
  "unit",
  "set",
  "lot",
  "hour",
  "day",
  "ft",
  "meter",
  "gallon",
  "point",
] as const;

// Helper to transform empty strings to null
const emptyToNull = (val: string | null | undefined) =>
  val === "" ? null : val;

// Image schema
const itemImageSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
  filename: z.string().min(1, "Filename is required"),
  order: z.number().int().min(0).default(0),
});

// Item creation schema
export const itemCreateSchema = z.object({
  name: z
    .string()
    .min(2, "Item name must be at least 2 characters")
    .max(200, "Item name must be at most 200 characters")
    .trim(),
  unit: z
    .string()
    .min(1, "Unit is required")
    .max(50, "Unit must be at most 50 characters")
    .trim(),
  pricePerUnit: z
    .number()
    .min(0, "Price cannot be negative")
    .transform((val) => Math.round(val * 100) / 100), // Round to 2 decimal places
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .transform(emptyToNull)
    .optional()
    .nullable(),
  brand: z
    .string()
    .max(100, "Brand must be at most 100 characters")
    .transform(emptyToNull)
    .optional()
    .nullable(),
  category: z
    .string()
    .max(100, "Category must be at most 100 characters")
    .transform(emptyToNull)
    .optional()
    .nullable(),
  images: z
    .array(itemImageSchema)
    .max(5, "Maximum 5 images allowed")
    .optional()
    .default([]),
});

export type ItemCreateInput = z.infer<typeof itemCreateSchema>;

// Item update schema (all fields optional)
export const itemUpdateSchema = z
  .object({
    name: z
      .string()
      .min(2, "Item name must be at least 2 characters")
      .max(200, "Item name must be at most 200 characters")
      .trim()
      .optional(),
    unit: z
      .string()
      .min(1, "Unit is required")
      .max(50, "Unit must be at most 50 characters")
      .trim()
      .optional(),
    pricePerUnit: z
      .number()
      .min(0, "Price cannot be negative")
      .transform((val) => Math.round(val * 100) / 100)
      .optional(),
    description: z
      .string()
      .max(1000, "Description must be at most 1000 characters")
      .transform(emptyToNull)
      .optional()
      .nullable(),
    brand: z
      .string()
      .max(100, "Brand must be at most 100 characters")
      .transform(emptyToNull)
      .optional()
      .nullable(),
    category: z
      .string()
      .max(100, "Category must be at most 100 characters")
      .transform(emptyToNull)
      .optional()
      .nullable(),
    images: z
      .array(itemImageSchema)
      .max(5, "Maximum 5 images allowed")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type ItemUpdateInput = z.infer<typeof itemUpdateSchema>;

// Query schema for listing items
export const itemQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  active: z
    .string()
    .optional()
    .transform((val) => val !== "false"), // Default to true
  page: z
    .string()
    .optional()
    .transform((val) => {
      const num = parseInt(val || "1", 10);
      return isNaN(num) || num < 1 ? 1 : num;
    }),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      const num = parseInt(val || "20", 10);
      if (isNaN(num) || num < 1) return 20;
      if (num > 100) return 100;
      return num;
    }),
  sort: z
    .string()
    .optional()
    .transform((val) => {
      const allowedSorts = ["name", "pricePerUnit", "category", "createdAt", "updatedAt"];
      return allowedSorts.includes(val || "") ? val : "createdAt";
    }),
  order: z
    .string()
    .optional()
    .transform((val) => (val === "asc" ? "asc" : "desc")),
});

export type ItemQueryInput = z.infer<typeof itemQuerySchema>;
