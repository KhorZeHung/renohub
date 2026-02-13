"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";
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
import type { SelectedImage } from "@/types";
import Image from "next/image";

interface LineItemDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  selectedImages: SelectedImage[];
  hasPresetItem: boolean;
  onSave: () => void;
}

export function LineItemDetailsDialog({
  open,
  onOpenChange,
  description,
  onDescriptionChange,
  selectedImages,
  hasPresetItem,
  onSave,
}: LineItemDetailsDialogProps) {
  const [localDescription, setLocalDescription] = useState(description);
  const [hasError, setHasError] = useState(false);

  const handleSave = () => {
    if (!localDescription.trim()) {
      setHasError(true);
      return;
    }
    onDescriptionChange(localDescription);
    onSave();
    setHasError(false);
  };

  const handleCancel = () => {
    setLocalDescription(description);
    setHasError(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Line Item Details</DialogTitle>
          <DialogDescription>
            View and edit the description for this line item.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Enter item description..."
              value={localDescription}
              onChange={(e) => {
                setLocalDescription(e.target.value);
                if (hasError && e.target.value.trim()) {
                  setHasError(false);
                }
              }}
              rows={4}
              className={hasError ? "border-destructive" : ""}
            />
            {hasError && (
              <p className="text-sm text-destructive">
                Description is required
              </p>
            )}
          </div>

          {/* Images Display (only for preset items) */}
          {hasPresetItem && selectedImages && selectedImages.length > 0 && (
            <div className="space-y-2">
              <Label>Images</Label>
              <div className="grid grid-cols-3 gap-3">
                {selectedImages.map((image, index) => (
                  <div
                    key={`${image.url}-${index}`}
                    className="relative aspect-square rounded-lg border bg-muted overflow-hidden"
                  >
                    <Image
                      src={image.url}
                      alt={image.filename}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 33vw, 200px"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Images are linked from the preset item selected
              </p>
            </div>
          )}

          {!hasPresetItem && (
            <p className="text-sm text-muted-foreground italic">
              Images are only available for preset items
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
