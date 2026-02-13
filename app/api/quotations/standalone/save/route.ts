import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Quotation, Lead, Company } from "@/lib/models";
import { getAuthenticatedSessionWithCompany } from "@/lib/auth-utils";
import { standaloneSaveSchema } from "@/lib/validations/quotation";
import {
  processGroups,
  calculateQuotationTotals,
  generateQuotationNumber,
  getQuotationNumberPrefix,
  countTotalLineItems,
} from "@/lib/quotation-helpers";
import type { IQuotation, IQuotationGroup } from "@/lib/models/quotation";

/**
 * Transform Lead document to API response format
 */
function transformLead(lead: {
  _id: mongoose.Types.ObjectId;
  clientName: string;
  contactNumber: string;
  email: string;
  budget: number;
  siteAddress: string;
  status: string;
  remark?: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: lead._id.toString(),
    clientName: lead.clientName,
    contactNumber: lead.contactNumber,
    email: lead.email,
    budget: lead.budget,
    siteAddress: lead.siteAddress,
    status: lead.status,
    remark: lead.remark || null,
    createdAt: lead.createdAt,
    updatedAt: lead.updatedAt,
  };
}

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
 * POST /api/quotations/standalone/save
 * Save standalone quotation with lead creation or selection
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and company setup
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = standaloneSaveSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { quotation: quotationData, createLead, leadId, lead: leadData } =
      validationResult.data;

    // Connect to database
    await connectToDatabase();

    let lead;

    // Handle lead creation or selection
    if (createLead && leadData) {
      // Create new lead
      const newLead = new Lead({
        ...leadData,
        companyId: company._id,
        isDeleted: false,
        statusHistory: [
          {
            status: leadData.status || "new",
            note: "Lead created from standalone quotation",
            changedAt: new Date(),
          },
        ],
      });

      await newLead.save();
      lead = newLead;
    } else if (leadId) {
      // Verify existing lead
      if (!mongoose.Types.ObjectId.isValid(leadId)) {
        return NextResponse.json(
          { error: "Invalid lead ID format" },
          { status: 400 }
        );
      }

      lead = await Lead.findOne({
        _id: leadId,
        companyId: company._id,
        isDeleted: false,
      });

      if (!lead) {
        return NextResponse.json({ error: "Lead not found" }, { status: 400 });
      }
    } else {
      return NextResponse.json(
        { error: "Either create a new lead or provide an existing lead ID" },
        { status: 400 }
      );
    }

    // Get the full company data for snapshot
    const fullCompany = await Company.findById(company._id).lean();
    if (!fullCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 400 });
    }

    // Generate quotation number
    const prefix = getQuotationNumberPrefix();
    const lastQuotation = await Quotation.findOne({
      companyId: company._id,
      quotationNumber: { $regex: `^${prefix}` },
    })
      .sort({ quotationNumber: -1 })
      .select("quotationNumber")
      .lean();

    const quotationNumber = generateQuotationNumber(
      lastQuotation?.quotationNumber || null
    );

    // Process groups and calculate amounts
    const processedGroups = processGroups(quotationData.groups);

    // Calculate totals
    const totals = calculateQuotationTotals(
      processedGroups,
      quotationData.discount,
      quotationData.taxRate
    );

    // Create company snapshot
    const companySnapshot = {
      name: fullCompany.name,
      email: fullCompany.email,
      contactNumber: fullCompany.contactNumber,
      address: fullCompany.address || undefined,
      logo: fullCompany.logo?.url || undefined,
    };

    // Build discount object if provided
    const discount = quotationData.discount
      ? {
          type: quotationData.discount.type,
          value: quotationData.discount.value,
          amount: totals.discountAmount,
        }
      : undefined;

    // Create new quotation
    const newQuotation = new Quotation({
      companyId: company._id,
      leadId: lead._id,
      quotationNumber,
      client: quotationData.client,
      companySnapshot,
      groups: processedGroups,
      subtotal: totals.subtotal,
      discount,
      taxableAmount: totals.taxableAmount,
      taxRate: quotationData.taxRate,
      taxAmount: totals.taxAmount,
      total: totals.total,
      validUntil: new Date(quotationData.validUntil),
      termsAndConditions: quotationData.termsAndConditions || undefined,
      notes: quotationData.notes || undefined,
      status: "draft",
      isDeleted: false,
    });

    await newQuotation.save();

    // Transform and return
    const quotationResponse = transformQuotationFull(newQuotation.toObject());
    const leadResponse = transformLead(lead.toObject());

    return NextResponse.json(
      {
        quotation: quotationResponse,
        lead: leadResponse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Save standalone quotation error:", error);

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

    // Handle duplicate quotation number (retry)
    if (
      error instanceof Error &&
      error.message.includes("duplicate key") &&
      error.message.includes("quotationNumber")
    ) {
      return NextResponse.json(
        { error: "Quotation number conflict, please retry" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to save quotation" },
      { status: 500 }
    );
  }
}
