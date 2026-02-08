"use client";

import { useCallback, useMemo, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useUpdateProduct } from "@/hooks/use-products";
import type { AdminProduct } from "@/lib/type";
import Image from "next/image";
import Link from "next/link";
import {
  CircleDot,
  ExternalLink,
  Loader2,
  RotateCcw,
  Save,
  SquarePen,
  Tag,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ── Types ────────────────────────────────────────────────

interface ProductDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: AdminProduct | null;
}

interface EditableVariant {
  id: string;
  size_id: string | null;
  size_name: string | null;
  stock: number;
}

// ── Helpers ──────────────────────────────────────────────

function flattenVariants(
  variants: AdminProduct["variants"],
): EditableVariant[] {
  return variants.map((v) => ({
    id: v.id,
    size_id: v.size_id,
    size_name: v.size_name,
    stock: v.stock,
  }));
}

function formatCurrency(value: number) {
  return `BDT ${value.toLocaleString("en-BD")}`;
}

// ── Main Component ───────────────────────────────────────

export function ProductDetailView({
  open,
  onOpenChange,
  product,
}: ProductDetailViewProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!product) return null;

  const content = <DetailContent key={product.id} product={product} />;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl leading-tight">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="mt-1 flex items-center gap-1.5 text-sm">
                  <Tag className="size-3" />
                  {product.category?.name}
                  <span className="text-muted-foreground/50">|</span>
                  <span className="font-mono text-xs text-muted-foreground/70">
                    {product.slug}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 pb-6">{content}</div>
          <DialogFooter className="border-t px-6 py-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/admin/products/${product.id}/edit`}>
                <ExternalLink className="size-3.5" />
                Edit Full Product
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto p-0">
        <SheetHeader className="px-5 pt-5 pb-0">
          <SheetTitle className="text-lg">{product.name}</SheetTitle>
          <SheetDescription className="flex items-center gap-1.5 text-sm">
            <Tag className="size-3" />
            {product.category?.name}
            <span className="text-muted-foreground/50">|</span>
            <span className="font-mono text-xs text-muted-foreground/70">
              {product.slug}
            </span>
          </SheetDescription>
        </SheetHeader>
        <div className="px-5 pb-5">{content}</div>
        <SheetFooter className="border-t px-5 py-4">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link href={`/admin/products/${product.id}/edit`}>
              <ExternalLink className="size-3.5" />
              Edit Full Product
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ── Detail Content ───────────────────────────────────────

function DetailContent({ product }: { product: AdminProduct }) {
  const updateProduct = useUpdateProduct();

  // ── Editing State ───────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [editedVariants, setEditedVariants] = useState<EditableVariant[]>([]);
  const [bulkStock, setBulkStock] = useState("");

  const originalVariants = useMemo(
    () => flattenVariants(product.variants),
    [product.variants],
  );

  const startEditing = useCallback(() => {
    setEditedVariants(originalVariants.map((v) => ({ ...v })));
    setIsEditing(true);
  }, [originalVariants]);

  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditedVariants([]);
    setBulkStock("");
  }, []);

  const isDirty = useMemo(() => {
    if (!isEditing || editedVariants.length !== originalVariants.length)
      return false;
    return editedVariants.some((ev, i) => {
      const ov = originalVariants[i];
      return ev.stock !== ov.stock;
    });
  }, [isEditing, editedVariants, originalVariants]);

  const changedCount = useMemo(() => {
    if (!isEditing) return 0;
    return editedVariants.filter((ev, i) => {
      const ov = originalVariants[i];
      return ev.stock !== ov.stock;
    }).length;
  }, [isEditing, editedVariants, originalVariants]);

  // ── Variant Edit Handlers ───────────────────

  const handleVariantChange = useCallback(
    (index: number, value: number) => {
      setEditedVariants((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], stock: value };
        return updated;
      });
    },
    [],
  );

  const handleBulkStock = useCallback(() => {
    const stock = parseInt(bulkStock);
    if (isNaN(stock) || stock < 0) return;
    setEditedVariants((prev) => prev.map((v) => ({ ...v, stock })));
    setBulkStock("");
  }, [bulkStock]);

  const resetVariant = useCallback(
    (index: number) => {
      setEditedVariants((prev) => {
        const updated = [...prev];
        updated[index] = { ...originalVariants[index] };
        return updated;
      });
    },
    [originalVariants],
  );

  // ── Save ────────────────────────────────────

  const handleSave = useCallback(() => {
    updateProduct.mutate(
      {
        id: product.id,
        data: {
          variants: editedVariants.map((v) => ({
            id: v.id,
            stock: v.stock,
            size_id: v.size_id,
          })),
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
          setEditedVariants([]);
        },
      },
    );
  }, [product.id, editedVariants, updateProduct]);

  // Which variants to render
  const displayVariants = isEditing ? editedVariants : originalVariants;

  const isFieldChanged = useCallback(
    (index: number) => {
      if (!isEditing || !originalVariants[index]) return false;
      return editedVariants[index]?.stock !== originalVariants[index].stock;
    },
    [isEditing, editedVariants, originalVariants],
  );

  return (
    <div className="space-y-5 pt-4">
      {/* ── Hero Card: Image + Badges + Metrics ── */}
      <div className="overflow-hidden rounded-xl border bg-background">
        {product.primary_image ? (
          <div className="relative">
            {/* Gradient overlay for badge readability */}
            <div className="absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/30 to-transparent z-1 pointer-events-none" />
            {/* Badges overlaid on image */}
            <div className="absolute top-2.5 left-2.5 z-10 flex flex-wrap gap-1.5">
              <StatusBadges product={product} overlay />
            </div>
            <div className="aspect-video relative bg-muted/10">
              <Image
                src={product.primary_image.url}
                alt={product.primary_image.alt_text || product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 640px"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 p-3.5">
            <StatusBadges product={product} />
          </div>
        )}

        {/* Metrics strip */}
        <div className="grid grid-cols-3 divide-x border-t">
          <MetricCell
            label="Sell Price"
            value={formatCurrency(product.sell_price)}
          />
          <MetricCell
            label={
              product.discount > 0
                ? `After ${product.discount_type === "PERCENTAGE" ? `${product.discount}%` : `BDT ${product.discount}`} off`
                : "Effective Price"
            }
            value={formatCurrency(product.effective_price)}
          />
          <MetricCell
            label="Total Stock"
            value={product.total_stock.toLocaleString()}
            alert={product.total_stock === 0}
          />
        </div>
      </div>

      {/* ── Sizes ────────────────────────────── */}
      {product.available_sizes.length > 0 && (
        <div className="space-y-1.5">
          <SectionLabel>Available Sizes</SectionLabel>
          <div className="flex flex-wrap gap-1.5">
            {product.available_sizes.map((s) => (
              <Badge key={s.id} variant="outline">
                {s.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* ── Variant Table Section ─────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <SectionLabel>Stock by Size</SectionLabel>

          {!isEditing ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={startEditing}
                  className="gap-1"
                >
                  <SquarePen className="size-3" />
                  Quick Edit
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Edit stock inline</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="flex items-center gap-1.5">
              {isDirty && (
                <span className="mr-1 text-xs text-muted-foreground">
                  {changedCount} changed
                </span>
              )}
              <Button
                variant="outline"
                size="xs"
                onClick={cancelEditing}
                disabled={updateProduct.isPending}
              >
                <X className="size-3" />
                Cancel
              </Button>
              <Button
                size="xs"
                onClick={handleSave}
                disabled={!isDirty || updateProduct.isPending}
              >
                {updateProduct.isPending ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <Save className="size-3" />
                )}
                Save
              </Button>
            </div>
          )}
        </div>

        {/* Bulk Fill Row (edit mode only) */}
        {isEditing && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-3 py-2">
            <span className="text-xs font-medium text-muted-foreground">
              Fill all:
            </span>
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                placeholder="Stock"
                value={bulkStock}
                onChange={(e) => setBulkStock(e.target.value)}
                className="h-7 w-20 text-xs"
                min={0}
              />
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={handleBulkStock}
                disabled={!bulkStock}
              >
                Set Stock
              </Button>
            </div>
          </div>
        )}

        {/* Variant Table */}
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead>Stock</TableHead>
                {isEditing && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayVariants.map((variant, index) => {
                const stockChanged = isFieldChanged(index);

                return (
                  <TableRow
                    key={variant.id}
                    className={
                      stockChanged
                        ? "bg-blue-50/50 dark:bg-blue-950/20"
                        : undefined
                    }
                  >
                    <TableCell className="text-sm">
                      {variant.size_name ?? "—"}
                    </TableCell>

                    {/* Stock */}
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          min={0}
                          step="1"
                          value={variant.stock || ""}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          placeholder="0"
                          className={`h-8 w-20 text-xs ${
                            stockChanged
                              ? "border-blue-400 ring-1 ring-blue-200 dark:border-blue-600 dark:ring-blue-900"
                              : ""
                          }`}
                        />
                      ) : (
                        <span
                          className={`text-sm ${
                            variant.stock === 0
                              ? "font-medium text-destructive"
                              : variant.stock <= 5
                                ? "text-amber-600 dark:text-amber-400"
                                : ""
                          }`}
                        >
                          {variant.stock}
                          {variant.stock === 0 && (
                            <span className="ml-1 text-[10px]">
                              (out of stock)
                            </span>
                          )}
                        </span>
                      )}
                    </TableCell>

                    {/* Reset single row */}
                    {isEditing && (
                      <TableCell>
                        {stockChanged && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-xs"
                                onClick={() => resetVariant(index)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <RotateCcw className="size-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              <p>Reset to original</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}

              {displayVariants.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isEditing ? 3 : 2}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No variants found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Timestamps ────────────────────────── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground pt-1">
        <span>
          Created{" "}
          {new Date(product.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span>
          Updated{" "}
          {new Date(product.updated_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────

function StatusBadges({
  product,
  overlay,
}: {
  product: AdminProduct;
  overlay?: boolean;
}) {
  const shadowCls = overlay ? "shadow-sm" : "";
  return (
    <>
      <Badge
        variant={product.is_published ? "default" : "secondary"}
        className={`gap-1 ${shadowCls}`}
      >
        <CircleDot className="size-3" />
        {product.is_published ? "Published" : "Draft"}
      </Badge>
      {product.is_featured && (
        <Badge
          variant="outline"
          className={`gap-1 border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-400 ${shadowCls}`}
        >
          Featured
        </Badge>
      )}
      {product.is_new && (
        <Badge
          variant="outline"
          className={`gap-1 border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/30 dark:text-blue-400 ${shadowCls}`}
        >
          New Arrival
        </Badge>
      )}
      {product.is_best_selling && (
        <Badge
          variant="outline"
          className={`gap-1 border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/30 dark:text-green-400 ${shadowCls}`}
        >
          Best Selling
        </Badge>
      )}
    </>
  );
}

function MetricCell({
  label,
  value,
  alert,
}: {
  label: string;
  value: string;
  alert?: boolean;
}) {
  return (
    <div className={`px-3 py-3 text-center ${alert ? "bg-destructive/5" : ""}`}>
      <p className="text-[11px] text-muted-foreground leading-none">{label}</p>
      <p
        className={`text-sm font-semibold mt-1.5 leading-tight ${
          alert ? "text-destructive" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-medium text-foreground">{children}</p>;
}
