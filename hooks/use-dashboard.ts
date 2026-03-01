import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to fetch");
  }
  return res.json();
};

export interface DashboardStats {
  totalLeads: number;
  quotationsSent: number;
  wonValue: number;
  conversionRate: number;
}

export interface DashboardLead {
  id: string;
  clientName: string;
  status: string;
  budget: number;
  createdAt: string;
}

export interface DashboardQuotation {
  id: string;
  quotationNumber: string;
  clientName: string;
  total: number;
  status: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentLeads: DashboardLead[];
  recentQuotations: DashboardQuotation[];
  pipeline: Record<string, number>;
}

export function useDashboard() {
  const { data, error, isLoading } = useSWR<DashboardData>(
    "/api/dashboard",
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    }
  );

  return {
    data: data ?? null,
    isLoading,
    error: error?.message || null,
  };
}
