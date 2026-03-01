"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/use-dashboard";
import { formatCurrency } from "@/lib/utils";

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  quoted: "bg-purple-100 text-purple-700",
  negotiating: "bg-orange-100 text-orange-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  viewed: "bg-cyan-100 text-cyan-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  expired: "bg-gray-100 text-gray-500",
};

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "won":
    case "accepted":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    case "lost":
    case "rejected":
      return <XCircle className="h-4 w-4 text-red-600" />;
    case "new":
    case "draft":
      return <Clock className="h-4 w-4 text-gray-600" />;
    default:
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  }
};

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

function ListItemSkeleton() {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-4 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="text-right space-y-1">
        <Skeleton className="h-4 w-16 ml-auto" />
        <Skeleton className="h-4 w-14 ml-auto rounded-full" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  const stats = [
    {
      name: "Total Leads",
      value: data ? String(data.stats.totalLeads) : "—",
      icon: Users,
      color: "bg-blue-500",
    },
    {
      name: "Quotations Sent",
      value: data ? String(data.stats.quotationsSent) : "—",
      icon: FileText,
      color: "bg-purple-500",
    },
    {
      name: "Won Value",
      value: data ? formatCurrency(data.stats.wonValue) : "—",
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      name: "Conversion Rate",
      value: data ? `${data.stats.conversionRate}%` : "—",
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  const pipeline = [
    { label: "New", key: "new", color: "bg-blue-500" },
    { label: "Contacted", key: "contacted", color: "bg-yellow-500" },
    { label: "Quoted", key: "quoted", color: "bg-purple-500" },
    { label: "Negotiating", key: "negotiating", color: "bg-orange-500" },
    { label: "Won", key: "won", color: "bg-green-500" },
    { label: "Lost", key: "lost", color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Your business overview</p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/leads?new-lead=true">
              <Plus className="h-4 w-4 mr-2" />
              New Lead
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))
          : stats.map((stat) => (
              <Card key={stat.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <stat.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.name}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Leads</CardTitle>
              <CardDescription>Your latest potential clients</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/leads">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <ListItemSkeleton key={i} />
                ))
              ) : data?.recentLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No leads yet.{" "}
                  <Link href="/leads?new-lead=true" className="underline">
                    Add your first lead
                  </Link>
                </p>
              ) : (
                data?.recentLeads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/40 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon status={lead.status} />
                      <div>
                        <p className="font-medium text-sm">{lead.clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(lead.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {formatCurrency(lead.budget)}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs capitalize ${
                          statusColors[lead.status] ?? ""
                        }`}
                      >
                        {lead.status}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Quotations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Quotations</CardTitle>
              <CardDescription>Latest quotations created</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/quotations">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <ListItemSkeleton key={i} />
                ))
              ) : data?.recentQuotations.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No quotations yet.{" "}
                  <Link href="/quotations/new" className="underline">
                    Create your first quotation
                  </Link>
                </p>
              ) : (
                data?.recentQuotations.map((quote) => (
                  <Link
                    key={quote.id}
                    href={`/quotations/${quote.id}`}
                    className="flex items-center justify-between py-2 border-b last:border-0 hover:bg-muted/40 -mx-2 px-2 rounded transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <StatusIcon status={quote.status} />
                      <div>
                        <p className="font-medium text-sm">
                          {quote.quotationNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {quote.clientName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">
                        {formatCurrency(quote.total)}
                      </p>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs capitalize ${
                          statusColors[quote.status] ?? ""
                        }`}
                      >
                        {quote.status}
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lead Pipeline Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Lead Pipeline</CardTitle>
          <CardDescription>Overview of your lead stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {pipeline.map((stage) => (
              <div key={stage.label} className="text-center">
                <div className={`h-2 rounded-full ${stage.color} mb-2`} />
                {isLoading ? (
                  <>
                    <Skeleton className="h-7 w-8 mx-auto mb-1" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-bold">
                      {data?.pipeline[stage.key] ?? 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {stage.label}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
