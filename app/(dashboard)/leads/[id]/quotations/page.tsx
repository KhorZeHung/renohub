"use client";

import { use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLead } from "@/hooks/use-leads";
import { useQuotation } from "@/hooks/use-quotations";
import { QuotationForm } from "@/components/quotations/quotation-form";
import { Skeleton } from "@/components/ui/skeleton";

function LeadQuotationContent({ leadId }: { leadId: string }) {
  const searchParams = useSearchParams();
  const quotationId = searchParams.get("quotationId");
  const isEditMode = !!quotationId;

  const { lead, isLoading: isLoadingLead, error: leadError } = useLead(leadId);
  const { quotation, isLoading: isLoadingQuotation, error: quotationError } = useQuotation(
    isEditMode ? quotationId : null
  );

  // Loading state
  if (isLoadingLead || (isEditMode && isLoadingQuotation)) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <Skeleton className="ml-10 h-10 w-30" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    );
  }

  // Error / not found
  if (leadError || !lead) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Lead not found</h2>
        <p className="text-muted-foreground">{leadError || "The lead could not be found."}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/leads">Back to Leads</Link>
        </Button>
      </div>
    );
  }

  if (isEditMode && (quotationError || !quotation)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Quotation not found</h2>
        <p className="text-muted-foreground">{quotationError || "The quotation could not be found."}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href={`/leads/${leadId}`}>Back to Lead</Link>
        </Button>
      </div>
    );
  }

  const leadData = {
    clientName: lead.clientName,
    contactNumber: lead.contactNumber,
    email: lead.email || "",
    siteAddress: lead.siteAddress || "",
  };

  if (isEditMode && quotation) {
    return (
      <QuotationForm
        mode="lead-edit"
        leadId={leadId}
        leadData={leadData}
        quotationId={quotationId}
        initialData={quotation}
      />
    );
  }

  return (
    <QuotationForm
      mode="lead-new"
      leadId={leadId}
      leadData={leadData}
    />
  );
}

export default function LeadQuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: leadId } = use(params);

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LeadQuotationContent leadId={leadId} />
    </Suspense>
  );
}
