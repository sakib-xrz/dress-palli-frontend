import api from "@/lib/axios";
import type {
  AdminProduct,
  AdminProductDetail,
  ApiResponse,
  CreateProductPayload,
  PaginatedResponse,
  ProductImage,
  ProductQueryParams,
  UpdateProductPayload,
  UpdateProductStatusPayload,
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
  ): Promise<ApiResponse<ProductImage[]>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    return api.post(`${PRODUCT_IMAGE_URL}/product/${productId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
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
