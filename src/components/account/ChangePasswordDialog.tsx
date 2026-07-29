"use client";

/** Change-password dialog — same show/hide eye toggle as the forgot-password flow. */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/common/PasswordInput";
import { useChangePassword } from "@/hooks/use-account";
import { changePasswordSchema, type ChangePasswordValues } from "@/lib/validations/account";

const EMPTY_VALUES: ChangePasswordValues = { old_password: "", new_password: "", confirm_password: "" };

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const changePasswordMutation = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({ resolver: zodResolver(changePasswordSchema), defaultValues: EMPTY_VALUES });

  useEffect(() => {
    if (!open) reset(EMPTY_VALUES);
  }, [open, reset]);

  async function onSubmit(values: ChangePasswordValues) {
    try {
      const result = await changePasswordMutation.mutateAsync({
        oldPassword: values.old_password,
        newPassword: values.new_password,
      });
      toast.success(result.message || "Password updated.");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Change password</DialogTitle>
        <DialogDescription>Enter your current password and choose a new one.</DialogDescription>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="old-password">Current password</Label>
            <PasswordInput
              id="old-password"
              autoComplete="current-password"
              disabled={isSubmitting}
              {...register("old_password")}
            />
            {errors.old_password && <p className="text-sm text-destructive">{errors.old_password.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="new-password">New password</Label>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              disabled={isSubmitting}
              {...register("new_password")}
            />
            {errors.new_password && <p className="text-sm text-destructive">{errors.new_password.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              disabled={isSubmitting}
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="text-sm text-destructive">{errors.confirm_password.message}</p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating…" : "Update password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
