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
    if (data.image) {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.parent_id) formData.append("parent_id", data.parent_id);
      if (data.is_active !== undefined)
        formData.append("is_active", String(data.is_active));
      formData.append("image", data.image);
      return api.post(CATEGORY_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.post(CATEGORY_URL, data);
  },

  update: async (
    id: string,
    data: UpdateCategoryPayload,
  ): Promise<ApiResponse<Category>> => {
    if (data.image) {
      const formData = new FormData();
      if (data.name !== undefined) formData.append("name", data.name);
      if (data.parent_id !== undefined)
        formData.append("parent_id", data.parent_id ?? "");
      formData.append("image", data.image);
      return api.patch(`${CATEGORY_URL}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    const jsonData: Record<string, unknown> = {};
    if (data.name !== undefined) jsonData.name = data.name;
    if (data.parent_id !== undefined) jsonData.parent_id = data.parent_id;
    return api.patch(`${CATEGORY_URL}/${id}`, jsonData);
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
