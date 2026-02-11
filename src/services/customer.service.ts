import api from "@/lib/axios";
import type {
  ApiResponse,
  Customer,
  CustomerWithOrders,
  CustomerQueryParams,
  CreateCustomerPayload,
  UpdateCustomerPayload,
  PaginatedResponse,
} from "@/lib/type";

const CUSTOMER_URL = "/customers";

export const customerService = {
  getAll: async (
    params?: CustomerQueryParams,
  ): Promise<PaginatedResponse<Customer>> => {
    return api.get(CUSTOMER_URL, { params });
  },

  getById: async (id: string): Promise<ApiResponse<CustomerWithOrders>> => {
    return api.get(`${CUSTOMER_URL}/${id}`);
  },

  create: async (
    data: CreateCustomerPayload,
  ): Promise<ApiResponse<Customer>> => {
    return api.post(CUSTOMER_URL, data);
  },

  update: async (
    id: string,
    data: UpdateCustomerPayload,
  ): Promise<ApiResponse<Customer>> => {
    return api.patch(`${CUSTOMER_URL}/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete(`${CUSTOMER_URL}/${id}`);
  },
};
