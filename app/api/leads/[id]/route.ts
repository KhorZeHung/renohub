import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/lib/models";
import {
  getAuthenticatedSessionWithCompany,
  validateOwnership,
} from "@/lib/auth-utils";
import { leadUpdateSchema } from "@/lib/validations/lead";

/**
 * Transform Lead document to API response format (detailed view)
 */
function transformLeadDetail(
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
    statusHistory: Array<{ status: string; note?: string; changedAt: Date }>;
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
    statusHistory: lead.statusHistory || [],
    quotationsCount,
    isDeleted: lead.isDeleted,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

/**
 * Validate ObjectId format
 */
function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/leads/[id]
 * Get a single lead by ID
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 });
    }

    // Check authentication and company setup
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    // Connect to database
    await connectToDatabase();

    // Find lead
    const lead = await Lead.findById(id).lean();

    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Validate ownership
    if (!validateOwnership(lead.companyId, company._id)) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Get quotation count for this lead
    // TODO: When Quotation model exists, count quotations here
    const quotationsCount = 0;

    // Transform and return
    const leadResponse = transformLeadDetail(lead, quotationsCount);

    return NextResponse.json({ lead: leadResponse });
  } catch (error) {
    console.error("Get lead error:", error);
    return NextResponse.json(
      { error: "Failed to fetch lead" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/leads/[id]
 * Update a lead (does NOT track status history - use PATCH /status for that)
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 });
    }

    // Check authentication and company setup
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();

    // Check if body is empty
    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const validationResult = leadUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const updateData = validationResult.data;

    // Connect to database
    await connectToDatabase();

    // Find lead first to validate ownership
    const existingLead = await Lead.findById(id).lean();

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Validate ownership
    if (!validateOwnership(existingLead.companyId, company._id)) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Check if lead is deleted
    if (existingLead.isDeleted) {
      return NextResponse.json(
        { error: "Cannot update deleted lead" },
        { status: 400 }
      );
    }

    // Update lead (no status history tracking for PUT)
    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedLead) {
      return NextResponse.json(
        { error: "Failed to update lead" },
        { status: 500 }
      );
    }

    // Get quotation count
    // TODO: When Quotation model exists, count quotations here
    const quotationsCount = 0;

    // Transform and return
    const leadResponse = transformLeadDetail(updatedLead, quotationsCount);

    return NextResponse.json({ lead: leadResponse });
  } catch (error) {
    console.error("Update lead error:", error);

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
      { error: "Failed to update lead" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leads/[id]
 * Soft delete a lead (sets isDeleted to true)
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid lead ID" }, { status: 400 });
    }

    // Check authentication and company setup
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    // Connect to database
    await connectToDatabase();

    // Find lead first to validate ownership
    const existingLead = await Lead.findById(id).lean();

    if (!existingLead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Validate ownership
    if (!validateOwnership(existingLead.companyId, company._id)) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    // Soft delete (set isDeleted to true)
    await Lead.findByIdAndUpdate(id, { $set: { isDeleted: true } });

    return NextResponse.json({ message: "Lead deleted successfully" });
  } catch (error) {
    console.error("Delete lead error:", error);
    return NextResponse.json(
      { error: "Failed to delete lead" },
      { status: 500 }
    );
  }
}
