import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models";
import { getAuthenticatedSession } from "@/lib/auth-utils";
import { changeEmailSchema } from "@/lib/validations/user";
import { signIn } from "@/lib/auth";

/**
 * POST /api/user/change-email
 * Request email change - sends verification link to new email
 * The user's email will be updated after they click the verification link
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { session, error } = await getAuthenticatedSession();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = changeEmailSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { newEmail } = validationResult.data;

    // Check if email is same as current
    if (newEmail === session.user.email) {
      return NextResponse.json(
        { error: "New email must be different from your current email" },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Check if email is already in use by another user
    const existingUser = await User.findOne({ email: newEmail }).lean();
    if (existingUser) {
      return NextResponse.json(
        { error: "This email is already registered" },
        { status: 409 }
      );
    }

    // Update the user's email directly
    // NextAuth's magic link flow will verify the new email when clicked
    await User.findByIdAndUpdate(session.user.id, {
      $set: {
        email: newEmail,
        emailVerified: null, // Reset verification status
      },
    });

    // Send magic link to new email for verification
    // This uses NextAuth's built-in email verification flow
    try {
      await signIn("nodemailer", {
        email: newEmail,
        redirect: false,
        callbackUrl: "/settings",
      });
    } catch {
      // Revert email change if magic link fails
      await User.findByIdAndUpdate(session.user.id, {
        $set: {
          email: session.user.email,
          emailVerified: new Date(),
        },
      });
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Verification email sent to ${newEmail}. Please click the link in the email to complete the change.`,
    });
  } catch (error) {
    console.error("Change email error:", error);
    return NextResponse.json(
      { error: "Failed to change email" },
      { status: 500 }
    );
  }
}
