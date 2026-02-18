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
    <div className="min-h-[calc(100vh-10rem)]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
          <ol className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
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
              <IconChevronRight className="size-3" />
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
              <IconChevronRight className="size-3" />
            </li>
            <li className="text-foreground font-medium truncate max-w-[140px] sm:max-w-[300px]">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Main Product Section */}
        <div className="grid gap-6 md:gap-8 lg:gap-10 md:grid-cols-2 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          {/* Image Gallery - sticky on desktop */}
          <div className="md:sticky md:top-24 h-fit min-w-0">
            <ProductImageGallery
              images={product.images}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-5 min-w-0">
            {/* Top Section: Badges + Name + Price */}
            <div className="space-y-3">
              {/* Badges */}
              {(product.is_new ||
                product.is_featured ||
                product.is_best_selling) && (
                <div className="flex flex-wrap gap-1.5">
                  {product.is_new && (
                    <Badge className="bg-linear-to-r from-pink-500 to-purple-500 border-0 text-white text-[10px] sm:text-xs px-2 py-0.5 shadow-sm">
                      New Arrival
                    </Badge>
                  )}
                  {product.is_featured && (
                    <Badge
                      variant="outline"
                      className="border-pink-300 text-pink-600 text-[10px] sm:text-xs px-2 py-0.5"
                    >
                      Featured
                    </Badge>
                  )}
                  {product.is_best_selling && (
                    <Badge
                      variant="outline"
                      className="border-purple-300 text-purple-600 text-[10px] sm:text-xs px-2 py-0.5"
                    >
                      Best Selling
                    </Badge>
                  )}
                </div>
              )}

              {/* Name */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-snug">
                {product.name}
              </h1>

              {/* Category */}
              <p className="text-xs sm:text-sm text-muted-foreground">
                Category:{" "}
                <Link
                  href={`/category/${product.category.slug}`}
                  className="hover:text-foreground underline underline-offset-2 transition-colors"
                >
                  {product.category.name}
                </Link>
              </p>
            </div>

            {/* Price Block */}
            <div>
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                  BDT {product.effective_price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-base sm:text-lg text-gray-400 line-through">
                      BDT {product.sell_price.toLocaleString()}
                    </span>
                    <Badge className="bg-red-500 text-white border-0 text-[10px] sm:text-xs px-2 py-0.5">
                      {product.discount}
                      {product.discount_type === "PERCENTAGE"
                        ? "%"
                        : " BDT"}{" "}
                      OFF
                    </Badge>
                  </>
                )}
              </div>
              {hasDiscount && (
                <p className="text-xs text-green-600 font-medium mt-1.5">
                  You save{" "}
                  {(
                    product.sell_price - product.effective_price
                  ).toLocaleString()}{" "}
                  BDT
                </p>
              )}
            </div>

            {/* Out of Stock */}
            {outOfStock && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm font-medium text-red-700">
                  This product is currently out of stock.
                </p>
              </div>
            )}

            {/* Purchase Options */}
            {!outOfStock && (
              <div className="space-y-4">
                {/* Size Selection */}
                {hasSizeVariant && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-gray-800">
                        Size <span className="text-destructive">*</span>
                      </h4>
                      {selectedVariant && (
                        <span className="text-xs text-muted-foreground">
                          {availableStock} in stock
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant) => {
                        const isOutOfStock = variant.stock === 0;
                        const isSelected = selectedVariant === variant.id;
                        return (
                          <button
                            key={variant.id}
                            type="button"
                            onClick={() =>
                              !isOutOfStock && selectVariant(variant.id)
                            }
                            disabled={isOutOfStock}
                            className={cn(
                              "relative min-w-[2.75rem] h-10 px-3.5 rounded-lg text-sm font-semibold border-2 transition-all duration-150",
                              isSelected
                                ? "bg-primary text-white border-primary shadow-sm"
                                : "bg-white text-gray-700 border-gray-200 hover:border-gray-400",
                              isOutOfStock &&
                                "opacity-40 cursor-not-allowed bg-gray-50 text-gray-400 border-gray-200",
                            )}
                          >
                            {variant.size_name}
                            {isOutOfStock && (
                              <span className="absolute inset-0 flex items-center justify-center">
                                <span className="block w-[120%] h-px bg-gray-400 rotate-[-20deg]" />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="space-y-2.5">
                  <h4 className="text-sm font-semibold text-gray-800">
                    Quantity
                  </h4>
                  <div className="flex items-center gap-3">
                    <div className="inline-flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={!canDecrement}
                        className="h-10 w-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 transition-colors text-lg font-medium"
                      >
                        −
                      </button>
                      <Input
                        type="number"
                        readOnly
                        min={1}
                        max={maxQuantity}
                        value={quantity}
                        className="w-12 h-10 text-center border-0 border-x border-gray-200 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-default font-semibold text-sm bg-white"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((q) => Math.min(maxQuantity, q + 1))
                        }
                        disabled={!canIncrement}
                        className="h-10 w-10 flex items-center justify-center bg-gray-50 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 transition-colors text-lg font-medium"
                      >
                        +
                      </button>
                    </div>
                    {selectedVariant && (
                      <span className="text-xs text-muted-foreground">
                        {availableStock} available
                      </span>
                    )}
                  </div>
                </div>
                <Separator />
                {/* Action Buttons */}
                <div className="flex gap-2.5 pt-1">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={needsVariantSelection}
                    className="flex-1 h-12 text-sm sm:text-base font-semibold border-2 hover:border-gray-400"
                  >
                    <IconShoppingCart className="size-[18px]" />
                    Add to Cart
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleBuyNow}
                    disabled={needsVariantSelection}
                    className="flex-1 h-12 text-sm sm:text-base font-semibold bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-sm"
                  >
                    <IconShoppingBag className="size-[18px]" />
                    Buy Now
                  </Button>
                </div>
              </div>
            )}

            {/* Attributes */}
            {product.attributes &&
              Object.keys(product.attributes).length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2.5">
                    <h4 className="text-sm font-semibold text-gray-800">
                      Product Details
                    </h4>
                    <div className="rounded-xl border border-gray-200 overflow-hidden">
                      {Object.entries(product.attributes).map(
                        ([key, value], index) => (
                          <div
                            key={key}
                            className={cn(
                              "grid grid-cols-[110px_1fr] sm:grid-cols-[150px_1fr] text-sm",
                              index > 0 && "border-t border-gray-100",
                            )}
                          >
                            <span className="px-3.5 py-2.5 bg-gray-50/80 font-medium text-gray-600 capitalize text-xs sm:text-sm">
                              {key.replace(/_/g, " ")}
                            </span>
                            <span className="px-3.5 py-2.5 text-gray-800 text-xs sm:text-sm">
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
          <div className="mt-8 sm:mt-12 lg:mt-16">
            <div className="border-b border-gray-200 pb-3 mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Description
              </h2>
            </div>
            <div
              className="product-description max-w-4xl text-gray-900!"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
