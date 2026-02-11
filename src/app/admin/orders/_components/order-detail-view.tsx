"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { useOrder } from "@/hooks/use-orders";
import type { Order, OrderStatus, PaymentStatus } from "@/lib/type";
import Image from "next/image";
import {
  Package,
  MapPin,
  User,
  Phone,
  CreditCard,
  Truck,
  Loader2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ── Types ────────────────────────────────────────────────

interface OrderDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

// ── Helpers ──────────────────────────────────────────────

const ORDER_STATUS_COLORS: Record<
  OrderStatus,
  {
    variant: "default" | "secondary" | "destructive" | "outline";
    className?: string;
  }
> = {
  PENDING: { variant: "secondary" },
  CONFIRMED: { variant: "default", className: "bg-blue-600 hover:bg-blue-700" },
  PROCESSING: {
    variant: "default",
    className: "bg-purple-600 hover:bg-purple-700",
  },
  SHIPPED: {
    variant: "default",
    className: "bg-indigo-600 hover:bg-indigo-700",
  },
  DELIVERED: {
    variant: "default",
    className: "bg-green-600 hover:bg-green-700",
  },
  CANCELLED: { variant: "destructive" },
  RETURNED: {
    variant: "outline",
    className: "border-amber-600 text-amber-600",
  },
};

const PAYMENT_STATUS_COLORS: Record<
  PaymentStatus,
  { variant: "default" | "secondary" | "destructive"; className?: string }
> = {
  PENDING: { variant: "secondary" },
  COLLECTED: {
    variant: "default",
    className: "bg-green-600 hover:bg-green-700",
  },
  REFUNDED: { variant: "destructive" },
};

function formatCurrency(value: number) {
  return `BDT ${value.toLocaleString("en-BD")}`;
}

// ── Main Component ───────────────────────────────────────

export function OrderDetailView({
  open,
  onOpenChange,
  order: orderProp,
}: OrderDetailViewProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Fetch full order details if we only have basic info
  const { data: fetchedOrder, isLoading } = useOrder(orderProp?.id ?? "");

  // Use fetched order if available (has items), otherwise use prop
  const order = fetchedOrder?.items ? fetchedOrder : orderProp;

  if (!order) return null;

  const content = isLoading ? (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  ) : (
    <DetailContent key={order.id} order={order} />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <DialogTitle className="text-xl leading-tight font-mono">
                  Order #{order.order_id}
                </DialogTitle>
                <DialogDescription className="mt-1 flex items-center gap-1.5 text-sm">
                  <Package className="size-3" />
                  Placed on{" "}
                  {new Date(order.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="px-6 pb-6">{content}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[92vh] overflow-y-auto p-0">
        <SheetHeader className="px-5 pt-5 pb-0">
          <SheetTitle className="text-lg font-mono">
            Order #{order.order_id}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-1.5 text-sm">
            <Package className="size-3" />
            Placed on{" "}
            {new Date(order.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </SheetDescription>
        </SheetHeader>
        <div className="px-5 pb-5">{content}</div>
      </SheetContent>
    </Sheet>
  );
}

// ── Detail Content ───────────────────────────────────────

function DetailContent({ order }: { order: Order }) {
  const orderStatusConfig = ORDER_STATUS_COLORS[order.status];
  const paymentStatusConfig = PAYMENT_STATUS_COLORS[order.payment_status];

  return (
    <div className="space-y-5 pt-4">
      {/* ── Status Cards ────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="gap-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Package className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-sm">Order Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Badge
              variant={orderStatusConfig.variant}
              className={orderStatusConfig.className}
            >
              {order.status}
            </Badge>
          </CardContent>
        </Card>

        <Card className="gap-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <CreditCard className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-sm">Payment Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Badge
              variant={paymentStatusConfig.variant}
              className={paymentStatusConfig.className}
            >
              {order.payment_status}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* ── Customer Information ───────────────── */}
      <Card className="gap-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <User className="size-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-base">Customer Information</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="size-4 text-muted-foreground" />
            <span className="font-medium">{order.customer_name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="size-4 text-muted-foreground" />
            <span className="font-mono">{order.customer_phone}</span>
          </div>
        </CardContent>
      </Card>

      {/* ── Shipping Address ───────────────────── */}
      <Card className="gap-2">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <MapPin className="size-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base">Shipping Address</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                <Truck className="size-3 inline mr-1" />
                {order.is_inside_dhaka ? "Inside Dhaka" : "Outside Dhaka"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>{order.shipping_address.address}</p>
          {order.shipping_address.area && (
            <p className="text-muted-foreground">
              Area: {order.shipping_address.area}
            </p>
          )}
          {order.shipping_address.city && (
            <p className="text-muted-foreground">
              City: {order.shipping_address.city}
            </p>
          )}
          {order.shipping_address.note && (
            <div className="mt-2 rounded-md border border-dashed bg-muted/40 px-3 py-2">
              <p className="text-xs font-medium text-muted-foreground">Note:</p>
              <p className="text-sm">{order.shipping_address.note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Order Items ─────────────────────────── */}
      {order.items && order.items.length > 0 && (
        <Card className="gap-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                <Package className="size-4 text-muted-foreground" />
              </div>
              <CardTitle className="text-base">Order Items</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-lg border overflow-hidden">
              <Table className="bg-background">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-medium">Product</TableHead>
                    <TableHead className="font-medium text-center">
                      Qty
                    </TableHead>
                    <TableHead className="font-medium text-right">
                      Unit Price
                    </TableHead>
                    <TableHead className="font-medium text-right">
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
                            <div className="size-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                              {productImage ? (
                                <Image
                                  src={productImage}
                                  alt={item.name_snapshot}
                                  width={48}
                                  height={48}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                                  No img
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm line-clamp-1">
                                {item.name_snapshot}
                              </div>
                              {item.variant?.size && (
                                <div className="text-xs text-muted-foreground">
                                  Size: {item.variant.size.name}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-mono">
                            {item.quantity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-sm">
                          {formatCurrency(item.price_at_purchase)}
                        </TableCell>
                        <TableCell className="text-right font-medium tabular-nums">
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

      {/* ── Order Summary ───────────────────────── */}
      <Card className="gap-2">
        <CardHeader>
          <CardTitle className="text-base">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium tabular-nums">
              {formatCurrency(order.subtotal_amount)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Delivery Fee{" "}
              <span className="text-xs">
                ({order.is_inside_dhaka ? "Inside Dhaka" : "Outside Dhaka"})
              </span>
            </span>
            <span className="font-medium tabular-nums">
              {formatCurrency(order.delivery_fee)}
            </span>
          </div>
          <Separator />
          <div className="flex items-center justify-between text-base font-semibold pt-1">
            <span>Total</span>
            <span className="tabular-nums">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── Timestamps ────────────────────────── */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground pt-1">
        <span>
          Created{" "}
          {new Date(order.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span>
          Updated{" "}
          {new Date(order.updated_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
