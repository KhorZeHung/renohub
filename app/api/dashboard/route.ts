import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Lead, Quotation } from "@/lib/models";
import { getAuthenticatedSessionWithCompany } from "@/lib/auth-utils";

/**
 * GET /api/dashboard
 * Returns aggregated stats, recent leads, recent quotations, and pipeline counts.
 */
export async function GET() {
  try {
    const { company, error } = await getAuthenticatedSessionWithCompany();
    if (error) return error;

    await connectToDatabase();

    const companyId = company._id;

    // Run all aggregations in parallel
    const [
      totalLeads,
      wonLeads,
      pipeline,
      wonValue,
      quotationsSent,
      recentLeads,
      recentQuotations,
    ] = await Promise.all([
      // Total active leads
      Lead.countDocuments({ companyId, isDeleted: false }),

      // Leads with status "won"
      Lead.countDocuments({ companyId, isDeleted: false, status: "won" }),

      // Lead count per status
      Lead.aggregate([
        { $match: { companyId, isDeleted: false } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),

      // Sum of totals for accepted quotations
      Quotation.aggregate([
        { $match: { companyId, isDeleted: false, status: "accepted" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),

      // Count of sent/viewed/accepted/rejected quotations
      Quotation.countDocuments({
        companyId,
        isDeleted: false,
        status: { $in: ["sent", "viewed", "accepted", "rejected", "expired"] },
      }),

      // 5 most recent leads
      Lead.find({ companyId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("clientName status budget createdAt")
        .lean(),

      // 5 most recent quotations
      Quotation.find({ companyId, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("quotationNumber client.name total status createdAt")
        .lean(),
    ]);

    // Build pipeline map
    const pipelineMap: Record<string, number> = {
      new: 0,
      contacted: 0,
      quoted: 0,
      negotiating: 0,
      won: 0,
      lost: 0,
    };
    for (const entry of pipeline) {
      if (entry._id in pipelineMap) {
        pipelineMap[entry._id] = entry.count;
      }
    }

    const wonValueTotal = wonValue[0]?.total ?? 0;
    const conversionRate =
      totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;

    return NextResponse.json({
      stats: {
        totalLeads,
        quotationsSent,
        wonValue: wonValueTotal,
        conversionRate,
      },
      recentLeads: recentLeads.map((l) => ({
        id: l._id.toString(),
        clientName: l.clientName,
        status: l.status,
        budget: l.budget ?? 0,
        createdAt: l.createdAt,
      })),
      recentQuotations: recentQuotations.map((q) => ({
        id: q._id.toString(),
        quotationNumber: q.quotationNumber,
        clientName: (q.client as { name: string }).name,
        total: q.total,
        status: q.status,
        createdAt: q.createdAt,
      })),
      pipeline: pipelineMap,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
