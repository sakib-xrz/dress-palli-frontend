"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/customer.service";
import { showToast } from "@/lib/toast";
import type {
  ApiErrorResponse,
  CustomerQueryParams,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "@/lib/type";
import { sanitizeParams } from "@/lib/utils";

const CUSTOMER_QUERY_KEY = ["customers"];

export function useCustomers(params?: CustomerQueryParams) {
  return useQuery({
    queryKey: [...CUSTOMER_QUERY_KEY, params],
    queryFn: async () => {
      const response = await customerService.getAll(
        sanitizeParams(params ?? {}) as CustomerQueryParams,
      );
      return { data: response.data, meta: response.meta };
    },
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: [...CUSTOMER_QUERY_KEY, id],
    queryFn: async () => {
      const response = await customerService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerPayload) => customerService.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCustomerPayload;
    }) => customerService.update(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customerService.delete(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMER_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}
