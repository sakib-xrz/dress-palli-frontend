"use client";

import { Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function ProductEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
      <div className="bg-muted flex size-14 items-center justify-center rounded-full">
        <Package className="text-muted-foreground size-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No products yet</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">
        Get started by adding your first product. You can add product details,
        variants, and images.
      </p>
      <Button asChild className="mt-6">
        <Link href="/admin/products/new">
          <Plus className="size-4" />
          Add Product
        </Link>
      </Button>
    </div>
  );
}
