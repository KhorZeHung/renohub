import {
  SkeletonPageHeader,
  SkeletonFilterBar,
  SkeletonItemCard,
  SkeletonPagination,
} from "@/components/skeletons"

export default function ItemsLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <SkeletonPageHeader />

      {/* Filters with view toggle */}
      <SkeletonFilterBar hasViewToggle />

      {/* Grid view skeleton - responsive */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonItemCard key={i} />
        ))}
      </div>

      {/* Pagination */}
      <SkeletonPagination />
    </div>
  )
}
