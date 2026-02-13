import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { connectToDatabase } from "@/lib/db";
import { Company } from "@/lib/models";
import { getAuthenticatedSessionWithCompany } from "@/lib/auth-utils";
import { standaloneQuotationSchema } from "@/lib/validations/quotation";
import { QuotationPDF } from "@/lib/pdf/quotation-pdf-template";
import {
  processGroups,
  calculateQuotationTotals,
  generateQuotationNumber,
  collectAttachmentImages,
} from "@/lib/quotation-helpers";

/**
 * POST /api/quotations/standalone
 * Generate PDF for standalone quotation (no database save)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication and company setup
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    // Parse and validate request body
    const body = await request.json();
    const validationResult = standaloneQuotationSchema.safeParse(body);

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

    // Connect to database to get company info
    await connectToDatabase();

    // Get the full company data for snapshot
    const fullCompany = await Company.findById(company._id).lean();
    if (!fullCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 400 }
      );
    }

    // Generate temporary quotation number
    const quotationNumber = generateQuotationNumber(null);

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
      contactNumber: fullCompany.contactNumber || "",
      address: fullCompany.address || undefined,
      logo: fullCompany.logo?.url || undefined,
    };

    // Build discount object if provided
    const discount = quotationData.discount
      ? {
          type: quotationData.discount.type as "percentage" | "fixed",
          value: quotationData.discount.value,
          amount: totals.discountAmount,
        }
      : undefined;

    // Collect attachment images
    const attachmentImages = collectAttachmentImages(processedGroups);

    // Generate PDF stream
    const pdfStream = await renderToStream(
      QuotationPDF({
        quotationNumber,
        quotationDate: new Date(),
        validUntil: new Date(quotationData.validUntil),
        client: quotationData.client,
        company: companySnapshot,
        groups: processedGroups,
        subtotal: totals.subtotal,
        discount,
        taxableAmount: totals.taxableAmount,
        taxRate: quotationData.taxRate,
        taxAmount: totals.taxAmount,
        total: totals.total,
        termsAndConditions: quotationData.termsAndConditions,
        notes: quotationData.notes,
        attachmentImages,
      })
    );

    // Convert Node.js stream to Web ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        pdfStream.on("data", (chunk: Buffer) => {
          controller.enqueue(new Uint8Array(chunk));
        });
        pdfStream.on("end", () => {
          controller.close();
        });
        pdfStream.on("error", (err: Error) => {
          controller.error(err);
        });
      },
    });

    // Return streamed PDF response
    return new Response(readableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${quotationNumber}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Generate standalone PDF error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
