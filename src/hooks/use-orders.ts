"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import { showToast } from "@/lib/toast";
import type {
  ApiErrorResponse,
  OrderQueryParams,
  UpdateOrderStatusPayload,
  UpdatePaymentStatusPayload,
} from "@/lib/type";
import { sanitizeParams } from "@/lib/utils";

const ORDER_QUERY_KEY = ["orders"];

export function useOrders(params?: OrderQueryParams) {
  return useQuery({
    queryKey: [...ORDER_QUERY_KEY, params],
    queryFn: async () => {
      const response = await orderService.getAll(sanitizeParams(params ?? {}));
      return { data: response.data, meta: response.meta };
    },
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: [...ORDER_QUERY_KEY, id],
    queryFn: async () => {
      const response = await orderService.getById(id);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateOrderStatusPayload;
    }) => orderService.updateStatus(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePaymentStatusPayload;
    }) => orderService.updatePaymentStatus(id, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ORDER_QUERY_KEY });
      showToast.success(response.message);
    },
    onError: (error: ApiErrorResponse) => {
      showToast.error(error.message);
    },
  });
}
