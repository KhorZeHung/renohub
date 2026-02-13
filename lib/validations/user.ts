import { z } from "zod";

// User profile update schema
export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim()
    .optional(),
  contactNumber: z
    .string()
    .max(20, "Contact number must be at most 20 characters")
    .transform((val) => (val === "" ? null : val))
    .optional()
    .nullable(),
  image: z
    .string()
    .transform((val) => (val === "" ? null : val))
    .optional()
    .nullable(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

// Email change schema
export const changeEmailSchema = z.object({
  newEmail: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
});

export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
