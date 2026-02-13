import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { User } from "@/lib/models";
import { getAuthenticatedSession } from "@/lib/auth-utils";
import { userUpdateSchema } from "@/lib/validations/user";

/**
 * GET /api/user
 * Get the current user's profile
 */
export async function GET() {
  try {
    // Check authentication
    const { session, error } = await getAuthenticatedSession();
    if (error) return error;

    // Connect to database
    await connectToDatabase();

    // Find user by ID
    const user = await User.findById(session.user.id).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Transform _id to id for frontend consistency
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image || null,
      contactNumber: user.contactNumber || null,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user
 * Update the current user's profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const { session, error } = await getAuthenticatedSession();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();
    console.log("User update request body:", JSON.stringify(body, null, 2));

    const validationResult = userUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      console.error(
        "User validation errors:",
        JSON.stringify(validationResult.error.flatten(), null, 2)
      );
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const userData = validationResult.data;
    console.log("User validated data:", JSON.stringify(userData, null, 2));

    // Connect to database
    await connectToDatabase();

    // Update user
    const user = await User.findByIdAndUpdate(
      session.user.id,
      { $set: userData },
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Transform _id to id for frontend consistency
    const userResponse = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image || null,
      contactNumber: user.contactNumber || null,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json(userResponse);
  } catch (error) {
    console.error("Update user error:", error);

    // Handle mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      const errors: Record<string, string[]> = {};
      for (const [field, err] of Object.entries(error.errors)) {
        errors[field] = [err.message];
      }
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
