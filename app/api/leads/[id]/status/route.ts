import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Lead } from "@/lib/models";
import {
  getAuthenticatedSessionWithCompany,
  validateOwnership,
} from "@/lib/auth-utils";
import { leadStatusUpdateSchema } from "@/lib/validations/lead";

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
 * PATCH /api/leads/[id]/status
 * Update lead status with history tracking
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
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
    const validationResult = leadStatusUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status, note } = validationResult.data;

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

    // Check if status is actually changing
    if (existingLead.status === status) {
      return NextResponse.json(
        { error: "Lead already has this status" },
        { status: 400 }
      );
    }

    // Update status and add to history
    const statusHistoryEntry = {
      status,
      note: note || undefined,
      changedAt: new Date(),
    };

    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      {
        $set: { status },
        $push: { statusHistory: statusHistoryEntry },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedLead) {
      return NextResponse.json(
        { error: "Failed to update lead status" },
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
    console.error("Update lead status error:", error);

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
      { error: "Failed to update lead status" },
      { status: 500 }
    );
  }
}
