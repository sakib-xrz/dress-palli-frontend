"use client";

import { useDeleteOrder } from "@/hooks/use-orders";
import type { Order } from "@/lib/type";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
}

export function DeleteOrderDialog({
  open,
  onOpenChange,
  order,
}: DeleteOrderDialogProps) {
  const deleteMutation = useDeleteOrder();

  const handleDelete = () => {
    if (!order) return;

    deleteMutation.mutate(order.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  if (!order) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Order</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete order{" "}
            <span className="font-mono font-medium">#{order.order_id}</span>?
            This action cannot be undone and will restore the stock for ordered
            items.
            <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20 px-3 py-2">
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                Note: Only pending orders can be deleted.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Delete Order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
