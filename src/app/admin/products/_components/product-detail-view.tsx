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
  Layers,
  Loader2,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
          <div className="px-6">{content}</div>
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

  const handleVariantChange = useCallback((index: number, value: number) => {
    setEditedVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], stock: value };
      return updated;
    });
  }, []);

  const handleBulkStock = useCallback(() => {
    const stock = parseInt(bulkStock);
    if (isNaN(stock) || stock < 0) return;
    setEditedVariants((prev) => prev.map((v) => ({ ...v, stock })));
    setBulkStock("");
  }, [bulkStock]);

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
      {(() => {
        const availableSizes = product.variants
          .filter((v) => v.size_id && v.size_name)
          .reduce<{ id: string; name: string }[]>((acc, v) => {
            if (!acc.some((s) => s.id === v.size_id)) {
              acc.push({ id: v.size_id!, name: v.size_name! });
            }
            return acc;
          }, []);
        return availableSizes.length > 0 ? (
          <div className="space-y-1.5">
            <SectionLabel>Available Sizes</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((s) => (
                <Badge key={s.id} variant="outline">
                  {s.name}
                </Badge>
              ))}
            </div>
          </div>
        ) : null;
      })()}

      <Separator />

      {/* ── Variant / Stock by Size Section ──── */}
      <Card className="gap-0">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Layers className="size-4 text-muted-foreground" />
              </div>
              <div>
                <CardTitle className="text-base">Stock by Size</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  View and quick-edit inventory per size
                </p>
              </div>
            </div>
            {!isEditing ? (
              <Button
                variant="outline"
                size="sm"
                onClick={startEditing}
                className="gap-1.5 shrink-0"
              >
                <SquarePen className="size-3.5" />
                Quick Edit
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {isDirty && (
                  <span className="text-xs text-muted-foreground">
                    {changedCount} changed
                  </span>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cancelEditing}
                  disabled={updateProduct.isPending}
                  className="gap-1.5"
                >
                  <X className="size-3.5" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={!isDirty || updateProduct.isPending}
                  className="gap-1.5"
                >
                  {updateProduct.isPending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Save className="size-3.5" />
                  )}
                  Save
                </Button>
              </div>
            )}
          </div>

          {/* Bulk Fill (edit mode only) */}
          {isEditing && (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed bg-muted/40 px-3 py-2.5 mt-1">
              <span className="text-xs font-medium text-muted-foreground">
                Set all sizes to:
              </span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Stock"
                  value={bulkStock}
                  onChange={(e) => setBulkStock(e.target.value)}
                  className="h-8 w-24 text-sm"
                  min={0}
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleBulkStock}
                  disabled={!bulkStock}
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border overflow-hidden">
            <Table className="bg-background">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-medium text-center w-1/2">
                    Size
                  </TableHead>
                  <TableHead className="font-medium text-center w-1/2">
                    Stock
                  </TableHead>
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
                          ? "bg-primary/5 dark:bg-primary/10"
                          : undefined
                      }
                    >
                      <TableCell className="font-medium text-center">
                        {variant.size_name ?? "—"}
                      </TableCell>

                      <TableCell className="text-center">
                        {isEditing ? (
                          <Input
                            type="number"
                            min={0}
                            step="1"
                            value={variant.stock ?? ""}
                            onChange={(e) =>
                              handleVariantChange(
                                index,
                                parseInt(e.target.value, 10) || 0,
                              )
                            }
                            placeholder="0"
                            className={`h-8 w-20 text-sm text-center ml-auto ${
                              stockChanged
                                ? "border-primary ring-1 ring-primary/20"
                                : ""
                            }`}
                          />
                        ) : (
                          <span
                            className={`inline-flex items-center justify-center text-sm ${
                              variant.stock === 0
                                ? "font-medium text-destructive"
                                : variant.stock <= 5
                                  ? "text-amber-600 dark:text-amber-400 font-medium"
                                  : ""
                            }`}
                          >
                            {variant.stock.toLocaleString()}
                            {variant.stock === 0 && (
                              <span className="ml-1.5 text-[10px] font-normal text-muted-foreground">
                                (out of stock)
                              </span>
                            )}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}

                {displayVariants.length > 0 && (
                  <TableRow className="bg-muted/50 font-medium hover:bg-muted/50">
                    <TableCell className="text-center">Total</TableCell>
                    <TableCell className="text-center">
                      {displayVariants
                        .reduce((sum, v) => sum + (v.stock ?? 0), 0)
                        .toLocaleString()}
                    </TableCell>
                  </TableRow>
                )}

                {displayVariants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="py-10 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Layers className="size-8 opacity-50" />
                        <p className="text-sm font-medium">No variants yet</p>
                        <p className="text-xs max-w-[220px]">
                          Add sizes and stock from the full product edit page.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
