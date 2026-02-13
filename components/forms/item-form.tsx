"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/forms/image-upload";
import { toast } from "@/hooks/use-toast";
import { createItem, updateItem } from "@/hooks/use-items";
import { ITEM_CATEGORY_OPTIONS, UNIT_OPTIONS, type ItemResponse, type ItemImage } from "@/types";

// Form validation schema
const itemFormSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name must be at most 200 characters"),
  unit: z
    .string()
    .min(1, "Unit is required")
    .max(50, "Unit must be at most 50 characters"),
  pricePerUnit: z
    .string()
    .min(1, "Price is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: "Price must be a positive number",
    }),
  description: z.string().max(1000, "Description must be at most 1000 characters").optional(),
  brand: z.string().max(100, "Brand must be at most 100 characters").optional(),
  category: z.string().max(100, "Category must be at most 100 characters").optional(),
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
  item?: ItemResponse | null;
  mode: "create" | "edit";
}

export function ItemForm({ item, mode }: ItemFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ItemImage[]>(item?.images || []);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: item?.name || "",
      unit: item?.unit || "",
      pricePerUnit: item?.pricePerUnit?.toString() || "",
      description: item?.description || "",
      brand: item?.brand || "",
      category: item?.category || "",
    },
  });

  const watchCategory = watch("category");
  const watchUnit = watch("unit");

  const onSubmit = async (data: ItemFormValues) => {
    setIsSubmitting(true);

    try {
      const payload = {
        name: data.name,
        unit: data.unit,
        pricePerUnit: parseFloat(data.pricePerUnit),
        description: data.description || null,
        brand: data.brand || null,
        category: data.category || null,
        images: images,
      };

      if (mode === "create") {
        await createItem(payload);
        toast({
          title: "Item created",
          description: "The item has been created successfully.",
          variant: "success",
        });
      } else if (item) {
        await updateItem(item.id, payload);
        toast({
          title: "Item updated",
          description: "The item has been updated successfully.",
          variant: "success",
        });
      }

      router.push("/items");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g., Vinyl Flooring - Premium Oak"
          {...register("name")}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Unit and Price Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Unit */}
        <div className="space-y-2">
          <Label htmlFor="unit">
            Unit <span className="text-destructive">*</span>
          </Label>
          <Input
            id="unit"
            placeholder="Or type custom unit"
            {...register("unit")}
            disabled={isSubmitting}
          />
          {errors.unit && (
            <p className="text-sm text-destructive">{errors.unit.message}</p>
          )}
        </div>

        {/* Price */}
        <div className="space-y-2">
          <Label htmlFor="pricePerUnit">
            Price / Unit (RM)<span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <NumericInput
              id="pricePerUnit"
              placeholder="0.00"
              {...register("pricePerUnit")}
              disabled={isSubmitting}
            />
          </div>
          {errors.pricePerUnit && (
            <p className="text-sm text-destructive">{errors.pricePerUnit.message}</p>
          )}
        </div>
      </div>

      {/* Category and Brand Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={watchCategory}
            onValueChange={(value) => setValue("category", value)}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {ITEM_CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.category && (
            <p className="text-sm text-destructive">{errors.category.message}</p>
          )}
        </div>

        {/* Brand */}
        <div className="space-y-2">
          <Label htmlFor="brand">Brand</Label>
          <Input
            id="brand"
            placeholder="e.g. Dulux"
            {...register("brand")}
            disabled={isSubmitting}
          />
          {errors.brand && (
            <p className="text-sm text-destructive">{errors.brand.message}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <p className="text-xs text-muted-foreground">default value to insert as item description in quotation</p>
        <Textarea
          id="description"
          rows={4}
          {...register("description")}
          disabled={isSubmitting}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Images */}
      <ImageUpload
        images={images}
        onImagesChange={setImages}
        description="pre-set images to be attached in quotation, max 5 images (optional)"
        disabled={isSubmitting}
      />

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Item" : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/items")}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
