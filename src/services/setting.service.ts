import api from "@/lib/axios";
import type {
  ApiResponse,
  Setting,
  InitSettingPayload,
  UpdateSettingPayload,
} from "@/lib/type";

const SETTING_URL = "/settings";

export const settingService = {
  get: async (): Promise<ApiResponse<Setting>> => {
    return api.get(SETTING_URL);
  },

  init: async (data: InitSettingPayload): Promise<ApiResponse<Setting>> => {
    const formData = new FormData();
    if (data.logo) formData.append("logo", data.logo);
    formData.append("address", data.address);
    formData.append("phone", data.phone);
    formData.append("email", data.email);
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("keywords", data.keywords);

    return api.post(SETTING_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: async (
    data: UpdateSettingPayload,
  ): Promise<ApiResponse<Setting>> => {
    const formData = new FormData();
    if (data.logo) formData.append("logo", data.logo);
    if (data.favicon) formData.append("favicon", data.favicon);
    if (data.address !== undefined) formData.append("address", data.address);
    if (data.phone !== undefined) formData.append("phone", data.phone);
    if (data.email !== undefined) formData.append("email", data.email);
    if (data.facebook !== undefined)
      formData.append("facebook", data.facebook ?? "");
    if (data.instagram !== undefined)
      formData.append("instagram", data.instagram ?? "");
    if (data.title !== undefined) formData.append("title", data.title);
    if (data.description !== undefined)
      formData.append("description", data.description);
    if (data.keywords !== undefined) formData.append("keywords", data.keywords);
    if (data.show_featured_products !== undefined)
      formData.append(
        "show_featured_products",
        String(data.show_featured_products),
      );
    if (data.show_new_arrivals !== undefined)
      formData.append("show_new_arrivals", String(data.show_new_arrivals));
    if (data.show_best_selling !== undefined)
      formData.append("show_best_selling", String(data.show_best_selling));
    if (data.google_analytics_id !== undefined)
      formData.append("google_analytics_id", data.google_analytics_id ?? "");
    if (data.google_tag_manager_id !== undefined)
      formData.append("google_tag_manager_id", data.google_tag_manager_id ?? "");
    if (data.facebook_pixel_id !== undefined)
      formData.append("facebook_pixel_id", data.facebook_pixel_id ?? "");
    if (data.delivery_charge_inside_dhaka !== undefined)
      formData.append(
        "delivery_charge_inside_dhaka",
        String(data.delivery_charge_inside_dhaka),
      );
    if (data.delivery_charge_outside_dhaka !== undefined)
      formData.append(
        "delivery_charge_outside_dhaka",
        String(data.delivery_charge_outside_dhaka),
      );

    return api.patch(SETTING_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
