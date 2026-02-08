"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useCreateSize, useUpdateSize } from "@/hooks/use-sizes";
import type { Size } from "@/lib/type";

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

const sizeFormSchema = z.object({
  name: z.string().min(1, "Size name is required"),
  is_published: z.boolean(),
});

type SizeFormValues = z.infer<typeof sizeFormSchema>;

// ── Props ───────────────────────────────────────────────

interface SizeFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  size?: Size | null;
}

// ── Component ───────────────────────────────────────────

export function SizeFormModal({
  open,
  onOpenChange,
  size,
}: SizeFormModalProps) {
  const isMobile = useIsMobile();
  const isEditing = !!size;

  const createMutation = useCreateSize();
  const updateMutation = useUpdateSize();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<SizeFormValues>({
    resolver: zodResolver(sizeFormSchema),
    defaultValues: {
      name: "",
      is_published: true,
    },
  });

  // Reset form when modal opens/closes or size changes
  useEffect(() => {
    if (open) {
      if (size) {
        form.reset({
          name: size.name,
          is_published: size.is_published,
        });
      } else {
        form.reset({
          name: "",
          is_published: true,
        });
      }
    }
  }, [open, size, form]);

  const onSubmit = async (values: SizeFormValues) => {
    if (isEditing && size) {
      await updateMutation.mutateAsync(
        {
          id: size.id,
          data: {
            name: values.name,
            is_published: values.is_published,
          },
        },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      await createMutation.mutateAsync(
        {
          name: values.name,
          is_published: values.is_published,
        },
        {
          onSuccess: () => onOpenChange(false),
        },
      );
    }
  };

  const title = isEditing ? "Edit Size" : "Add Size";
  const description = isEditing
    ? "Update the size details below."
    : "Fill in the details to create a new size.";

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
                <Input placeholder="e.g. XL" {...field} />
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
          <SheetFooter className="px-0">
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending && <Loader2 className="animate-spin" />}
              {isEditing ? "Update Size" : "Create Size"}
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
              {isEditing ? "Update Size" : "Create Size"}
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
