import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Quotation, Lead, Company } from "@/lib/models";
import { getAuthenticatedSessionWithCompany } from "@/lib/auth-utils";
import { quotationCreateSchema, quotationQuerySchema } from "@/lib/validations/quotation";
import {
  processGroups,
  calculateQuotationTotals,
  generateQuotationNumber,
  getQuotationNumberPrefix,
  countTotalLineItems,
} from "@/lib/quotation-helpers";
import type { IQuotation, IQuotationGroup } from "@/lib/models/quotation";

/**
 * Transform Quotation document to API response format (list view)
 */
function transformQuotationForList(quotation: IQuotation) {
  return {
    id: quotation._id.toString(),
    quotationNumber: quotation.quotationNumber,
    client: {
      name: quotation.client.name,
      contactNumber: quotation.client.contactNumber,
    },
    leadId: quotation.leadId ? quotation.leadId.toString() : null,
    total: quotation.total,
    status: quotation.status,
    validUntil: quotation.validUntil,
    groupsCount: quotation.groups.length,
    totalLineItems: countTotalLineItems(quotation.groups),
    createdAt: quotation.createdAt,
    updatedAt: quotation.updatedAt,
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
    createdAt: quotation.createdAt,
    updatedAt: quotation.updatedAt,
  };
}

/**
 * GET /api/quotations
 * List all quotations with pagination, search, and filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication and company setup
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const queryResult = quotationQuerySchema.safeParse({
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      leadId: searchParams.get("leadId") || undefined,
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

    const { search, status, leadId, page, limit, sort, order } = queryResult.data;

    // Connect to database
    await connectToDatabase();

    // Build query
    const query: Record<string, unknown> = {
      companyId: company._id,
      isDeleted: false,
    };

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add leadId filter
    if (leadId) {
      if (!mongoose.Types.ObjectId.isValid(leadId)) {
        return NextResponse.json({
          quotations: [],
          pagination: {
            page: 1,
            limit,
            total: 0,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        });
      }
      query.leadId = new mongoose.Types.ObjectId(leadId);
    }

    // Add text search
    if (search) {
      query.$or = [
        { quotationNumber: { $regex: search, $options: "i" } },
        { "client.name": { $regex: search, $options: "i" } },
      ];
    }

    // Count total documents
    const total = await Quotation.countDocuments(query);

    // Calculate pagination
    const totalPages = Math.ceil(total / limit!);
    const skip = (page! - 1) * limit!;

    // Build sort object
    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sort || "createdAt"] = order === "asc" ? 1 : -1;

    // Fetch quotations
    const quotations = await Quotation.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(limit!)
      .lean();

    // Transform quotations
    const transformedQuotations = quotations.map((q) =>
      transformQuotationForList(q as unknown as IQuotation)
    );

    return NextResponse.json({
      quotations: transformedQuotations,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page! < totalPages,
        hasPrev: page! > 1,
      },
    });
  } catch (error) {
    console.error("Get quotations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quotations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/quotations
 * Create a new quotation
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and company setup
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = quotationCreateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const quotationData = validationResult.data;

    // Connect to database
    await connectToDatabase();

    // Verify leadId if provided
    if (quotationData.leadId) {
      if (!mongoose.Types.ObjectId.isValid(quotationData.leadId)) {
        return NextResponse.json(
          { error: "Invalid lead ID format" },
          { status: 400 }
        );
      }

      const lead = await Lead.findOne({
        _id: quotationData.leadId,
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

    // Get the full company data for snapshot
    const fullCompany = await Company.findById(company._id).lean();
    if (!fullCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 400 }
      );
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
      leadId: quotationData.leadId
        ? new mongoose.Types.ObjectId(quotationData.leadId)
        : null,
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
      status: quotationData.status || "draft",
      isDeleted: false,
    });

    await newQuotation.save();

    // Transform and return
    const quotationResponse = transformQuotationFull(newQuotation.toObject());

    return NextResponse.json({ quotation: quotationResponse }, { status: 201 });
  } catch (error) {
    console.error("Create quotation error:", error);

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
      // This shouldn't happen often, but if it does, the client should retry
      return NextResponse.json(
        { error: "Quotation number conflict, please retry" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create quotation" },
      { status: 500 }
    );
  }
}
