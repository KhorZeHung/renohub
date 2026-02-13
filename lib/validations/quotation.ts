import { z } from "zod";

// Quotation statuses
export const QUOTATION_STATUSES = [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "rejected",
  "expired",
] as const;

export type QuotationStatus = (typeof QUOTATION_STATUSES)[number];

// Discount types
export const DISCOUNT_TYPES = ["percentage", "fixed"] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

// Helper to transform empty strings to null
const emptyToNull = (val: string | null | undefined) =>
  val === "" ? null : val;

// Helper to transform empty strings to undefined
const emptyToUndefined = (val: string | undefined) =>
  val === "" ? undefined : val;

// Selected image schema (for attachment)
export const selectedImageSchema = z.object({
  url: z.string().min(1, "Image URL is required"),
  filename: z.string().min(1, "Filename is required"),
  caption: z
    .string()
    .max(200, "Caption must be at most 200 characters")
    .transform(emptyToNull)
    .optional()
    .nullable(),
});

export type SelectedImageInput = z.infer<typeof selectedImageSchema>;

// Line item discount schema
export const lineItemDiscountSchema = z.object({
  type: z.enum(DISCOUNT_TYPES),
  value: z.number().min(0, "Discount value cannot be negative"),
});

export type LineItemDiscountInput = z.infer<typeof lineItemDiscountSchema>;

// Line item schema
export const lineItemSchema = z.object({
  id: z.string().min(1, "Line item ID is required"),
  itemId: z
    .string()
    .transform(emptyToNull)
    .optional()
    .nullable(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be at most 500 characters")
    .trim(),
  quantity: z
    .number()
    .min(0.01, "Quantity must be at least 0.01")
    .transform((val) => Math.round(val * 100) / 100),
  unit: z
    .string()
    .min(1, "Unit is required")
    .max(50, "Unit must be at most 50 characters")
    .trim(),
  unitPrice: z
    .number()
    .min(0, "Unit price cannot be negative")
    .transform((val) => Math.round(val * 100) / 100),
  amount: z
    .number()
    .min(0, "Amount cannot be negative")
    .transform((val) => Math.round(val * 100) / 100),
  discount: lineItemDiscountSchema.optional(),
  selectedImages: z
    .array(selectedImageSchema)
    .max(5, "Maximum 5 images can be selected per line item")
    .optional()
    .default([]),
});

export type LineItemInput = z.infer<typeof lineItemSchema>;

// Group schema
export const groupSchema = z.object({
  id: z.string().min(1, "Group ID is required"),
  name: z
    .string()
    .min(1, "Group name is required")
    .max(200, "Group name must be at most 200 characters")
    .trim(),
  description: z
    .string()
    .max(1000, "Group description must be at most 1000 characters")
    .transform(emptyToNull)
    .optional()
    .nullable(),
  order: z.number().min(0, "Order must be at least 0").default(0),
  lineItems: z
    .array(lineItemSchema)
    .min(1, "Group must have at least 1 line item"),
  subtotal: z
    .number()
    .min(0, "Subtotal cannot be negative")
    .transform((val) => Math.round(val * 100) / 100),
});

export type GroupInput = z.infer<typeof groupSchema>;

// Client info schema
export const clientInfoSchema = z.object({
  name: z
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
    .trim()
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .max(500, "Address must be at most 500 characters")
    .transform(emptyToUndefined)
    .optional(),
});

export type ClientInfoInput = z.infer<typeof clientInfoSchema>;

// Document-level discount schema
export const quotationDiscountSchema = z.object({
  type: z.enum(DISCOUNT_TYPES),
  value: z.number().min(0, "Discount value cannot be negative"),
});

export type QuotationDiscountInput = z.infer<typeof quotationDiscountSchema>;

// Quotation creation schema
export const quotationCreateSchema = z.object({
  leadId: z
    .string()
    .transform(emptyToNull)
    .optional()
    .nullable(),
  client: clientInfoSchema,
  groups: z.array(groupSchema).min(1, "Quotation must have at least 1 group"),
  discount: quotationDiscountSchema.optional(),
  taxRate: z
    .number()
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100%")
    .transform((val) => Math.round(val * 100) / 100),
  validUntil: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Please enter a valid date"),
  termsAndConditions: z
    .string()
    .max(5000, "Terms and conditions must be at most 5000 characters")
    .transform(emptyToNull)
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(2000, "Notes must be at most 2000 characters")
    .transform(emptyToNull)
    .optional()
    .nullable(),
  status: z.enum(QUOTATION_STATUSES).default("draft"),
});

export type QuotationCreateInput = z.infer<typeof quotationCreateSchema>;

// Quotation update schema (all fields optional)
export const quotationUpdateSchema = z
  .object({
    leadId: z
      .string()
      .transform(emptyToNull)
      .optional()
      .nullable(),
    client: clientInfoSchema.optional(),
    groups: z
      .array(groupSchema)
      .min(1, "Quotation must have at least 1 group")
      .optional(),
    discount: quotationDiscountSchema.optional().nullable(),
    taxRate: z
      .number()
      .min(0, "Tax rate cannot be negative")
      .max(100, "Tax rate cannot exceed 100%")
      .transform((val) => Math.round(val * 100) / 100)
      .optional(),
    validUntil: z
      .string()
      .refine((val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      }, "Please enter a valid date")
      .optional(),
    termsAndConditions: z
      .string()
      .max(5000, "Terms and conditions must be at most 5000 characters")
      .transform(emptyToNull)
      .optional()
      .nullable(),
    notes: z
      .string()
      .max(2000, "Notes must be at most 2000 characters")
      .transform(emptyToNull)
      .optional()
      .nullable(),
    status: z.enum(QUOTATION_STATUSES).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type QuotationUpdateInput = z.infer<typeof quotationUpdateSchema>;

// Status update schema
export const quotationStatusUpdateSchema = z.object({
  status: z.enum(QUOTATION_STATUSES, {
    message: "Invalid status value",
  }),
});

export type QuotationStatusUpdateInput = z.infer<
  typeof quotationStatusUpdateSchema
>;

// Query schema for listing quotations
export const quotationQuerySchema = z.object({
  search: z.string().optional(),
  status: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "all") return undefined;
      if (QUOTATION_STATUSES.includes(val as QuotationStatus))
        return val as QuotationStatus;
      return undefined;
    }),
  leadId: z
    .string()
    .optional()
    .transform(emptyToUndefined),
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
        "quotationNumber",
        "total",
        "validUntil",
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

export type QuotationQueryInput = z.infer<typeof quotationQuerySchema>;

// Standalone quotation schema (for PDF generation only, no status)
export const standaloneQuotationSchema = z.object({
  client: clientInfoSchema,
  groups: z.array(groupSchema).min(1, "Quotation must have at least 1 group"),
  discount: quotationDiscountSchema.optional(),
  taxRate: z
    .number()
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100%")
    .transform((val) => Math.round(val * 100) / 100),
  validUntil: z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  }, "Please enter a valid date"),
  termsAndConditions: z
    .string()
    .max(5000, "Terms and conditions must be at most 5000 characters")
    .transform(emptyToNull)
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(2000, "Notes must be at most 2000 characters")
    .transform(emptyToNull)
    .optional()
    .nullable(),
});

export type StandaloneQuotationInput = z.infer<typeof standaloneQuotationSchema>;

// Standalone save schema (with lead creation option)
export const standaloneSaveSchema = z.object({
  quotation: standaloneQuotationSchema,
  createLead: z.boolean(),
  leadId: z
    .string()
    .transform(emptyToNull)
    .optional()
    .nullable(),
  lead: z
    .object({
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
        .trim()
        .optional()
        .or(z.literal("")),
      budget: z
        .number()
        .min(0, "Budget cannot be negative")
        .transform((val) => Math.round(val * 100) / 100),
      siteAddress: z
        .string()
        .max(500, "Site address must be at most 500 characters")
        .trim()
        .optional()
        .nullable(),
      status: z.enum([
        "new",
        "contacted",
        "quoted",
        "negotiating",
        "won",
        "lost",
      ]),
      remark: z
        .string()
        .max(2000, "Remark must be at most 2000 characters")
        .transform(emptyToNull)
        .optional()
        .nullable(),
    })
    .optional(),
}).refine(
  (data) => {
    // If createLead is true, lead data must be provided
    if (data.createLead && !data.lead) {
      return false;
    }
    // If createLead is false, leadId must be provided
    if (!data.createLead && !data.leadId) {
      return false;
    }
    return true;
  },
  {
    message:
      "Either provide lead data for creation or leadId for existing lead",
  }
);

export type StandaloneSaveInput = z.infer<typeof standaloneSaveSchema>;
