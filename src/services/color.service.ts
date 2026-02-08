import api from "@/lib/axios";
import type {
  ApiResponse,
  Color,
  CreateColorPayload,
  UpdateColorPayload,
} from "@/lib/type";

const COLOR_URL = "/colors";

export const colorService = {
  getAll: async (): Promise<ApiResponse<Color[]>> => {
    return api.get(`${COLOR_URL}?include_inactive=true`);
  },

  getById: async (id: string): Promise<ApiResponse<Color>> => {
    return api.get(`${COLOR_URL}/${id}`);
  },

  create: async (data: CreateColorPayload): Promise<ApiResponse<Color>> => {
    return api.post(COLOR_URL, data);
  },

  update: async (
    id: string,
    data: UpdateColorPayload,
  ): Promise<ApiResponse<Color>> => {
    return api.patch(`${COLOR_URL}/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete(`${COLOR_URL}/${id}`);
  },
};
