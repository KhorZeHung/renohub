import useSWR from "swr";
import type { ItemResponse, ItemsListResponse } from "@/types";

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch");
  }
  return res.json();
};

export interface UseItemsParams {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  active?: boolean;
}

/**
 * Hook for fetching paginated items list
 */
export function useItems(params: UseItemsParams = {}) {
  const { search, category, page = 1, limit = 20, sort, order, active = true } = params;

  // Build query string
  const queryParams = new URLSearchParams();
  if (search) queryParams.set("search", search);
  if (category && category !== "All") queryParams.set("category", category);
  if (page) queryParams.set("page", page.toString());
  if (limit) queryParams.set("limit", limit.toString());
  if (sort) queryParams.set("sort", sort);
  if (order) queryParams.set("order", order);
  queryParams.set("active", active.toString());

  const queryString = queryParams.toString();
  const url = `/api/items${queryString ? `?${queryString}` : ""}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<ItemsListResponse>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  return {
    items: data?.items || [],
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
 * Hook for fetching a single item by ID
 */
export function useItem(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<{ item: ItemResponse }>(
    id ? `/api/items/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    item: data?.item || null,
    isLoading,
    error: error?.message || null,
    mutate,
  };
}

/**
 * Create a new item
 */
export async function createItem(data: {
  name: string;
  unit: string;
  pricePerUnit: number;
  description?: string | null;
  brand?: string | null;
  category?: string | null;
  images?: Array<{ url: string; filename: string; order: number }>;
}): Promise<{ item: ItemResponse }> {
  const res = await fetch("/api/items", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create item");
  }

  return res.json();
}

/**
 * Update an existing item
 */
export async function updateItem(
  id: string,
  data: {
    name?: string;
    unit?: string;
    pricePerUnit?: number;
    description?: string | null;
    brand?: string | null;
    category?: string | null;
    images?: Array<{ url: string; filename: string; order: number }>;
  }
): Promise<{ item: ItemResponse }> {
  const res = await fetch(`/api/items/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update item");
  }

  return res.json();
}

/**
 * Delete an item (soft delete)
 */
export async function deleteItem(id: string): Promise<{ message: string }> {
  const res = await fetch(`/api/items/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete item");
  }

  return res.json();
}
