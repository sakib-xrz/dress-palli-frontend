import api from "@/lib/axios";
import type {
  ApiResponse,
  Banner,
  CreateBannerPayload,
  ReorderBannerPayload,
  UpdateBannerPayload,
} from "@/lib/type";

const BANNER_URL = "/banners";

export const bannerService = {
  getAll: async (includeInactive = false): Promise<ApiResponse<Banner[]>> => {
    return api.get(BANNER_URL, {
      params: { include_inactive: includeInactive },
    });
  },

  getById: async (id: string): Promise<ApiResponse<Banner>> => {
    return api.get(`${BANNER_URL}/${id}`);
  },

  create: async (data: CreateBannerPayload): Promise<ApiResponse<Banner>> => {
    const formData = new FormData();
    formData.append("image", data.image);
    if (data.link_url) formData.append("link_url", data.link_url);
    if (data.is_active !== undefined)
      formData.append("is_active", String(data.is_active));

    return api.post(BANNER_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: async (
    id: string,
    data: UpdateBannerPayload,
  ): Promise<ApiResponse<Banner>> => {
    const formData = new FormData();
    if (data.image) formData.append("image", data.image);
    if (data.link_url !== undefined)
      formData.append("link_url", data.link_url || "");
    if (data.is_active !== undefined)
      formData.append("is_active", String(data.is_active));

    return api.patch(`${BANNER_URL}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  reorder: async (
    data: ReorderBannerPayload,
  ): Promise<ApiResponse<Banner[]>> => {
    return api.patch(`${BANNER_URL}/reorder`, data);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete(`${BANNER_URL}/${id}`);
  },
};
