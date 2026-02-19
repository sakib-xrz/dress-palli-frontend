"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/admin.service";
import { showToast } from "@/lib/toast";
import type {
  ApiErrorResponse,
  AdminQueryParams,
  CreateAdminPayload,
  UpdateAdminStatusPayload,
  ResetAdminPasswordPayload,
} from "@/lib/type";
import { sanitizeParams } from "@/lib/utils";

const ADMIN_QUERY_KEY = ["admins"];

export function useAdmins(params?: AdminQueryParams) {
  return useQuery({
    queryKey: [...ADMIN_QUERY_KEY, params],
    queryFn: async () => {
      const response = await adminService.getAll(
        sanitizeParams(params ?? {}) as AdminQueryParams,
      );
      return { data: response.data, meta: response.meta };
    },
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdminPayload) => adminService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdateAdminStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAdminStatusPayload;
    }) => adminService.updateStatus(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useResetAdminPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ResetAdminPasswordPayload;
    }) => adminService.resetPassword(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ADMIN_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}
