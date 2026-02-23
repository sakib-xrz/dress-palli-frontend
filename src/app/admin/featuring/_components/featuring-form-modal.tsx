"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  useCreateFeaturedCategory,
  useUpdateFeaturedCategory,
} from "@/hooks/use-featured-categories";
import type { FeaturedCategory } from "@/lib/type";
import { CategoryCombobox } from "@/components/shared/category-combobox";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const featuringFormSchema = z.object({
  category_id: z.string().min(1, "Category is required"),
  title: z.string().min(1, "Title is required"),
  banner: z.instanceof(File).optional(),
  youtube_video_link: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal("")),
  is_published: z.boolean(),
});

type FeaturingFormValues = z.infer<typeof featuringFormSchema>;

// ── Props ───────────────────────────────────────────────

interface FeaturingFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featuring?: FeaturedCategory | null;
  existingFeaturedIds?: string[];
}

// ── Component ───────────────────────────────────────────

export function FeaturingFormModal({
  open,
  onOpenChange,
  featuring,
  existingFeaturedIds = [],
}: FeaturingFormModalProps) {
  const isMobile = useIsMobile();
  const isEditing = !!featuring;

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const createMutation = useCreateFeaturedCategory();
  const updateMutation = useUpdateFeaturedCategory();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<FeaturingFormValues>({
    resolver: zodResolver(featuringFormSchema),
    defaultValues: {
      category_id: "",
      title: "",
      youtube_video_link: "",
      is_published: true,
    },
  });

  // Reset form when modal opens or featuring changes
  useEffect(() => {
    if (open) {
      if (featuring) {
        form.reset({
          category_id: featuring.category_id,
          title: featuring.title,
          youtube_video_link: featuring.youtube_video_link || "",
          is_published: featuring.is_published,
        });
      } else {
        form.reset({
          category_id: "",
          title: "",
          youtube_video_link: "",
          is_published: true,
        });
      }
    }
  }, [open, featuring, form]);

  // Clear preview when modal closes (avoids setState in effect)
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) setPreviewUrl(null);
    onOpenChange(nextOpen);
  };

  const currentPreviewUrl = featuring?.banner_url || null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("banner", file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const displayPreviewUrl = previewUrl || currentPreviewUrl;

  const onSubmit = async (values: FeaturingFormValues) => {
    const youtubeLink = values.youtube_video_link?.trim() || null;

    if (isEditing && featuring) {
      const payload: {
        title?: string;
        banner?: File;
        youtube_video_link?: string | null;
        is_published?: boolean;
      } = {
        title: values.title,
        youtube_video_link: youtubeLink,
        is_published: values.is_published,
      };
      if (values.banner) payload.banner = values.banner;

      await updateMutation.mutateAsync(
        { id: featuring.id, data: payload },
        { onSuccess: () => handleOpenChange(false) },
      );
    } else {
      const payload = {
        category_id: values.category_id,
        title: values.title,
        banner: values.banner,
        youtube_video_link: youtubeLink,
        is_published: values.is_published,
      };

      await createMutation.mutateAsync(payload, {
        onSuccess: () => {
          form.reset({
            category_id: "",
            title: "",
            youtube_video_link: "",
            is_published: true,
          });
          handleOpenChange(false);
        },
      });
    }
  };

  const title = isEditing ? "Edit Featured" : "Add Featured";
  const description = isEditing
    ? "Update the featured category details below."
    : "Select a category and add details to feature it on your homepage.";

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 px-4">
        {/* Category Field (create only) */}
        {!isEditing && (
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <CategoryCombobox
                    value={field.value}
                    onValueChange={field.onChange}
                    invalid={!!form.formState.errors.category_id}
                    excludeIds={existingFeaturedIds}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {isEditing && (
          <FormField
            control={form.control}
            name="category_id"
            render={() => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input
                    value={featuring?.category.name}
                    disabled
                    className="bg-muted"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {/* Title Field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Summer Collection" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Banner Image Field */}
        <FormField
          control={form.control}
          name="banner"
          render={() => (
            <FormItem>
              <FormLabel>Banner Image (optional)</FormLabel>
              <span className="text-xs text-muted-foreground font-mono">
                Recommended: 1920px x 730px (21:8)
              </span>
              <FormControl>
                <div className="space-y-4">
                  {displayPreviewUrl && (
                    <div className="relative aspect-21/8 w-full overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={displayPreviewUrl}
                        alt="Banner preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  {!displayPreviewUrl && (
                    <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8">
                      <label
                        htmlFor="featuring-banner"
                        className="flex cursor-pointer flex-col items-center gap-2"
                      >
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Upload Banner Image
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Recommended: 1920×730px (21:8)
                        </span>
                        <input
                          id="featuring-banner"
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
                        document.getElementById("featuring-banner")?.click()
                      }
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Change Image
                    </Button>
                  )}
                  <input
                    id="featuring-banner"
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

        {/* YouTube Video Link Field */}
        <FormField
          control={form.control}
          name="youtube_video_link"
          render={({ field }) => (
            <FormItem>
              <FormLabel>YouTube Video Link (optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://www.youtube.com/watch?v=..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Published Field */}
        <FormField
          control={form.control}
          name="is_published"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <FormLabel className="cursor-pointer w-16">Published</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Footer */}
        {isMobile ? (
          <SheetFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
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
              onClick={() => handleOpenChange(false)}
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

  // ── Mobile: Sheet from bottom ──
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          className="max-h-[90vh] overflow-y-auto rounded-t-xl"
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="py-4">{formContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // ── Desktop: Dialog ──
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
