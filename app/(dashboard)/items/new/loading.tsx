import { Skeleton } from "@/components/ui/skeleton"
import { SkeletonFormField } from "@/components/skeletons"

export default function NewItemLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Skeleton className="h-8 w-36" />

      {/* Form fields placeholder */}
      <div className="space-y-4">
        <SkeletonFormField />
        <SkeletonFormField />
        <SkeletonFormField />
        <SkeletonFormField />
      </div>
    </div>
  )
}
