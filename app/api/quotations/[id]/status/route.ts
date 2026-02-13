import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Quotation, Lead } from "@/lib/models";
import {
  getAuthenticatedSessionWithCompany,
  validateOwnership,
} from "@/lib/auth-utils";
import { quotationStatusUpdateSchema } from "@/lib/validations/quotation";
import { countTotalLineItems } from "@/lib/quotation-helpers";
import type { IQuotation, IQuotationGroup } from "@/lib/models/quotation";

/**
 * Transform Quotation document to full API response format
 */
function transformQuotationFull(quotation: IQuotation) {
  return {
    id: quotation._id.toString(),
    quotationNumber: quotation.quotationNumber,
    leadId: quotation.leadId ? quotation.leadId.toString() : null,
    client: quotation.client,
    companySnapshot: quotation.companySnapshot,
    groups: quotation.groups.map((group: IQuotationGroup) => ({
      ...group,
      lineItems: group.lineItems.map((item) => ({
        ...item,
        itemId: item.itemId ? item.itemId.toString() : null,
      })),
    })),
    subtotal: quotation.subtotal,
    discount: quotation.discount || null,
    taxableAmount: quotation.taxableAmount,
    taxRate: quotation.taxRate,
    taxAmount: quotation.taxAmount,
    total: quotation.total,
    validUntil: quotation.validUntil,
    termsAndConditions: quotation.termsAndConditions || null,
    notes: quotation.notes || null,
    status: quotation.status,
    pdfUrl: quotation.pdfUrl || null,
    pdfGeneratedAt: quotation.pdfGeneratedAt || null,
    isDeleted: quotation.isDeleted,
    groupsCount: quotation.groups.length,
    totalLineItems: countTotalLineItems(quotation.groups),
    createdAt: quotation.createdAt,
    updatedAt: quotation.updatedAt,
  };
}

/**
 * PATCH /api/quotations/[id]/status
 * Update quotation status with lead auto-update for "accepted" status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check authentication and company setup
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid quotation ID format" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = quotationStatusUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status: newStatus } = validationResult.data;

    // Connect to database
    await connectToDatabase();

    // Find quotation
    const quotation = await Quotation.findById(id);

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    // Validate ownership
    const ownershipError = validateOwnership(quotation.companyId, company._id);
    if (ownershipError) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    // Check if quotation is deleted
    if (quotation.isDeleted) {
      return NextResponse.json(
        { error: "Cannot update status of deleted quotation" },
        { status: 400 }
      );
    }

    // Check if status is the same
    if (quotation.status === newStatus) {
      return NextResponse.json(
        { error: "Quotation already has this status" },
        { status: 400 }
      );
    }

    let leadUpdated = false;

    // Handle "accepted" status - auto-update lead and demote other accepted quotations
    if (newStatus === "accepted" && quotation.leadId) {
      // Find the associated lead
      const lead = await Lead.findOne({
        _id: quotation.leadId,
        companyId: company._id,
        isDeleted: false,
      });

      if (lead) {
        // Demote any other accepted quotations for this lead to "sent"
        await Quotation.updateMany(
          {
            leadId: quotation.leadId,
            companyId: company._id,
            status: "accepted",
            _id: { $ne: quotation._id },
            isDeleted: false,
          },
          { $set: { status: "sent" } }
        );

        // Update lead status to "won" if not already
        if (lead.status !== "won") {
          lead.status = "won";
          lead.statusHistory.push({
            status: "won",
            note: `Quotation ${quotation.quotationNumber} accepted`,
            changedAt: new Date(),
          });
          await lead.save();
          leadUpdated = true;
        }
      }
    }

    // Update quotation status
    quotation.status = newStatus;
    await quotation.save();

    // Transform and return
    const quotationResponse = transformQuotationFull(quotation.toObject());

    return NextResponse.json({
      quotation: quotationResponse,
      leadUpdated,
    });
  } catch (error) {
    console.error("Update quotation status error:", error);
    return NextResponse.json(
      { error: "Failed to update quotation status" },
      { status: 500 }
    );
  }
}
