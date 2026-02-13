"use client";

import { useState } from "react";
import Image from "next/image";
import { RotateCw } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ImageUpload } from "@/components/forms/image-upload";
import { AttachmentThumbnail } from "@/components/ui/attachment-thumbnail";
import type { SelectedImage } from "@/types";

export interface AttachmentLineItemImage {
  url: string;
  filename: string;
  itemDescription: string;
}

interface AttachmentSectionProps {
  lineItemImages: AttachmentLineItemImage[];
  customImages: SelectedImage[];
  onCustomImagesChange: (images: SelectedImage[]) => void;
}

export function AttachmentSection({
  lineItemImages,
  customImages,
  onCustomImagesChange,
}: AttachmentSectionProps) {
  const totalImages = lineItemImages.length + customImages.length;

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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Attachment</CardTitle>
            {totalImages > 0 && (
              <Badge variant="secondary" className="text-xs">
                {totalImages} image{totalImages === 1 ? "" : "s"}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Item Images (from line items) */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Item Images</Label>
            {lineItemImages.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {lineItemImages.map((image, index) => (
                  <AttachmentThumbnail
                    key={`${image.url}-${index}`}
                    url={image.url}
                    filename={image.filename}
                    description={image.itemDescription}
                    onClick={() => openImageViewer(image)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic py-2">
                No images selected from items
              </p>
            )}
          </div>

          <Separator />

          {/* Custom Upload Images */}
          <ImageUpload
            images={customImages}
            onImagesChange={onCustomImagesChange}
            uploadType="quotation"  
            maxImages={20}
            label="Custom Images"
          />
        </CardContent>
      </Card>

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
    </>
  );
}
