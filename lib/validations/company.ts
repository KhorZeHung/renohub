import { z } from "zod";

// Logo schema - url can be relative path or full URL
const logoSchema = z.object({
  url: z.string().min(1, "Logo URL is required"),
  filename: z.string().min(1, "Filename is required"),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
});

// Helper to transform empty strings to null
const emptyToNull = (val: string | null | undefined) =>
  val === "" ? null : val;

// Company creation/update schema
export const companySchema = z.object({
  name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be at most 100 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  contactNumber: z
    .string()
    .max(20, "Contact number must be at most 20 characters")
    .transform(emptyToNull)
    .optional()
    .nullable(),
  address: z
    .string()
    .max(500, "Address must be at most 500 characters")
    .transform(emptyToNull)
    .optional()
    .nullable(),
  website: z
    .string()
    .max(200, "Website URL must be at most 200 characters")
    .transform(emptyToNull)
    .refine(
      (val) => !val || /^https?:\/\/.+/.test(val),
      "Please enter a valid website URL (starting with http:// or https://)"
    )
    .optional()
    .nullable(),
  taxRegistrationNumber: z
    .string()
    .max(50, "Tax registration number must be at most 50 characters")
    .transform(emptyToNull)
    .optional()
    .nullable(),
  logo: logoSchema.optional().nullable(),
  defaultTerms: z
    .string()
    .max(5000, "Default terms must be at most 5000 characters")
    .transform(emptyToNull)
    .optional()
    .nullable(),
  defaultValidityDays: z
    .number()
    .min(1, "Validity days must be at least 1")
    .max(365, "Validity days must be at most 365")
    .optional()
    .default(30),
  defaultTaxRate: z
    .number()
    .min(0, "Tax rate cannot be negative")
    .max(100, "Tax rate cannot exceed 100%")
    .transform((val) => Math.round(val * 100) / 100) // Round to 2 decimal places
    .optional()
    .default(0),
});

export type CompanyInput = z.infer<typeof companySchema>;

// Partial update schema (all fields optional except required ones)
export const companyUpdateSchema = companySchema.partial();

export type CompanyUpdateInput = z.infer<typeof companyUpdateSchema>;

// Initial setup schema (only required fields for onboarding)
export const companySetupSchema = z.object({
  name: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name must be at most 100 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
  contactNumber: z
    .string()
    .max(20, "Contact number must be at most 20 characters")
    .optional(),
});

export type CompanySetupInput = z.infer<typeof companySetupSchema>;
