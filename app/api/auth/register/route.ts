import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models";
import { registerSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { signIn } from "@/lib/auth";

/**
 * POST /api/auth/register
 * Register a new user and send magic link
 *
 * Flow:
 * 1. Validate request body
 * 2. Check rate limit
 * 3. Check if email already exists
 * 4. Create user record (or update name if exists)
 * 5. Trigger magic link send
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { name, email } = validationResult.data;

    // Check rate limit
    const rateLimitResult = checkRateLimit(email);
    if (!rateLimitResult.success) {
      const retryAfterSeconds = Math.ceil(rateLimitResult.resetInMs / 1000);
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfterSeconds.toString(),
          },
        }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
      // If user exists and is verified, they should use login instead
      if (existingUser.emailVerified) {
        return NextResponse.json(
          {
            error: "An account with this email already exists. Please log in.",
            code: "EMAIL_EXISTS",
          },
          { status: 409 }
        );
      }

      // If user exists but not verified, update name and resend verification
      await User.updateOne({ email }, { name });
    } else {
      // Create new user
      await User.create({
        name,
        email,
        emailVerified: null,
        role: "owner",
        lastActiveAt: new Date(),
      });
    }

    // Trigger Auth.js magic link flow
    // This will send the verification email
    try {
      await signIn("nodemailer", {
        email,
        redirect: false,
        callbackUrl: "/setup",
      });
    } catch (error) {
      // Auth.js signIn throws a redirect error on success
      // We need to catch and ignore it
      if (
        error instanceof Error &&
        error.message.includes("NEXT_REDIRECT")
      ) {
        // This is expected behavior - magic link was sent
      } else {
        throw error;
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Verification email sent. Please check your inbox.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Handle mongoose duplicate key error
    if (
      error instanceof Error &&
      error.message.includes("duplicate key")
    ) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "An error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
