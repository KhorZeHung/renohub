import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/lib/models";
import { getAuthenticatedSessionWithCompany } from "@/lib/auth-utils";
import { leadCreateSchema, leadQuerySchema } from "@/lib/validations/lead";

/**
 * Transform Lead document to API response format
 */
function transformLead(
  lead: {
    _id: mongoose.Types.ObjectId;
    clientName: string;
    contactNumber: string;
    email: string;
    budget: number;
    siteAddress: string;
    status: string;
    remark?: string;
    images?: Array<{ url: string; filename: string; order: number }>;
    statusHistory?: Array<{ status: string; note?: string; changedAt: Date }>;
    isDeleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  },
  quotationsCount: number = 0
) {
  return {
    id: lead._id.toString(),
    clientName: lead.clientName,
    contactNumber: lead.contactNumber,
    email: lead.email,
    budget: lead.budget,
    siteAddress: lead.siteAddress,
    status: lead.status,
    remark: lead.remark || null,
    images: lead.images || [],
    quotationsCount,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

/**
 * GET /api/leads
 * List all leads with pagination, search, and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and company setup
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryResult = leadQuerySchema.safeParse({
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      sort: searchParams.get("sort") || undefined,
      order: searchParams.get("order") || undefined,
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: "Invalid query parameters" },
        { status: 400 }
      );
    }

    const { search, status, page, limit, sort, order } = queryResult.data;

    // Connect to database
    await connectToDatabase();

    // Build query
    const query: Record<string, unknown> = {
      companyId: company._id,
      isDeleted: false,
    };

    // Add status filter
    if (status) {
      query.status = status.length === 1 ? status[0] : { $in: status };
    }

    // Add text search
    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { siteAddress: { $regex: search, $options: "i" } },
      ];
    }

    // Count total documents
    const total = await Lead.countDocuments(query);

    // Calculate pagination
    const totalPages = Math.ceil(total / limit);
    const skip = (page - 1) * limit;

    // Build sort object
    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sort || "createdAt"] = order === "asc" ? 1 : -1;

    // Fetch leads
    const leads = await Lead.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit)
      .lean();

    // Get quotation counts for all leads
    // TODO: When Quotation model exists, aggregate counts here
    // For now, return 0 for all leads
    const quotationCounts: Record<string, number> = {};

    // Transform leads
    const transformedLeads = leads.map((lead) =>
      transformLead(lead, quotationCounts[lead._id.toString()] || 0)
    );

    return NextResponse.json({
      leads: transformedLeads,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads
 * Create a new lead
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and company setup
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = leadCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const leadData = validationResult.data;

    // Connect to database
    await connectToDatabase();

    // Create new lead with initial status history
    const newLead = new Lead({
      ...leadData,
      companyId: company._id,
      isDeleted: false,
      statusHistory: [
        {
          status: leadData.status || "new",
          note: "Lead created",
          changedAt: new Date(),
        },
      ],
    });

    await newLead.save();

    // Transform and return
    const leadResponse = transformLead(newLead.toObject(), 0);

    return NextResponse.json({ lead: leadResponse }, { status: 201 });
  } catch (error) {
    console.error("Create lead error:", error);

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
      { error: "Failed to create lead" },
      { status: 500 }
    );
  }
}
