import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SkeletonFormField } from "@/components/skeletons"

export default function StandaloneQuotationLoading() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-md" />
        <div className="space-y-1">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      {/* Quotation Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-44" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <SkeletonFormField />
            <SkeletonFormField />
            <SkeletonFormField />
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <SkeletonFormField />
            <SkeletonFormField />
            <SkeletonFormField />
            <SkeletonFormField />
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28 rounded-md" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Header row */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-2 px-2">
              <Skeleton className="col-span-5 h-3 w-20" />
              <Skeleton className="col-span-2 h-3 w-8 mx-auto" />
              <Skeleton className="col-span-1 h-3 w-8 mx-auto" />
              <Skeleton className="col-span-2 h-3 w-10 ml-auto" />
              <Skeleton className="col-span-2 h-3 w-14 ml-auto" />
            </div>
            {/* Line items */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-3 sm:grid sm:grid-cols-12 sm:gap-2 sm:items-center">
                <Skeleton className="sm:col-span-5 h-8 w-full" />
                <Skeleton className="sm:col-span-2 h-8 w-full mt-2 sm:mt-0" />
                <Skeleton className="sm:col-span-1 h-8 w-full mt-2 sm:mt-0" />
                <Skeleton className="sm:col-span-2 h-8 w-full mt-2 sm:mt-0" />
                <div className="sm:col-span-2 flex items-center justify-between mt-2 sm:mt-0">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-7 w-12 rounded" />
                <Skeleton className="h-7 w-16 rounded" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-7 w-16 rounded" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="border-t pt-3 flex justify-between">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-16" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full rounded-md" />
        </CardContent>
      </Card>

      {/* Attachment Images */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-32 rounded-md" />
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8">
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-8 mx-auto rounded" />
              <Skeleton className="h-4 w-24 mx-auto" />
              <Skeleton className="h-3 w-44 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
        </CardHeader>
        <CardContent>
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
          <Skeleton className="h-3 w-44 mt-2" />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Skeleton className="h-9 w-20 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
    </div>
  )
}
