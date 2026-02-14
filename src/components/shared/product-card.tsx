"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "../ui/button";
import { IconShoppingCart, IconShoppingBag } from "@tabler/icons-react";
import { PublicProduct } from "@/lib/type";

interface ProductCardProps {
  product: PublicProduct;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const outOfStock =
    product.variants?.some((variant) => variant.stock === 0) || false;

  const primaryImage = product.primary_image?.url;

  const hasDiscount = product.discount > 0;
  const discountPercentage =
    product.discount_type === "PERCENTAGE"
      ? product.discount
      : Math.round((product.discount / product.sell_price) * 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    // Add to cart logic
    console.log("Add to cart:", product.id);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    // Buy now logic - typically adds to cart and redirects to checkout
    console.log("Buy now:", product.id);
  };

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group block h-full",
        !outOfStock ? "cursor-pointer" : "pointer-events-none",
        className,
      )}
    >
      <article className="relative h-full flex flex-col bg-background border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-gray-300 dark:hover:border-gray-700">
        {/* Badges */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
          {hasDiscount && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-red-500 text-white shadow-md">
              -{discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Out of Stock Overlay - covers entire card */}
        {outOfStock && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-30">
            <div className="text-center w-full">
              <div className="bg-black/50 px-4 py-2 w-full">
                <p className="text-sm font-semibold text-white">Out of Stock</p>
              </div>
            </div>
          </div>
        )}

        {/* Image Container */}
        <div className="relative aspect-3/4 overflow-hidden bg-gray-50 dark:bg-gray-900">
          {primaryImage ? (
            <>
              {/* Primary Image */}
              <Image
                src={primaryImage}
                alt={product.primary_image?.alt_text || product.name}
                fill
                className={cn(
                  "object-cover transition-all duration-700 ease-out",
                  imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm",
                  "group-hover:scale-105",
                )}
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                onLoad={() => setImageLoaded(true)}
                priority={false}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <svg
                className="w-12 h-12 text-gray-300 dark:text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Subtle Gradient Overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col lg:p-3.5 p-2">
          {/* Name */}
          <h3
            title={product.name}
            className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1 leading-snug group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors"
          >
            {product.name}
          </h3>

          {/* Price & Stock */}
          <div className="space-y-1.5">
            <div className="flex items-baseline mb-2 flex-col sm:flex-row sm:gap-2">
              <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                BDT {product.effective_price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm font-medium text-gray-400 dark:text-gray-500 line-through">
                  BDT {product.sell_price.toLocaleString()}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-auto">
              <Button
                variant="outline"
                onClick={handleAddToCart}
                className="flex-1"
                size="sm"
              >
                <IconShoppingCart className="w-3.5 h-3.5 block sm:hidden xl:block" />
                <span className="hidden sm:block">Add to Cart</span>
              </Button>
              <Button
                variant="secondary"
                onClick={handleBuyNow}
                className="flex-1"
                size="sm"
              >
                <IconShoppingBag className="w-3.5 h-3.5 block sm:hidden xl:block" />
                <span className="hidden sm:block">Buy Now</span>
              </Button>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
