"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";

import {
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
} from "@/hooks/use-products";
import { useIsMobile } from "@/hooks/use-mobile";
import type {
  AdminProductDetail,
  CreateProductPayload,
  UpdateProductPayload,
} from "@/lib/type";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

import { CategoryCombobox } from "@/components/shared/category-combobox";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { InfoFields, type InfoField } from "./info-fields";
import { VariantSection, type VariantRow } from "./variant-section";

interface ProductFormProps {
  product?: AdminProductDetail | null;
  mode: "create" | "edit";
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleDelete = () => {
    if (!product) return;
    deleteMutation.mutate(product.id, {
      onSuccess: () => {
        router.push("/admin/products");
      },
    });
  };

  // ── Form State (initialized from product prop) ───────
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [buyPrice, setBuyPrice] = useState(product?.buy_price ?? 0);
  const [costPrice, setCostPrice] = useState(product?.cost_price ?? 0);
  const [sellPrice, setSellPrice] = useState(product?.sell_price ?? 0);
  const [discount, setDiscount] = useState(product?.discount ?? 0);
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FLAT">(
    product?.discount_type ?? "PERCENTAGE",
  );
  const [isPublished, setIsPublished] = useState(
    product?.is_published ?? false,
  );
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isNew, setIsNew] = useState(product?.is_new ?? false);
  const [isBestSelling, setIsBestSelling] = useState(
    product?.is_best_selling ?? false,
  );
  const [infoFields, setInfoFields] = useState<InfoField[]>(() => {
    if (product?.attributes && typeof product.attributes === "object") {
      return Object.entries(product.attributes).map(([key, value]) => ({
        key,
        value: String(value),
      }));
    }
    return [];
  });
  const [variants, setVariants] = useState<VariantRow[]>(() => {
    if (product?.variants) {
      return product.variants.map((v) => ({
        id: v.id,
        size_id: v.size_id,
        size_name: v.size_name ?? "—",
        stock: v.stock,
      }));
    }
    return [];
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Validation ────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Product name is required";
    if (!categoryId) newErrors.category_id = "Category is required";
    if (!buyPrice || buyPrice <= 0)
      newErrors.buy_price = "Buy price must be greater than 0";
    if (!costPrice || costPrice <= 0)
      newErrors.cost_price = "Cost price must be greater than 0";
    if (!sellPrice || sellPrice <= 0)
      newErrors.sell_price = "Sell price must be greater than 0";
    if (variants.length === 0) {
      newErrors.variants = "At least one variant is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, categoryId, buyPrice, costPrice, sellPrice, variants]);

  // ── Convert info fields to object ─────────────────────
  const getInfoObject = useCallback((): Record<string, string> | null => {
    const validFields = infoFields.filter(
      (f) => f.key.trim() && f.value.trim(),
    );
    if (validFields.length === 0) return null;
    return Object.fromEntries(
      validFields.map((f) => [f.key.trim(), f.value.trim()]),
    );
  }, [infoFields]);

  // ── Compute effective price ───────────────────────────
  const effectivePrice =
    discount > 0
      ? discountType === "PERCENTAGE"
        ? Math.max(0, sellPrice - (sellPrice * discount) / 100)
        : Math.max(0, sellPrice - discount)
      : sellPrice;

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "create") {
      const payload: CreateProductPayload = {
        name: name.trim(),
        description: description.trim() || null,
        category_id: categoryId,
        attributes: getInfoObject(),
        buy_price: buyPrice,
        cost_price: costPrice,
        sell_price: sellPrice,
        discount,
        discount_type: discountType,
        is_published: isPublished,
        is_featured: isFeatured,
        is_new: isNew,
        is_best_selling: isBestSelling,
        variants: variants.map((v) => ({
          stock: v.stock,
          size_id: v.size_id,
        })),
      };

      createMutation.mutate(payload, {
        onSuccess: () => {
          router.push("/admin/products");
        },
      });
    } else if (product) {
      const payload: UpdateProductPayload = {
        name: name.trim(),
        description: description.trim() || null,
        category_id: categoryId,
        attributes: getInfoObject(),
        buy_price: buyPrice,
        cost_price: costPrice,
        sell_price: sellPrice,
        discount,
        discount_type: discountType,
        is_published: isPublished,
        is_featured: isFeatured,
        is_new: isNew,
        is_best_selling: isBestSelling,
        variants: variants.map((v) => ({
          id: v.id,
          stock: v.stock,
          size_id: v.size_id,
        })),
      };

      updateMutation.mutate(
        { id: product.id, data: payload },
        {
          onSuccess: () => {
            router.push("/admin/products");
          },
        },
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Top Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "create" ? "Create Product" : "Edit Product"}
            </h1>
            {mode === "edit" && product && (
              <p className="text-sm text-muted-foreground">{product.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {mode === "edit" && product && (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 />
              </Button>
              {isMobile ? (
                <Sheet
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <SheetContent side="bottom" className="rounded-t-xl">
                    <SheetHeader>
                      <SheetTitle>Delete Product</SheetTitle>
                      <SheetDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-foreground">
                          {product.name}
                        </span>
                        ? This action cannot be undone.
                      </SheetDescription>
                    </SheetHeader>
                    <SheetFooter>
                      <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        className="w-full"
                      >
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={deleteMutation.isPending}
                        className="w-full"
                      >
                        Cancel
                      </Button>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
              ) : (
                <AlertDialog
                  open={deleteDialogOpen}
                  onOpenChange={setDeleteDialogOpen}
                >
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Product</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-foreground">
                          {product.name}
                        </span>
                        ? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={deleteMutation.isPending}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteMutation.isPending}
                        variant="destructive"
                      >
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </>
          )}
          <Button variant="outline" type="button" asChild>
            <Link href="/admin/products">Discard</Link>
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="animate-spin" />}
            {mode === "create" ? "Create Product" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        {/* ── Main Content (Left) ────────────────────── */}
        <div className="space-y-6">
          {/* Product Information */}
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>
                Basic details about your product.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Summer Floral Dress"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name)
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.name;
                        return next;
                      });
                  }}
                  aria-invalid={!!errors.name}
                  className="bg-background"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="Describe your product — fabric details, fit, style tips..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
              <CardDescription>
                Set buy, cost, and sell prices. Optionally add a discount.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="buy_price">
                    Buy Price (BDT) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="buy_price"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0"
                    value={buyPrice === 0 ? "" : buyPrice}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setBuyPrice(isNaN(v) ? 0 : v);
                      if (errors.buy_price)
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.buy_price;
                          return next;
                        });
                    }}
                    aria-invalid={!!errors.buy_price}
                    className="bg-background"
                  />
                  {errors.buy_price && (
                    <p className="text-sm text-destructive">
                      {errors.buy_price}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost_price">
                    Cost Price (BDT) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cost_price"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0"
                    value={costPrice === 0 ? "" : costPrice}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setCostPrice(isNaN(v) ? 0 : v);
                      if (errors.cost_price)
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.cost_price;
                          return next;
                        });
                    }}
                    aria-invalid={!!errors.cost_price}
                    className="bg-background"
                  />
                  {errors.cost_price && (
                    <p className="text-sm text-destructive">
                      {errors.cost_price}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sell_price">
                    Sell Price (BDT) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="sell_price"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0"
                    value={sellPrice || ""}
                    onChange={(e) => {
                      setSellPrice(parseFloat(e.target.value) || 0);
                      if (errors.sell_price)
                        setErrors((prev) => {
                          const next = { ...prev };
                          delete next.sell_price;
                          return next;
                        });
                    }}
                    aria-invalid={!!errors.sell_price}
                    className="bg-background"
                  />
                  {errors.sell_price && (
                    <p className="text-sm text-destructive">
                      {errors.sell_price}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    min={0}
                    step="0.01"
                    placeholder="0"
                    value={discount || ""}
                    onChange={(e) =>
                      setDiscount(parseFloat(e.target.value) || 0)
                    }
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2 w-full">
                  <Label>Discount Type</Label>
                  <Select
                    value={discountType}
                    onValueChange={(val) =>
                      setDiscountType(val as "PERCENTAGE" | "FLAT")
                    }
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                      <SelectItem value="FLAT">Flat (BDT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Effective Price</Label>
                  <div className="flex h-9 items-center rounded-md border bg-muted/50 px-3 text-sm font-medium cursor-not-allowed">
                    BDT {effectivePrice.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Variants & Additional Info - side by side */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Variants */}
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>
                      Variants <span className="text-destructive">*</span>
                    </CardTitle>
                    <CardDescription>
                      Select sizes to create stock variants.
                    </CardDescription>
                  </div>
                  {variants.length > 0 && (
                    <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                      {variants.length}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <VariantSection
                  variants={variants}
                  onChange={(v) => {
                    setVariants(v);
                    if (errors.variants)
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.variants;
                        return next;
                      });
                  }}
                  error={errors.variants}
                />
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="h-fit">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle>Additional Information</CardTitle>
                    <CardDescription>
                      Custom details to help customers.
                    </CardDescription>
                  </div>
                  {infoFields.length > 0 && (
                    <span className="text-xs font-medium text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                      {infoFields.length}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <InfoFields fields={infoFields} onChange={setInfoFields} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Sidebar (Right) ────────────────────────── */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="published" className="cursor-pointer">
                    Published
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Visible to customers
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="featured" className="cursor-pointer">
                    Featured
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Show in featured section
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="new" className="cursor-pointer">
                    New Arrival
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Display &quot;New&quot; badge
                  </p>
                </div>
                <Switch id="new" checked={isNew} onCheckedChange={setIsNew} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="bestselling" className="cursor-pointer">
                    Best Selling
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Mark as best seller
                  </p>
                </div>
                <Switch
                  id="bestselling"
                  checked={isBestSelling}
                  onCheckedChange={setIsBestSelling}
                />
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card className="gap-2">
            <CardHeader>
              <CardTitle>
                Category <span className="text-destructive">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <CategoryCombobox
                value={categoryId}
                onValueChange={(val) => {
                  setCategoryId(val);
                  if (errors.category_id)
                    setErrors((prev) => {
                      const next = { ...prev };
                      delete next.category_id;
                      return next;
                    });
                }}
                invalid={!!errors.category_id}
              />
              {errors.category_id && (
                <p className="text-sm text-destructive">{errors.category_id}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
