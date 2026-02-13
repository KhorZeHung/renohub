import {
  SkeletonPageHeader,
  SkeletonFilterBar,
  SkeletonStatusSummary,
  SkeletonLeadCard,
  SkeletonPagination,
} from "@/components/skeletons"

export default function LeadsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <SkeletonPageHeader />

      {/* Filters - search and status buttons */}
      <SkeletonFilterBar />

      {/* Stats Summary - 6 status cards */}
      <SkeletonStatusSummary items={6} />

      {/* Lead cards */}
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonLeadCard key={i} />
        ))}
      </div>

      {/* Pagination */}
      <SkeletonPagination />
    </div>
  )
}
