"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { colorService } from "@/services/color.service";
import { showToast } from "@/lib/toast";
import type {
  ApiErrorResponse,
  CreateColorPayload,
  UpdateColorPayload,
} from "@/lib/type";

const COLOR_QUERY_KEY = ["colors"];

export function useColors() {
  return useQuery({
    queryKey: COLOR_QUERY_KEY,
    queryFn: async () => {
      const response = await colorService.getAll();
      return response.data;
    },
  });
}

export function useColor(id: string) {
  return useQuery({
    queryKey: [...COLOR_QUERY_KEY, id],
    queryFn: async () => {
      const response = await colorService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateColorPayload) => colorService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: COLOR_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdateColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateColorPayload }) =>
      colorService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: COLOR_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useDeleteColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => colorService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: COLOR_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}
