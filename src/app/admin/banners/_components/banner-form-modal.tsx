"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";

import { useIsMobile } from "@/hooks/use-mobile";
import { useCreateBanner, useUpdateBanner } from "@/hooks/use-banners";
import type { Banner } from "@/lib/type";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ── Schema ──────────────────────────────────────────────

const bannerFormSchema = z.object({
  image: z.instanceof(File).optional(),
  is_active: z.boolean(),
});

type BannerFormValues = z.infer<typeof bannerFormSchema>;

// ── Props ───────────────────────────────────────────────

interface BannerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner?: Banner | null;
}

// ── Component ───────────────────────────────────────────

export function BannerFormModal({
  open,
  onOpenChange,
  banner,
}: BannerFormModalProps) {
  const isMobile = useIsMobile();
  const isEditing = !!banner;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const createMutation = useCreateBanner();
  const updateMutation = useUpdateBanner();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
    defaultValues: {
      is_active: true,
    },
  });

  // Reset form when modal opens/closes or banner changes
  useEffect(() => {
    if (open) {
      if (banner) {
        form.reset({
          is_active: banner.is_active,
        });
      } else {
        form.reset({
          is_active: true,
        });
      }
    }
  }, [open, banner, form]);

  // Update preview URL based on banner prop
  const currentPreviewUrl = banner?.image_url || null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("image", file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const displayPreviewUrl = previewUrl || currentPreviewUrl;

  const onSubmit = async (values: BannerFormValues) => {
    if (isEditing && banner) {
      const payload: { is_active: boolean; image?: File } = {
        is_active: values.is_active,
      };
      if (values.image) {
        payload.image = values.image;
      }

      await updateMutation.mutateAsync(
        { id: banner.id, data: payload },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      if (!values.image) {
        form.setError("image", { message: "Banner image is required" });
        return;
      }

      await createMutation.mutateAsync(
        {
          image: values.image,
          is_active: values.is_active,
        },
        {
          onSuccess: () => {
            form.reset({
              is_active: true,
            });
            setPreviewUrl(null);
            onOpenChange(false);
          },
        },
      );
    }
  };

  const title = isEditing ? "Edit Banner" : "Add Banner";
  const description = isEditing
    ? "Update the banner details below."
    : "Upload a new banner image and configure its settings.";

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 px-4">
        {/* Image Upload Field */}
        <FormField
          control={form.control}
          name="image"
          render={() => (
            <FormItem>
              <FormLabel>
                Banner Image{" "}
                {!isEditing && <span className="text-destructive">*</span>}
              </FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {/* Preview */}
                  {displayPreviewUrl && (
                    <div className="relative aspect-21/9 w-full overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={displayPreviewUrl}
                        alt="Banner preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {/* Upload Button */}
                  {!displayPreviewUrl && (
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8">
                      <label
                        htmlFor="banner-image"
                        className="flex cursor-pointer flex-col items-center gap-2"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Upload Banner Image
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">
                          Recommended: 1920px x 810px (21:9)
                        </span>
                        <input
                          id="banner-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  )}

                  {displayPreviewUrl && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("banner-image")?.click()
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Change Image
                    </Button>
                  )}
                  <input
                    id="banner-image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active Status Field */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Display this banner on the website
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Footer Buttons */}
        {isMobile ? (
          <SheetFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Create"}
            </Button>
          </SheetFooter>
        ) : (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        )}
      </form>
    </Form>
  );

  // Render appropriate modal based on screen size
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="py-4">{formContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
