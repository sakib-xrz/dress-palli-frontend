import api from "@/lib/axios";
import type {
  AdminProduct,
  AdminProductDetail,
  ApiResponse,
  CreateProductPayload,
  PaginatedResponse,
  ProductImage,
  ProductQueryParams,
  UpdateImagePayload,
  UpdateProductPayload,
  UpdateProductStatusPayload,
  UploadProductImageOptions,
} from "@/lib/type";

const PRODUCT_URL = "/products";
const PRODUCT_IMAGE_URL = "/product-images";

export const productService = {
  // ── Products ─────────────────────────────────────────

  getAllForAdmin: async (
    params?: ProductQueryParams,
  ): Promise<PaginatedResponse<AdminProduct>> => {
    return api.get(`${PRODUCT_URL}/admin`, { params });
  },

  getByIdForAdmin: async (
    id: string,
  ): Promise<ApiResponse<AdminProductDetail>> => {
    return api.get(`${PRODUCT_URL}/admin/${id}`);
  },

  create: async (
    data: CreateProductPayload,
  ): Promise<ApiResponse<AdminProductDetail>> => {
    return api.post(PRODUCT_URL, data);
  },

  update: async (
    id: string,
    data: UpdateProductPayload,
  ): Promise<ApiResponse<AdminProductDetail>> => {
    return api.patch(`${PRODUCT_URL}/${id}`, data);
  },

  updateStatus: async (
    id: string,
    data: UpdateProductStatusPayload,
  ): Promise<ApiResponse<AdminProductDetail>> => {
    return api.patch(`${PRODUCT_URL}/${id}/status`, data);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return api.delete(`${PRODUCT_URL}/${id}`);
  },

  // ── Product Images ───────────────────────────────────

  getImages: async (
    productId: string,
  ): Promise<ApiResponse<ProductImage[]>> => {
    return api.get(`${PRODUCT_IMAGE_URL}/product/${productId}`);
  },

  uploadImages: async (
    productId: string,
    files: File[],
    options?: UploadProductImageOptions,
  ): Promise<ApiResponse<ProductImage[]>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    if (options?.alt_text) formData.append("alt_text", options.alt_text);
    if (options?.is_primary) formData.append("is_primary", "true");
    return api.post(`${PRODUCT_IMAGE_URL}/product/${productId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
  },

  updateImage: async (
    imageId: string,
    data: UpdateImagePayload,
  ): Promise<ApiResponse<ProductImage>> => {
    return api.patch(`${PRODUCT_IMAGE_URL}/${imageId}`, data);
  },

  deleteImage: async (imageId: string): Promise<ApiResponse<null>> => {
    return api.delete(`${PRODUCT_IMAGE_URL}/${imageId}`);
  },

  setPrimaryImage: async (
    imageId: string,
  ): Promise<ApiResponse<ProductImage>> => {
    return api.patch(`${PRODUCT_IMAGE_URL}/${imageId}/primary`);
  },
};
