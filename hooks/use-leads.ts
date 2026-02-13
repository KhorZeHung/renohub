import useSWR from "swr";
import type {
  LeadResponse,
  LeadDetailResponse,
  LeadsListResponse,
  LeadStatus,
  LeadImage,
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

export interface UseLeadsParams {
  search?: string;
  status?: LeadStatus[];
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

/**
 * Hook for fetching paginated leads list
 */
export function useLeads(params: UseLeadsParams = {}) {
  const { search, status, page = 1, limit = 20, sort, order } = params;

  // Build query string
  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (status && status.length > 0) queryParams.set("status", status.join(","));
  if (page) queryParams.set("page", page.toString());
  if (limit) queryParams.set("limit", limit.toString());
  if (sort) queryParams.set("sort", sort);
  if (order) queryParams.set("order", order);

  const queryString = queryParams.toString();
  const url = `/api/leads${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, isValidating, mutate } =
    useSWR<LeadsListResponse>(url, fetcher, {
      revalidateOnFocus: false,
      keepPreviousData: true,
    });

  return {
    leads: data?.leads || [],
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
 * Hook for fetching a single lead by ID
 */
export function useLead(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ lead: LeadDetailResponse }>(
    id ? `/api/leads/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    lead: data?.lead || null,
    isLoading,
    error: error?.message || null,
    mutate,
  };
}

/**
 * Create a new lead
 */
export async function createLead(data: {
  clientName: string;
  contactNumber: string;
  email: string;
  budget: number;
  siteAddress: string;
  status?: LeadStatus;
  remark?: string | null;
  images?: LeadImage[];
}): Promise<{ lead: LeadResponse }> {
  const res = await fetch("/api/leads", {
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
 * Update an existing lead
 */
export async function updateLead(
  id: string,
  data: {
    clientName?: string;
    contactNumber?: string;
    email?: string;
    budget?: number;
    siteAddress?: string;
    status?: LeadStatus;
    remark?: string | null;
    images?: LeadImage[];
  }
): Promise<{ lead: LeadDetailResponse }> {
  const res = await fetch(`/api/leads/${id}`, {
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
 * Update lead status with history tracking
 */
export async function updateLeadStatus(
  id: string,
  data: {
    status: LeadStatus;
    note?: string | null;
  }
): Promise<{ lead: LeadDetailResponse }> {
  const res = await fetch(`/api/leads/${id}/status`, {
    method: "PATCH",
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
 * Delete a lead (soft delete)
 */
export async function deleteLead(id: string): Promise<{ message: string }> {
  const res = await fetch(`/api/leads/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete lead");
  }

  return res.json();
}
