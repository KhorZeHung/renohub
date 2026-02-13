import { Skeleton } from "@/components/ui/skeleton"
import { SkeletonFormField } from "@/components/skeletons"

export default function ItemDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-24" />

      {/* Form fields placeholder */}
      <div className="space-y-4">
        <SkeletonFormField />
        <SkeletonFormField />
        <SkeletonFormField />
      </div>
    </div>
  )
}
