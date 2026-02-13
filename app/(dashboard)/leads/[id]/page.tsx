"use client";

import { use, useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Plus,
  AlertCircle,
  Trash2,
  Loader2,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { ImageUpload } from "@/components/forms/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLead, updateLead, updateLeadStatus, deleteLead } from "@/hooks/use-leads";
import { useLeadQuotations } from "@/hooks/use-quotations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { LEAD_STATUS_OPTIONS, LEAD_STATUS_COLORS, type LeadStatus, type LeadImage, type QuotationStatus } from "@/types";
import { LeadFab } from "@/components/leads/lead-fab";
import { ScrollArea } from "@/components/ui/scroll-area";

const leadEditSchema = z.object({
  clientName: z
    .string()
    .min(2, "Client name must be at least 2 characters")
    .max(100, "Client name must be at most 100 characters"),
  contactNumber: z
    .string()
    .min(8, "Contact number must be at least 8 characters")
    .max(20, "Contact number must be at most 20 characters"),
  email: z.string().email("Please enter a valid email address"),
  budget: z.number().min(0, "Budget cannot be negative"),
  siteAddress: z
    .string()
    .min(5, "Site address must be at least 5 characters")
    .max(500, "Site address must be at most 500 characters"),
  remark: z
    .string()
    .max(2000, "Remark must be at most 2000 characters")
    .optional(),
});

type LeadEditInput = z.infer<typeof leadEditSchema>;

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { lead, isLoading, error, mutate } = useLead(id);
  const { quotations, isLoading: isLoadingQuotations } = useLeadQuotations(id);

  const [newStatus, setNewStatus] = useState<LeadStatus | "">("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quotation sort & filter
  const [quotationSort, setQuotationSort] = useState("created-desc");
  const [quotationStatusFilter, setQuotationStatusFilter] = useState<QuotationStatus | "all">("all");
  const filteredAndSortedQuotations = useMemo(() => {
    let filtered = [...quotations];
    if (quotationStatusFilter !== "all") {
      filtered = filtered.filter((q) => q.status === quotationStatusFilter);
    }
    switch (quotationSort) {
      case "created-asc":
        return filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "created-desc":
        return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "total-asc":
        return filtered.sort((a, b) => a.total - b.total);
      case "total-desc":
        return filtered.sort((a, b) => b.total - a.total);
      default:
        return filtered;
    }
  }, [quotations, quotationSort, quotationStatusFilter]);

  // Form state (always in edit mode)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<LeadImage[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadEditInput>({
    resolver: zodResolver(leadEditSchema),
    defaultValues: {
      clientName: "",
      contactNumber: "",
      email: "",
      budget: 0,
      siteAddress: "",
      remark: "",
    },
  });

  // Sync form when lead data loads
  useEffect(() => {
    if (lead) {
      reset({
        clientName: lead.clientName,
        contactNumber: lead.contactNumber,
        email: lead.email,
        budget: lead.budget,
        siteAddress: lead.siteAddress,
        remark: lead.remark || "",
      });
      setImages(lead.images || []);
    }
  }, [lead, reset]);

  const handleStatusUpdate = async (status?: LeadStatus) => {
    const statusToUpdate = status || (newStatus as LeadStatus);
    if (!statusToUpdate) return;

    setIsUpdatingStatus(true);
    try {
      await updateLeadStatus(id, { status: statusToUpdate });
      setNewStatus("");
      mutate();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteLead(id);
      window.location.href = "/leads";
    } catch {
      setIsDeleting(false);
    }
  };

  const handleImagesChange = (newImages: LeadImage[]) => {
    setImages(newImages.map((img, i) => ({ ...img, order: i })));
  };

  const onSubmit = async (data: LeadEditInput) => {
    if (!lead) return;
    setIsSubmitting(true);
    try {
      const updateData: Record<string, unknown> = {};
      if (data.clientName !== lead.clientName) updateData.clientName = data.clientName;
      if (data.contactNumber !== lead.contactNumber) updateData.contactNumber = data.contactNumber;
      if (data.email !== lead.email) updateData.email = data.email;
      if (data.budget !== lead.budget) updateData.budget = data.budget;
      if (data.siteAddress !== lead.siteAddress) updateData.siteAddress = data.siteAddress;
      if (data.remark !== (lead.remark || "")) updateData.remark = data.remark || null;

      const imagesChanged = JSON.stringify(images) !== JSON.stringify(lead.images || []);
      if (imagesChanged) updateData.images = images;

      if (Object.keys(updateData).length === 0) {
        toast({ title: "No changes", description: "No changes were made." });
        return;
      }

      await updateLead(lead.id, updateData as Parameters<typeof updateLead>[1]);
      toast({ title: "Lead updated", description: "Changes saved successfully." });
      mutate();
    } catch (error: unknown) {
      console.error("Update lead error:", error);
      const message =
        error && typeof error === "object" && "error" in error
          ? (error as { error: string }).error
          : "Failed to update lead. Please try again.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Error</h2>
        <p className="text-muted-foreground">{error || "Lead not found"}</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link href="/leads">Back to Leads</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <LeadFab />
    
      <div className="max-w-7xl mx-auto pb-20 lg:pb-0">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/leads">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{lead.clientName}</h1>
                <Badge className={LEAD_STATUS_COLORS[lead.status]}>{lead.status}</Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Lead Info Form (always editable) */}
              <Card id="lead-info-section" className="scroll-mt-24">
                <CardHeader>
                  <CardTitle>Lead Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="edit-clientName">
                          Client Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="edit-clientName"
                          placeholder="Enter client name"
                          {...register("clientName")}
                        />
                        {errors.clientName && (
                          <p className="text-sm text-red-500">{errors.clientName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-contactNumber">
                          Contact Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="edit-contactNumber"
                          placeholder="+65 9123 4567"
                          {...register("contactNumber")}
                        />
                        {errors.contactNumber && (
                          <p className="text-sm text-red-500">{errors.contactNumber.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-email">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="edit-email"
                          type="email"
                          placeholder="client@email.com"
                          {...register("email")}
                        />
                        {errors.email && (
                          <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-budget">
                          Budget (RM) <span className="text-red-500">*</span>
                        </Label>
                        <NumericInput
                          id="edit-budget"
                          placeholder="0.00"
                          {...register("budget")}
                        />
                        {errors.budget && (
                          <p className="text-sm text-red-500">{errors.budget.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-siteAddress">
                        Site Address <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="edit-siteAddress"
                        placeholder="Enter the project site address"
                        rows={2}
                        {...register("siteAddress")}
                      />
                      {errors.siteAddress && (
                        <p className="text-sm text-red-500">{errors.siteAddress.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="edit-remark">Remarks</Label>
                      <Textarea
                        id="edit-remark"
                        placeholder="Add any notes or remarks about this lead"
                        rows={4}
                        {...register("remark")}
                      />
                      {errors.remark && (
                        <p className="text-sm text-red-500">{errors.remark.message}</p>
                      )}
                    </div>

                    <ImageUpload
                      images={images}
                      onImagesChange={handleImagesChange}
                      disabled={isSubmitting}
                      uploadType="lead"
                      label="Reference Images"
                      maxImages={5}
                    />

                    <div className="flex justify-end pt-2 border-t">
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Quotations */}
              <Card id="lead-quotations-section" className="scroll-mt-24">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>Quotations</CardTitle>
                  <Button size="sm" asChild>
                    <Link href={`/leads/${lead.id}/quotations`}>
                      <Plus className="h-4 w-4 mr-2" />
                      New Quote
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {isLoadingQuotations ? (
                    <div className="flex items-center justify-center py-6">
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  ) : quotations.length === 0 ? (
                    <div className="text-center py-6 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground mb-4">No quotations generated yet</p>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/leads/${lead.id}/quotations`}>Create First Quote</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-end gap-2">
                        <Select value={quotationStatusFilter} onValueChange={(v) => setQuotationStatusFilter(v as QuotationStatus | "all")}>
                          <SelectTrigger className="w-[130px] h-8 text-xs">
                            <Filter className="h-3 w-3 mr-1.5" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All status</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="sent">Sent</SelectItem>
                            <SelectItem value="viewed">Viewed</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="expired">Expired</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select value={quotationSort} onValueChange={setQuotationSort}>
                          <SelectTrigger className="w-[150px] h-8 text-xs">
                            <ArrowUpDown className="h-3 w-3 mr-1.5" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="created-desc">Newest first</SelectItem>
                            <SelectItem value="created-asc">Oldest first</SelectItem>
                            <SelectItem value="total-desc">Highest total</SelectItem>
                            <SelectItem value="total-asc">Lowest total</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <ScrollArea className="max-h-[400px]">
                        <div className="space-y-3">
                          {filteredAndSortedQuotations.length === 0 ? (
                            <p className="text-center text-sm text-muted-foreground py-4">No quotations match this filter</p>
                          ) : filteredAndSortedQuotations.map((quotation) => (
                            <Link
                              key={quotation.id}
                              href={`/leads/${lead.id}/quotations?quotationId=${quotation.id}`}
                              className="block p-3 rounded-lg border hover:bg-accent transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{quotation.quotationNumber}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(quotation.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold">RM {quotation.total.toLocaleString()}</p>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {quotation.status}
                                  </Badge>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar (desktop only) */}
            <div className="space-y-6">
              <Card id="lead-danger-section">
                  <CardHeader>
                    <CardTitle>Activity Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <ScrollArea className="h-[250px]">
                        <div className="space-y-4">
                          {lead.statusHistory && lead.statusHistory.length > 0 ? (
                          lead.statusHistory.map((history, index) => (
                          <div key={index} className="flex gap-3 relative pb-4 last:pb-0">
                            {index !== lead.statusHistory.length - 1 && (
                              <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-muted" />
                            )}
                          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 z-10">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium capitalize">{history.status}</p>
                              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {new Date(history.changedAt).toLocaleDateString()}
                              </span>
                            </div>
                            {history.note && (
                              <p className="text-xs text-muted-foreground">{history.note}</p>
                            )}
                          </div>
                        </div>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No history available</p>
                        )}
                      </div>
                    </ScrollArea>
                  </CardContent>
              </Card>
              <Card id="lead-timeline-section">
                <CardHeader>
                  <CardTitle>Status & Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newStatus || lead.status}
                      onValueChange={(val) => setNewStatus(val as LeadStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2 text-left">
                          <SelectValue placeholder="Select status" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-block w-2 h-2 rounded-full shrink-0 ${
                                  LEAD_STATUS_COLORS[option.value as LeadStatus]?.split(" ")[0] || "bg-gray-100"
                                }`}
                              />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => handleStatusUpdate()}
                    disabled={isUpdatingStatus}
                  >
                    {isUpdatingStatus ? "Updating..." : "Update"}
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex 4xl-flex-col items-center justify-between">
                    <div className="pr-2">
                      <p className="text-sm font-medium">Delete this lead</p>
                      <p className="text-xs text-muted-foreground">
                        This will permanently remove the lead and all associated data.
                      </p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Lead</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this lead? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
