"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { showToast } from "@/lib/toast";
import { cn, formatPrice } from "@/lib/utils";
import { orderService } from "@/services/order.service";
import type {
  ApiErrorResponse,
  PublicOrderTracking,
  OrderStatus,
} from "@/lib/type";
import {
  IconPackage,
  IconSearch,
  IconLoader2,
  IconMapPin,
  IconTruck,
  IconClock,
  IconCircleCheck,
  IconCircleX,
  IconRotateClockwise,
  IconBox,
  IconClipboardCheck,
  IconSettings,
  IconHome,
  IconX,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";

// ── Status Configuration ─────────────────────────────────

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  PENDING: {
    label: "Pending",
    color:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    icon: IconClock,
  },
  CONFIRMED: {
    label: "Confirmed",
    color:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    icon: IconClipboardCheck,
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-secondary/20 text-secondary border-secondary/40",
    icon: IconSettings,
  },
  SHIPPED: {
    label: "Shipped",
    color:
      "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800",
    icon: IconTruck,
  },
  DELIVERED: {
    label: "Delivered",
    color:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    icon: IconCircleCheck,
  },
  CANCELLED: {
    label: "Cancelled",
    color:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
    icon: IconCircleX,
  },
  RETURNED: {
    label: "Returned",
    color: "bg-muted text-muted-foreground border-border",
    icon: IconRotateClockwise,
  },
};

// ── Order Status Timeline ────────────────────────────────

const ORDER_FLOW: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

function StatusTimeline({
  currentStatus,
  statusHistory,
}: {
  currentStatus: OrderStatus;
  statusHistory: PublicOrderTracking["status_history"];
}) {
  const isCancelled = currentStatus === "CANCELLED";
  const isReturned = currentStatus === "RETURNED";
  const isTerminal = isCancelled || isReturned;

  // Find the furthest status reached in the flow
  const currentIndex = ORDER_FLOW.indexOf(currentStatus);
  const reachedStatuses = new Set(
    statusHistory
      .filter((h) => h.to_status && ORDER_FLOW.includes(h.to_status))
      .map((h) => h.to_status as OrderStatus),
  );

  // Also include current status if it's in the flow
  if (currentIndex >= 0) {
    ORDER_FLOW.slice(0, currentIndex + 1).forEach((s) =>
      reachedStatuses.add(s),
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">
        Order Status
      </h3>

      {/* Show terminal status if applicable */}
      {isTerminal && (
        <div
          className={cn(
            "flex items-center gap-3 p-4 rounded-lg border mb-4",
            STATUS_CONFIG[currentStatus].color,
          )}
        >
          {(() => {
            const Icon = STATUS_CONFIG[currentStatus].icon;
            return <Icon className="size-6" />;
          })()}
          <div>
            <p className="font-medium">{STATUS_CONFIG[currentStatus].label}</p>
            <p className="text-sm opacity-80">
              {isCancelled
                ? "This order has been cancelled"
                : "This order has been returned"}
            </p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="relative">
        {ORDER_FLOW.map((status, index) => {
          const config = STATUS_CONFIG[status];
          const Icon = config.icon;
          const isReached = reachedStatuses.has(status);
          const isCurrent = status === currentStatus && !isTerminal;
          const isLast = index === ORDER_FLOW.length - 1;

          // Find the timestamp for when this status was reached
          const historyEntry = statusHistory.find(
            (h) => h.to_status === status,
          );
          const timestamp = historyEntry
            ? new Date(historyEntry.changed_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })
            : null;

          return (
            <div key={status} className="flex gap-4">
              {/* Timeline line and dot */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex items-center justify-center size-10 rounded-full border-2 transition-colors",
                    isReached || isCurrent
                      ? "bg-accent/20 border-accent text-accent"
                      : "bg-muted border-border text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" />
                </div>
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 h-12 transition-colors",
                      isReached && reachedStatuses.has(ORDER_FLOW[index + 1])
                        ? "bg-green-500"
                        : "bg-border",
                    )}
                  />
                )}
              </div>

              {/* Status info */}
              <div className={cn("pb-12", isLast && "pb-0")}>
                <p
                  className={cn(
                    "font-medium",
                    isReached || isCurrent
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {config.label}
                </p>
                {timestamp && (
                  <p className="text-sm text-muted-foreground">{timestamp}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────

export default function TrackOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("id") || "";

  const [orderId, setOrderId] = useState(initialOrderId);
  const [isLoading, setIsLoading] = useState(false);
  const [orderData, setOrderData] = useState<PublicOrderTracking | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrackOrder = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedId = orderId.trim().toUpperCase();
    if (!trimmedId) {
      showToast.error("Please enter an order ID");
      return;
    }

    setIsLoading(true);
    setHasSearched(true);

    try {
      const response = await orderService.trackOrder(trimmedId);
      if (response.success && response.data) {
        setOrderData(response.data);
        // Update URL with order ID for shareability
        router.replace(`/track-order?id=${trimmedId}`, { scroll: false });
      }
    } catch (err) {
      const error = err as ApiErrorResponse;
      setOrderData(null);
      if (error?.statusCode === 404) {
        showToast.error("Order not found. Please check the order ID.");
      } else {
        showToast.error(error?.message || "Failed to track order");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-search if initial order ID is provided
  useEffect(() => {
    if (initialOrderId) {
      handleTrackOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-linear-to-br from-background to-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center size-16 rounded-full bg-linear-to-br from-muted to-card mb-4">
            <IconPackage className="size-8 text-accent" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Track Your Order
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Enter your order ID to check the current status and delivery updates
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleTrackOrder} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Enter your order ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                className="h-12 text-center sm:text-left font-mono text-lg tracking-wider uppercase pr-10 placeholder:text-sm"
                disabled={isLoading}
              />
              {orderId && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderId("");
                    setOrderData(null);
                    setHasSearched(false);
                    router.replace("/track-order", { scroll: false });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                  aria-label="Clear search"
                >
                  <IconX className="size-4 text-muted-foreground" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || !orderId.trim()}
              className="h-12 px-8 bg-linear-to-r from-primary to-accent text-primary-foreground hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <IconLoader2 className="size-5 animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <IconSearch className="size-5" />
                  Track Order
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Order Data */}
        {orderData && (
          <div className="space-y-6 animate-in fade-in-50 duration-300">
            {/* Order Header */}
            <Card>
              <CardHeader className="border-b">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">
                      Order #{orderData.order_id}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Placed on{" "}
                      {new Date(orderData.created_at).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-sm px-3 py-1",
                      STATUS_CONFIG[orderData.status].color,
                    )}
                  >
                    {STATUS_CONFIG[orderData.status].label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <StatusTimeline
                  currentStatus={orderData.status}
                  statusHistory={orderData.status_history}
                />
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconBox className="size-5" />
                  Order Items ({orderData.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-4">
                  {orderData.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-card/70"
                    >
                      {/* Product Image */}
                      <div className="relative size-16 sm:size-20 rounded-lg overflow-hidden bg-muted shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center size-full">
                            <IconPackage className="size-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        {item.product_slug ? (
                          <Link
                            href={`/products/${item.product_slug}`}
                            className="font-medium text-foreground hover:text-accent line-clamp-2"
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <p className="font-medium text-foreground line-clamp-2">
                            {item.name}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {item.size && (
                            <span className="text-sm text-muted-foreground">
                              Size: {item.size}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          {formatPrice(Number(item.price) * item.quantity)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(Number(item.price))} each
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="my-4" />

                {/* Order Summary */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>
                      {formatPrice(Number(orderData.subtotal_amount))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Delivery Fee{" "}
                      {orderData.is_inside_dhaka
                        ? "(Inside Dhaka)"
                        : "(Outside Dhaka)"}
                    </span>
                    <span>{formatPrice(Number(orderData.delivery_fee))}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span className="text-accent">
                      {formatPrice(Number(orderData.total_amount))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader className="border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconMapPin className="size-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <IconHome className="size-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-foreground">
                      {orderData.shipping_address.address}
                    </p>
                    {(orderData.shipping_address.area ||
                      orderData.shipping_address.city) && (
                      <p className="text-sm text-muted-foreground">
                        {[
                          orderData.shipping_address.area,
                          orderData.shipping_address.city,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* No Results */}
        {hasSearched && !isLoading && !orderData && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted mb-4">
              <IconSearch className="size-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Order Not Found
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn&apos;t find an order with that ID. Please check the
              order ID and try again.
            </p>
          </div>
        )}

        {/* Help Text */}
        {!orderData && !hasSearched && (
          <div className="text-center text-sm text-muted-foreground mt-8">
            <p>
              You can find your order ID in the confirmation message you
              received after placing your order.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
