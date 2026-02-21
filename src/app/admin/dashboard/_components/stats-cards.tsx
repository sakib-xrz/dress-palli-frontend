"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Clock,
  CheckCircle2,
} from "lucide-react";
import type { DashboardOverview } from "@/lib/type";

interface StatsCardsProps {
  data?: DashboardOverview;
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

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(data.revenue.total),
      description: `${formatCurrency(data.revenue.subtotal)} products + ${formatCurrency(data.revenue.delivery_fees)} delivery`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Revenue",
      value: formatCurrency(data.revenue.pending),
      description: "From uncollected orders",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Total Orders",
      value: data.orders.total.toString(),
      description: `${data.orders.delivered} delivered, ${data.orders.cancelled} cancelled`,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Processing Orders",
      value: data.orders.processing.toString(),
      description: `${data.orders.pending} pending approval`,
      icon: Package,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Delivery Rate",
      value:
        data.orders.total > 0
          ? `${((data.orders.delivered / data.orders.total) * 100).toFixed(1)}%`
          : "0%",
      description: `${data.orders.delivered} of ${data.orders.total} orders`,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    {
      title: "New Customers",
      value: data.customers.new.toString(),
      description: `${data.customers.total} total customers`,
      icon: Users,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    {
      title: "All-Time Revenue",
      value: formatCurrency(data.all_time.total_revenue),
      description: `${data.all_time.total_completed_orders} completed orders`,
      icon: DollarSign,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
    {
      title: "Active Products",
      value: data.products.active.toString(),
      description: "Published products",
      icon: Package,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <CardDescription className="text-xs">
              {stat.description}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
