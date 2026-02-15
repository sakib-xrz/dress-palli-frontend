"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { IconShoppingCart, IconShoppingBag } from "@tabler/icons-react";
import { PublicProduct } from "@/lib/type";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";

interface ProductCardProps {
  product: PublicProduct;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<"cart" | "buy" | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const selectedVariantData = product.variants?.find(
    (v) => v.id === selectedVariant,
  );
  const availableStock = selectedVariantData?.stock ?? 0;

  const outOfStock =
    product.variants?.every((variant) => variant.stock === 0) || false;

  const primaryImage = product.primary_image?.url;

  const hasDiscount = product.discount > 0;

  const handleOpenDialogOrModal = (type: "cart" | "buy") => {
    setModalType(type);
    setSelectedVariant(null);
    setQuantity(1);
    setIsOpen(true);
  };

  const closeAndReset = () => {
    setModalType(null);
    setIsOpen(false);
    setSelectedVariant(null);
    setQuantity(1);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setModalType(null);
      setSelectedVariant(null);
      setQuantity(1);
    }
  };

  const handleAddToCartConfirm = () => {
    if (!selectedVariant) return;
    console.log(
      "Add to cart:",
      product.id,
      "variant:",
      selectedVariant,
      "qty:",
      quantity,
    );
    closeAndReset();
  };

  const handleBuyNowConfirm = () => {
    if (!selectedVariant) return;
    console.log(
      "Buy now:",
      product.id,
      "variant:",
      selectedVariant,
      "qty:",
      quantity,
    );
    closeAndReset();
  };

  const maxQuantity = selectedVariant ? Math.min(availableStock, 99) : 1;
  const canIncrement = selectedVariant && quantity < maxQuantity;
  const canDecrement = quantity > 1;

  const selectVariant = (variantId: string) => {
    const variant = product.variants?.find((v) => v.id === variantId);
    if (variant && variant.stock > 0) {
      setSelectedVariant(variantId);
      setQuantity((q) => Math.min(q, Math.min(variant.stock, 99)));
    }
  };

  const hasSizeVariant =
    product.variants?.length > 0 &&
    product.variants.some(
      (variant) => variant.size_name !== null && variant.id !== null,
    );

  const renderDialogContent = () => (
    <div className="flex flex-col gap-4 justify-between h-full">
      <div>
        {/* Product name */}
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {product.name}
        </h2>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            BDT {product.effective_price.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-lg text-gray-500 line-through">
              BDT {product.sell_price.toLocaleString()}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Size variant selection */}
        {hasSizeVariant && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Size <span className="text-destructive">*</span>
            </h4>
            <div className="flex gap-2">
              {hasSizeVariant &&
                product.variants.map((variant) => {
                  const isOutOfStock = variant.stock === 0;
                  const isSelected = selectedVariant === variant.id;

                  return (
                    <Button
                      variant="outline"
                      key={variant.id}
                      onClick={() => !isOutOfStock && selectVariant(variant.id)}
                      disabled={isOutOfStock}
                      size="icon"
                      className={cn(isSelected && "bg-primary text-white")}
                    >
                      <div className="text-center">
                        <div className="font-semibold text-sm">
                          {variant.size_name}
                        </div>
                      </div>
                    </Button>
                  );
                })}
            </div>
          </div>
        )}

        {/* Quantity & Stock row */}
        <div className="flex items-start gap-2 flex-col">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select Quantity <span className="text-destructive">*</span>
          </h4>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={!canDecrement}
                className="h-9 w-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                −
              </button>
              <Input
                type="number"
                readOnly
                min={1}
                max={maxQuantity}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val))
                    setQuantity(Math.min(maxQuantity, Math.max(1, val)));
                }}
                className="w-14 h-9 text-center border-0 rounded-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-default"
              />
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                disabled={!canIncrement}
                className="h-9 w-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                +
              </button>
            </div>
            {selectedVariant && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {availableStock} available
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div>
          {modalType === "cart" && (
            <Button
              variant="default"
              onClick={handleAddToCartConfirm}
              disabled={!selectedVariant}
              className="w-full"
            >
              <IconShoppingCart className="size-4" />
              Add to Cart
            </Button>
          )}
          {modalType === "buy" && (
            <Button
              variant="secondary"
              onClick={handleBuyNowConfirm}
              disabled={!selectedVariant}
              className="w-full"
            >
              <IconShoppingBag className="size-4" />
              Buy Now
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
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
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-500 text-white shadow-md">
                {product.discount}
                {}
                {product.discount_type === "PERCENTAGE" ? "%" : " BDT"} OFF
              </span>
            )}
          </div>

          {/* Out of Stock Overlay - covers entire card */}
          {outOfStock && (
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-30">
              <div className="text-center w-full">
                <div className="bg-black/50 px-4 py-2 w-full">
                  <p className="text-sm font-semibold text-white">
                    Out of Stock
                  </p>
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
            <div className="flex flex-col gap-1.5">
              <div className="flex items-baseline mb-2 flex-col sm:flex-row sm:gap-2">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  BDT {product.effective_price.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-sm font-medium text-gray-400 dark:text-gray-500 line-through hidden sm:block">
                    BDT {product.sell_price.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 mt-auto">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenDialogOrModal("cart");
                  }}
                  className="flex-1"
                  size="sm"
                >
                  <IconShoppingCart className="w-3.5 h-3.5 block sm:hidden xl:block" />
                  <span className="hidden sm:block">Add to Cart</span>
                </Button>
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenDialogOrModal("buy");
                  }}
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

      {/* Dialog for desktop (md and up) - two-column layout */}
      {isDesktop ? (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
            <DialogTitle className="sr-only">{product.name}</DialogTitle>
            <div className="flex flex-col sm:flex-row">
              {/* Single product image - no gallery */}
              {primaryImage ? (
                <div className="relative w-full sm:w-56 aspect-square sm:aspect-auto sm:min-h-[340px] bg-gray-50 dark:bg-gray-900 shrink-0">
                  <Image
                    src={primaryImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="relative w-full sm:w-56 aspect-square sm:aspect-auto sm:min-h-[340px] bg-gray-50 dark:bg-gray-900 shrink-0">
                  <div className="absolute inset-0 flex items-center justify-center">
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
                </div>
              )}
              {/* Product details */}
              <div className="flex-1 p-4 sm:p-5 flex flex-col">
                {renderDialogContent()}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ) : (
        /* Sheet for mobile - stacked layout */
        <Sheet open={isOpen} onOpenChange={handleOpenChange}>
          <SheetContent
            side="bottom"
            className="h-auto p-0 overflow-hidden flex flex-col"
          >
            <SheetTitle className="sr-only">{product.name}</SheetTitle>
            <div className="flex-1 p-4 pb-6">{renderDialogContent()}</div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
}
