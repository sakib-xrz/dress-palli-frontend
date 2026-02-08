"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
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
  useDeleteProductImage,
  useSetPrimaryImage,
  useUpdateImage,
} from "@/hooks/use-products";
import { productService } from "@/services/product.service";
import { showToast } from "@/lib/toast";
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

interface StagedFile {
  id: string;
  file: File;
  previewUrl: string;
  uploadTarget: string;
  altText: string;
  isPrimary: boolean;
}

interface VariantOption {
  id: string;
  label: string;
  colorCode: string | null;
}

// ── Helpers ────────────────────────────────────────────

let fileIdCounter = 0;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
            <DialogTitle className="text-lg">Manage Images</DialogTitle>
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
  const queryClient = useQueryClient();

  // Upload state
  const [stagedFiles, setStagedFiles] = useState<StagedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    current: 0,
    total: 0,
  });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit alt text state
  const [editingImageId, setEditingImageId] = useState<string | null>(null);
  const [editAltText, setEditAltText] = useState("");

  // Queries & Mutations
  const { data: images, isLoading } = useProductImages(product.id);
  const deleteMutation = useDeleteProductImage();
  const setPrimaryMutation = useSetPrimaryImage();
  const updateMutation = useUpdateImage();

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

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (fileArray.length === 0) return;

    const newStaged: StagedFile[] = fileArray.map((file) => ({
      id: `staged-${++fileIdCounter}`,
      file,
      previewUrl: URL.createObjectURL(file),
      uploadTarget: "product",
      altText: "",
      isPrimary: false,
    }));

    setStagedFiles((prev) => [...prev, ...newStaged].slice(0, 10));
  }, []);

  const removeStagedFile = useCallback((id: string) => {
    setStagedFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file) URL.revokeObjectURL(file.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const updateStagedFile = useCallback(
    (id: string, updates: Partial<StagedFile>) => {
      setStagedFiles((prev) =>
        prev.map((f) => {
          if (f.id !== id) {
            // When setting one as primary, uncheck others
            if (updates.isPrimary) return { ...f, isPrimary: false };
            return f;
          }
          return { ...f, ...updates };
        }),
      );
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  // ── Upload all staged files ────────────────────────

  const handleUploadAll = useCallback(async () => {
    if (stagedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ current: 0, total: stagedFiles.length });

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < stagedFiles.length; i++) {
      const item = stagedFiles[i];
      setUploadProgress({ current: i + 1, total: stagedFiles.length });

      try {
        const options = {
          alt_text: item.altText || undefined,
          is_primary: item.isPrimary || undefined,
        };

        if (item.uploadTarget === "product") {
          await productService.uploadImages(product.id, [item.file], options);
        } else {
          await productService.uploadVariantImages(
            item.uploadTarget,
            [item.file],
            options,
          );
        }
        successCount++;
      } catch {
        errorCount++;
      }
    }

    // Cleanup preview URLs
    stagedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
    setStagedFiles([]);
    setIsUploading(false);
    setUploadProgress({ current: 0, total: 0 });

    // Refresh data
    queryClient.invalidateQueries({ queryKey: ["products"] });

    if (successCount > 0 && errorCount === 0) {
      showToast.success(
        `${successCount} image${successCount > 1 ? "s" : ""} uploaded successfully`,
      );
    } else if (successCount > 0) {
      showToast.error(`${successCount} uploaded, ${errorCount} failed`);
    } else {
      showToast.error("Failed to upload images");
    }
  }, [stagedFiles, product.id, queryClient]);

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
      {
        label: string;
        colorCode: string | null;
        images: ProductImageWithVariant[];
      }
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
      <div className="space-y-3">
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
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            dragActive
              ? "border-primary bg-primary/5 scale-[1.01]"
              : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/30"
          } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <div
            className={`rounded-full p-3 ${dragActive ? "bg-primary/10" : "bg-muted"}`}
          >
            {isUploading ? (
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="size-5 text-muted-foreground" />
            )}
          </div>
          <p className="mt-3 text-sm font-medium">
            {isUploading ? "Uploading..." : "Click or drag images to upload"}
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

        {/* Staged files with individual settings */}
        {stagedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {stagedFiles.length} image
                {stagedFiles.length > 1 ? "s" : ""} selected
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  stagedFiles.forEach((f) => URL.revokeObjectURL(f.previewUrl));
                  setStagedFiles([]);
                }}
                disabled={isUploading}
                className="text-xs h-7 text-muted-foreground"
              >
                Clear all
              </Button>
            </div>

            <div className="space-y-2">
              {stagedFiles.map((staged) => (
                <StagedFileCard
                  key={staged.id}
                  staged={staged}
                  variantOptions={variantOptions}
                  onUpdate={updateStagedFile}
                  onRemove={removeStagedFile}
                  disabled={isUploading}
                />
              ))}
            </div>

            <div className="flex justify-end pt-1">
              <Button
                onClick={handleUploadAll}
                disabled={isUploading}
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Uploading {uploadProgress.current} of {uploadProgress.total}
                    ...
                  </>
                ) : (
                  <>
                    <Upload />
                    Upload {stagedFiles.length} image
                    {stagedFiles.length > 1 ? "s" : ""}
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
        <h4 className="text-sm font-medium">
          All Images
          {totalImages > 0 && (
            <span className="text-muted-foreground ml-1.5 font-normal">
              ({totalImages})
            </span>
          )}
        </h4>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : totalImages > 0 ? (
          <div className="space-y-5">
            {/* Product-level images */}
            {productLevelImages.length > 0 && (
              <ImageSection
                label="Product Images"
                count={productLevelImages.length}
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
            )}

            {/* Variant image groups */}
            {variantImageGroups.map((group) => (
              <ImageSection
                key={group.label}
                label={group.label}
                count={group.images.length}
                colorCode={group.colorCode}
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
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-10 text-center">
            <div className="rounded-full bg-muted p-3">
              <ImagePlus className="size-6 text-muted-foreground" />
            </div>
            <p className="mt-3 text-sm font-medium">No images yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload images above to showcase this product.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Staged File Card ───────────────────────────────────

function StagedFileCard({
  staged,
  variantOptions,
  onUpdate,
  onRemove,
  disabled,
}: {
  staged: StagedFile;
  variantOptions: VariantOption[];
  onUpdate: (id: string, updates: Partial<StagedFile>) => void;
  onRemove: (id: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex gap-3 rounded-xl border bg-card p-3 shadow-sm transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={staged.previewUrl}
          alt={staged.file.name}
          className="size-full object-cover"
        />
      </div>

      {/* Settings */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* File info + remove */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{staged.file.name}</p>
            <p className="text-[11px] text-muted-foreground">
              {formatFileSize(staged.file.size)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            onClick={() => onRemove(staged.id)}
            disabled={disabled}
            className="shrink-0 -mt-0.5 -mr-0.5 text-muted-foreground hover:text-destructive"
          >
            <X className="size-3.5" />
          </Button>
        </div>

        {/* Upload target + Alt text */}
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">
              Upload to
            </Label>
            <Select
              value={staged.uploadTarget}
              onValueChange={(v) => onUpdate(staged.id, { uploadTarget: v })}
              disabled={disabled}
            >
              <SelectTrigger className="h-8 text-xs bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Product (General)</SelectItem>
                {variantOptions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    <div className="flex items-center gap-1.5">
                      {v.colorCode && (
                        <span
                          className="size-2.5 rounded-full border shrink-0"
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
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">
              Alt text
            </Label>
            <Input
              value={staged.altText}
              onChange={(e) => onUpdate(staged.id, { altText: e.target.value })}
              placeholder="Describe the image..."
              className="h-8 text-xs bg-background"
              disabled={disabled}
            />
          </div>
        </div>

        {/* Primary toggle */}
        <div className="flex items-center gap-2">
          <Checkbox
            id={`primary-${staged.id}`}
            checked={staged.isPrimary}
            onCheckedChange={(checked) =>
              onUpdate(staged.id, { isPrimary: checked === true })
            }
            disabled={disabled}
            className="bg-background"
          />
          <Label
            htmlFor={`primary-${staged.id}`}
            className="text-[11px] cursor-pointer text-muted-foreground"
          >
            Set as primary image
          </Label>
        </div>
      </div>
    </div>
  );
}

// ── Image Section ──────────────────────────────────────

interface ImageSectionProps {
  label: string;
  count: number;
  colorCode?: string | null;
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

function ImageSection({
  label,
  count,
  colorCode,
  images,
  ...gridProps
}: ImageSectionProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        {colorCode && (
          <span
            className="size-3 rounded-full border shrink-0"
            style={{ backgroundColor: colorCode }}
          />
        )}
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
          <span className="ml-1 font-normal">({count})</span>
        </p>
      </div>
      <ImageGrid images={images} {...gridProps} />
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
              className="group relative aspect-square overflow-hidden rounded-xl border bg-muted shadow-sm"
            >
              <Image
                src={image.url}
                alt={image.alt_text || "Product image"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Primary badge */}
              {image.is_primary && (
                <Badge className="absolute top-2 left-2 text-[10px] gap-1 pointer-events-none shadow-sm">
                  <Star className="size-2.5 fill-current" />
                  Primary
                </Badge>
              )}

              {/* Alt text on hover */}
              {image.alt_text && !isEditing && (
                <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/70 via-black/30 to-transparent px-2.5 pb-2 pt-6 opacity-0 transition-opacity group-hover:opacity-100">
                  <p className="text-[11px] text-white/90 line-clamp-2 leading-tight">
                    {image.alt_text}
                  </p>
                </div>
              )}

              {/* Edit alt text overlay */}
              {isEditing && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2.5 bg-black/60 p-3 backdrop-blur-xs">
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
                <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/0 opacity-0 transition-all duration-200 group-hover:bg-black/40 group-hover:opacity-100">
                  <div className="flex gap-1.5">
                    {!image.is_primary && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            type="button"
                            size="xs"
                            variant="secondary"
                            onClick={() => onSetPrimary(image.id)}
                            disabled={isSetPrimaryPending}
                            className="shadow-sm"
                          >
                            <Star className="size-3.5" />
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
                          onClick={() => onEditStart(image.id, image.alt_text)}
                          className="shadow-sm"
                        >
                          <Pencil className="size-3.5" />
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
                          className="shadow-sm"
                        >
                          <Trash2 className="size-3.5" />
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
