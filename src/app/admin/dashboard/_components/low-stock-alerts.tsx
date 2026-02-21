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
import { AlertTriangle, PackageX } from "lucide-react";
import type { LowStockAlert } from "@/lib/type";
import Link from "next/link";

interface LowStockAlertsProps {
  data?: LowStockAlert[];
  isLoading?: boolean;
  threshold?: number;
}

export function LowStockAlerts({
  data,
  isLoading,
  threshold = 10,
}: LowStockAlertsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const outOfStockCount =
    data?.filter((item) => item.is_out_of_stock).length || 0;
  const lowStockCount = (data?.length || 0) - outOfStockCount;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle>Inventory Alerts</CardTitle>
        </div>
        <CardDescription>
          {outOfStockCount > 0 && (
            <span className="text-red-500 font-medium">
              {outOfStockCount} out of stock
            </span>
          )}
          {outOfStockCount > 0 && lowStockCount > 0 && ", "}
          {lowStockCount > 0 && (
            <span className="text-amber-500">
              {lowStockCount} low stock (≤{threshold})
            </span>
          )}
          {!data?.length && "No alerts"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!data?.length ? (
          <div className="flex h-[200px] flex-col items-center justify-center text-muted-foreground">
            <PackageX className="h-10 w-10 mb-2 opacity-50" />
            <p>All products are well stocked</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
            {data.map((item) => (
              <Link
                key={item.variant_id}
                href={`/admin/products/${item.product_id}/edit`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors border"
              >
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage
                    src={item.product_image || undefined}
                    alt={item.product_name}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-lg">
                    {item.product_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.product_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Size: {item.size}
                  </p>
                </div>
                <Badge
                  variant={item.is_out_of_stock ? "destructive" : "secondary"}
                  className="font-mono"
                >
                  {item.is_out_of_stock ? "Out" : item.current_stock}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
