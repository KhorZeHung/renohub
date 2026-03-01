import { NextRequest, NextResponse } from "next/server";
import { renderToStream } from "@react-pdf/renderer";
import { publicQuotationSchema } from "@/lib/validations/quotation";
import { QuotationPDF } from "@/lib/pdf/quotation-pdf-template";
import {
  processGroups,
  calculateQuotationTotals,
  generateQuotationNumber,
} from "@/lib/quotation-helpers";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * POST /api/quotations/public/pdf
 * Generate PDF for a free-tier public quotation (no authentication required)
 */
export async function POST(request: NextRequest) {
  try {
    // Apply IP-based rate limiting
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rateLimitResult = checkRateLimit(`pdf:${ip}`);
    if (!rateLimitResult.success) {
      const retryAfterSeconds = Math.ceil(rateLimitResult.resetInMs / 1000);
      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: retryAfterSeconds,
        },
        {
          status: 429,
          headers: { "Retry-After": retryAfterSeconds.toString() },
        }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = publicQuotationSchema.safeParse(body);

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

    // Build company snapshot from user-provided data
    const companySnapshot = {
      name: quotationData.company.name,
      email: quotationData.company.email || "",
      contactNumber: quotationData.company.contactNumber || "",
      address: quotationData.company.address || undefined,
      logo: undefined,
    };

    // Build discount object if provided
    const discount = quotationData.discount
      ? {
          type: quotationData.discount.type as "percentage" | "fixed",
          value: quotationData.discount.value,
          amount: totals.discountAmount,
        }
      : undefined;

    // Generate PDF stream (no attachments on free tier)
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
        attachmentImages: [],
        showBranding: true,
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
    console.error("Generate public PDF error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF. Please try again." },
      { status: 500 }
    );
  }
}
