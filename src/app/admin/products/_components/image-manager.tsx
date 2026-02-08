"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Star, Trash2, Upload } from "lucide-react";

import {
  useProductImages,
  useUploadProductImages,
  useDeleteProductImage,
  useSetPrimaryImage,
} from "@/hooks/use-products";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ImageManagerProps {
  productId: string;
}

export function ImageManager({ productId }: ImageManagerProps) {
  const { data: images, isLoading } = useProductImages(productId);
  const uploadMutation = useUploadProductImages();
  const deleteMutation = useDeleteProductImage();
  const setPrimaryMutation = useSetPrimaryImage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (fileArray.length === 0) return;
      uploadMutation.mutate({ productId, files: fileArray });
    },
    [productId, uploadMutation],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Images</CardTitle>
        <CardDescription>
          Upload images to showcase your product. First image becomes the
          primary.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setDragActive(false);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
        >
          {uploadMutation.isPending ? (
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="size-8 text-muted-foreground" />
          )}
          <p className="mt-2 text-sm font-medium">
            {uploadMutation.isPending
              ? "Uploading..."
              : "Click or drag images to upload"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPEG, PNG, WebP up to 30MB. Max 10 at once.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) {
                handleFiles(e.target.files);
                e.target.value = "";
              }
            }}
          />
        </div>

        {/* Image Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : images && images.length > 0 ? (
          <TooltipProvider>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                >
                  <Image
                    src={image.url}
                    alt={image.alt_text || "Product image"}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  {image.is_primary && (
                    <Badge className="absolute top-1.5 left-1.5 text-[10px] gap-1">
                      <Star className="size-2.5 fill-current" />
                      Primary
                    </Badge>
                  )}

                  {/* Hover Actions */}
                  <div className="absolute inset-0 flex items-end justify-center gap-1.5 bg-black/0 p-2 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                    {!image.is_primary && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="xs"
                            variant="secondary"
                            onClick={() => setPrimaryMutation.mutate(image.id)}
                            disabled={setPrimaryMutation.isPending}
                          >
                            <Star />
                            Primary
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Set as primary image</TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="xs"
                          variant="destructive"
                          onClick={() => deleteMutation.mutate(image.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete image</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              ))}

              {/* Add More */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-dashed text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <ImagePlus className="size-6" />
                <span className="mt-1 text-xs">Add More</span>
              </button>
            </div>
          </TooltipProvider>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <ImagePlus className="size-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No images yet. Upload images to showcase your product.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
