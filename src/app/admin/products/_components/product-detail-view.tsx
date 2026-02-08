"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import type { AdminProduct } from "@/lib/type";
import Image from "next/image";
import Link from "next/link";
import { Pencil, ExternalLink } from "lucide-react";

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

interface ProductDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: AdminProduct | null;
}

export function ProductDetailView({
  open,
  onOpenChange,
  product,
}: ProductDetailViewProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (!product) return null;

  const content = <DetailContent product={product} />;

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{product.name}</DialogTitle>
            <DialogDescription>
              {product.category?.name} &middot; {product.slug}
            </DialogDescription>
          </DialogHeader>
          {content}
          <DialogFooter>
            <Button variant="outline" asChild>
              <Link href={`/admin/products/${product.id}/edit`}>
                <Pencil />
                Edit Product
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{product.name}</SheetTitle>
          <SheetDescription>
            {product.category?.name} &middot; {product.slug}
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-4">{content}</div>
        <SheetFooter>
          <Button variant="outline" className="w-full" asChild>
            <Link href={`/admin/products/${product.id}/edit`}>
              <Pencil />
              Edit Product
            </Link>
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function DetailContent({ product }: { product: AdminProduct }) {
  return (
    <div className="space-y-5">
      {/* Status Badges */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant={product.is_published ? "default" : "outline"}>
          {product.is_published ? "Published" : "Draft"}
        </Badge>
        {product.is_featured && <Badge variant="secondary">Featured</Badge>}
        {product.is_new && <Badge variant="secondary">New Arrival</Badge>}
        {product.is_best_selling && (
          <Badge variant="secondary">Best Selling</Badge>
        )}
      </div>

      {/* Primary Image */}
      {product.primary_image && (
        <div className="overflow-hidden rounded-lg border bg-muted aspect-video relative">
          <Image
            src={product.primary_image.url}
            alt={product.primary_image.alt_text || product.name}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 640px"
          />
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          label="Price Range"
          value={
            product.price_range.min === product.price_range.max
              ? `BDT${product.price_range.min}`
              : `BDT${product.price_range.min} – BDT${product.price_range.max}`
          }
        />
        <MetricCard
          label="Total Stock"
          value={product.total_stock.toString()}
        />
        <MetricCard
          label="Variants"
          value={product.variants
            .reduce((sum, g) => sum + g.sizes.length, 0)
            .toString()}
        />
      </div>

      {/* Colors & Sizes */}
      {product.available_colors.length > 0 && (
        <div className="space-y-2">
          <Label>Colors</Label>
          <div className="flex flex-wrap gap-1.5">
            {product.available_colors.map((c) => (
              <Badge key={c.id} variant="outline" className="gap-1.5">
                {c.code && (
                  <span
                    className="size-2.5 rounded-full border"
                    style={{ backgroundColor: c.code }}
                  />
                )}
                {c.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {product.available_sizes.length > 0 && (
        <div className="space-y-2">
          <Label>Sizes</Label>
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

      {/* Variants Table */}
      <div className="space-y-2">
        <Label>Variant Breakdown</Label>
        <div className="rounded-lg border overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Color</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {product.variants.flatMap((group) =>
                group.sizes.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {group.color?.code && (
                          <span
                            className="size-3 rounded-full border shrink-0"
                            style={{ backgroundColor: group.color.code }}
                          />
                        )}
                        <span className="text-sm">
                          {group.color?.name ?? "—"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {s.size_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      BDT{s.price}
                    </TableCell>
                    <TableCell className="text-sm">{s.stock}</TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={s.is_active ? "default" : "outline"}
                        className="text-[10px]"
                      >
                        {s.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )),
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Created / Updated */}
      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span>
          Created:{" "}
          {new Date(product.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span>
          Updated:{" "}
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold mt-0.5">{value}</p>
    </div>
  );
}

function Label({ children, ...props }: React.ComponentProps<"p">) {
  return (
    <p className="text-sm font-medium" {...props}>
      {children}
    </p>
  );
}
