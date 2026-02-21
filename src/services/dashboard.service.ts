import api from "@/lib/axios";
import type {
  ApiResponse,
  DashboardDateRangeParams,
  DashboardOverview,
  LowStockAlert,
  LowStockQueryParams,
  OrderStatusDistribution,
  PaginatedResponse,
  ProductSalesItem,
  ProductSalesQueryParams,
  ProductSearchResult,
  RecentOrder,
  RevenueTrend,
  SingleProductSales,
  TopSellingProductsResponse,
} from "@/lib/type";

const DASHBOARD_URL = "/dashboard";

export const dashboardService = {
  // Get overview statistics
  getOverview: async (
    params?: DashboardDateRangeParams,
  ): Promise<ApiResponse<DashboardOverview>> => {
    return api.get(`${DASHBOARD_URL}/overview`, { params });
  },

  // Get order status distribution for charts
  getOrderStatusDistribution: async (
    params?: DashboardDateRangeParams,
  ): Promise<ApiResponse<OrderStatusDistribution>> => {
    return api.get(`${DASHBOARD_URL}/order-status-distribution`, { params });
  },

  // Get revenue trend for charts
  getRevenueTrend: async (
    params?: DashboardDateRangeParams,
  ): Promise<ApiResponse<RevenueTrend>> => {
    return api.get(`${DASHBOARD_URL}/revenue-trend`, { params });
  },

  // Get top selling products
  getTopSellingProducts: async (
    params?: DashboardDateRangeParams & { limit?: number },
  ): Promise<ApiResponse<TopSellingProductsResponse>> => {
    return api.get(`${DASHBOARD_URL}/top-products`, { params });
  },

  // Get product sales list with filters
  getProductSales: async (
    params?: ProductSalesQueryParams,
  ): Promise<PaginatedResponse<ProductSalesItem>> => {
    return api.get(`${DASHBOARD_URL}/product-sales`, { params });
  },

  // Get single product detailed sales analytics
  getSingleProductSales: async (
    productId: string,
    params?: DashboardDateRangeParams,
  ): Promise<ApiResponse<SingleProductSales>> => {
    return api.get(`${DASHBOARD_URL}/product-sales/${productId}`, { params });
  },

  // Get low stock alerts
  getLowStockAlerts: async (
    params?: LowStockQueryParams,
  ): Promise<PaginatedResponse<LowStockAlert>> => {
    return api.get(`${DASHBOARD_URL}/low-stock`, { params });
  },

  // Search products for dropdown
  searchProducts: async (
    search: string,
    limit?: number,
  ): Promise<ApiResponse<ProductSearchResult[]>> => {
    return api.get(`${DASHBOARD_URL}/search-products`, {
      params: { search, limit },
    });
  },

  // Get recent orders
  getRecentOrders: async (
    limit?: number,
  ): Promise<ApiResponse<RecentOrder[]>> => {
    return api.get(`${DASHBOARD_URL}/recent-orders`, { params: { limit } });
  },
};
