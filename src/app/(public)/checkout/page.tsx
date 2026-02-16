"use client";

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import useCartStore from "@/store/use-cart-store";
import { cartService, type CartItemResponse } from "@/services/cart.service";
import { orderService } from "@/services/order.service";
import { useGlobalSettings } from "@/contexts/settings-context";
import { showToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { ApiErrorResponse } from "@/lib/type";
import {
  IconArrowLeft,
  IconUser,
  IconTruck,
  IconMapPin,
  IconShoppingBag,
  IconShoppingCartOff,
  IconLoader2,
} from "@tabler/icons-react";

type FormData = {
  customer_name: string;
  customer_phone: string;
  address: string;
  area: string;
  city: string;
  note: string;
};

const INITIAL_FORM_DATA: FormData = {
  customer_name: "",
  customer_phone: "",
  address: "",
  area: "",
  city: "Dhaka",
  note: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    clearCart,
    is_inside_dhaka: storedIsInsideDhaka,
    setInsideDhaka: storeSetInsideDhaka,
  } = useCartStore();
  const { settings } = useGlobalSettings();

  // ── Form state ───────────────────────────────────────────
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [isInsideDhaka, setIsInsideDhaka] = useState(
    storedIsInsideDhaka ?? true,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Cart data (mirrors cart page pattern) ────────────────
  const [productDataMap, setProductDataMap] = useState<
    Map<string, CartItemResponse>
  >(new Map());
  const [initialLoading, setInitialLoading] = useState(true);

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
      const response = await cartService.getCartItems(
        currentItems,
        isInsideDhaka,
      );
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

  // ── Computed values ──────────────────────────────────────
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

  const deliveryCharge = isInsideDhaka
    ? (settings?.delivery_charge_inside_dhaka ?? 0)
    : (settings?.delivery_charge_outside_dhaka ?? 0);

  const subtotal = useMemo(
    () => displayItems.reduce((sum, item) => sum + item.total_price, 0),
    [displayItems],
  );

  const grandTotal = subtotal + deliveryCharge;

  // ── Handlers ─────────────────────────────────────────────
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleDeliveryAreaChange = (insideDhaka: boolean) => {
    setIsInsideDhaka(insideDhaka);
    storeSetInsideDhaka(insideDhaka);

    if (insideDhaka) {
      setFormData((prev) => ({ ...prev, city: "Dhaka" }));
    } else if (formData.city === "Dhaka") {
      setFormData((prev) => ({ ...prev, city: "" }));
    }

    if (errors.city) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.city;
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = "Full name is required";
    } else if (formData.customer_name.trim().length < 2) {
      newErrors.customer_name = "Name must be at least 2 characters";
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = "Phone number is required";
    } else if (!/^01[3-9]\d{8}$/.test(formData.customer_phone.trim())) {
      newErrors.customer_phone =
        "Enter a valid phone number (e.g. 01XXXXXXXXX)";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.area.trim()) {
      newErrors.area = "Area is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        customer_name: formData.customer_name.trim(),
        customer_phone: formData.customer_phone.trim(),
        is_inside_dhaka: isInsideDhaka,
        shipping_address: {
          address: formData.address.trim(),
          area: formData.area.trim(),
          city: formData.city.trim(),
          ...(formData.note.trim() && { note: formData.note.trim() }),
        },
        items: items.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
      };

      const response = await orderService.createPublicOrder(payload);
      router.push(`/order-success?order_id=${response.data.order_id}`);
      clearCart();
    } catch (error) {
      const apiError = error as ApiErrorResponse;
      showToast.error(
        apiError?.message || "Failed to place order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Empty cart state ─────────────────────────────────────
  if (!initialLoading && items.length === 0) {
    return (
      <div className="min-h-[calc(100vh-10rem)] bg-linear-to-br from-pink-50/30 to-purple-50/30 dark:from-pink-950/5 dark:to-purple-950/5">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:py-16">
          <div className="flex flex-col items-center justify-center space-y-6 rounded-2xl border border-pink-200/50 bg-white dark:bg-gray-900/50 dark:border-pink-800/50 p-12 backdrop-blur-sm shadow-sm">
            <div className="rounded-full bg-linear-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 p-6">
              <IconShoppingCartOff className="size-16 text-pink-600 dark:text-pink-400" />
            </div>
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Your cart is empty
              </h2>
              <p className="text-muted-foreground max-w-md">
                Add items to your cart before proceeding to checkout.
              </p>
            </div>
            <Button
              asChild
              size="lg"
              className="mt-4 bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
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

  // ── Main render ──────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-10rem)] bg-linear-to-br from-pink-50/30 to-purple-50/30 dark:from-pink-950/5 dark:to-purple-950/5">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors mb-3"
          >
            <IconArrowLeft className="size-4" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold bg-linear-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Checkout
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Complete your order details below
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
            {/* ── Left Column: Form ────────────────────── */}
            <div className="space-y-6">
              {/* Contact Information */}
              <section className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex items-center justify-center size-8 rounded-full bg-pink-100 dark:bg-pink-900/30">
                    <IconUser className="size-4 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    Contact Information
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customer_name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customer_name"
                      placeholder="Enter your full name"
                      value={formData.customer_name}
                      onChange={(e) =>
                        handleChange("customer_name", e.target.value)
                      }
                      aria-invalid={!!errors.customer_name}
                      disabled={isSubmitting}
                    />
                    {errors.customer_name && (
                      <p className="text-xs text-red-500">
                        {errors.customer_name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customer_phone">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customer_phone"
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      value={formData.customer_phone}
                      onChange={(e) =>
                        handleChange(
                          "customer_phone",
                          e.target.value.replace(/[^0-9]/g, "").slice(0, 11),
                        )
                      }
                      aria-invalid={!!errors.customer_phone}
                      disabled={isSubmitting}
                    />
                    {errors.customer_phone && (
                      <p className="text-xs text-red-500">
                        {errors.customer_phone}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Delivery Area */}
              <section className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex items-center justify-center size-8 rounded-full bg-pink-100 dark:bg-pink-900/30">
                    <IconTruck className="size-4 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    Delivery Area
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleDeliveryAreaChange(true)}
                    disabled={isSubmitting}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-4 transition-all duration-200",
                      isInsideDhaka
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20 dark:border-pink-400 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900",
                    )}
                  >
                    <span
                      className={cn(
                        "font-medium text-sm",
                        isInsideDhaka
                          ? "text-pink-700 dark:text-pink-300"
                          : "text-gray-700 dark:text-gray-300",
                      )}
                    >
                      Inside Dhaka
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        isInsideDhaka
                          ? "text-pink-600 dark:text-pink-400"
                          : "text-gray-500 dark:text-gray-400",
                      )}
                    >
                      BDT{" "}
                      {(
                        settings?.delivery_charge_inside_dhaka ?? 0
                      ).toLocaleString()}{" "}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeliveryAreaChange(false)}
                    disabled={isSubmitting}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 rounded-lg border-2 p-4 transition-all duration-200",
                      !isInsideDhaka
                        ? "border-pink-500 bg-pink-50 dark:bg-pink-950/20 dark:border-pink-400 shadow-sm"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-900",
                    )}
                  >
                    <span
                      className={cn(
                        "font-medium text-sm",
                        !isInsideDhaka
                          ? "text-pink-700 dark:text-pink-300"
                          : "text-gray-700 dark:text-gray-300",
                      )}
                    >
                      Outside Dhaka
                    </span>
                    <span
                      className={cn(
                        "text-xs",
                        !isInsideDhaka
                          ? "text-pink-600 dark:text-pink-400"
                          : "text-gray-500 dark:text-gray-400",
                      )}
                    >
                      BDT{" "}
                      {(
                        settings?.delivery_charge_outside_dhaka ?? 0
                      ).toLocaleString()}{" "}
                    </span>
                  </button>
                </div>
              </section>

              {/* Shipping Address */}
              <section className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-5">
                  <div className="flex items-center justify-center size-8 rounded-full bg-pink-100 dark:bg-pink-900/30">
                    <IconMapPin className="size-4 text-pink-600 dark:text-pink-400" />
                  </div>
                  <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                    Shipping Address
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Full Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="address"
                      placeholder="House no, Road no, Block, Sector..."
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      aria-invalid={!!errors.address}
                      disabled={isSubmitting}
                      className="min-h-20 resize-none"
                    />
                    {errors.address && (
                      <p className="text-xs text-red-500">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="area">
                        Area <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="area"
                        placeholder="e.g. Gulshan, Mirpur..."
                        value={formData.area}
                        onChange={(e) => handleChange("area", e.target.value)}
                        aria-invalid={!!errors.area}
                        disabled={isSubmitting}
                      />
                      {errors.area && (
                        <p className="text-xs text-red-500">{errors.area}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">
                        City <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder="e.g. Dhaka, Chittagong..."
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        aria-invalid={!!errors.city}
                        disabled={isSubmitting}
                      />
                      {errors.city && (
                        <p className="text-xs text-red-500">{errors.city}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">
                      Delivery Note{" "}
                      <span className="text-muted-foreground font-normal">
                        (Optional)
                      </span>
                    </Label>
                    <Textarea
                      id="note"
                      placeholder="Any special instructions for delivery..."
                      value={formData.note}
                      onChange={(e) => handleChange("note", e.target.value)}
                      disabled={isSubmitting}
                      className="min-h-16 resize-none"
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* ── Right Column: Order Summary ──────────── */}
            <div className="lg:sticky lg:top-24 h-fit space-y-4">
              <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-gray-100 text-lg">
                  Order Summary
                </h3>

                {initialLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <Skeleton className="size-14 rounded-md shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                    <Separator className="my-3" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Item list */}
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {displayItems.map((item) => (
                        <div
                          key={item.variant_id}
                          className="flex gap-3 items-start"
                        >
                          <div className="relative size-14 shrink-0 overflow-hidden rounded-md border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
                            {item.image ? (
                              <Image
                                src={item.image.url}
                                alt={item.image.alt_text || item.product.name}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <IconShoppingBag className="size-5 text-gray-300 dark:text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {item.size && `${item.size} · `}Qty:{" "}
                              {item.quantity}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 shrink-0">
                            BDT {item.total_price.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-3" />

                    {/* Pricing breakdown */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Subtotal ({displayItems.length} item
                          {displayItems.length !== 1 ? "s" : ""})
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          BDT {subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Delivery Charge
                        </span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          BDT {deliveryCharge.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <Separator className="my-3" />

                    <div className="flex justify-between text-base font-semibold pt-1">
                      <span className="text-gray-900 dark:text-gray-100">
                        Grand Total
                      </span>
                      <span className="text-pink-600 dark:text-pink-400 text-lg">
                        BDT {grandTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  className="mt-6 w-full bg-linear-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all"
                  size="lg"
                  disabled={
                    initialLoading || isSubmitting || displayItems.length === 0
                  }
                >
                  {isSubmitting ? (
                    <>
                      <IconLoader2 className="size-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <IconShoppingBag className="size-4" />
                      Place Order
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                  By placing this order, you agree to our terms of service
                </p>
              </div>

              {/* Back to Cart */}
              <Button
                type="button"
                variant="outline"
                asChild
                size="lg"
                className="w-full hover:bg-pink-50 dark:hover:bg-pink-900/10 hover:border-pink-300 dark:hover:border-pink-700 transition-colors"
              >
                <Link href="/cart">
                  <IconArrowLeft className="size-4" />
                  Back to Cart
                </Link>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
