import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Quotation, Lead } from "@/lib/models";
import {
  getAuthenticatedSessionWithCompany,
  validateOwnership,
} from "@/lib/auth-utils";
import { quotationUpdateSchema } from "@/lib/validations/quotation";
import {
  processGroups,
  calculateQuotationTotals,
  countTotalLineItems,
} from "@/lib/quotation-helpers";
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
 * GET /api/quotations/[id]
 * Get a single quotation by ID
 */
export async function GET(
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

    // Connect to database
    await connectToDatabase();

    // Find quotation
    const quotation = await Quotation.findOne({
      _id: id,
      isDeleted: false,
    }).lean();

    if (!quotation) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    // Validate ownership
    const ownershipError = validateOwnership(quotation.companyId, company._id);
    if (!ownershipError) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    // Transform and return
    const quotationResponse = transformQuotationFull(quotation as unknown as IQuotation);

    return NextResponse.json({ quotation: quotationResponse });
  } catch (error) {
    console.error("Get quotation error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotation" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/quotations/[id]
 * Update a quotation
 */
export async function PUT(
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
    const validationResult = quotationUpdateSchema.safeParse(body);

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
        { error: "Cannot update deleted quotation" },
        { status: 400 }
      );
    }

    // Check if quotation is accepted (prevent edits)
    if (quotation.status === "accepted") {
      return NextResponse.json(
        { error: "Cannot edit accepted quotation" },
        { status: 400 }
      );
    }

    // Verify leadId if being updated
    if (updateData.leadId !== undefined) {
      if (updateData.leadId) {
        if (!mongoose.Types.ObjectId.isValid(updateData.leadId)) {
          return NextResponse.json(
            { error: "Invalid lead ID format" },
            { status: 400 }
          );
        }

        const lead = await Lead.findOne({
          _id: updateData.leadId,
          companyId: company._id,
          isDeleted: false,
        });

        if (!lead) {
          return NextResponse.json(
            { error: "Lead not found" },
            { status: 400 }
          );
        }
      }
      quotation.leadId = updateData.leadId
        ? new mongoose.Types.ObjectId(updateData.leadId)
        : null;
    }

    // Update client if provided
    if (updateData.client) {
      quotation.client = {
        name: updateData.client.name,
        contactNumber: updateData.client.contactNumber,
        email: updateData.client.email || undefined,
        address: updateData.client.address || undefined,
      };
    }

    // Update groups and recalculate totals if provided
    if (updateData.groups) {
      const processedGroups = processGroups(updateData.groups);
      quotation.groups = processedGroups;
    }

    // Get current tax rate (use new if provided, otherwise use existing)
    const taxRate = updateData.taxRate ?? quotation.taxRate;

    // Recalculate totals if groups, discount, or taxRate changed
    if (
      updateData.groups ||
      updateData.discount !== undefined ||
      updateData.taxRate !== undefined
    ) {
      const discount =
        updateData.discount !== undefined
          ? (updateData.discount ?? undefined)
          : quotation.discount
          ? { type: quotation.discount.type, value: quotation.discount.value }
          : undefined;

      const totals = calculateQuotationTotals(
        quotation.groups,
        discount,
        taxRate
      );

      quotation.subtotal = totals.subtotal;
      quotation.taxableAmount = totals.taxableAmount;
      quotation.taxRate = taxRate;
      quotation.taxAmount = totals.taxAmount;
      quotation.total = totals.total;

      // Update discount object
      if (discount) {
        quotation.discount = {
          type: discount.type,
          value: discount.value,
          amount: totals.discountAmount,
        };
      } else if (updateData.discount === null) {
        quotation.discount = undefined;
      }
    }

    // Update other fields if provided
    if (updateData.validUntil) {
      quotation.validUntil = new Date(updateData.validUntil);
    }

    if (updateData.termsAndConditions !== undefined) {
      quotation.termsAndConditions = updateData.termsAndConditions || undefined;
    }

    if (updateData.notes !== undefined) {
      quotation.notes = updateData.notes || undefined;
    }

    if (updateData.status) {
      quotation.status = updateData.status;
    }

    // Save updated quotation
    await quotation.save();

    // Transform and return
    const quotationResponse = transformQuotationFull(quotation.toObject());

    return NextResponse.json({ quotation: quotationResponse });
  } catch (error) {
    console.error("Update quotation error:", error);

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
      { error: "Failed to update quotation" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/quotations/[id]
 * Soft delete a quotation
 */
export async function DELETE(
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

    // Check if already deleted
    if (quotation.isDeleted) {
      return NextResponse.json(
        { error: "Quotation already deleted" },
        { status: 400 }
      );
    }

    // Soft delete
    quotation.isDeleted = true;
    await quotation.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete quotation error:", error);
    return NextResponse.json(
      { error: "Failed to delete quotation" },
      { status: 500 }
    );
  }
}
