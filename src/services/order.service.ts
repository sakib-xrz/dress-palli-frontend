import api from "@/lib/axios";
import type {
  ApiResponse,
  Order,
  OrderQueryParams,
  PaginatedResponse,
  UpdateOrderStatusPayload,
  UpdatePaymentStatusPayload,
} from "@/lib/type";

const ORDER_URL = "/orders";

export const orderService = {
  // ── Orders ─────────────────────────────────────────

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

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete(`${ORDER_URL}/${id}`);
  },
};
