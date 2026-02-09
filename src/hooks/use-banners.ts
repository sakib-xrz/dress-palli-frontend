"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { bannerService } from "@/services/banner.service";
import { showToast } from "@/lib/toast";
import type {
  ApiErrorResponse,
  CreateBannerPayload,
  ReorderBannerPayload,
  UpdateBannerPayload,
} from "@/lib/type";

const BANNER_QUERY_KEY = ["banners"];

export function useBanners(includeInactive = false) {
  return useQuery({
    queryKey: [...BANNER_QUERY_KEY, includeInactive],
    queryFn: async () => {
      const response = await bannerService.getAll(includeInactive);
      return response.data;
    },
  });
}

export function useBanner(id: string) {
  return useQuery({
    queryKey: [...BANNER_QUERY_KEY, id],
    queryFn: async () => {
      const response = await bannerService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBannerPayload) => bannerService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerPayload }) =>
      bannerService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useReorderBanners() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ReorderBannerPayload) => bannerService.reorder(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => bannerService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: BANNER_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}
