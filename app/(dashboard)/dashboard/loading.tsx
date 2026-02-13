import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  SkeletonStatsCard,
  SkeletonRecentRow,
  SkeletonPageHeader,
  SkeletonPipelineSummary,
} from "@/components/skeletons"

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <SkeletonPageHeader />

      {/* Stats Grid - 4 cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-4 w-40" />
            </div>
            <Skeleton className="h-8 w-16 rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRecentRow key={i} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Quotations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-44" />
            </div>
            <Skeleton className="h-8 w-16 rounded-md" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonRecentRow key={i} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Pipeline */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-44" />
        </CardHeader>
        <CardContent>
          <SkeletonPipelineSummary items={6} />
        </CardContent>
      </Card>
    </div>
  )
}
