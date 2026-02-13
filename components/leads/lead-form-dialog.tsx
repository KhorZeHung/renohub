"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericInput } from "@/components/ui/numeric-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/forms/image-upload";
import { createLead } from "@/hooks/use-leads";
import type { LeadImage } from "@/types";

const leadFormSchema = z.object({
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

type LeadFormInput = z.infer<typeof leadFormSchema>;

interface LeadFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (leadId: string) => void;
}

export function LeadFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: LeadFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [images, setImages] = useState<LeadImage[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LeadFormInput>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      clientName: "",
      contactNumber: "",
      email: "",
      budget: 0,
      siteAddress: "",
      remark: "",
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      reset({
        clientName: "",
        contactNumber: "",
        email: "",
        budget: 0,
        siteAddress: "",
        remark: "",
      });
      setImages([]);
      setServerError(null);
    }
  }, [open, reset]);

  const handleImagesChange = (newImages: LeadImage[]) => {
    setImages(newImages.map((img, i) => ({ ...img, order: i })));
  };

  const onSubmit = async (data: LeadFormInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await createLead({
        ...data,
        status: "new",
        images,
      });
      onOpenChange(false);
      onSuccess?.(result.lead.id);
    } catch (error: unknown) {
      console.error("Create lead error:", error);
      if (error && typeof error === "object" && "error" in error) {
        setServerError((error as { error: string }).error);
      } else {
        setServerError("Failed to create lead. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new lead.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {serverError && (
            <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm">
              {serverError}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Client Name */}
            <div className="space-y-2">
              <Label htmlFor="dialog-clientName">
                Client Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dialog-clientName"
                placeholder="Enter client name"
                {...register("clientName")}
              />
              {errors.clientName && (
                <p className="text-sm text-red-500">
                  {errors.clientName.message}
                </p>
              )}
            </div>

            {/* Contact Number */}
            <div className="space-y-2">
              <Label htmlFor="dialog-contactNumber">
                Contact Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dialog-contactNumber"
                placeholder="+65 9123 4567"
                {...register("contactNumber")}
              />
              {errors.contactNumber && (
                <p className="text-sm text-red-500">
                  {errors.contactNumber.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="dialog-email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dialog-email"
                type="email"
                placeholder="client@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Budget */}
            <div className="space-y-2">
              <Label htmlFor="dialog-budget">
                Budget (RM) <span className="text-red-500">*</span>
              </Label>
              <NumericInput
                id="dialog-budget"
                placeholder="0.00"
                {...register("budget")}
              />
              {errors.budget && (
                <p className="text-sm text-red-500">{errors.budget.message}</p>
              )}
            </div>
          </div>

          {/* Site Address */}
          <div className="space-y-2">
            <Label htmlFor="dialog-siteAddress">
              Site Address <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="dialog-siteAddress"
              placeholder="Enter the project site address"
              rows={2}
              {...register("siteAddress")}
            />
            {errors.siteAddress && (
              <p className="text-sm text-red-500">
                {errors.siteAddress.message}
              </p>
            )}
          </div>

          {/* Remark */}
          <div className="space-y-2">
            <Label htmlFor="dialog-remark">Remarks</Label>
            <Textarea
              id="dialog-remark"
              placeholder="Add any notes or remarks about this lead"
              rows={3}
              {...register("remark")}
            />
            {errors.remark && (
              <p className="text-sm text-red-500">{errors.remark.message}</p>
            )}
          </div>

          {/* Reference Images */}
          <ImageUpload
            images={images}
            onImagesChange={handleImagesChange}
            disabled={isSubmitting}
            uploadType="lead"
            label="Reference Images"
            maxImages={5}
          />

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Create Lead
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
