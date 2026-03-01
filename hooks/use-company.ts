import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (res.status === 404) return null;
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch");
  }
  return res.json();
};

export interface CompanyProfile {
  id: string;
  name: string;
  email: string;
  contactNumber: string | null;
  address: string | null;
  website: string | null;
  taxRegistrationNumber: string | null;
  logo: { url: string; filename: string; width?: number; height?: number } | null;
  defaultTerms: string | null;
  defaultValidityDays: number;
  defaultTaxRate: number;
}

/**
 * Hook for fetching the authenticated user's company profile.
 * Returns null if company has not been set up yet (404).
 */
export function useCompany() {
  const { data, error, isLoading, mutate } = useSWR<CompanyProfile | null>(
    "/api/company",
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    company: data ?? null,
    isLoading,
    error: error?.message || null,
    mutate,
  };
}
