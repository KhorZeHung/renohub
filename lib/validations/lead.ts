import { z } from "zod";

// Lead statuses
export const LEAD_STATUSES = [
  "new",
  "contacted",
  "quoted",
  "negotiating",
  "won",
  "lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

// Helper to transform empty strings to null
const emptyToNull = (val: string | null | undefined) =>
  val === "" ? null : val;

// Lead image schema
const leadImageSchema = z.object({
  url: z.string(),
  filename: z.string(),
  order: z.number(),
});

// Lead creation schema (for form - status required)
export const leadCreateSchema = z.object({
  clientName: z
    .string()
    .min(2, "Client name must be at least 2 characters")
    .max(100, "Client name must be at most 100 characters")
    .trim(),
  contactNumber: z
    .string()
    .min(8, "Contact number must be at least 8 characters")
    .max(20, "Contact number must be at most 20 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  budget: z
    .number()
    .min(0, "Budget cannot be negative")
    .transform((val) => Math.round(val * 100) / 100),
  siteAddress: z
    .string()
    .min(5, "Site address must be at least 5 characters")
    .max(500, "Site address must be at most 500 characters")
    .trim(),
  status: z.enum(LEAD_STATUSES),
  remark: z
    .string()
    .max(2000, "Remark must be at most 2000 characters")
    .transform(emptyToNull)
    .optional()
    .nullable(),
  images: z.array(leadImageSchema).max(5).optional(),
});

export type LeadCreateInput = z.infer<typeof leadCreateSchema>;

// Lead update schema (all fields optional)
export const leadUpdateSchema = z
  .object({
    clientName: z
      .string()
      .min(2, "Client name must be at least 2 characters")
      .max(100, "Client name must be at most 100 characters")
      .trim()
      .optional(),
    contactNumber: z
      .string()
      .min(8, "Contact number must be at least 8 characters")
      .max(20, "Contact number must be at most 20 characters")
      .trim()
      .optional(),
    email: z
      .string()
      .email("Please enter a valid email address")
      .toLowerCase()
      .trim()
      .optional(),
    budget: z
      .number()
      .min(0, "Budget cannot be negative")
      .transform((val) => Math.round(val * 100) / 100)
      .optional(),
    siteAddress: z
      .string()
      .min(5, "Site address must be at least 5 characters")
      .max(500, "Site address must be at most 500 characters")
      .trim()
      .optional(),
    status: z.enum(LEAD_STATUSES).optional(),
    remark: z
      .string()
      .max(2000, "Remark must be at most 2000 characters")
      .transform(emptyToNull)
      .optional()
      .nullable(),
    images: z.array(leadImageSchema).max(5).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type LeadUpdateInput = z.infer<typeof leadUpdateSchema>;

// Status update schema (for PATCH /status endpoint)
export const leadStatusUpdateSchema = z.object({
  status: z.enum(LEAD_STATUSES),
  note: z
    .string()
    .max(500, "Note must be at most 500 characters")
    .transform(emptyToNull)
    .optional()
    .nullable(),
});

export type LeadStatusUpdateInput = z.infer<typeof leadStatusUpdateSchema>;

// Query schema for listing leads
export const leadQuerySchema = z.object({
  search: z.string().optional(),
  status: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "all") return undefined;
      const statuses = val
        .split(",")
        .map((s) => s.trim())
        .filter((s) => LEAD_STATUSES.includes(s as LeadStatus)) as LeadStatus[];
      return statuses.length > 0 ? statuses : undefined;
    }),
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
      const allowedSorts = [
        "clientName",
        "budget",
        "status",
        "createdAt",
        "updatedAt",
      ];
      return allowedSorts.includes(val || "") ? val : "createdAt";
    }),
  order: z
    .string()
    .optional()
    .transform((val) => (val === "asc" ? "asc" : "desc")),
});

export type LeadQueryInput = z.infer<typeof leadQuerySchema>;
