import useSWR from "swr";
import type {
  QuotationResponse,
  QuotationDetailResponse,
  QuotationsListResponse,
  QuotationStatus,
  CreateQuotationInput,
  UpdateQuotationInput,
  StandaloneSaveInput,
  LeadResponse,
} from "@/types";

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch");
  }
  return res.json();
};

export interface UseQuotationsParams {
  search?: string;
  status?: QuotationStatus | "all";
  leadId?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

/**
 * Hook for fetching paginated quotations list
 */
export function useQuotations(params: UseQuotationsParams = {}) {
  const { search, status, leadId, page = 1, limit = 20, sort, order } = params;

  // Build query string
  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (status && status !== "all") queryParams.set("status", status);
  if (leadId) queryParams.set("leadId", leadId);
  if (page) queryParams.set("page", page.toString());
  if (limit) queryParams.set("limit", limit.toString());
  if (sort) queryParams.set("sort", sort);
  if (order) queryParams.set("order", order);

  const queryString = queryParams.toString();
  const url = `/api/quotations${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<QuotationsListResponse>(url, fetcher, {
      revalidateOnFocus: false,
      keepPreviousData: true,
    });

  return {
    quotations: data?.quotations || [],
    pagination: data?.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false,
    },
    isLoading,
    isValidating,
    error: error?.message || null,
    mutate,
  };
}

/**
 * Hook for fetching a single quotation by ID
 */
export function useQuotation(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{
    quotation: QuotationDetailResponse;
  }>(id ? `/api/quotations/${id}` : null, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    quotation: data?.quotation || null,
    isLoading,
    error: error?.message || null,
    mutate,
  };
}

/**
 * Hook for fetching quotations for a specific lead
 */
export function useLeadQuotations(leadId: string | null) {
  const { data, error, isLoading, isValidating, mutate } =
    useSWR<QuotationsListResponse>(
      leadId ? `/api/quotations?leadId=${leadId}&limit=100` : null,
      fetcher,
      {
        revalidateOnFocus: false,
      }
    );

  return {
    quotations: data?.quotations || [],
    isLoading,
    isValidating,
    error: error?.message || null,
    mutate,
  };
}

/**
 * Create a new quotation
 */
export async function createQuotation(
  data: CreateQuotationInput
): Promise<{ quotation: QuotationDetailResponse }> {
  const res = await fetch("/api/quotations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return res.json();
}

/**
 * Update an existing quotation
 */
export async function updateQuotation(
  id: string,
  data: UpdateQuotationInput
): Promise<{ quotation: QuotationDetailResponse }> {
  const res = await fetch(`/api/quotations/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return res.json();
}

/**
 * Update quotation status
 */
export async function updateQuotationStatus(
  id: string,
  status: QuotationStatus
): Promise<{ quotation: QuotationDetailResponse; leadUpdated: boolean }> {
  const res = await fetch(`/api/quotations/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return res.json();
}

/**
 * Delete a quotation (soft delete)
 */
export async function deleteQuotation(id: string): Promise<{ message: string }> {
  const res = await fetch(`/api/quotations/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete quotation");
  }

  return res.json();
}

/**
 * Generate PDF for an existing quotation (returns blob for download)
 */
export async function generatePDF(id: string): Promise<Blob> {
  const res = await fetch(`/api/quotations/${id}/pdf`);

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to generate PDF");
  }

  return res.blob();
}

/**
 * Generate standalone PDF (no database save, returns blob for download)
 */
export async function generateStandalonePDF(
  data: Omit<CreateQuotationInput, "leadId" | "status">
): Promise<Blob> {
  const res = await fetch("/api/quotations/standalone", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to generate PDF");
  }

  return res.blob();
}

/**
 * Save standalone quotation with lead creation or selection
 */
export async function saveStandaloneQuotation(
  data: StandaloneSaveInput
): Promise<{ quotation: QuotationDetailResponse; lead: LeadResponse }> {
  const res = await fetch("/api/quotations/standalone/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw error;
  }

  return res.json();
}

/**
 * Helper function to download a PDF blob
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
