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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const deleteMutation = useDeleteProduct();

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
  const [isPublished, setIsPublished] = useState(product?.is_published ?? false);
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);
  const [isNew, setIsNew] = useState(product?.is_new ?? false);
  const [isBestSelling, setIsBestSelling] = useState(
    product?.is_best_selling ?? false,
  );
  const [infoFields, setInfoFields] = useState<InfoField[]>(() => {
    if (product?.info && typeof product.info === "object") {
      return Object.entries(product.info).map(([key, value]) => ({
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
        color_id: v.color_id,
        size_id: v.size_id,
        color_name: v.color?.name ?? "—",
        size_name: v.size?.name ?? "—",
        price: Number(v.price),
        stock: v.stock,
        is_active: v.is_active,
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
    if (variants.length === 0) {
      newErrors.variants = "At least one variant is required";
    } else {
      const invalidVariants = variants.filter((v) => !v.price || v.price <= 0);
      if (invalidVariants.length > 0) {
        newErrors.variants = "All variants must have a price greater than 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [name, categoryId, variants]);

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

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "create") {
      const payload: CreateProductPayload = {
        name: name.trim(),
        description: description.trim() || null,
        category_id: categoryId,
        info: getInfoObject(),
        is_published: isPublished,
        is_featured: isFeatured,
        is_new: isNew,
        is_best_selling: isBestSelling,
        variants: variants.map((v) => ({
          price: v.price,
          stock: v.stock,
          color_id: v.color_id,
          size_id: v.size_id,
          is_active: v.is_active,
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
        info: getInfoObject(),
        is_published: isPublished,
        is_featured: isFeatured,
        is_new: isNew,
        is_best_selling: isBestSelling,
        variants: variants.map((v) => ({
          id: v.id,
          price: v.price,
          stock: v.stock,
          color_id: v.color_id,
          size_id: v.size_id,
          is_active: v.is_active,
        })),
      };

      updateMutation.mutate({ id: product.id, data: payload });
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
              {mode === "create" ? "Add Product" : "Edit Product"}
            </h1>
            {mode === "edit" && product && (
              <p className="text-sm text-muted-foreground">{product.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {mode === "edit" && product && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 />
                </Button>
              </AlertDialogTrigger>
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

          {/* Variants */}
          <Card>
            <CardHeader>
              <CardTitle>
                Variants <span className="text-destructive">*</span>
              </CardTitle>
              <CardDescription>
                Select colors and sizes — variants are auto-generated as you
                pick. Or add custom variants manually.
              </CardDescription>
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
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
              <CardDescription>
                Custom attributes like Material, Fabric, Care Instructions, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InfoFields fields={infoFields} onChange={setInfoFields} />
            </CardContent>
          </Card>
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
          <Card>
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
