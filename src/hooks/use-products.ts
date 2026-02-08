"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { showToast } from "@/lib/toast";
import type {
  ApiErrorResponse,
  CreateProductPayload,
  ProductQueryParams,
  UpdateProductPayload,
  UpdateProductStatusPayload,
} from "@/lib/type";

const PRODUCT_QUERY_KEY = ["products"];

export function useProducts(params?: ProductQueryParams) {
  return useQuery({
    queryKey: [...PRODUCT_QUERY_KEY, params],
    queryFn: async () => {
      const response = await productService.getAllForAdmin(params);
      return { data: response.data, meta: response.meta };
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [...PRODUCT_QUERY_KEY, id],
    queryFn: async () => {
      const response = await productService.getByIdForAdmin(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductPayload) => productService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductPayload }) =>
      productService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductStatusPayload;
    }) => productService.updateStatus(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

// ── Image Hooks ─────────────────────────────────────────

export function useProductImages(productId: string) {
  return useQuery({
    queryKey: [...PRODUCT_QUERY_KEY, productId, "images"],
    queryFn: async () => {
      const response = await productService.getImages(productId);
      return response.data;
    },
    enabled: !!productId,
  });
}

export function useUploadProductImages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, files }: { productId: string; files: File[] }) =>
      productService.uploadImages(productId, files),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: [...PRODUCT_QUERY_KEY, variables.productId, "images"],
      });
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useDeleteProductImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => productService.deleteImage(imageId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useSetPrimaryImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageId: string) => productService.setPrimaryImage(imageId),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: PRODUCT_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}
