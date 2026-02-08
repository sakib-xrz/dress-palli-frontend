"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/use-categories";
import type { Category } from "@/lib/type";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// ── Schema ──────────────────────────────────────────────

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  parent_id: z.string().nullable().optional(),
  is_active: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// ── Props ───────────────────────────────────────────────

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
}

// ── Component ───────────────────────────────────────────

export function CategoryFormModal({
  open,
  onOpenChange,
  category,
}: CategoryFormModalProps) {
  const isMobile = useIsMobile();
  const isEditing = !!category;

  const { data: categories } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      parent_id: null,
      is_active: true,
    },
  });

  // Reset form when modal opens/closes or category changes
  useEffect(() => {
    if (open) {
      if (category) {
        form.reset({
          name: category.name,
          parent_id: category.parent_id || null,
          is_active: category.is_active,
        });
      } else {
        form.reset({
          name: "",
          parent_id: null,
          is_active: true,
        });
      }
    }
  }, [open, category, form]);

  // Filter out current category and its children from parent options
  const parentOptions = (categories ?? []).filter((c) => {
    if (!isEditing) return true;
    // Exclude self
    if (c.id === category?.id) return false;
    // Exclude children of the current category
    if (c.parent_id === category?.id) return false;
    return true;
  });

  const onSubmit = async (values: CategoryFormValues) => {
    const payload = {
      ...values,
      parent_id: values.parent_id || null,
    };

    if (isEditing && category) {
      await updateMutation.mutateAsync(
        {
          id: category.id,
          data: {
            name: payload.name,
            parent_id: payload.parent_id,
          },
        },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      await createMutation.mutateAsync(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const title = isEditing ? "Edit Category" : "Add Category";
  const description = isEditing
    ? "Update the category details below."
    : "Fill in the details to create a new category.";

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        {/* Name Field */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Summer Collection" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parent Category Field */}
        <FormField
          control={form.control}
          name="parent_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Category</FormLabel>
              <Select
                value={field.value ?? "none"}
                onValueChange={(value) =>
                  field.onChange(value === "none" ? null : value)
                }
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {parentOptions.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status Field (only on create) */}
        {!isEditing && (
          <FormField
            control={form.control}
            name="is_active"
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
        )}

        {/* Footer */}
        {isMobile ? (
          <SheetFooter className="px-0">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="animate-spin" />}
              {isEditing ? "Update Category" : "Create Category"}
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
              {isPending && <Loader2 className="animate-spin" />}
              {isEditing ? "Update Category" : "Create Category"}
            </Button>
          </DialogFooter>
        )}
      </form>
    </Form>
  );

  // ── Mobile: Sheet from bottom ──
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">{formContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  // ── Desktop: Dialog ──
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
