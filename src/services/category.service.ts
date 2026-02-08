import api from "@/lib/axios";
import type {
  ApiResponse,
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  UpdateCategoryStatusPayload,
} from "@/lib/type";

const CATEGORY_URL = "/categories";

export const categoryService = {
  getAll: async (): Promise<ApiResponse<Category[]>> => {
    return api.get(CATEGORY_URL);
  },

  getById: async (id: string): Promise<ApiResponse<Category>> => {
    return api.get(`${CATEGORY_URL}/${id}`);
  },

  create: async (
    data: CreateCategoryPayload,
  ): Promise<ApiResponse<Category>> => {
    return api.post(CATEGORY_URL, data);
  },

  update: async (
    id: string,
    data: UpdateCategoryPayload,
  ): Promise<ApiResponse<Category>> => {
    return api.patch(`${CATEGORY_URL}/${id}`, data);
  },

  updateStatus: async (
    id: string,
    data: UpdateCategoryStatusPayload,
  ): Promise<ApiResponse<Category>> => {
    return api.patch(`${CATEGORY_URL}/${id}/status`, data);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete(`${CATEGORY_URL}/${id}`);
  },
};
