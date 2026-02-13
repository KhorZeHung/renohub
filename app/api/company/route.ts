import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Company } from "@/lib/models";
import { getAuthenticatedSession } from "@/lib/auth-utils";
import { companySchema, companyUpdateSchema } from "@/lib/validations/company";

/**
 * GET /api/company
 * Get the current user's company profile
 */
export async function GET() {
  try {
    // Check authentication
    const { session, error } = await getAuthenticatedSession();
    if (error) return error;

    // Connect to database
    await connectToDatabase();

    // Find company by user ID
    const company = await Company.findOne({
      userId: new mongoose.Types.ObjectId(session.user.id),
    }).lean();

    if (!company) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 }
      );
    }

    // Transform _id to id for frontend consistency
    const companyResponse = {
      id: company._id.toString(),
      userId: company.userId.toString(),
      name: company.name,
      email: company.email,
      contactNumber: company.contactNumber || null,
      address: company.address || null,
      website: company.website || null,
      taxRegistrationNumber: company.taxRegistrationNumber || null,
      logo: company.logo || null,
      defaultTerms: company.defaultTerms || null,
      defaultValidityDays: company.defaultValidityDays,
      defaultTaxRate: company.defaultTaxRate,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };

    return NextResponse.json(companyResponse);
  } catch (error) {
    console.error("Get company error:", error);
    return NextResponse.json(
      { error: "Failed to fetch company profile" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/company
 * Create or update the current user's company profile
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const { session, error } = await getAuthenticatedSession();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();
    console.log("Company update request body:", JSON.stringify(body, null, 2));

    const validationResult = companyUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      console.error(
        "Company validation errors:",
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

    const companyData = validationResult.data;
    console.log(
      "Company validated data:",
      JSON.stringify(companyData, null, 2)
    );

    // Connect to database
    await connectToDatabase();

    const userId = new mongoose.Types.ObjectId(session.user.id);

    // Check if company exists
    const existingCompany = await Company.findOne({ userId }).lean();

    let company;

    if (existingCompany) {
      // Update existing company
      company = await Company.findOneAndUpdate(
        { userId },
        { $set: companyData },
        { new: true, runValidators: true }
      ).lean();
    } else {
      // Validate that required fields are present for creation
      const createValidation = companySchema.safeParse(companyData);
      if (!createValidation.success) {
        return NextResponse.json(
          {
            error: "Missing required fields for company creation",
            details: createValidation.error.flatten().fieldErrors,
          },
          { status: 400 }
        );
      }

      // Create new company
      const newCompany = new Company({
        ...companyData,
        userId,
      });
      await newCompany.save();
      company = newCompany.toObject();
    }

    if (!company) {
      return NextResponse.json(
        { error: "Failed to save company profile" },
        { status: 500 }
      );
    }

    // Transform _id to id for frontend consistency
    const companyResponse = {
      id: company._id.toString(),
      userId: company.userId.toString(),
      name: company.name,
      email: company.email,
      contactNumber: company.contactNumber || null,
      address: company.address || null,
      website: company.website || null,
      taxRegistrationNumber: company.taxRegistrationNumber || null,
      logo: company.logo || null,
      defaultTerms: company.defaultTerms || null,
      defaultValidityDays: company.defaultValidityDays,
      defaultTaxRate: company.defaultTaxRate,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
    };

    return NextResponse.json(companyResponse, {
      status: existingCompany ? 200 : 201,
    });
  } catch (error) {
    console.error("Update company error:", error);

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
      { error: "Failed to update company profile" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/company
 * Partially update the current user's company profile
 * Alias for PUT with partial updates
 */
export async function PATCH(request: NextRequest) {
  return PUT(request);
}
