import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// =============================================================================
// PRIMITIVE SKELETONS
// =============================================================================

export function SkeletonText({
  className,
  width = "w-full"
}: {
  className?: string
  width?: string
}) {
  return <Skeleton className={cn("h-4", width, className)} />
}

export function SkeletonHeading({
  className,
  size = "lg"
}: {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}) {
  const heights = { sm: "h-5", md: "h-6", lg: "h-7", xl: "h-8" }
  return <Skeleton className={cn(heights[size], "w-48", className)} />
}

export function SkeletonAvatar({
  className,
  size = "md"
}: {
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const sizes = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-12 w-12" }
  return <Skeleton className={cn("rounded-full", sizes[size], className)} />
}

export function SkeletonButton({
  className,
  size = "default"
}: {
  className?: string
  size?: "sm" | "default" | "lg"
}) {
  const sizes = { sm: "h-8 w-20", default: "h-9 w-24", lg: "h-10 w-28" }
  return <Skeleton className={cn("rounded-md", sizes[size], className)} />
}

export function SkeletonInput({ className }: { className?: string }) {
  return <Skeleton className={cn("h-9 w-full rounded-md", className)} />
}

export function SkeletonBadge({ className }: { className?: string }) {
  return <Skeleton className={cn("h-5 w-16 rounded-full", className)} />
}

export function SkeletonImage({
  className,
  aspect = "video"
}: {
  className?: string
  aspect?: "square" | "video" | "wide"
}) {
  const aspects = { square: "aspect-square", video: "aspect-video", wide: "aspect-[2/1]" }
  return <Skeleton className={cn(aspects[aspect], "rounded-lg", className)} />
}

// =============================================================================
// CARD SKELETONS
// =============================================================================

export function SkeletonStatsCard({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="mt-4 space-y-1">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

export function SkeletonLeadCard({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-3.5 rounded-full" />
                <Skeleton className="h-4 w-52" />
              </div>
            </div>
          </div>
          <div className="text-right shrink-0 space-y-2">
            <Skeleton className="h-6 w-20 ml-auto" />
            <Skeleton className="h-3 w-12 ml-auto" />
            <div className="flex items-center gap-1 justify-end mt-2">
              <Skeleton className="h-3.5 w-3.5" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-5 w-5 shrink-0 hidden sm:block" />
        </div>
        <Skeleton className="mt-3 h-10 w-full rounded" />
      </CardContent>
    </Card>
  )
}

export function SkeletonItemCard({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <Skeleton className="aspect-video rounded-none" />
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0 space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-8 rounded shrink-0" />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Skeleton className="h-5 w-16 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  )
}

export function SkeletonQuotationCard({ className }: { className?: string }) {
  return (
    <div className={cn("p-4 border-b last:border-0", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20 hidden sm:block" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="space-y-1">
            <Skeleton className="h-5 w-20 sm:ml-auto" />
            <Skeleton className="h-3 w-14 sm:ml-auto" />
          </div>
          <div className="flex gap-1">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// LIST SKELETONS
// =============================================================================

export function SkeletonRecentRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between py-2 border-b last:border-0", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-4 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="text-right space-y-1">
        <Skeleton className="h-4 w-16 ml-auto" />
        <Skeleton className="h-5 w-14 rounded-full ml-auto" />
      </div>
    </div>
  )
}

export function SkeletonItemRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-4 p-4 border-b last:border-0", className)}>
      <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <Skeleton className="h-3 w-60" />
      </div>
      <div className="text-right shrink-0 space-y-1">
        <Skeleton className="h-4 w-16 ml-auto" />
        <Skeleton className="h-3 w-12 ml-auto" />
      </div>
      <div className="flex gap-1 shrink-0">
        <Skeleton className="h-8 w-8 rounded" />
        <Skeleton className="h-8 w-8 rounded" />
      </div>
    </div>
  )
}

export function SkeletonTimeline({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <Skeleton className="h-6 w-6 rounded-full" />
            {i < items - 1 && <Skeleton className="w-0.5 h-12 mt-1" />}
          </div>
          <div className="pb-4 space-y-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

// =============================================================================
// FORM SKELETONS
// =============================================================================

export function SkeletonFormField({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  )
}

export function SkeletonFormSection({
  fields = 4,
  columns = 2,
  className
}: {
  fields?: number
  columns?: 1 | 2
  className?: string
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className={cn("grid gap-4", columns === 2 && "sm:grid-cols-2")}>
          {Array.from({ length: fields }).map((_, i) => (
            <SkeletonFormField key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function SkeletonToggleRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-between py-2", className)}>
      <div className="space-y-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-5 w-9 rounded-full" />
    </div>
  )
}

export function SkeletonAvatarUpload({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-6", className)}>
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

// =============================================================================
// LAYOUT SKELETONS
// =============================================================================

export function SkeletonPageHeader({
  hasButton = true,
  className
}: {
  hasButton?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", className)}>
      <div className="space-y-1">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      {hasButton && <Skeleton className="h-9 w-28 rounded-md" />}
    </div>
  )
}

export function SkeletonFilterBar({
  hasViewToggle = false,
  className
}: {
  hasViewToggle?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-4", className)}>
      <Skeleton className="h-9 flex-1 rounded-md" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-24 rounded-md" />
        {hasViewToggle && (
          <div className="flex border rounded-md">
            <Skeleton className="h-9 w-9 rounded-l-md border-0" />
            <Skeleton className="h-9 w-9 rounded-r-md border-0" />
          </div>
        )}
      </div>
    </div>
  )
}

export function SkeletonStatusSummary({
  items = 6,
  className
}: {
  items?: number
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-3 sm:grid-cols-6 gap-2", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} className="h-16 rounded-lg" />
      ))}
    </div>
  )
}

export function SkeletonPipelineSummary({
  items = 6,
  className
}: {
  items?: number
  className?: string
}) {
  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="text-center space-y-2">
          <Skeleton className="h-2 w-full rounded-full" />
          <Skeleton className="h-8 w-12 mx-auto" />
          <Skeleton className="h-3 w-16 mx-auto" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonPagination({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-end gap-4", className)}>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-14 rounded-md" />
      </div>
      <Skeleton className="h-4 w-20" />
      <div className="flex items-center gap-1">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  )
}
