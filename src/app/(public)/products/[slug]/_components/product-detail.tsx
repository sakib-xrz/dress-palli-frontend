"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IconShoppingCart,
  IconShoppingBag,
  IconChevronRight,
  IconHome2,
} from "@tabler/icons-react";
import type { PublicProductDetail } from "@/lib/type";
import useCartStore from "@/store/use-cart-store";
import ProductImageGallery from "./product-image-gallery";

interface ProductDetailProps {
  product: PublicProductDetail;
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const router = useRouter();
  const { addToCart } = useCartStore();

  const hasSizeVariant =
    product.variants.length > 0 &&
    product.variants.some((v) => v.size_name !== null);

  const [selectedVariant, setSelectedVariant] = useState<string | null>(() => {
    if (!hasSizeVariant && product.variants.length > 0) {
      const firstInStock = product.variants.find((v) => v.stock > 0);
      return firstInStock?.id ?? null;
    }
    return null;
  });
  const [quantity, setQuantity] = useState(1);

  const selectedVariantData = product.variants.find(
    (v) => v.id === selectedVariant,
  );
  const availableStock = selectedVariantData?.stock ?? 0;

  const outOfStock = product.variants.every((v) => v.stock === 0);
  const hasDiscount = product.discount > 0;

  const maxQuantity = selectedVariant ? Math.min(availableStock, 99) : 1;
  const canIncrement = !!selectedVariant && quantity < maxQuantity;
  const canDecrement = quantity > 1;

  const selectVariant = (variantId: string) => {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant && variant.stock > 0) {
      setSelectedVariant(variantId);
      setQuantity((q) => Math.min(q, Math.min(variant.stock, 99)));
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart({ variant_id: selectedVariant, quantity });
  };

  const handleBuyNow = () => {
    if (!selectedVariant) return;
    addToCart({ variant_id: selectedVariant, quantity });
    router.push("/checkout");
  };

  const needsVariantSelection = hasSizeVariant && !selectedVariant;

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-linear-to-br from-pink-50/30 to-purple-50/30">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
          <ol className="flex items-center gap-1.5 text-sm text-muted-foreground flex-wrap">
            <li>
              <Link
                href="/"
                className="hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                <IconHome2 className="size-3.5" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </li>
            <li>
              <IconChevronRight className="size-3.5" />
            </li>
            <li>
              <Link
                href={`/category/${product.category.slug}`}
                className="hover:text-foreground transition-colors"
              >
                {product.category.name}
              </Link>
            </li>
            <li>
              <IconChevronRight className="size-3.5" />
            </li>
            <li className="text-foreground font-medium truncate max-w-[180px] sm:max-w-none">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Main Product Section */}
        <div className="grid gap-8 lg:gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Image Gallery */}
          <div className="lg:sticky lg:top-24 h-fit lg:col-span-4">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6 lg:col-span-8">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {product.is_new && (
                <Badge className="bg-linear-to-r from-pink-500 to-purple-500 border-0 text-white shadow-sm">
                  New Arrival
                </Badge>
              )}
              {product.is_featured && (
                <Badge
                  variant="outline"
                  className="border-pink-300 text-pink-600"
                >
                  Featured
                </Badge>
              )}
              {product.is_best_selling && (
                <Badge
                  variant="outline"
                  className="border-purple-300 text-purple-600"
                >
                  Best Selling
                </Badge>
              )}
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Category */}
            <p className="text-sm text-muted-foreground">
              Category:{" "}
              <Link
                href={`/category/${product.category.slug}`}
                className="hover:text-foreground underline underline-offset-2 transition-colors"
              >
                {product.category.name}
              </Link>
            </p>

            {/* Price */}
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                BDT {product.effective_price.toLocaleString()}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    BDT {product.sell_price.toLocaleString()}
                  </span>
                  <Badge className="bg-red-500 text-white border-0 shadow-sm">
                    {product.discount}
                    {product.discount_type === "PERCENTAGE" ? "%" : " BDT"} OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Out of Stock */}
            {outOfStock && (
              <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm font-medium text-red-700">
                  This product is currently out of stock.
                </p>
              </div>
            )}

            <Separator />

            {/* Size Selection */}
            {hasSizeVariant && !outOfStock && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Size <span className="text-destructive">*</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const isOutOfStock = variant.stock === 0;
                    const isSelected = selectedVariant === variant.id;
                    return (
                      <Button
                        key={variant.id}
                        variant="outline"
                        onClick={() =>
                          !isOutOfStock && selectVariant(variant.id)
                        }
                        disabled={isOutOfStock}
                        className={cn(
                          "min-w-[3rem] h-10 text-sm font-semibold transition-all",
                          isSelected &&
                            "bg-primary text-white border-primary hover:bg-primary/90 hover:text-white",
                          isOutOfStock && "opacity-50 line-through",
                        )}
                      >
                        {variant.size_name}
                      </Button>
                    );
                  })}
                </div>
                {selectedVariant && (
                  <p className="text-xs text-muted-foreground">
                    {availableStock} in stock
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            {!outOfStock && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                  Quantity
                </h4>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-md overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={!canDecrement}
                      className="h-10 w-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 transition-colors"
                    >
                      −
                    </button>
                    <Input
                      type="number"
                      readOnly
                      min={1}
                      max={maxQuantity}
                      value={quantity}
                      className="w-16 h-10 text-center border-0 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-default"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((q) => Math.min(maxQuantity, q + 1))
                      }
                      disabled={!canIncrement}
                      className="h-10 w-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  {selectedVariant && (
                    <span className="text-sm text-muted-foreground">
                      {availableStock} available
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!outOfStock && (
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={needsVariantSelection}
                  className="flex-1"
                >
                  <IconShoppingCart className="size-5" />
                  Add to Cart
                </Button>
                <Button
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={needsVariantSelection}
                  className="flex-1 bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                >
                  <IconShoppingBag className="size-5" />
                  Buy Now
                </Button>
              </div>
            )}

            {/* Attributes */}
            {product.attributes &&
              Object.keys(product.attributes).length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
                      Product Details
                    </h4>
                    <div className="rounded-md border overflow-hidden">
                      {Object.entries(product.attributes).map(
                        ([key, value], index) => (
                          <div
                            key={key}
                            className={cn(
                              "grid grid-cols-[120px_1fr] sm:grid-cols-[160px_1fr] text-sm",
                              index > 0 && "border-t",
                            )}
                          >
                            <span className="px-4 py-2.5 bg-gray-50 font-medium text-gray-700 capitalize">
                              {key.replace(/_/g, " ")}
                            </span>
                            <span className="px-4 py-2.5 text-gray-600">
                              {value}
                            </span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </>
              )}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-10 sm:mt-14">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
              Product Description
            </h2>
            <Separator className="mb-6" />
            <div
              className="product-description"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
