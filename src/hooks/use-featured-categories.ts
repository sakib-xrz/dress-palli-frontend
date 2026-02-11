"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { featuredCategoryService } from "@/services/featured-category.service";
import { showToast } from "@/lib/toast";
import type {
  ApiErrorResponse,
  CreateFeaturedCategoryPayload,
  ReorderFeaturedCategoryPayload,
  UpdateFeaturedCategoryPayload,
} from "@/lib/type";

const FEATURED_CATEGORY_QUERY_KEY = ["featured-categories"];

export function useFeaturedCategories(includeUnpublished = false) {
  return useQuery({
    queryKey: [...FEATURED_CATEGORY_QUERY_KEY, includeUnpublished],
    queryFn: async () => {
      const response = await featuredCategoryService.getAll(includeUnpublished);
      return response.data;
    },
  });
}

export function useFeaturedCategory(id: string) {
  return useQuery({
    queryKey: [...FEATURED_CATEGORY_QUERY_KEY, id],
    queryFn: async () => {
      const response = await featuredCategoryService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateFeaturedCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFeaturedCategoryPayload) =>
      featuredCategoryService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: FEATURED_CATEGORY_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdateFeaturedCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateFeaturedCategoryPayload;
    }) => featuredCategoryService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: FEATURED_CATEGORY_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useReorderFeaturedCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderFeaturedCategoryPayload) =>
      featuredCategoryService.reorder(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: FEATURED_CATEGORY_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useDeleteFeaturedCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => featuredCategoryService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: FEATURED_CATEGORY_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}
