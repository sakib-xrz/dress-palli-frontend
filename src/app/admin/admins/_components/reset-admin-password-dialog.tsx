"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { useIsMobile } from "@/hooks/use-mobile";
import { useResetAdminPassword } from "@/hooks/use-admins";
import type { AdminUser } from "@/lib/type";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

interface ResetAdminPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: AdminUser | null;
}

export function ResetAdminPasswordDialog({
  open,
  onOpenChange,
  admin,
}: ResetAdminPasswordDialogProps) {
  const isMobile = useIsMobile();
  const resetMutation = useResetAdminPassword();

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({ password: "" });
    }
  }, [open, form]);

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!admin) return;

    await resetMutation.mutateAsync(
      {
        id: admin.id,
        data: values,
      },
      {
        onSuccess: () => onOpenChange(false),
      },
    );
  };

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Minimum 6 characters"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isMobile ? (
          <SheetFooter className="px-0">
            <Button
              type="submit"
              disabled={resetMutation.isPending}
              className="w-full"
            >
              {resetMutation.isPending && <Loader2 className="animate-spin" />}
              Reset Password
            </Button>
          </SheetFooter>
        ) : (
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={resetMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={resetMutation.isPending}>
              {resetMutation.isPending && <Loader2 className="animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        )}
      </form>
    </Form>
  );

  const description = (
    <>
      Set a new password for{" "}
      <span className="font-semibold text-foreground">{admin?.name}</span>.
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className="rounded-t-xl"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader>
            <SheetTitle>Reset Password</SheetTitle>
            <SheetDescription>{description}</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-4">{formContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
