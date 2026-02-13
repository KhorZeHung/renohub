import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models";
import { loginSchema } from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { signIn } from "@/lib/auth";

/**
 * POST /api/auth/login
 * Validate user exists and send magic link
 *
 * Flow:
 * 1. Validate request body (email format)
 * 2. Check rate limit
 * 3. Check if user exists in database
 * 4. If found, send magic link
 * 5. If not found, return 404
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

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

    // Check if user exists
    const existingUser = await User.findOne({ email }).lean();

    if (!existingUser) {
      return NextResponse.json(
        {
          error:
            "No account found with this email address. Please sign up first.",
        },
        { status: 404 }
      );
    }

    // User exists (verified or unverified) - send magic link
    try {
      await signIn("nodemailer", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
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
        message: "Magic link sent. Please check your inbox.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "An error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
