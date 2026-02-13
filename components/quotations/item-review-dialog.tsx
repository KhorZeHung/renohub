"use client";

import { useState, useEffect } from "react";
import { Check, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ItemImage, SelectedImage } from "@/types";

interface ItemReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  itemName: string;
  availableImages: ItemImage[];
  description: string;
  selectedImageUrls: Set<string>;
  onConfirm: (description: string, selectedImages: SelectedImage[]) => void;
  onCancel: () => void;
}

export function ItemReviewDialog({
  open,
  onOpenChange,
  mode,
  itemName,
  availableImages,
  description,
  selectedImageUrls,
  onConfirm,
  onCancel,
}: ItemReviewDialogProps) {
  const [localDescription, setLocalDescription] = useState(description);
  const [localSelectedUrls, setLocalSelectedUrls] = useState<Set<string>>(
    new Set(selectedImageUrls)
  );
  const [hasError, setHasError] = useState(false);

  // Sync local state when props change (dialog opens with new data)
  useEffect(() => {
    if (open) {
      setLocalDescription(description);
      setLocalSelectedUrls(new Set(selectedImageUrls));
      setHasError(false);
    }
  }, [open, description, selectedImageUrls]);

  const toggleImage = (url: string) => {
    setLocalSelectedUrls((prev) => {
      const next = new Set(prev);
      if (next.has(url)) {
        next.delete(url);
      } else {
        next.add(url);
      }
      return next;
    });
  };

  const selectAll = () => {
    setLocalSelectedUrls(new Set(availableImages.map((img) => img.url)));
  };

  const deselectAll = () => {
    setLocalSelectedUrls(new Set());
  };

  const handleConfirm = () => {
    if (!localDescription.trim()) {
      setHasError(true);
      return;
    }

    const selectedImages: SelectedImage[] = availableImages
      .filter((img) => localSelectedUrls.has(img.url))
      .map((img) => ({
        url: img.url,
        filename: img.filename,
      }));

    onConfirm(localDescription.trim(), selectedImages);
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleCancel();
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{itemName}</DialogTitle>
          <DialogDescription>
            {mode === "add"
              ? "Review item details and select images for the quotation attachment"
              : "Edit item description and image selection"}
          </DialogDescription>
        </DialogHeader>
        <div className="py-2 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Editable Description */}
          <div className="space-y-1">
            <Label className="text-sm font-medium">
              Item Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={localDescription}
              onChange={(e) => {
                setLocalDescription(e.target.value);
                if (hasError && e.target.value.trim()) {
                  setHasError(false);
                }
              }}
              placeholder="Item description for the quotation line item"
              rows={2}
              className={`text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input ${
                hasError ? "border-destructive" : ""
              }`}
            />
            {hasError && (
              <p className="text-sm text-destructive">
                Description is required
              </p>
            )}
          </div>

          {/* Image Selection Grid */}
          {availableImages.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Images ({localSelectedUrls.size} selected)
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={selectAll}
                  >
                    Select All
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={deselectAll}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {availableImages.map((image, index) => {
                  const isSelected = localSelectedUrls.has(image.url);
                  return (
                    <button
                      key={`${image.url}-${index}`}
                      onClick={() => toggleImage(image.url)}
                      className={`relative aspect-square rounded-lg border-2 overflow-hidden transition-all ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-muted hover:border-muted-foreground/30"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.filename}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          if (target.parentElement) {
                            target.parentElement.innerHTML = `<div class="w-full h-full bg-muted flex items-center justify-center"><svg class="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>`;
                          }
                        }}
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 p-1 rounded-full bg-primary text-white">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                      <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                        {image.filename}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            {mode === "add" ? "Add" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
