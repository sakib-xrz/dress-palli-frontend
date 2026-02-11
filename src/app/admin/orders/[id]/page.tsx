"use client";

import { useParams, useRouter } from "next/navigation";
import { useOrder } from "@/hooks/use-orders";
import {
  useUpdateOrderStatus,
  useUpdatePaymentStatus,
} from "@/hooks/use-orders";
import type { OrderStatus, PaymentStatus } from "@/lib/type";
import Image from "next/image";
import Link from "next/link";
import {
  Package,
  MapPin,
  User,
  Phone,
  CreditCard,
  Truck,
  Loader2,
  ArrowLeft,
  Calendar,
  Hash,
  ShoppingBag,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// ── Helpers ──────────────────────────────────────────────

const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }
> = {
  PENDING: { label: "Pending", variant: "secondary" },
  CONFIRMED: { label: "Confirmed", variant: "default", className: "bg-blue-600 hover:bg-blue-700" },
  PROCESSING: { label: "Processing", variant: "default", className: "bg-purple-600 hover:bg-purple-700" },
  SHIPPED: { label: "Shipped", variant: "default", className: "bg-indigo-600 hover:bg-indigo-700" },
  DELIVERED: { label: "Delivered", variant: "default", className: "bg-green-600 hover:bg-green-700" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
  RETURNED: { label: "Returned", variant: "outline", className: "border-amber-600 text-amber-600" },
};

const PAYMENT_STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; variant: "default" | "secondary" | "destructive"; className?: string }
> = {
  PENDING: { label: "Pending", variant: "secondary" },
  COLLECTED: { label: "Collected", variant: "default", className: "bg-green-600 hover:bg-green-700" },
  REFUNDED: { label: "Refunded", variant: "destructive" },
};

function formatCurrency(value: number) {
  return `BDT ${value.toLocaleString("en-BD")}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ── Loading Skeleton ─────────────────────────────────────

function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-6 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data: order, isLoading } = useOrder(orderId);
  const orderStatusMutation = useUpdateOrderStatus();
  const paymentStatusMutation = useUpdatePaymentStatus();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <OrderDetailSkeleton />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Package className="size-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Order not found</h2>
        <p className="text-muted-foreground mb-6">
          The order you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/admin/orders">
            <ArrowLeft className="size-4" />
            Back to Orders
          </Link>
        </Button>
      </div>
    );
  }

  const orderStatusConfig = ORDER_STATUS_CONFIG[order.status];
  const paymentStatusConfig = PAYMENT_STATUS_CONFIG[order.payment_status];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight font-mono">
              Order #{order.order_id}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="size-4" />
                <span>Placed {formatDate(order.created_at)}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Hash className="size-4" />
                <span className="font-mono">{order.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <Package className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-sm font-medium">Order Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Select
              value={order.status}
              onValueChange={(value: OrderStatus) => {
                orderStatusMutation.mutate({
                  id: order.id,
                  data: { status: value },
                });
              }}
              disabled={orderStatusMutation.isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="DELIVERED">Delivered</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="RETURNED">Returned</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <CreditCard className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Select
              value={order.payment_status}
              onValueChange={(value: PaymentStatus) => {
                paymentStatusMutation.mutate({
                  id: order.id,
                  data: { payment_status: value },
                });
              }}
              disabled={paymentStatusMutation.isPending}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="COLLECTED">Collected</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <ShoppingBag className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tabular-nums">
              {formatCurrency(order.total_amount)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                    <Package className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Order Items</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.items.length} {order.items.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="rounded-lg border overflow-hidden">
                  <Table className="bg-background">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="font-semibold">Product</TableHead>
                        <TableHead className="font-semibold text-center">
                          Quantity
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Price
                        </TableHead>
                        <TableHead className="font-semibold text-right">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {order.items.map((item) => {
                        const productImage =
                          item.variant?.product?.images?.[0]?.url;
                        return (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="size-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
                                  {productImage ? (
                                    <Image
                                      src={productImage}
                                      alt={item.name_snapshot}
                                      width={56}
                                      height={56}
                                      className="size-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                                      No img
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-medium text-sm">
                                    {item.name_snapshot}
                                  </div>
                                  {item.variant?.size && (
                                    <div className="text-xs text-muted-foreground mt-0.5">
                                      Size: {item.variant.size.name}
                                    </div>
                                  )}
                                  {item.variant?.product && (
                                    <Link
                                      href={`/admin/products/${item.variant.product.id}/edit`}
                                      className="text-xs text-primary hover:underline mt-0.5 inline-block"
                                    >
                                      View Product →
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary" className="font-mono text-sm">
                                {item.quantity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatCurrency(item.price_at_purchase)}
                            </TableCell>
                            <TableCell className="text-right font-semibold tabular-nums">
                              {formatCurrency(
                                item.price_at_purchase * item.quantity,
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(order.subtotal_amount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Delivery Fee{" "}
                  <Badge variant="outline" className="ml-1 text-[10px]">
                    {order.is_inside_dhaka ? "Inside Dhaka" : "Outside Dhaka"}
                  </Badge>
                </span>
                <span className="font-medium tabular-nums">
                  {formatCurrency(order.delivery_fee)}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-lg font-bold pt-1">
                <span>Total</span>
                <span className="tabular-nums">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Customer & Shipping */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <User className="size-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">Customer</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Phone</p>
                <div className="flex items-center justify-between">
                  <p className="font-mono">{order.customer_phone}</p>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${order.customer_phone}`}>
                      <Phone className="size-3.5" />
                      Call
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                  <MapPin className="size-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Shipping Address</CardTitle>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Truck className="size-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {order.is_inside_dhaka ? "Inside Dhaka" : "Outside Dhaka"}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm">{order.shipping_address.address}</p>
              </div>
              {order.shipping_address.area && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Area</p>
                  <p className="text-sm">{order.shipping_address.area}</p>
                </div>
              )}
              {order.shipping_address.city && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">City</p>
                  <p className="text-sm">{order.shipping_address.city}</p>
                </div>
              )}
              {order.shipping_address.note && (
                <div className="rounded-md border border-dashed bg-muted/40 p-3 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Delivery Note:
                  </p>
                  <p className="text-sm">{order.shipping_address.note}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline / Metadata */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="flex size-6 items-center justify-center rounded-full bg-muted shrink-0 mt-0.5">
                  <Calendar className="size-3 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(order.created_at)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex size-6 items-center justify-center rounded-full bg-muted shrink-0 mt-0.5">
                  <Calendar className="size-3 text-muted-foreground" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(order.updated_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
