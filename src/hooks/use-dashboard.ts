"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/dashboard.service";
import type {
  DashboardDateRangeParams,
  LowStockQueryParams,
  ProductSalesQueryParams,
} from "@/lib/type";
import { sanitizeParams } from "@/lib/utils";

const DASHBOARD_QUERY_KEY = ["dashboard"];

export function useDashboardOverview(params?: DashboardDateRangeParams) {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, "overview", params],
    queryFn: async () => {
      const response = await dashboardService.getOverview(
        sanitizeParams(params ?? {}),
      );
      return response.data;
    },
  });
}

export function useOrderStatusDistribution(params?: DashboardDateRangeParams) {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, "order-status-distribution", params],
    queryFn: async () => {
      const response = await dashboardService.getOrderStatusDistribution(
        sanitizeParams(params ?? {}),
      );
      return response.data;
    },
  });
}

export function useRevenueTrend(params?: DashboardDateRangeParams) {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, "revenue-trend", params],
    queryFn: async () => {
      const response = await dashboardService.getRevenueTrend(
        sanitizeParams(params ?? {}),
      );
      return response.data;
    },
  });
}

export function useTopSellingProducts(
  params?: DashboardDateRangeParams & { limit?: number },
) {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, "top-products", params],
    queryFn: async () => {
      const response = await dashboardService.getTopSellingProducts(
        sanitizeParams(params ?? {}),
      );
      return response.data;
    },
  });
}

export function useProductSales(params?: ProductSalesQueryParams) {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, "product-sales", params],
    queryFn: async () => {
      const response = await dashboardService.getProductSales(
        sanitizeParams(params ?? {}),
      );
      return { data: response.data, meta: response.meta };
    },
  });
}

export function useSingleProductSales(
  productId: string | null,
  params?: DashboardDateRangeParams,
) {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, "product-sales", productId, params],
    queryFn: async () => {
      if (!productId) return null;
      const response = await dashboardService.getSingleProductSales(
        productId,
        sanitizeParams(params ?? {}),
      );
      return response.data;
    },
    enabled: !!productId,
  });
}

export function useLowStockAlerts(params?: LowStockQueryParams) {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, "low-stock", params],
    queryFn: async () => {
      const response = await dashboardService.getLowStockAlerts(
        sanitizeParams(params ?? {}),
      );
      return { data: response.data, meta: response.meta };
    },
  });
}

export function useProductSearch(search: string, limit?: number) {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, "search-products", search, limit],
    queryFn: async () => {
      const response = await dashboardService.searchProducts(search, limit);
      return response.data;
    },
    enabled: search.length >= 2,
  });
}

export function useRecentOrders(limit?: number) {
  return useQuery({
    queryKey: [...DASHBOARD_QUERY_KEY, "recent-orders", limit],
    queryFn: async () => {
      const response = await dashboardService.getRecentOrders(limit);
      return response.data;
    },
  });
}
