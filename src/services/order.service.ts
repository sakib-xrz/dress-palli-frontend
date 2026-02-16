import api from "@/lib/axios";
import type {
  ApiResponse,
  CreatePublicOrderPayload,
  Order,
  OrderHistory,
  OrderQueryParams,
  PaginatedResponse,
  UpdateOrderStatusPayload,
  UpdatePaymentStatusPayload,
} from "@/lib/type";

const ORDER_URL = "/orders";

export const orderService = {
  // ── Public ─────────────────────────────────────────

  createPublicOrder: async (
    data: CreatePublicOrderPayload,
  ): Promise<ApiResponse<Order>> => {
    return api.post(ORDER_URL, data);
  },

  // ── Admin ──────────────────────────────────────────

  getAll: async (
    params?: OrderQueryParams,
  ): Promise<PaginatedResponse<Order>> => {
    return api.get(ORDER_URL, { params });
  },

  getById: async (id: string): Promise<ApiResponse<Order>> => {
    return api.get(`${ORDER_URL}/${id}`);
  },

  updateStatus: async (
    id: string,
    data: UpdateOrderStatusPayload,
  ): Promise<ApiResponse<Order>> => {
    return api.patch(`${ORDER_URL}/${id}/status`, data);
  },

  updatePaymentStatus: async (
    id: string,
    data: UpdatePaymentStatusPayload,
  ): Promise<ApiResponse<Order>> => {
    return api.patch(`${ORDER_URL}/${id}/payment-status`, data);
  },

  getHistory: async (id: string): Promise<ApiResponse<OrderHistory[]>> => {
    return api.get(`${ORDER_URL}/${id}/history`);
  },
};
