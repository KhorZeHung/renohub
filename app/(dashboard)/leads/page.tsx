"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Grid3X3,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLeads } from "@/hooks/use-leads";
import { LeadFormDialog } from "@/components/leads/lead-form-dialog";
import type { LeadStatus } from "@/types";
import { LEAD_STATUS_OPTIONS, LEAD_STATUS_COLORS } from "@/types";



const itemsPerPageOptions = [5, 10, 20, 50];

export default function LeadsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLeadDialogOpen, setIsLeadDialogOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get("new-lead") === "true") {
      setIsLeadDialogOpen(true);
      router.replace("/leads", { scroll: false });
    }
  }, [searchParams, router]);

  const { leads, pagination, isLoading, error, mutate } = useLeads({
    search: searchQuery || undefined,
    status: selectedStatus ? [selectedStatus] : [],
    page: currentPage,
    limit: itemsPerPage,
  });

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusSelect = (value: string) => {
    setSelectedStatus(value === "all" ? null : (value as LeadStatus));
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Track and manage your potential clients
          </p>
        </div>
        <Button className="hidden sm:inline-flex" onClick={() => setIsLeadDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-row gap-2 sm:gap-4">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedStatus || "all"}
            onValueChange={handleStatusSelect}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {LEAD_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center">
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        LEAD_STATUS_COLORS[option.value as LeadStatus]?.split(" ")[0] || "bg-gray-100"
                      }`}
                    />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-16 rounded-full" />
                      </div>
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-5/6" />
                      </div>
                      <div className="pt-2 flex justify-between items-center">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-4 w-4 rounded-full" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="divide-y">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="hidden sm:flex flex-col items-end gap-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-5 w-5 rounded-full" />
                </div>
              ))}
            </div>
          </Card>
        )
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Leads Display */}
      {!isLoading && !error && (
        viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {leads.map((lead) => (
              <Card
                key={lead.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-0">
                  <Link href={`/leads/${lead.id}`} className="block">
                    <div className="p-4">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <h3 className="font-semibold truncate">{lead.clientName}</h3>
                            <span
                              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                                LEAD_STATUS_COLORS[lead.status]
                              }`}
                            >
                              {lead.status}
                            </span>
                          </div>
                          {lead.budget > 0 && (
                            <div className="text-right shrink-0">
                              <p className="font-semibold text-sm">
                                RM {lead.budget.toLocaleString()}
                              </p>
                              <p className="text-[10px] text-muted-foreground uppercase">Budget</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 shrink-0" />
                            <span className="truncate">{lead.contactNumber || "-"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="line-clamp-1">{lead.siteAddress || "-"}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end border-t border-border/50">
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="divide-y divide-border">
              {leads.map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`} className="block hover:bg-muted/50 transition-colors">
                  <div className="p-4 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{lead.clientName}</h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider ${
                            LEAD_STATUS_COLORS[lead.status]
                          }`}
                        >
                          {lead.status}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.contactNumber || "-"}
                        </span>
                        <span className="hidden sm:flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {lead.siteAddress || "-"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      {lead.budget > 0 && (
                        <div className="text-right hidden sm:block">
                          <p className="font-semibold text-sm">RM {lead.budget.toLocaleString()}</p>
                          <p className="text-[10px] text-muted-foreground uppercase">Budget</p>
                        </div>
                      )}
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )
      )}

      {/* Pagination */}
      {!isLoading && !error && pagination.total > 0 && (
        <div className="flex items-center justify-end gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Items per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => handleItemsPerPageChange(Number(value))}
            >
              <SelectTrigger className="h-8 w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {itemsPerPageOptions.map((option) => (
                  <SelectItem key={option} value={option.toString()}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>
              {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, pagination.total)} of{" "}
              {pagination.total}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={!pagination.hasPrev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (pagination.totalPages <= 5) return true;
                if (page === 1 || page === pagination.totalPages) return true;
                if (Math.abs(page - currentPage) <= 1) return true;
                return false;
              })
              .map((page, index, arr) => (
                <span key={page} className="flex items-center">
                  {index > 0 && arr[index - 1] !== page - 1 && (
                    <span className="px-1 text-muted-foreground">...</span>
                  )}
                  <Button
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                </span>
              ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={!pagination.hasNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && leads.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 mx-auto text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-medium">No leads found</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedStatus
              ? "Try adjusting your search or filter"
              : "Get started by adding your first lead"}
          </p>
          <Button className="mt-4" onClick={() => setIsLeadDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => setIsLeadDialogOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex sm:hidden h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 active:scale-95 transition-all"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Lead Create Dialog */}
      <LeadFormDialog
        open={isLeadDialogOpen}
        onOpenChange={setIsLeadDialogOpen}
        onSuccess={(leadId) => {
          mutate();
          router.push(`/leads/${leadId}`);
        }}
      />
    </div>
  );
}
