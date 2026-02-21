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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import type { OrderStatusDistribution } from "@/lib/type";

interface OrderStatusChartProps {
  data?: OrderStatusDistribution;
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#f59e0b",
  CONFIRMED: "#3b82f6",
  PROCESSING: "#8b5cf6",
  SHIPPED: "#6366f1",
  DELIVERED: "#10b981",
  CANCELLED: "#ef4444",
  RETURNED: "#f97316",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export function OrderStatusChart({ data, isLoading }: OrderStatusChartProps) {
  if (isLoading) {
    return (
      <Card className="col-span-1">
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[280px] w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const chartData = data.distribution
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: STATUS_LABELS[item.status],
      value: item.count,
      status: item.status,
    }));

  const totalOrders = data.distribution.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Order Status</CardTitle>
        <CardDescription>Distribution of {totalOrders} orders</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            No orders in this period
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status]}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
