"use client";

/** Add/Edit dialog for a super admin. Email is locked when editing (identifies the record). */
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddSuperAdmin, useUpdateSuperAdmin } from "@/hooks/use-super-admins";
import { superAdminSchema, type SuperAdminValues } from "@/lib/validations/super-admin";
import type { SuperAdmin } from "@/lib/api";

interface SuperAdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editing?: SuperAdmin | null;
}

export function SuperAdminFormDialog({ open, onOpenChange, editing }: SuperAdminFormDialogProps) {
  const isEdit = Boolean(editing);
  const addMutation = useAddSuperAdmin();
  const updateMutation = useUpdateSuperAdmin();
  const mutation = isEdit ? updateMutation : addMutation;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SuperAdminValues>({
    resolver: zodResolver(superAdminSchema),
    defaultValues: { email: "", name: "", phone_number: "" },
  });

  useEffect(() => {
    if (open) {
      reset({
        email: editing?.email ?? "",
        name: editing?.name ?? "",
        phone_number: editing?.phone_number ?? "",
      });
    }
  }, [open, editing, reset]);

  async function onSubmit(values: SuperAdminValues) {
    try {
      const result = await mutation.mutateAsync({ ...values, phone_number: Number(values.phone_number) });
      toast.success(result.message || (isEdit ? "Super admin updated." : "Super admin added."));
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit super admin" : "Add super admin"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this administrator's name and phone number."
              : "A password will be generated and emailed automatically."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sa-email">Email</Label>
            <Input id="sa-email" type="email" disabled={isEdit || isSubmitting} {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sa-name">Name</Label>
            <Input id="sa-name" disabled={isSubmitting} {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sa-phone">Phone number</Label>
            <Input id="sa-phone" type="tel" disabled={isSubmitting} {...register("phone_number")} />
            {errors.phone_number && <p className="text-sm text-destructive">{errors.phone_number.message}</p>}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add super admin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
