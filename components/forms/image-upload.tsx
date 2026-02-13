"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon, Plus, RotateCw } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { AttachmentThumbnail } from "@/components/ui/attachment-thumbnail";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import type { ItemImage } from "@/types";

const DEFAULT_MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

type BaseImage = { url: string; filename: string };

interface ImageUploadProps<T extends BaseImage = ItemImage> {
  images: T[];
  onImagesChange: (images: T[]) => void;
  disabled?: boolean;
  uploadType?: string;
  maxImages?: number;
  label?: string;
  description? : string;
  hideLabel?: boolean;
}

export function ImageUpload<T extends BaseImage = ItemImage>({
  images,
  onImagesChange,
  disabled = false,
  uploadType = "item",
  maxImages = DEFAULT_MAX_IMAGES,
  label = "Item Images",
  description = "",
  hideLabel = false,
}: ImageUploadProps<T>) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image viewer state
  const [viewerImage, setViewerImage] = useState<{ url: string; filename: string } | null>(null);
  const [rotation, setRotation] = useState(0);

  const openImageViewer = (image: { url: string; filename: string }) => {
    setViewerImage(image);
    setRotation(0);
  };

  const closeImageViewer = () => {
    setViewerImage(null);
    setRotation(0);
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `${file.name}: Only JPEG, PNG, and WebP images are allowed`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `${file.name}: File size must be less than 5MB`;
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<{ url: string; filename: string } | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", uploadType);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload file");
    }

    const data = await response.json();
    return {
      url: data.url,
      filename: data.filename,
    };
  };

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const remainingSlots = maxImages - images.length;

      if (fileArray.length > remainingSlots) {
        toast({
          title: "Too many images",
          description: `You can only upload ${remainingSlots} more image${remainingSlots === 1 ? "" : "s"}`,
          variant: "destructive",
        });
        return;
      }

      // Validate all files first
      const errors: string[] = [];
      for (const file of fileArray) {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        }
      }

      if (errors.length > 0) {
        toast({
          title: "Invalid files",
          description: errors.join("\n"),
          variant: "destructive",
        });
        return;
      }

      setIsUploading(true);
      const newImages: T[] = [];

      try {
        for (let i = 0; i < fileArray.length; i++) {
          const file = fileArray[i];
          const uploadResult = await uploadFile(file);
          if (uploadResult) {
            newImages.push({
              url: uploadResult.url,
              filename: uploadResult.filename,
            } as unknown as T);
          }
        }

        if (newImages.length > 0) {
          onImagesChange([...images, ...newImages]);
          toast({
            title: "Images uploaded",
            description: `Successfully uploaded ${newImages.length} image${newImages.length === 1 ? "" : "s"}`,
            variant: "success",
          });
        }
      } catch (error) {
        toast({
          title: "Upload failed",
          description: error instanceof Error ? error.message : "Failed to upload images",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [images, onImagesChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled || isUploading) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFiles(files);
      }
    },
    [disabled, isUploading, handleFiles]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFiles(files);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleFiles]
  );

  const handleRemoveImage = useCallback(
    (index: number) => {
      const newImages = images.filter((_, i) => i !== index);
      onImagesChange(newImages);
    },
    [images, onImagesChange]
  );

  const canUpload = images.length < maxImages && !disabled && !isUploading;

  return (
    <div className="space-y-4">
      {!hideLabel && (
        <div className="flex items-center justify-between mb-2">
          <Label>{label}</Label>
          <div className="flex items-center gap-2">
            {images.length > 0 && canUpload && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={disabled || isUploading}
                />
                <Button
                  type="button"
                  size="sm"
                  className="h-7 gap-1"
                  disabled={disabled || isUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Plus className="h-3.5 w-3.5" />
                  )}
                  Add
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      {description && <p className="text-xs text-muted-foreground text-left">{description}</p>}

      {/* Image limit reached message */}
      {images.length >= maxImages && (
        <p className="text-sm text-muted-foreground text-center py-2">
          Maximum number of images reached. Remove an image to upload more.
        </p>
      )}

      {/* Image preview grid */}
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((image, index) => (
            <AttachmentThumbnail
              key={`${image.url}-${index}`}
              url={image.url}
              filename={image.filename}
              onClick={() => !disabled && openImageViewer(image)}
              className="aspect-square h-20 w-20"
            >
              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors">

                {/* Delete button */}
                {!disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </AttachmentThumbnail>
          ))}
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !canUpload && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <ImageIcon className="h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No images uploaded</p>
        </div>
      )}

      {/* Help text */}
      {images.length > 1 && !disabled && (
        <p className="text-xs text-muted-foreground">
          The first image will be used as the main image.
        </p>
      )}

      {/* Drop zone - only shown when no images uploaded */}
      {images.length === 0 && canUpload && (
        <div
          className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            disabled={disabled || isUploading}
          />

          <div className="flex flex-col items-center gap-2">
            {isUploading ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-sm font-medium">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    Drag & drop images here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG, WebP up to 5MB each
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Image Viewer Dialog */}
      <Dialog open={!!viewerImage} onOpenChange={(open) => !open && closeImageViewer()}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Viewer</DialogTitle>
            <DialogDescription>View image with zoom and rotate controls</DialogDescription>
          </DialogHeader>
          {viewerImage && (
            <div className="relative">
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
              >
                {/* Toolbar */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-background/80 backdrop-blur-sm rounded-lg border p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setRotation((r) => r + 90)}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
                <TransformComponent
                  wrapperStyle={{ width: "100%", minHeight: "400px", maxHeight: "80vh" }}
                  contentStyle={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}
                >
                  <Image
                    src={viewerImage.url}
                    alt={viewerImage.filename}
                    width={800}
                    height={600}
                    className="max-w-full h-auto object-contain"
                    style={{ maxHeight: "70vh", transform: `rotate(${rotation}deg)`, transition: "transform 0.2s ease" }}
                  />
                </TransformComponent>
              </TransformWrapper>

              {/* Filename */}
              <div className="px-4 py-2 border-t bg-muted/50">
                <p className="text-xs text-muted-foreground truncate">{viewerImage.filename}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
