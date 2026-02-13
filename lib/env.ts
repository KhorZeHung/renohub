import { z } from "zod";

/**
 * Environment variable validation schema
 * This ensures all required env vars are present and properly typed
 */
const envSchema = z.object({
  // App Configuration
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_APP_NAME: z.string().default("RenoHub"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),

  // Database
  MONGODB_URI: z.string().min(1, "MongoDB URI is required"),

  // Authentication
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_URL: z.string().url().optional(),

  // Email Service (SMTP)
  SMTP_HOST: z.string().min(1, "SMTP_HOST is required"),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z.string().default("false"),
  SMTP_USER: z.string().min(1, "SMTP_USER is required"),
  SMTP_PASSWORD: z.string().min(1, "SMTP_PASSWORD is required"),
  EMAIL_FROM: z.string().email("EMAIL_FROM must be a valid email"),

  // File Uploads
  UPLOAD_DIR: z.string().default("./public/uploads"),
  MAX_FILE_SIZE: z.coerce.number().default(5242880), // 5MB

  // Security
  MAGIC_LINK_EXPIRY_MINUTES: z.coerce.number().default(15),
  RATE_LIMIT_MAGIC_LINK: z.coerce.number().default(3),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables
 * Call this at app startup to ensure all required env vars are present
 */
function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "Invalid environment variables:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

/**
 * Validated environment variables
 * Use this instead of process.env for type-safe access
 */
export const env = validateEnv();

/**
 * Check if we're in development mode
 */
export const isDev = env.NODE_ENV === "development";

/**
 * Check if we're in production mode
 */
export const isProd = env.NODE_ENV === "production";

/**
 * Check if we're in test mode
 */
export const isTest = env.NODE_ENV === "test";
