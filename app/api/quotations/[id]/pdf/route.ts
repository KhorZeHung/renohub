import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { renderToStream } from "@react-pdf/renderer";
import { connectToDatabase } from "@/lib/db";
import { Quotation } from "@/lib/models";
import {
  getAuthenticatedSessionWithCompany,
  validateOwnership,
} from "@/lib/auth-utils";
import { QuotationPDF } from "@/lib/pdf/quotation-pdf-template";
import { collectAttachmentImages } from "@/lib/quotation-helpers";
import type { IQuotation } from "@/lib/models/quotation";

/**
 * GET /api/quotations/[id]/pdf
 * Generate and stream PDF for a quotation
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
    if (ownershipError) {
      return NextResponse.json(
        { error: "Quotation not found" },
        { status: 404 }
      );
    }

    const q = quotation as unknown as IQuotation;

    // Collect attachment images from all groups
    const attachmentImages = collectAttachmentImages(q.groups);

    // Generate PDF stream
    const pdfStream = await renderToStream(
      QuotationPDF({
        quotationNumber: q.quotationNumber,
        quotationDate: q.createdAt,
        validUntil: q.validUntil,
        client: q.client,
        company: q.companySnapshot,
        groups: q.groups,
        subtotal: q.subtotal,
        discount: q.discount,
        taxableAmount: q.taxableAmount,
        taxRate: q.taxRate,
        taxAmount: q.taxAmount,
        total: q.total,
        termsAndConditions: q.termsAndConditions,
        notes: q.notes,
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
        "Content-Disposition": `attachment; filename="${q.quotationNumber}.pdf"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Generate PDF error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
