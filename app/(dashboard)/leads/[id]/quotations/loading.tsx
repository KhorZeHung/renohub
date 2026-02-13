import { Skeleton } from "@/components/ui/skeleton";

export default function LeadQuotationLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Main content */}
        <div className="xl:col-span-2 space-y-6">
          {/* Cards */}
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          ))}
        </div>

        {/* Sidebar */}
        <div>
          <Skeleton className="h-48 w-full rounded-lg sticky top-4" />
        </div>
      </div>
    </div>
  );
}
