"use client";

import { use } from "react";
import { Loader2 } from "lucide-react";

import { useProduct } from "@/hooks/use-products";

import { ProductForm } from "../../_components/product-form";
import { ImageManager } from "../../_components/image-manager";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = use(params);
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <h2 className="text-lg font-semibold">Product not found</h2>
        <p className="text-sm text-muted-foreground mt-1">
          The product you&apos;re looking for doesn&apos;t exist or has been
          deleted.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProductForm product={product} mode="edit" />

      {/* Image Manager - only on edit page */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <ImageManager productId={product.id} />
        <div /> {/* Spacer for sidebar alignment */}
      </div>
    </div>
  );
}
