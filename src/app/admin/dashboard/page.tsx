"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DatePreset } from "@/lib/type";
import {
  useDashboardOverview,
  useOrderStatusDistribution,
  useRevenueTrend,
  useTopSellingProducts,
  useLowStockAlerts,
  useRecentOrders,
} from "@/hooks/use-dashboard";

import { DateRangeSelector } from "./_components/date-range-selector";
import { StatsCards } from "./_components/stats-cards";
import { OrderStatusChart } from "./_components/order-status-chart";
import { RevenueTrendChart } from "./_components/revenue-trend-chart";
import { TopSellingProducts } from "./_components/top-selling-products";
import { LowStockAlerts } from "./_components/low-stock-alerts";
import { RecentOrders } from "./_components/recent-orders";
import { ProductSalesLookup } from "./_components/product-sales-lookup";
import { ProductSalesTable } from "./_components/product-sales-table";
import { useMediaQuery } from "@/hooks/use-media-query";

export default function DashboardPage() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [preset, setPreset] = useState<DatePreset>("last_30_days");
  const [customStartDate, setCustomStartDate] = useState<string | undefined>();
  const [customEndDate, setCustomEndDate] = useState<string | undefined>();

  const dateParams =
    customStartDate && customEndDate
      ? { start_date: customStartDate, end_date: customEndDate }
      : { preset };

  // Fetch dashboard data
  const { data: overviewData, isLoading: isLoadingOverview } =
    useDashboardOverview(dateParams);
  const { data: statusDistribution, isLoading: isLoadingStatus } =
    useOrderStatusDistribution(dateParams);
  const { data: revenueTrend, isLoading: isLoadingTrend } =
    useRevenueTrend(dateParams);
  const { data: topProducts, isLoading: isLoadingTopProducts } =
    useTopSellingProducts({ ...dateParams, limit: 5 });
  const { data: lowStockData, isLoading: isLoadingLowStock } =
    useLowStockAlerts({ threshold: 10, limit: 20 });
  const { data: recentOrders, isLoading: isLoadingRecentOrders } =
    useRecentOrders(5);

  const handlePresetChange = useCallback((newPreset: DatePreset) => {
    setPreset(newPreset);
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
  }, []);

  const handleCustomRangeChange = useCallback(
    (startDate: string, endDate: string) => {
      setCustomStartDate(startDate);
      setCustomEndDate(endDate);
    },
    [],
  );

  const handleClearCustomRange = useCallback(() => {
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
  }, []);

  if (!isDesktop) {
    return (
      <div className="space-y-6 flex items-center justify-center text-center pt-10">
        <div>
          <h5 className="text-lg font-semibold">
            Dashboard is only available on desktop devices.
          </h5>
          <p className="text-muted-foreground">
            Please access the dashboard from a desktop device for the best
            experience.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your store&apos;s performance
          </p>
        </div>
        <DateRangeSelector
          preset={customStartDate ? undefined : preset}
          startDate={customStartDate}
          endDate={customEndDate}
          onPresetChange={handlePresetChange}
          onCustomRangeChange={handleCustomRangeChange}
          onClearCustomRange={handleClearCustomRange}
        />
      </div>

      {/* Stats Cards */}
      <StatsCards data={overviewData} isLoading={isLoadingOverview} />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <RevenueTrendChart data={revenueTrend} isLoading={isLoadingTrend} />
        <OrderStatusChart
          data={statusDistribution}
          isLoading={isLoadingStatus}
        />
      </div>

      {/* Products & Orders Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TopSellingProducts
          data={topProducts}
          isLoading={isLoadingTopProducts}
        />
        <RecentOrders data={recentOrders} isLoading={isLoadingRecentOrders} />
      </div>

      {/* Low Stock Alerts */}
      <div className="grid gap-6 grid-cols-1">
        <LowStockAlerts
          data={lowStockData?.data}
          isLoading={isLoadingLowStock}
          threshold={10}
        />
      </div>

      {/* Product Sales Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Product Sales Analytics</h2>
        <Tabs defaultValue="lookup" className="w-full">
          <TabsList>
            <TabsTrigger value="lookup">Product Lookup</TabsTrigger>
            <TabsTrigger value="table">All Products Table</TabsTrigger>
          </TabsList>
          <TabsContent value="lookup" className="mt-4">
            <ProductSalesLookup
              preset={customStartDate ? undefined : preset}
              startDate={customStartDate}
              endDate={customEndDate}
            />
          </TabsContent>
          <TabsContent value="table" className="mt-4">
            <ProductSalesTable
              preset={customStartDate ? undefined : preset}
              startDate={customStartDate}
              endDate={customEndDate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
