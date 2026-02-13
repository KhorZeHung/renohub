import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SkeletonFormField } from "@/components/skeletons"

export default function CompanySettingsLoading() {
  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Logo */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Skeleton className="h-32 w-32 rounded-lg" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-9 w-28 rounded-md" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <SkeletonFormField />
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonFormField />
            <SkeletonFormField />
          </div>
          <SkeletonFormField />
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonFormField />
            <SkeletonFormField />
          </div>
        </CardContent>
      </Card>

      {/* Quotation Defaults */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonFormField />
            <SkeletonFormField />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-md border">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-6" />
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              ))}
            </div>
            <Skeleton className="h-3 w-64" />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-44" />
                </div>
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-28 ml-auto" />
                <Skeleton className="h-4 w-36 ml-auto" />
                <Skeleton className="h-4 w-24 ml-auto" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
    </div>
  )
}
