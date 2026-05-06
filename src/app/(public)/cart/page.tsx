"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import useCartStore from "@/store/use-cart-store";
import { cartService, type CartItemResponse } from "@/services/cart.service";
import { showToast } from "@/lib/toast";
import {
  IconShoppingCartOff,
  IconTrash,
  IconMinus,
  IconPlus,
  IconShoppingBag,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function CartPage() {
  const {
    items,
    removeFromCart,
    incrementQuantity,
    decrementQuantity,
    clearCart,
  } = useCartStore();

  const [productDataMap, setProductDataMap] = useState<
    Map<string, CartItemResponse>
  >(new Map());
  const [initialLoading, setInitialLoading] = useState(true);
  const [imageLoadedStates, setImageLoadedStates] = useState<
    Record<string, boolean>
  >({});

  const variantIdsKey = useMemo(
    () =>
      items
        .map((i) => i.variant_id)
        .sort()
        .join(","),
    [items],
  );

  const itemsRef = useRef(items);
  itemsRef.current = items;

  const fetchProductData = useCallback(async () => {
    const currentItems = itemsRef.current;

    if (currentItems.length === 0) {
      setProductDataMap(new Map());
      setInitialLoading(false);
      return;
    }

    try {
      const response = await cartService.getCartItems(currentItems);

      const map = new Map<string, CartItemResponse>();
      for (const item of response.data.items) {
        map.set(item.variant_id, item);
      }
      setProductDataMap(map);
    } catch {
      showToast.error("Failed to load cart items");
    } finally {
      setInitialLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variantIdsKey]);

  useEffect(() => {
    fetchProductData();
  }, [fetchProductData]);

  const displayItems = useMemo(() => {
    return items
      .map((storeItem) => {
        const data = productDataMap.get(storeItem.variant_id);
        if (!data) return null;

        return {
          ...data,
          quantity: storeItem.quantity,
          total_price: data.effected_unit_price * storeItem.quantity,
        };
      })
      .filter(Boolean) as (CartItemResponse & {
      quantity: number;
      total_price: number;
    })[];
  }, [items, productDataMap]);

  const summary = useMemo(() => {
    const subtotal = displayItems.reduce(
      (sum, item) => sum + item.total_price,
      0,
    );
    const totalQuantity = displayItems.reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return {
      item_count: displayItems.length,
      total_quantity: totalQuantity,
      subtotal,
      grand_total: subtotal,
    };
  }, [displayItems]);

  const handleIncrement = (variantId: string) => {
    const data = productDataMap.get(variantId);
    const storeItem = items.find((i) => i.variant_id === variantId);
    if (!data || !storeItem) return;

    if (storeItem.quantity >= data.stock) {
      showToast.error("Cannot add more than available stock");
      return;
    }

    incrementQuantity(variantId);
  };

  const handleDecrement = (variantId: string) => {
    const storeItem = items.find((i) => i.variant_id === variantId);
    if (!storeItem || storeItem.quantity <= 1) return;

    decrementQuantity(variantId);
  };

  const handleRemove = (variantId: string) => {
    removeFromCart(variantId);
    showToast.success("Item removed from cart");
  };

  const handleClearCart = () => {
    clearCart();
    setProductDataMap(new Map());
    showToast.success("Cart cleared");
  };

  const handleImageLoad = (variantId: string) => {
    setImageLoadedStates((prev) => ({ ...prev, [variantId]: true }));
  };

  if (!initialLoading && items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-10rem)] bg-linear-to-br from-background to-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-border bg-card/90 p-12 backdrop-blur-sm shadow-sm">
            <div className="rounded-full bg-linear-to-br from-muted to-card p-6">
              <IconShoppingCartOff className="size-16 text-accent" />
            </div>
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-foreground">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground max-w-md">
                Looks like you haven&apos;t added anything to your cart yet.
                Start shopping to fill it up!
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="mt-4 bg-linear-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
            >
              <Link href="/">
                <IconShoppingBag className="size-5" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-linear-to-br from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl font-bold bg-linear-to-r from-accent to-primary bg-clip-text text-transparent">
            Shopping Cart
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {initialLoading
              ? "Loading..."
              : `${summary.item_count} item(s) in your cart`}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Cart Items */}
          <div className="space-y-4">
            {initialLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <Skeleton className="h-28 w-28 rounded-md shrink-0" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-9 w-36" />
                      </div>
                    </div>
                  </div>
                ))
              : displayItems.map((cartItem) => {
                  const maxQuantity = Math.min(cartItem.stock, 99);
                  const isOutOfStock = cartItem.stock === 0;
                  const imageLoaded = imageLoadedStates[cartItem.variant_id];

                  return (
                    <article
                      key={cartItem.variant_id}
                      className={cn(
                        "group relative overflow-hidden rounded-lg border bg-card shadow-sm transition-all duration-300",
                        isOutOfStock
                          ? "border-destructive/40 opacity-75"
                          : "border-border hover:shadow-md hover:border-accent/40",
                      )}
                    >
                      {/* Out of Stock Badge */}
                      {isOutOfStock && (
                        <Badge
                          variant="destructive"
                          className="absolute right-3 top-3 z-10 shadow-md"
                        >
                          Out of Stock
                        </Badge>
                      )}

                      {/* Discount Badge */}
                      {cartItem.product.has_discount && !isOutOfStock && (
                        <div className="absolute right-3 top-3 z-10">
                          <Badge className="bg-primary text-primary-foreground shadow-md border-0">
                            {cartItem.product.discount}
                            {cartItem.product.discount_type === "PERCENTAGE"
                              ? "%"
                              : " BDT"}{" "}
                            OFF
                          </Badge>
                        </div>
                      )}

                      <div className="flex gap-4 p-4">
                        {/* Product Image */}
                        <div className="relative aspect-3/4 overflow-hidden bg-muted w-[20%] hidden sm:block">
                          {cartItem.image ? (
                            <Image
                              src={cartItem.image.url}
                              alt={
                                cartItem.image.alt_text || cartItem.product.name
                              }
                              fill
                              className={cn(
                                "object-cover transition-all duration-700 ease-out",
                                imageLoaded
                                  ? "opacity-100 blur-0"
                                  : "opacity-0 blur-sm",
                                "group-hover:scale-105",
                              )}
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              onLoad={() =>
                                handleImageLoad(cartItem.variant_id)
                              }
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <IconShoppingBag className="size-10 text-muted-foreground/60" />
                            </div>
                          )}
                          {/* Subtle Gradient Overlay */}
                          <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>

                        {/* Product Details */}
                        <div className="flex flex-1 flex-col justify-between min-w-0">
                          <div className="space-y-1.5">
                            <h3 className="font-medium text-foreground line-clamp-2 leading-snug group-hover:text-accent transition-colors">
                              {cartItem.product.name}
                            </h3>

                            <div>
                              {cartItem.size && (
                                <p className="text-muted-foreground text-sm">
                                  Size:{" "}
                                  <span className="font-medium">
                                    {cartItem.size}
                                  </span>
                                </p>
                              )}

                              <div className="flex items-baseline gap-2 flex-wrap">
                                <span className="text-lg font-semibold text-foreground">
                                  BDT{" "}
                                  {cartItem.effected_unit_price.toLocaleString()}
                                </span>
                                {cartItem.product.has_discount && (
                                  <span className="text-sm font-medium text-muted-foreground line-through">
                                    BDT{" "}
                                    {cartItem.product.sell_price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            {" "}
                            {/* Quantity Controls & Actions */}
                            <div className="mt-3 flex items-center justify-between flex-wrap gap-3">
                              <div className="flex items-center gap-2">
                                {/* Quantity Selector */}
                                <div className="flex items-center overflow-hidden rounded-md border border-border shadow-sm">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDecrement(cartItem.variant_id)
                                    }
                                    disabled={
                                      cartItem.quantity <= 1 || isOutOfStock
                                    }
                                    className="flex h-9 w-9 items-center justify-center bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Decrease quantity"
                                  >
                                    <IconMinus className="size-4" />
                                  </button>
                                  <Input
                                    type="number"
                                    readOnly
                                    min={1}
                                    max={maxQuantity}
                                    value={cartItem.quantity}
                                    className="h-9 w-14 border-0 text-center font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none cursor-default bg-card"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleIncrement(cartItem.variant_id)
                                    }
                                    disabled={
                                      cartItem.quantity >= maxQuantity ||
                                      isOutOfStock
                                    }
                                    className="flex h-9 w-9 items-center justify-center bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    aria-label="Increase quantity"
                                  >
                                    <IconPlus className="size-4" />
                                  </button>
                                </div>

                                <span className="text-muted-foreground text-xs whitespace-nowrap">
                                  {cartItem.stock} available
                                </span>
                              </div>

                              {/* Remove Button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRemove(cartItem.variant_id)
                                }
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <IconTrash className="size-4" />
                                <span className="hidden sm:inline">Remove</span>
                              </Button>
                            </div>
                            {/* Item Subtotal */}
                            <div className="mt-2 flex items-center justify-between text-sm pt-2 border-t border-border/70">
                              <span className="text-muted-foreground">
                                Item Total:
                              </span>
                              <span className="font-semibold text-foreground">
                                BDT {cartItem.total_price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}

            {/* Clear Cart Button */}
            {!initialLoading && displayItems.length > 0 && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleClearCart}
                className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/40 transition-colors"
              >
                <IconTrash className="size-4" />
                Clear All Items
              </Button>
            )}
          </div>

          {/* Order Summary - Sticky Sidebar */}
          <div className="lg:sticky lg:top-24 h-fit space-y-4">
            {/* Order Summary */}
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 font-semibold text-foreground text-lg">
                Order Summary
              </h3>
              {initialLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {displayItems.map((item) => (
                      <div
                        key={item.variant_id}
                        className="flex gap-3 items-start"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.size && `${item.size} · `}Qty: {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-foreground shrink-0">
                          BDT {item.total_price.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator className="my-3" />
                  <div className="flex justify-between text-base font-semibold pt-1">
                      <span className="text-foreground">
                      Subtotal
                    </span>
                      <span className="text-accent text-lg">
                      BDT {summary.subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              <Button
                asChild
                className="mt-6 w-full bg-linear-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-md hover:shadow-lg transition-all"
                size="lg"
                disabled={initialLoading}
              >
                <Link href="/checkout">
                  <IconShoppingBag className="size-5" />
                  Proceed to Checkout
                </Link>
              </Button>
            </div>

            {/* Continue Shopping */}
            <Button
              variant="outline"
              asChild
              size="lg"
              className="w-full hover:bg-muted hover:border-accent/40 transition-colors"
            >
              <Link href="/">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
