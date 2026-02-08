"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sizeService } from "@/services/size.service";
import { showToast } from "@/lib/toast";
import type {
  ApiErrorResponse,
  CreateSizePayload,
  UpdateSizePayload,
} from "@/lib/type";

const SIZE_QUERY_KEY = ["sizes"];

export function useSizes() {
  return useQuery({
    queryKey: SIZE_QUERY_KEY,
    queryFn: async () => {
      const response = await sizeService.getAll();
      return response.data;
    },
  });
}

export function useSize(id: string) {
  return useQuery({
    queryKey: [...SIZE_QUERY_KEY, id],
    queryFn: async () => {
      const response = await sizeService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSizePayload) => sizeService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: SIZE_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdateSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSizePayload }) =>
      sizeService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: SIZE_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useDeleteSize() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => sizeService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: SIZE_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}
