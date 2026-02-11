import api from "@/lib/axios";
import type {
  ApiResponse,
  FeaturedCategory,
  CreateFeaturedCategoryPayload,
  ReorderFeaturedCategoryPayload,
  UpdateFeaturedCategoryPayload,
} from "@/lib/type";

const FEATURED_CATEGORY_URL = "/featured-categories";

export const featuredCategoryService = {
  getAll: async (
    includeUnpublished = false,
  ): Promise<ApiResponse<FeaturedCategory[]>> => {
    return api.get(FEATURED_CATEGORY_URL, {
      params: { include_unpublished: includeUnpublished },
    });
  },

  getById: async (
    id: string,
  ): Promise<ApiResponse<FeaturedCategory>> => {
    return api.get(`${FEATURED_CATEGORY_URL}/${id}`);
  },

  create: async (
    data: CreateFeaturedCategoryPayload,
  ): Promise<ApiResponse<FeaturedCategory>> => {
    const formData = new FormData();
    formData.append("category_id", data.category_id);
    formData.append("title", data.title);
    if (data.banner) formData.append("banner", data.banner);
    if (data.youtube_video_link !== undefined)
      formData.append("youtube_video_link", data.youtube_video_link || "");
    if (data.is_published !== undefined)
      formData.append("is_published", String(data.is_published));

    return api.post(FEATURED_CATEGORY_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: async (
    id: string,
    data: UpdateFeaturedCategoryPayload,
  ): Promise<ApiResponse<FeaturedCategory>> => {
    const formData = new FormData();
    if (data.title !== undefined) formData.append("title", data.title);
    if (data.banner) formData.append("banner", data.banner);
    if (data.youtube_video_link !== undefined)
      formData.append(
        "youtube_video_link",
        data.youtube_video_link === null ? "" : data.youtube_video_link,
      );
    if (data.is_published !== undefined)
      formData.append("is_published", String(data.is_published));

    return api.patch(`${FEATURED_CATEGORY_URL}/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  reorder: async (
    data: ReorderFeaturedCategoryPayload,
  ): Promise<ApiResponse<FeaturedCategory[]>> => {
    return api.patch(`${FEATURED_CATEGORY_URL}/reorder`, data);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete(`${FEATURED_CATEGORY_URL}/${id}`);
  },
};
