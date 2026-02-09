"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";

import { useDeleteBanner } from "@/hooks/use-banners";
import type { Banner } from "@/lib/type";

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

interface DeleteBannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: Banner | null;
}

export function DeleteBannerDialog({
  open,
  onOpenChange,
  banner,
}: DeleteBannerDialogProps) {
  const deleteMutation = useDeleteBanner();

  const handleDelete = async () => {
    if (!banner) return;

    await deleteMutation.mutateAsync(banner.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Banner</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this banner? This action cannot be
            undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {banner && (
          <div className="my-4">
            <div className="relative aspect-21/9 w-full overflow-hidden rounded-lg border bg-muted">
              <Image
                src={banner.image_url}
                alt="Banner to delete"
                fill
                className="object-cover"
              />
            </div>
            {banner.link_url && (
              <p className="mt-2 text-sm text-muted-foreground">
                <span className="font-medium">Link:</span> {banner.link_url}
              </p>
            )}
          </div>
        )}

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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
