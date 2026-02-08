"use client";

import { Loader2 } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useDeleteSize } from "@/hooks/use-sizes";
import type { Size } from "@/lib/type";

import { Button } from "@/components/ui/button";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface DeleteSizeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size: Size | null;
}

export function DeleteSizeDialog({
  open,
  onOpenChange,
  size,
}: DeleteSizeDialogProps) {
  const isMobile = useIsMobile();
  const deleteMutation = useDeleteSize();

  const handleDelete = async () => {
    if (!size) return;

    await deleteMutation.mutateAsync(size.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const title = "Delete Size";
  const description = (
    <>
      Are you sure you want to delete{" "}
      <span className="font-semibold text-foreground">{size?.name}</span>? This
      action cannot be undone.
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="w-full"
            >
              {deleteMutation.isPending && <Loader2 className="animate-spin" />}
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={deleteMutation.isPending}
              className="w-full"
            >
              Cancel
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && <Loader2 className="animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
