"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/category.service";
import { showToast } from "@/lib/toast";
import type {
  ApiErrorResponse,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  UpdateCategoryStatusPayload,
} from "@/lib/type";

const CATEGORY_QUERY_KEY = ["categories"];

export function useCategories() {
  return useQuery({
    queryKey: CATEGORY_QUERY_KEY,
    queryFn: async () => {
      const response = await categoryService.getAll();
      return response.data;
    },
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: [...CATEGORY_QUERY_KEY, id],
    queryFn: async () => {
      const response = await categoryService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryPayload) => categoryService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryPayload }) =>
      categoryService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdateCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCategoryStatusPayload;
    }) => categoryService.updateStatus(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}
