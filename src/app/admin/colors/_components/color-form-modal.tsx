"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useCreateColor, useUpdateColor } from "@/hooks/use-colors";
import type { Color } from "@/lib/type";

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

const colorFormSchema = z.object({
  name: z.string().min(1, "Color name is required"),
  code: z.string().nullable().optional(),
  is_active: z.boolean(),
});

type ColorFormValues = z.infer<typeof colorFormSchema>;

// ── Props ───────────────────────────────────────────────

interface ColorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  color?: Color | null;
}

// ── Component ───────────────────────────────────────────

export function ColorFormModal({
  open,
  onOpenChange,
  color,
}: ColorFormModalProps) {
  const isMobile = useIsMobile();
  const isEditing = !!color;

  const createMutation = useCreateColor();
  const updateMutation = useUpdateColor();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<ColorFormValues>({
    resolver: zodResolver(colorFormSchema),
    defaultValues: {
      name: "",
      code: "",
      is_active: true,
    },
  });

  // Reset form when modal opens/closes or color changes
  useEffect(() => {
    if (open) {
      if (color) {
        form.reset({
          name: color.name,
          code: color.code || "",
          is_active: color.is_active,
        });
      } else {
        form.reset({
          name: "",
          code: "",
          is_active: true,
        });
      }
    }
  }, [open, color, form]);

  const onSubmit = async (values: ColorFormValues) => {
    const payload = {
      ...values,
      code: values.code || null,
    };

    if (isEditing && color) {
      await updateMutation.mutateAsync(
        {
          id: color.id,
          data: {
            name: payload.name,
            code: payload.code,
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

  const title = isEditing ? "Edit Color" : "Add Color";
  const description = isEditing
    ? "Update the color details below."
    : "Fill in the details to create a new color.";

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
                <Input placeholder="e.g. Red" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Color Code Field */}
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color Code</FormLabel>
              <div className="flex items-center gap-2">
                <FormControl>
                  <Input
                    placeholder="e.g. #FF0000"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                {field.value && (
                  <div
                    className="size-9 shrink-0 rounded-md border border-border shadow-sm"
                    style={{ backgroundColor: field.value }}
                  />
                )}
              </div>
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
              {isEditing ? "Update Color" : "Create Color"}
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
              {isEditing ? "Update Color" : "Create Color"}
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
