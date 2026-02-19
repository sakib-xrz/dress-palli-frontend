import api from "@/lib/axios";
import type {
  ApiResponse,
  AdminUser,
  AdminQueryParams,
  CreateAdminPayload,
  UpdateAdminStatusPayload,
  ResetAdminPasswordPayload,
  PaginatedResponse,
} from "@/lib/type";

const ADMIN_URL = "/admins";

export const adminService = {
  getAll: async (
    params?: AdminQueryParams,
  ): Promise<PaginatedResponse<AdminUser>> => {
    return api.get(ADMIN_URL, { params });
  },

  create: async (data: CreateAdminPayload): Promise<ApiResponse<AdminUser>> => {
    return api.post(ADMIN_URL, data);
  },

  updateStatus: async (
    id: string,
    data: UpdateAdminStatusPayload,
  ): Promise<ApiResponse<AdminUser>> => {
    return api.patch(`${ADMIN_URL}/${id}/status`, data);
  },

  resetPassword: async (
    id: string,
    data: ResetAdminPasswordPayload,
  ): Promise<ApiResponse<AdminUser>> => {
    return api.patch(`${ADMIN_URL}/${id}/reset-password`, data);
  },
};
