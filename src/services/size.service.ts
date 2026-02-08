import api from "@/lib/axios";
import type {
  ApiResponse,
  Size,
  CreateSizePayload,
  UpdateSizePayload,
  ReorderSizePayload,
} from "@/lib/type";

const SIZE_URL = "/sizes";

export const sizeService = {
  getAll: async (): Promise<ApiResponse<Size[]>> => {
    return api.get(`${SIZE_URL}?include_all=true`);
  },

  getById: async (id: string): Promise<ApiResponse<Size>> => {
    return api.get(`${SIZE_URL}/${id}`);
  },

  create: async (data: CreateSizePayload): Promise<ApiResponse<Size>> => {
    return api.post(SIZE_URL, data);
  },

  update: async (
    id: string,
    data: UpdateSizePayload,
  ): Promise<ApiResponse<Size>> => {
    return api.patch(`${SIZE_URL}/${id}`, data);
  },

  reorder: async (data: ReorderSizePayload): Promise<ApiResponse<Size[]>> => {
    return api.patch(`${SIZE_URL}/reorder`, data);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete(`${SIZE_URL}/${id}`);
  },
};
