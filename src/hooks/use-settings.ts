"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingService } from "@/services/setting.service";
import { showToast } from "@/lib/toast";
import type {
  ApiErrorResponse,
  InitSettingPayload,
  UpdateSettingPayload,
} from "@/lib/type";
import type { Setting } from "@/lib/type";

const SETTING_QUERY_KEY = ["settings"];

export function useSettings() {
  return useQuery({
    queryKey: SETTING_QUERY_KEY,
    queryFn: async (): Promise<Setting | null> => {
      try {
        const response = await settingService.get();
        return response.data;
      } catch (err) {
        // 404 = settings not configured yet
        if (err && typeof err === "object" && "statusCode" in err) {
          if ((err as { statusCode?: number }).statusCode === 404) return null;
        }
        throw err;
      }
    },
    retry: false,
  });
}

export function useInitSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InitSettingPayload) => settingService.init(data),
    onSuccess: (response) => {
      queryClient.setQueryData<Setting>(SETTING_QUERY_KEY, response.data);
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSettingPayload) => settingService.update(data),
    onSuccess: (response) => {
      queryClient.setQueryData<Setting>(SETTING_QUERY_KEY, response.data);
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}
