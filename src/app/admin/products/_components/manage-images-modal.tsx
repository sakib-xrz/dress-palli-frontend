"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Check,
  ImagePlus,
  Loader2,
  Pencil,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { useMediaQuery } from "@/hooks/use-media-query";
import {
  useProductImages,
  useUploadProductImages,
  useUploadVariantImages,
  useDeleteProductImage,
  useSetPrimaryImage,
  useUpdateImage,
} from "@/hooks/use-products";
import type { AdminProduct, ProductImageWithVariant } from "@/lib/type";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ── Types ──────────────────────────────────────────────

interface ManageImagesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: AdminProduct | null;
}

interface VariantOption {
  id: string;
  label: string;
  colorCode: string | null;
}

// ── Main Modal/Sheet ───────────────────────────────────

export function ManageImagesModal({
  open,
  onOpenChange,
  product,
}: ManageImagesModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!product) return null;

  const content = <ManageImagesContent product={product} />;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Images</DialogTitle>
            <DialogDescription>{product.name}</DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Manage Images</SheetTitle>
          <SheetDescription>{product.name}</SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">{content}</div>
      </SheetContent>
    </Sheet>
  );
}

// ── Content ────────────────────────────────────────────

function ManageImagesContent({ product }: { product: AdminProduct }) {
  // Upload state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadTarget, setUploadTarget] = useState<string>("product");
  const [altText, setAltText] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit alt text state
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editAltText, setEditAltText] = useState("");

  // Queries & Mutations
  const { data: images, isLoading } = useProductImages(product.id);
  const uploadProductMutation = useUploadProductImages();
  const uploadVariantMutation = useUploadVariantImages();
  const deleteMutation = useDeleteProductImage();
  const setPrimaryMutation = useSetPrimaryImage();
  const updateMutation = useUpdateImage();

  const isUploading =
    uploadProductMutation.isPending || uploadVariantMutation.isPending;

  // Flatten variants into selectable options
  const variantOptions = useMemo<VariantOption[]>(() => {
    return product.variants.flatMap((group) =>
      group.sizes.map((size) => ({
        id: size.id,
        label:
          [group.color?.name, size.size_name].filter(Boolean).join(" / ") ||
          "Default Variant",
        colorCode: group.color?.code ?? null,
      })),
    );
  }, [product.variants]);

  // ── File handling ──────────────────────────────────

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) =>
        f.type.startsWith("image/"),
      );
      if (fileArray.length === 0) return;
      setSelectedFiles((prev) => [...prev, ...fileArray].slice(0, 10));
    },
    [],
  );

  const removeFile = useCallback((index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  // ── Upload ─────────────────────────────────────────

  const handleUpload = useCallback(() => {
    if (selectedFiles.length === 0) return;

    const options = {
      alt_text: altText || undefined,
      is_primary: isPrimary || undefined,
    };

    const onSuccess = () => {
      setSelectedFiles([]);
      setAltText("");
      setIsPrimary(false);
      setUploadTarget("product");
    };

    if (uploadTarget === "product") {
      uploadProductMutation.mutate(
        { productId: product.id, files: selectedFiles, options },
        { onSuccess },
      );
    } else {
      uploadVariantMutation.mutate(
        { variantId: uploadTarget, files: selectedFiles, options },
        { onSuccess },
      );
    }
  }, [
    selectedFiles,
    altText,
    isPrimary,
    uploadTarget,
    product.id,
    uploadProductMutation,
    uploadVariantMutation,
  ]);

  // ── Edit alt text ──────────────────────────────────

  const handleSaveAltText = useCallback(
    (imageId: string) => {
      updateMutation.mutate(
        { imageId, data: { alt_text: editAltText || null } },
        {
          onSuccess: () => {
            setEditingImageId(null);
            setEditAltText("");
          },
        },
      );
    },
    [editAltText, updateMutation],
  );

  // ── Group images for display ───────────────────────

  const productLevelImages = useMemo(
    () => images?.filter((img) => !img.variant_id) ?? [],
    [images],
  );

  const variantImageGroups = useMemo(() => {
    if (!images) return [];
    const variantImgs = images.filter((img) => img.variant_id);
    const groups = new Map<
      string,
      { label: string; colorCode: string | null; images: ProductImageWithVariant[] }
    >();

    for (const img of variantImgs) {
      const vid = img.variant_id!;
      if (!groups.has(vid)) {
        const label =
          [img.variant?.color?.name, img.variant?.size?.name]
            .filter(Boolean)
            .join(" / ") || "Variant";
        groups.set(vid, {
          label,
          colorCode: img.variant?.color?.code ?? null,
          images: [],
        });
      }
      groups.get(vid)!.images.push(img);
    }
    return Array.from(groups.values());
  }, [images]);

  const totalImages = images?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* ── Upload Section ─────────────────────────────── */}
      <div className="space-y-4">
        {/* Drop zone */}
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
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
        >
          {isUploading ? (
            <Loader2 className="size-7 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="size-7 text-muted-foreground" />
          )}
          <p className="mt-2 text-sm font-medium">
            {isUploading
              ? "Uploading..."
              : "Click or drag images to upload"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPEG, PNG, WebP up to 30MB &middot; Max 10 at once
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

        {/* File previews & upload options */}
        {selectedFiles.length > 0 && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            {/* Preview thumbnails */}
            <div className="flex gap-2 flex-wrap">
              {selectedFiles.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="group relative size-16 overflow-hidden rounded-md border bg-muted shrink-0"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="size-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(i);
                    }}
                    className="absolute -top-0.5 -right-0.5 rounded-full bg-destructive p-0.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Upload options */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Upload to
                </Label>
                <Select value={uploadTarget} onValueChange={setUploadTarget}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">
                      Product (General)
                    </SelectItem>
                    {variantOptions.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        <div className="flex items-center gap-2">
                          {v.colorCode && (
                            <span
                              className="size-3 rounded-full border shrink-0"
                              style={{ backgroundColor: v.colorCode }}
                            />
                          )}
                          {v.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Alt text
                </Label>
                <Input
                  placeholder="Describe the image..."
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                />
              </div>
            </div>

            {/* Primary + Upload button */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="is-primary-upload"
                  checked={isPrimary}
                  onCheckedChange={(checked) =>
                    setIsPrimary(checked === true)
                  }
                />
                <Label
                  htmlFor="is-primary-upload"
                  className="text-sm cursor-pointer"
                >
                  Set as primary image
                </Label>
              </div>
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload />
                    Upload{" "}
                    {selectedFiles.length === 1
                      ? "1 image"
                      : `${selectedFiles.length} images`}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* ── Existing Images ────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">
            All Images
            {totalImages > 0 && (
              <span className="text-muted-foreground ml-1.5 font-normal">
                ({totalImages})
              </span>
            )}
          </h4>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        ) : totalImages > 0 ? (
          <div className="space-y-5">
            {/* Product-level images */}
            {productLevelImages.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Product Images ({productLevelImages.length})
                </p>
                <ImageGrid
                  images={productLevelImages}
                  editingImageId={editingImageId}
                  editAltText={editAltText}
                  onEditStart={(id, alt) => {
                    setEditingImageId(id);
                    setEditAltText(alt || "");
                  }}
                  onEditEnd={() => {
                    setEditingImageId(null);
                    setEditAltText("");
                  }}
                  onEditAltTextChange={setEditAltText}
                  onSaveAltText={handleSaveAltText}
                  onSetPrimary={(id) => setPrimaryMutation.mutate(id)}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  isSetPrimaryPending={setPrimaryMutation.isPending}
                  isDeletePending={deleteMutation.isPending}
                  isSavePending={updateMutation.isPending}
                />
              </div>
            )}

            {/* Variant image groups */}
            {variantImageGroups.map((group) => (
              <div key={group.label} className="space-y-2">
                <div className="flex items-center gap-2">
                  {group.colorCode && (
                    <span
                      className="size-3 rounded-full border shrink-0"
                      style={{ backgroundColor: group.colorCode }}
                    />
                  )}
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {group.label} ({group.images.length})
                  </p>
                </div>
                <ImageGrid
                  images={group.images}
                  editingImageId={editingImageId}
                  editAltText={editAltText}
                  onEditStart={(id, alt) => {
                    setEditingImageId(id);
                    setEditAltText(alt || "");
                  }}
                  onEditEnd={() => {
                    setEditingImageId(null);
                    setEditAltText("");
                  }}
                  onEditAltTextChange={setEditAltText}
                  onSaveAltText={handleSaveAltText}
                  onSetPrimary={(id) => setPrimaryMutation.mutate(id)}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  isSetPrimaryPending={setPrimaryMutation.isPending}
                  isDeletePending={deleteMutation.isPending}
                  isSavePending={updateMutation.isPending}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <ImagePlus className="size-8 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium text-muted-foreground">
              No images yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload images above to showcase this product.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Image Grid ─────────────────────────────────────────

interface ImageGridProps {
  images: ProductImageWithVariant[];
  editingImageId: string | null;
  editAltText: string;
  onEditStart: (imageId: string, currentAlt: string | null) => void;
  onEditEnd: () => void;
  onEditAltTextChange: (value: string) => void;
  onSaveAltText: (imageId: string) => void;
  onSetPrimary: (imageId: string) => void;
  onDelete: (imageId: string) => void;
  isSetPrimaryPending: boolean;
  isDeletePending: boolean;
  isSavePending: boolean;
}

function ImageGrid({
  images,
  editingImageId,
  editAltText,
  onEditStart,
  onEditEnd,
  onEditAltTextChange,
  onSaveAltText,
  onSetPrimary,
  onDelete,
  isSetPrimaryPending,
  isDeletePending,
  isSavePending,
}: ImageGridProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((image) => {
          const isEditing = editingImageId === image.id;

          return (
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

              {/* Primary badge */}
              {image.is_primary && (
                <Badge className="absolute top-1.5 left-1.5 text-[10px] gap-1 pointer-events-none">
                  <Star className="size-2.5 fill-current" />
                  Primary
                </Badge>
              )}

              {/* Alt text badge */}
              {image.alt_text && !isEditing && (
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent px-2 pb-1.5 pt-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-[10px] text-white/90 line-clamp-1">
                    {image.alt_text}
                  </p>
                </div>
              )}

              {/* Edit alt text overlay */}
              {isEditing && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/60 p-2">
                  <Input
                    value={editAltText}
                    onChange={(e) => onEditAltTextChange(e.target.value)}
                    placeholder="Alt text..."
                    className="h-8 text-xs bg-white"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") onSaveAltText(image.id);
                      if (e.key === "Escape") onEditEnd();
                    }}
                  />
                  <div className="flex gap-1.5">
                    <Button
                      size="xs"
                      variant="secondary"
                      onClick={() => onSaveAltText(image.id)}
                      disabled={isSavePending}
                    >
                      {isSavePending ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        <Check className="size-3" />
                      )}
                      Save
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-white hover:text-white hover:bg-white/20"
                      onClick={onEditEnd}
                    >
                      <X className="size-3" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Hover action buttons */}
              {!isEditing && (
                <div className="absolute inset-0 flex items-end justify-center gap-1.5 bg-black/0 p-2 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                  <div className="flex gap-1">
                    {!image.is_primary && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="xs"
                            variant="secondary"
                            onClick={() => onSetPrimary(image.id)}
                            disabled={isSetPrimaryPending}
                          >
                            <Star className="size-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          Set as primary
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="xs"
                          variant="secondary"
                          onClick={() =>
                            onEditStart(image.id, image.alt_text)
                          }
                        >
                          <Pencil className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Edit alt text</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="xs"
                          variant="destructive"
                          onClick={() => onDelete(image.id)}
                          disabled={isDeletePending}
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Delete</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
