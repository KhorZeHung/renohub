import Link from "next/link";
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Dummy data
const stats = [
  {
    name: "Total Leads",
    value: "48",
    change: "+12%",
    changeType: "positive",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    name: "Quotations Sent",
    value: "32",
    change: "+8%",
    changeType: "positive",
    icon: FileText,
    color: "bg-purple-500",
  },
  {
    name: "Won Value",
    value: "$124,500",
    change: "+23%",
    changeType: "positive",
    icon: DollarSign,
    color: "bg-green-500",
  },
  {
    name: "Conversion Rate",
    value: "34%",
    change: "-2%",
    changeType: "negative",
    icon: TrendingUp,
    color: "bg-orange-500",
  },
];

const recentLeads = [
  { id: 1, name: "John Smith", status: "new", budget: "$15,000", date: "2 hours ago" },
  { id: 2, name: "Sarah Chen", status: "contacted", budget: "$28,000", date: "5 hours ago" },
  { id: 3, name: "Michael Wong", status: "quoted", budget: "$45,000", date: "1 day ago" },
  { id: 4, name: "Emily Tan", status: "negotiating", budget: "$32,000", date: "2 days ago" },
  { id: 5, name: "David Lee", status: "won", budget: "$52,000", date: "3 days ago" },
];

const recentQuotations = [
  { id: "QT-202601-0042", client: "John Smith", total: "$15,200", status: "draft", date: "Today" },
  { id: "QT-202601-0041", client: "Sarah Chen", total: "$28,500", status: "sent", date: "Yesterday" },
  { id: "QT-202601-0040", client: "Michael Wong", total: "$45,800", status: "accepted", date: "Jan 28" },
  { id: "QT-202601-0039", client: "Emily Tan", total: "$32,100", status: "sent", date: "Jan 27" },
];

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-yellow-100 text-yellow-700",
  quoted: "bg-purple-100 text-purple-700",
  negotiating: "bg-orange-100 text-orange-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
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

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, Josh! Here&apos;s your business overview.
          </p>
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
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <span
                  className={`text-sm font-medium flex items-center gap-1 ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {stat.changeType === "positive" ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  {stat.change}
                </span>
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
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon status={lead.status} />
                    <div>
                      <p className="font-medium text-sm">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{lead.budget}</p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs capitalize ${
                        statusColors[lead.status]
                      }`}
                    >
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
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
              {recentQuotations.map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon status={quote.status} />
                    <div>
                      <p className="font-medium text-sm">{quote.id}</p>
                      <p className="text-xs text-muted-foreground">{quote.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{quote.total}</p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs capitalize ${
                        statusColors[quote.status]
                      }`}
                    >
                      {quote.status}
                    </span>
                  </div>
                </div>
              ))}
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
            {[
              { label: "New", count: 12, color: "bg-blue-500" },
              { label: "Contacted", count: 8, color: "bg-yellow-500" },
              { label: "Quoted", count: 15, color: "bg-purple-500" },
              { label: "Negotiating", count: 6, color: "bg-orange-500" },
              { label: "Won", count: 5, color: "bg-green-500" },
              { label: "Lost", count: 2, color: "bg-red-500" },
            ].map((stage) => (
              <div key={stage.label} className="text-center">
                <div className={`h-2 rounded-full ${stage.color} mb-2`} />
                <p className="text-2xl font-bold">{stage.count}</p>
                <p className="text-xs text-muted-foreground">{stage.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
