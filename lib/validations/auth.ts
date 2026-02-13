import { z } from "zod";

// Registration schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be at most 100 characters")
    .trim(),
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Login schema (magic link request)
export const loginSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Magic link verification schema
export const verifySchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: z.string().email("Invalid email").optional(),
});

export type VerifyInput = z.infer<typeof verifySchema>;
