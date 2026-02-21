"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { TopSellingProductsResponse } from "@/lib/type";

interface TopSellingProductsProps {
  data?: TopSellingProductsResponse;
  isLoading?: boolean;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function TopSellingProducts({
  data,
  isLoading,
}: TopSellingProductsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Selling Products</CardTitle>
        <CardDescription>Best performers by revenue</CardDescription>
      </CardHeader>
      <CardContent>
        {data.products.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-muted-foreground">
            No sales in this period
          </div>
        ) : (
          <div className="space-y-4">
            {data.products.map((product, index) => (
              <div key={product.product_id} className="flex items-center gap-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                  {index + 1}
                </div>
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage
                    src={product.image || undefined}
                    alt={product.name}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-lg">
                    {product.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.quantity} sold
                  </p>
                </div>
                <Badge variant="secondary" className="font-mono">
                  {formatCurrency(product.revenue)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
