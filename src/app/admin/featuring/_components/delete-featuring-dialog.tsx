"use client";

import { Loader2 } from "lucide-react";
import Image from "next/image";

import { useIsMobile } from "@/hooks/use-mobile";
import { useDeleteFeaturedCategory } from "@/hooks/use-featured-categories";
import type { FeaturedCategory } from "@/lib/type";

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

interface DeleteFeaturingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featuring: FeaturedCategory | null;
}

export function DeleteFeaturingDialog({
  open,
  onOpenChange,
  featuring,
}: DeleteFeaturingDialogProps) {
  const isMobile = useIsMobile();
  const deleteMutation = useDeleteFeaturedCategory();

  const handleDelete = async () => {
    if (!featuring) return;

    await deleteMutation.mutateAsync(featuring.id, {
      onSuccess: () => onOpenChange(false),
    });
  };

  const title = "Delete Featured";
  const description = (
    <>
      Are you sure you want to remove{" "}
      <span className="font-semibold text-foreground">
        {featuring?.category.name}
      </span>{" "}
      from featured? This action cannot be undone.
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
          {featuring?.banner_url && (
            <div className="my-4">
              <div className="relative aspect-21/9 w-full overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={featuring.banner_url}
                  alt="Featured banner"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
          <SheetFooter>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="w-full"
            >
              {deleteMutation.isPending && (
                <Loader2 className="animate-spin" />
              )}
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

        {featuring?.banner_url && (
          <div className="my-4">
            <div className="relative aspect-21/9 w-full overflow-hidden rounded-lg border bg-muted">
              <Image
                src={featuring.banner_url}
                alt="Featured banner"
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteMutation.isPending}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
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
