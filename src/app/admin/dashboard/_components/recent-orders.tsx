"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { RecentOrder } from "@/lib/type";

interface RecentOrdersProps {
  data?: RecentOrder[];
  isLoading?: boolean;
}

function formatCurrency(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  CONFIRMED: "default",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "outline",
  CANCELLED: "destructive",
  RETURNED: "destructive",
};

const PAYMENT_VARIANTS: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  COLLECTED: "default",
  REFUNDED: "destructive",
};

export function RecentOrders({ data, isLoading }: RecentOrdersProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders across all channels</CardDescription>
        </div>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/orders">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!data?.length ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No recent orders
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">
                      #{order.order_id}
                    </span>
                    <Badge
                      variant={STATUS_VARIANTS[order.status] || "secondary"}
                    >
                      {order.status}
                    </Badge>
                    <Badge
                      variant={
                        PAYMENT_VARIANTS[order.payment_status] || "secondary"
                      }
                    >
                      {order.payment_status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 truncate">
                    {order.customer_name} - {order.customer_phone}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-semibold">
                    {formatCurrency(order.total_amount)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
